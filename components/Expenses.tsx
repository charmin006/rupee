'use client'

import { useState } from 'react'
import { Expense, Category } from '@/lib/types'
import AddExpenseModal from './AddExpenseModal'
import RecentExpenses from './RecentExpenses'
import SpendingChart from './SpendingChart'

interface ExpensesProps {
  expenses: Expense[]
  categories: Category[]
  onAddExpense: (expense: Expense) => Promise<void>
  onUpdateExpense: (expense: Expense) => Promise<void>
  onDeleteExpense: (id: string) => Promise<void>
}

export default function Expenses({ expenses, categories, onAddExpense, onUpdateExpense, onDeleteExpense }: ExpensesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const handleAddExpense = async (expense: Expense) => {
    await onAddExpense(expense)
    setIsModalOpen(false)
  }

  const handleEditExpense = async (expense: Expense) => {
    await onUpdateExpense(expense)
    setEditingExpense(null)
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      await onDeleteExpense(id)
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    const now = new Date()
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear()
  }).reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track and manage your expenses</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-blue-600">₹{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
          <p className="text-3xl font-bold text-green-600">₹{thisMonthExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Count</h3>
          <p className="text-3xl font-bold text-purple-600">{expenses.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Chart</h3>
          <SpendingChart expenses={expenses} categories={categories} period="month" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
          <RecentExpenses 
            expenses={expenses.slice(0, 5)} 
            categories={categories}
          />
        </div>
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddExpense}
        categories={categories}
        editingExpense={editingExpense}
      />
    </div>
  )
} 