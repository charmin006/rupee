'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Income } from '@/lib/types'
import { generateId, validateAmount } from '@/lib/utils'

interface AddIncomeModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (income: any) => void
  editingIncome?: Income | null
}

export default function AddIncomeModal({
  isOpen,
  onClose,
  onAdd,
  editingIncome,
}: AddIncomeModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when editing
  useEffect(() => {
    if (editingIncome) {
      setFormData({
        amount: editingIncome.amount.toString(),
        source: editingIncome.source,
        date: editingIncome.date,
        note: editingIncome.note || '',
      })
    } else {
      setFormData({
        amount: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      })
    }
    setErrors({})
  }, [editingIncome, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.amount || !validateAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount'
    }
    
    if (!formData.source.trim()) {
      newErrors.source = 'Please enter income source'
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Create income object
    const income = {
      id: editingIncome?.id || generateId(),
      amount: parseFloat(formData.amount),
      source: formData.source.trim(),
      date: formData.date,
      note: formData.note,
      createdAt: editingIncome?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    onAdd(income)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      amount: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingIncome ? 'Edit Income' : 'Add New Income'}
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`input-field ${errors.amount ? 'border-danger-500' : ''}`}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>
                )}
              </div>
              
              {/* Source */}
              <div>
                <label className="form-label">Income Source</label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className={`input-field ${errors.source ? 'border-danger-500' : ''}`}
                  placeholder="e.g., Salary, Freelance, Investment"
                />
                {errors.source && (
                  <p className="mt-1 text-sm text-danger-600">{errors.source}</p>
                )}
              </div>
              
              {/* Date */}
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`input-field ${errors.date ? 'border-danger-500' : ''}`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-danger-600">{errors.date}</p>
                )}
              </div>
              
              {/* Note */}
              <div>
                <label className="form-label">Note (Optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Add a note about this income..."
                />
              </div>
            </form>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-primary w-full sm:w-auto sm:ml-3"
            >
              {editingIncome ? 'Update Income' : 'Add Income'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 