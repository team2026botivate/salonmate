import React, { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  DollarSign,
  FileText,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  IndianRupee,
  Loader2,
} from 'lucide-react';
import { useGetDailyExpenses, useDailyExpenseMutations } from '../../hook/dbOperation';
// import { useGetInventoryData } from '../../hook/dbOperation';

// Note: data comes from Supabase daily_expenses table via hooks

const DailyExpenses = () => {
  const { data, loading, error, refetch } = useGetDailyExpenses();

  console.log(data, 'data');

  const {
    addExpense,
    updateExpense,
    deleteExpense,
    loading: mutLoading,
    error: mutError,
  } = useDailyExpenseMutations();
  // const { data: invRows, loading: invLoading } = useGetInventoryData();
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    notes: '',
    qty: 1,
  });

  console.log(formData, 'form data ');

  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [editingId, setEditingId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState('');

  // Map DB rows to UI items whenever data changes
  useEffect(() => {
    const mapped = (data || []).map((row) => ({
      id: row.id,
      date: row.expense_date, // YYYY-MM-DD
      // productName: row.product_name || '',
      amount: Number(row.amount) || 0,
      notes: row.note || '',
      title: row.title || '',
      qty: Number(row.qty || 1),
      createdAt: row.created_at ? new Date(row.created_at) : new Date(row.expense_date),
    }));
    setExpenses(mapped);
  }, [data]);

  // Calculate summaries
  const calculateSummary = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);

    const todayTotal = expenses
      .filter((expense) => expense.date === today)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const weekTotal = expenses
      .filter((expense) => new Date(expense.date) >= thisWeekStart)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const monthTotal = expenses
      .filter((expense) => new Date(expense.date) >= thisMonthStart)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return { todayTotal, weekTotal, monthTotal };
  };

  const { todayTotal, weekTotal, monthTotal } = calculateSummary();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      const updated = await updateExpense(editingId, {
        date: formData.date,
        amount: formData.amount,
        notes: formData.notes,
        title: formData.title,
        qty: formData.qty,
      });
      if (updated) {
        await refetch?.();
        setEditingId(null);
      }
    } else {
      const created = await addExpense({
        date: formData.date,
        amount: formData.amount,
        notes: formData.notes,
        title: formData.title,
        qty: formData.qty,
      });
      if (created) {
        await refetch?.();
      }
    }

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: '',
      notes: '',
      title: '',
      qty: 1,
    });
  };

  const handleEdit = (expense) => {
    setFormData({
      date: expense.date,
      amount: expense.amount.toString(),
      notes: expense.notes,
      title: expense.title || expense.productName || '',
      qty: Number(expense.qty || 1),
    });
    setEditingId(expense.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const ok = await deleteExpense(id);
      if (ok) await refetch?.();
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const aValue = new Date(a.date);
      const bValue = new Date(b.date);
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const EmptyState = () => (
    <div className="py-12 text-center">
      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <h3 className="mb-2 text-lg font-medium text-gray-900">No expenses yet</h3>
      <p className="text-gray-600">Start by adding your first expense above</p>
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Daily Expenses</h1>
          <p className="text-gray-600">Track and manage your salon's daily expenses</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          {/* Main Content Area */}
          <div className="space-y-6 xl:col-span-3">
            {/* Add Expense Form */}
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="flex items-center mb-6">
                <Plus className="w-6 h-6 mr-3 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Expense' : 'Add New Expense'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Date Field */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full py-3 pl-10 pr-4 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Product Field (from Inventory) */}
                  <div>
                    <label
                      htmlFor="expenseName"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Expense Name
                    </label>
                    <input
                      name="title"
                      type="text"
                      id="expenseName"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter name"
                      className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid gap-6 grid--2 grid-cols- md:grid-cols-2">
                  {/* Quantity Field */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 opacity-50">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="qty"
                      value={formData.qty}
                      onChange={handleInputChange}
                      placeholder="1"
                      min="1"
                      className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Amount Field */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">Amount *</label>
                    <div className="relative">
                      <IndianRupee className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full py-3 pl-10 pr-4 transition-all border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  {/* Notes Field */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-700">Notes</label>
                    <div className="relative w-full ">
                      <FileText className="absolute h-5 text-gray-400 w- left-3 top-3" />
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Optional notes..."
                        rows="3"
                        className="w-full py-3 pl-10 pr-4 transition-all border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          date: new Date().toISOString().split('T')[0],
                          category: '',
                          amount: '',
                          notes: '',
                        });
                      }}
                      className="px-6 py-3 mr-3 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 font-medium text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {editingId ? 'Update Expense' : 'Add Expense'}
                    {mutLoading && <Loader2 className="w-5 h-5 ml-2 animate-spin" />}
                  </button>
                </div>
              </form>
            </div>

            {/* Expenses Table */}
            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Recent Expenses</h2>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-4 text-sm font-medium text-left text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Date</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                        Products
                      </th>
                      <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">Qty</th>
                      <th
                        className="px-6 py-4 text-sm font-medium text-left text-gray-700 transition-colors cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Amount</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                        Notes
                      </th>
                      <th className="px-6 py-4 text-sm font-medium text-left text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortedExpenses.map((expense) => (
                      <tr key={expense.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {expense.title || expense.productName || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{expense.qty}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="max-w-xs px-6 py-4 text-sm text-gray-600 truncate">
                          {expense.notes || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-blue-600 hover:bg-blue-50"
                              title="Edit expense"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {sortedExpenses.length === 0 && (
                  <div className="py-12 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No expenses yet</h3>
                    <p className="text-gray-600">Start by adding your first expense above</p>
                  </div>
                )}
              </div>
              {/* Mobile View */}
              <div className="md:hidden">
                {/* Mobile Sorting Controls */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onSort('date')}
                        className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </button>
                      <button
                        onClick={() => onSort('amount')}
                        className="flex items-center px-3 py-2 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <span>Amount</span>
                        <ArrowUpDown className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="p-4 space-y-4">
                  {sortedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {expense.title || expense.productName || '-'}
                            </span>
                            <span className="text-xs text-gray-500">Qty: {expense.qty}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{formatDate(expense.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      {expense.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <span className="font-medium">Notes: </span>
                            {expense.notes}
                          </p>
                        </div>
                      )}

                      {/* Card Actions */}
                      <div className="flex items-center justify-end pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200"
                            title="Edit expense"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {sortedExpenses.length === 0 && <EmptyState />}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky p-6 bg-white border border-gray-100 shadow-sm rounded-xl top-6">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">Expense Summary</h3>

              <div className="space-y-6">
                {/* Today's Total */}
                <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Today</span>
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(todayTotal)}</p>
                </div>

                {/* This Week's Total */}
                <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-700">This Week</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">{formatCurrency(weekTotal)}</p>
                </div>

                {/* This Month's Total */}
                <div className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">This Month</span>
                    <TrendingDown className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(monthTotal)}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-6 mt-6 border-t border-gray-100">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Expenses:</span>
                    <span className="font-medium text-gray-900">{expenses.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg per Day:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(monthTotal / new Date().getDate())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyExpenses;
