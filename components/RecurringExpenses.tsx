'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Repeat, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { RecurringExpense, Expense } from '../lib/types';
import { storage } from '../lib/storage';
import { calculateNextDueDate, isRecurringExpenseDue, generateRecurringExpenses } from '../lib/utils';
import toast from 'react-hot-toast';

interface RecurringExpensesProps {
  onExpenseCreated: (expense: Expense) => void;
}

const RecurringExpenses: React.FC<RecurringExpensesProps> = ({ onExpenseCreated }) => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: '',
    endDate: '',
    note: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other',
  });

  useEffect(() => {
    loadRecurringExpenses();
    processRecurringExpenses();
  }, []);

  const loadRecurringExpenses = () => {
    const expenses = storage.getRecurringExpenses();
    setRecurringExpenses(expenses);
  };

  const processRecurringExpenses = () => {
    const expenses = storage.getRecurringExpenses();
    const generatedExpenses = generateRecurringExpenses(expenses);
    
    if (generatedExpenses.length > 0) {
      generatedExpenses.forEach(expense => {
        storage.addExpense(expense);
        onExpenseCreated(expense);
      });
      
      // Update next due dates
      expenses.forEach(expense => {
        if (isRecurringExpenseDue(expense)) {
          const updatedExpense = {
            ...expense,
            nextDueDate: calculateNextDueDate(expense),
            updatedAt: new Date().toISOString(),
          };
          storage.updateRecurringExpense(updatedExpense);
        }
      });
      
      loadRecurringExpenses();
      toast.success(`${generatedExpenses.length} recurring expense(s) generated!`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recurringExpense: RecurringExpense = {
      id: editingExpense?.id || crypto.randomUUID(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      frequency: formData.frequency,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      nextDueDate: formData.startDate,
      isActive: true,
      note: formData.note,
      paymentMethod: formData.paymentMethod,
      profileId: storage.getUser().activeProfileId,
      createdAt: editingExpense?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingExpense) {
      storage.updateRecurringExpense(recurringExpense);
      toast.success('Recurring expense updated!');
    } else {
      storage.addRecurringExpense(recurringExpense);
      toast.success('Recurring expense created!');
    }

    resetForm();
    loadRecurringExpenses();
  };

  const handleEdit = (expense: RecurringExpense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      frequency: expense.frequency,
      startDate: expense.startDate,
      endDate: expense.endDate || '',
      note: expense.note || '',
      paymentMethod: expense.paymentMethod || 'cash',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring expense?')) {
      storage.deleteRecurringExpense(id);
      loadRecurringExpenses();
      toast.success('Recurring expense deleted!');
    }
  };

  const toggleActive = (expense: RecurringExpense) => {
    const updatedExpense = {
      ...expense,
      isActive: !expense.isActive,
      updatedAt: new Date().toISOString(),
    };
    storage.updateRecurringExpense(updatedExpense);
    loadRecurringExpenses();
    toast.success(`Recurring expense ${updatedExpense.isActive ? 'activated' : 'deactivated'}!`);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      startDate: '',
      endDate: '',
      note: '',
      paymentMethod: 'cash',
    });
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return frequency;
    }
  };

  const getStatusIcon = (expense: RecurringExpense) => {
    if (!expense.isActive) {
      return <Clock size={16} className="text-gray-400" />;
    }
    if (isRecurringExpenseDue(expense)) {
      return <AlertCircle size={16} className="text-orange-500" />;
    }
    return <CheckCircle size={16} className="text-green-500" />;
  };

  const getStatusText = (expense: RecurringExpense) => {
    if (!expense.isActive) {
      return 'Inactive';
    }
    if (isRecurringExpenseDue(expense)) {
      return 'Due';
    }
    return 'Active';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recurring Expenses</h2>
          <p className="text-gray-600">Manage your automatic expense scheduling</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Recurring
        </button>
      </div>

      {/* Recurring Expenses List */}
      <div className="bg-white rounded-lg shadow">
        {recurringExpenses.length === 0 ? (
          <div className="p-8 text-center">
            <Repeat size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recurring Expenses</h3>
            <p className="text-gray-600 mb-4">
              Create recurring expenses to automatically track regular payments
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Recurring Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recurringExpenses.map((expense) => (
              <div key={expense.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(expense)}
                      <span className={`text-sm font-medium ${
                        !expense.isActive ? 'text-gray-400' :
                        isRecurringExpenseDue(expense) ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {getStatusText(expense)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(expense)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        expense.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {expense.isActive ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">{expense.title}</h3>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Amount:</span>
                      <span className="ml-1">₹{expense.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Category:</span>
                      <span className="ml-1">{expense.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span>
                      <span className="ml-1">{getFrequencyLabel(expense.frequency)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Next Due:</span>
                      <span className="ml-1">
                        {new Date(expense.nextDueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {expense.note && (
                    <p className="mt-2 text-sm text-gray-600">{expense.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Netflix Subscription"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {storage.getCategories().map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingExpense ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses; 