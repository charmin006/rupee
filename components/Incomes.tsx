'use client'

import { useState } from 'react'
import { Income } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Edit, Trash2 } from 'lucide-react'
import AddIncomeModal from './AddIncomeModal'

interface IncomesProps {
  incomes: Income[]
  onAddIncome: (income: any) => void
  onUpdateIncome: (income: any) => void
  onDeleteIncome: (id: string) => void
}

export default function Incomes({
  incomes,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
}: IncomesProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    setShowAddModal(true)
  }

  const handleAddOrUpdate = (incomeData: any) => {
    if (editingIncome) {
      // Update existing income
      const updatedIncome = {
        ...editingIncome,
        ...incomeData,
        updatedAt: new Date().toISOString(),
      }
      onUpdateIncome(updatedIncome)
      setEditingIncome(null)
    } else {
      // Add new income
      onAddIncome(incomeData)
    }
    setShowAddModal(false)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingIncome(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incomes</h1>
          <p className="text-gray-600">Track your income sources</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Income</span>
        </button>
      </div>

      {/* Incomes List */}
      <div className="card">
        {incomes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">No incomes yet</p>
            <p className="text-gray-400 mb-4">Start tracking your income to see it here</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Income
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{income.source}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(income.date)}
                    </p>
                    {income.note && (
                      <p className="text-sm text-gray-500 mt-1">{income.note}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      +{formatCurrency(income.amount)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(income)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteIncome(income.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Income Modal */}
      <AddIncomeModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onAdd={handleAddOrUpdate}
        editingIncome={editingIncome}
      />
    </div>
  )
} 