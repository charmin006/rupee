'use client'

import { useState } from 'react'
import { BudgetLimit, Category } from '@/lib/types'

interface BudgetLimitsProps {
  budgetLimits: BudgetLimit[]
  categories: Category[]
  onAddBudgetLimit: (limit: BudgetLimit) => Promise<void>
  onUpdateBudgetLimit: (limit: BudgetLimit) => Promise<void>
  onDeleteBudgetLimit: (id: string) => Promise<void>
}

export default function BudgetLimits({ budgetLimits, categories, onAddBudgetLimit, onUpdateBudgetLimit, onDeleteBudgetLimit }: BudgetLimitsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLimit, setEditingLimit] = useState<BudgetLimit | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    period: 'month' as 'day' | 'week' | 'month'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingLimit) {
      await onUpdateBudgetLimit({
        ...editingLimit,
        category: formData.category,
        amount: formData.amount,
        period: formData.period
      })
      setEditingLimit(null)
    } else {
      await onAddBudgetLimit({
        id: '',
        category: formData.category,
        amount: formData.amount,
        period: formData.period,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    setFormData({ category: '', amount: 0, period: 'month' })
    setIsModalOpen(false)
  }

  const handleEdit = (limit: BudgetLimit) => {
    setEditingLimit(limit)
    setFormData({
      category: limit.category,
      amount: limit.amount,
      period: limit.period
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget limit?')) {
      await onDeleteBudgetLimit(id)
    }
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || '#6B7280'
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown Category'
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.icon || '📊'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Limits</h1>
          <p className="text-gray-600">Set spending limits for categories</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Limit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetLimits.map((limit) => {
          const categoryColor = getCategoryColor(limit.category)
          const categoryName = getCategoryName(limit.category)
          const categoryIcon = getCategoryIcon(limit.category)
          
          return (
            <div
              key={limit.id}
              className="bg-white p-6 rounded-lg shadow border-l-4"
              style={{ borderLeftColor: categoryColor }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${categoryColor}20` }}
                  >
                    {categoryIcon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{categoryName}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {limit.period}ly limit
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(limit)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(limit.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Limit Amount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{limit.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    limit.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {limit.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {budgetLimits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budget limits set</h3>
          <p className="text-gray-600 mb-4">
            Create budget limits to control your spending by category
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Set Your First Limit
          </button>
        </div>
      )}

      {/* Add/Edit Budget Limit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingLimit ? 'Edit Budget Limit' : 'Add Budget Limit'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'day' | 'week' | 'month' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingLimit ? 'Update' : 'Add'} Limit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingLimit(null)
                    setFormData({ category: '', amount: 0, period: 'month' })
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 