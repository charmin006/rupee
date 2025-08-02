'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Category, PaymentMethod, Expense } from '@/lib/types'
import { generateId, validateAmount } from '@/lib/utils'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (expense: any) => void
  categories: Category[]
  editingExpense?: Expense | null
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
]

export default function AddExpenseModal({
  isOpen,
  onClose,
  onAdd,
  categories,
  editingExpense,
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    paymentMethod: 'cash' as PaymentMethod,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form when editing
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        amount: editingExpense.amount.toString(),
        category: editingExpense.category,
        date: editingExpense.date,
        note: editingExpense.note || '',
        paymentMethod: editingExpense.paymentMethod || 'cash',
      })
    } else {
      setFormData({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
        paymentMethod: 'cash',
      })
    }
    setErrors({})
  }, [editingExpense, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.amount || !validateAmount(formData.amount)) {
      newErrors.amount = 'Please enter a valid amount'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Create expense object
    const expense = {
      id: editingExpense?.id || generateId(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      note: formData.note,
      paymentMethod: formData.paymentMethod,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    onAdd(expense)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      paymentMethod: 'cash',
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
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
              
              {/* Category */}
              <div>
                <label className="form-label">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`input-field ${errors.category ? 'border-danger-500' : ''}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-danger-600">{errors.category}</p>
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
              
              {/* Payment Method */}
              <div>
                <label className="form-label">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="input-field"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Note */}
              <div>
                <label className="form-label">Note (Optional)</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Add a note about this expense..."
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
              {editingExpense ? 'Update Expense' : 'Add Expense'}
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