'use client'

import { useState } from 'react'
import { Income } from '@/lib/types'
import AddIncomeModal from './AddIncomeModal'

interface IncomesProps {
  incomes: Income[]
  onAddIncome: (income: Income) => Promise<void>
  onUpdateIncome: (income: Income) => Promise<void>
  onDeleteIncome: (id: string) => Promise<void>
}

export default function Incomes({ incomes, onAddIncome, onUpdateIncome, onDeleteIncome }: IncomesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  const handleAddIncome = async (income: Income) => {
    await onAddIncome(income)
    setIsModalOpen(false)
  }

  const handleEditIncome = async (income: Income) => {
    await onUpdateIncome(income)
    setEditingIncome(null)
  }

  const handleDeleteIncome = async (id: string) => {
    if (confirm('Are you sure you want to delete this income?')) {
      await onDeleteIncome(id)
    }
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const thisMonthIncome = incomes.filter(income => {
    const incomeDate = new Date(income.date)
    const now = new Date()
    return incomeDate.getMonth() === now.getMonth() && incomeDate.getFullYear() === now.getFullYear()
  }).reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incomes</h1>
          <p className="text-gray-600">Track and manage your income sources</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Income
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-blue-600">₹{thisMonthIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Count</h3>
          <p className="text-3xl font-bold text-purple-600">{incomes.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income History</h3>
          {incomes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No income records yet</p>
              <p className="text-gray-400 mb-4">Start tracking your income to see them here</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Your First Income
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xl">💰</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{income.source}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(income.date).toLocaleDateString()}
                      </p>
                      {income.note && (
                        <p className="text-sm text-gray-500 mt-1">{income.note}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹{income.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingIncome(income)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteIncome(income.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddIncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddIncome}
        editingIncome={editingIncome}
      />
    </div>
  )
} 