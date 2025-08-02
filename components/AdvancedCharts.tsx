'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Calendar as CalendarIcon, TrendingUp, PieChart as PieChartIcon, BarChart3, Filter } from 'lucide-react';
import { Expense, ChartData, CalendarViewData } from '../lib/types';
import { storage } from '../lib/storage';
import { generateChartData, generateCalendarViewData } from '../lib/utils';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface AdvancedChartsProps {
  expenses: Expense[];
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ expenses }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'bar' | 'line' | 'area' | 'pie' | 'calendar' | 'category-bar'>('bar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarViewData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  useEffect(() => {
    updateChartData();
  }, [expenses, selectedPeriod, selectedDate, selectedCategory]);

  const updateChartData = () => {
    const startDate = getStartDate();
    const endDate = new Date();
    
    const filteredExpenses = selectedCategory === 'all' 
      ? expenses 
      : expenses.filter(exp => exp.category === selectedCategory);

    const data = generateChartData(filteredExpenses, selectedPeriod, startDate, endDate);
    setChartData(data);

    // Generate calendar data for current month
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth() + 1;
    const calendarData = generateCalendarViewData(filteredExpenses, currentYear, currentMonth);
    setCalendarData(calendarData);
  };

  const getStartDate = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case 'week':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() - 6, 1);
      case 'year':
        return new Date(now.getFullYear() - 2, 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }
  };

  const getCategoryData = () => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value); // Sort by amount descending
  };

  const getPaymentMethodData = () => {
    const methodTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (expense.paymentMethod) {
        methodTotals[expense.paymentMethod] = (methodTotals[expense.paymentMethod] || 0) + expense.amount;
      }
    });

    return Object.entries(methodTotals).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value,
    }));
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!chartData) return null;

    switch (selectedChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'category-bar':
        const categoryData = getCategoryData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = selectedCategory === 'all' ? getCategoryData() : getPaymentMethodData();
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatCurrency} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'calendar':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                tileContent={({ date }: { date: Date }) => {
                  const dateString = date.toISOString().split('T')[0];
                  const dayData = calendarData?.days.find(day => day.date === dateString);
                  
                  if (dayData) {
                    return (
                      <div className="text-xs">
                        <div className={`w-2 h-2 mx-auto rounded-full ${
                          dayData.total > 0 ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        {dayData.total > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            ₹{dayData.total.toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
                tileClassName={({ date }: { date: Date }) => {
                  const dateString = date.toISOString().split('T')[0];
                  const dayData = calendarData?.days.find(day => day.date === dateString);
                  return dayData && dayData.total > 0 ? 'bg-red-50' : '';
                }}
              />
            </div>
            
            {calendarData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Calendar Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Days:</span>
                      <span>{calendarData.days.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spending Days:</span>
                      <span>{calendarData.days.filter(d => d.total > 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>No Spend Days:</span>
                      <span>{calendarData.days.filter(d => d.total === 0).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Spent:</span>
                      <span>₹{calendarData.days.reduce((sum, d) => sum + d.total, 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (selectedChart) {
      case 'bar':
      case 'line':
      case 'area':
        return `Spending Over Time (${selectedPeriod})`;
      case 'category-bar':
        return 'Spending by Category';
      case 'pie':
        return selectedCategory === 'all' ? 'Spending by Category' : 'Spending by Payment Method';
      case 'calendar':
        return `Spending Calendar - ${selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      default:
        return 'Chart';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Detailed spending analysis and insights</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Period Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          {/* Chart Type */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Chart:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setSelectedChart('bar')}
                className={`p-2 rounded ${selectedChart === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Bar Chart"
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setSelectedChart('line')}
                className={`p-2 rounded ${selectedChart === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Line Chart"
              >
                <TrendingUp size={16} />
              </button>
              <button
                onClick={() => setSelectedChart('area')}
                className={`p-2 rounded ${selectedChart === 'area' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Area Chart"
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setSelectedChart('category-bar')}
                className={`p-2 rounded ${selectedChart === 'category-bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Category Bar Chart"
              >
                <BarChart3 size={16} />
              </button>
              <button
                onClick={() => setSelectedChart('pie')}
                className={`p-2 rounded ${selectedChart === 'pie' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Pie Chart"
              >
                <PieChartIcon size={16} />
              </button>
              <button
                onClick={() => setSelectedChart('calendar')}
                className={`p-2 rounded ${selectedChart === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Calendar View"
              >
                <CalendarIcon size={16} />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          {selectedChart !== 'calendar' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(expenses.map(exp => exp.category))).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{getChartTitle()}</h3>
        {renderChart()}
      </div>

      {/* Summary Stats */}
      {chartData && selectedChart !== 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-sm text-gray-600">Total Spending</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(chartData.total)}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{chartData.categories.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-600">Data Points</p>
            <p className="text-2xl font-bold text-gray-900">{chartData.data.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedCharts; 