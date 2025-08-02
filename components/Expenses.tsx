'use client'

import { useState } from 'react'
import { Expense, Category } from '@/lib/types'
import { formatCurrency, formatDate, getCategoryColor, getCategoryIcon } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import AddExpenseModal from './AddExpenseModal'

interface ExpensesProps {
  expenses: Expense[]
  categories: Category[]
  onAddExpense: (expense: any) => void
  onUpdateExpense: (expense: any) => void
  onDeleteExpense: (id: string) => void
}

export default function Expenses({
  expenses,
  categories,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}: ExpensesProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setShowAddModal(true)
  }

  const handleAddOrUpdate = (expenseData: any) => {
    if (editingExpense) {
      // Update existing expense
      const updatedExpense = {
        ...editingExpense,
        ...expenseData,
        updatedAt: new Date().toISOString(),
      }
      onUpdateExpense(updatedExpense)
      setEditingExpense(null)
    } else {
      // Add new expense
      onAddExpense(expenseData)
    }
    setShowAddModal(false)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingExpense(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Manage and track your expenses</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expenses List */}
      <div className="card">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No expenses yet</p>
            <p className="text-gray-400 mb-4">Start tracking your expenses to see them here</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => {
              const categoryColor = getCategoryColor(expense.category, categories)
              const categoryIcon = getCategoryIcon(expense.category, categories)
              
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${categoryColor}20` }}
                    >
                      {categoryIcon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{expense.category}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(expense.date)} • {expense.paymentMethod}
                      </p>
                      {expense.note && (
                        <p className="text-sm text-gray-500 mt-1">{expense.note}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onAdd={handleAddOrUpdate}
        categories={categories}
        editingExpense={editingExpense}
      />
    </div>
  )
} 