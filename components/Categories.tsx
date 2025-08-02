'use client'

import { useState } from 'react'
import { Category } from '@/lib/types'

interface CategoriesProps {
  categories: Category[]
  onAddCategory: (category: Category) => Promise<void>
  onUpdateCategory: (category: Category) => Promise<void>
  onDeleteCategory: (id: string) => Promise<void>
}

export default function Categories({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoriesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: '📊'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCategory) {
      await onUpdateCategory({
        ...editingCategory,
        name: formData.name,
        color: formData.color,
        icon: formData.icon
      })
      setEditingCategory(null)
    } else {
      await onAddCategory({
        id: '',
        name: formData.name,
        color: formData.color,
        icon: formData.icon,
        isCustom: true,
        createdAt: new Date().toISOString()
      })
    }
    
    setFormData({ name: '', color: '#3B82F6', icon: '📊' })
    setIsModalOpen(false)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await onDeleteCategory(id)
    }
  }

  const iconOptions = ['📊', '🍔', '🚗', '🏠', '💊', '👕', '🎬', '📚', '🏋️', '✈️', '💻', '🎮', '🎨', '🎵', '📱', '💡']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage your expense categories</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white p-4 rounded-lg shadow border-l-4"
            style={{ borderLeftColor: category.color }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {category.isCustom ? 'Custom' : 'Default'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  ✏️
                </button>
                {category.isCustom && (
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-2 text-lg rounded ${
                        formData.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Add'} Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingCategory(null)
                    setFormData({ name: '', color: '#3B82F6', icon: '📊' })
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