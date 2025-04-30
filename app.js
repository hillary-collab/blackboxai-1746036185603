import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

// Blue-related colors for the charts
const COLORS = ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

export default function FinancialTracker() {
  // State management
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('financial-tracker-transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [
      { id: 1, description: 'Product Sales', amount: 5000, type: 'income', category: 'Sales', date: '2025-04-01' },
      { id: 2, description: 'Office Rent', amount: 1500, type: 'expense', category: 'Rent', date: '2025-04-05' },
      { id: 3, description: 'Office Supplies', amount: 300, type: 'expense', category: 'Supplies', date: '2025-04-10' },
      { id: 4, description: 'Consulting Income', amount: 1200, type: 'income', category: 'Services', date: '2025-04-15' },
      { id: 5, description: 'Marketing', amount: 400, type: 'expense', category: 'Marketing', date: '2025-04-20' }
    ];
  });
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().slice(0, 10)
  });
  
  const [view, setView] = useState('dashboard');
  const [filter, setFilter] = useState('all');

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('financial-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Helper functions
  const calculateBalance = () => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === 'income' 
        ? acc + parseFloat(transaction.amount) 
        : acc - parseFloat(transaction.amount);
    }, 0);
  };

  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);
  };

  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => acc + parseFloat(transaction.amount), 0);
  };

  // Functions for adding/removing transactions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      alert('Please fill in all fields');
      return;
    }

    const newId = transactions.length > 0 
      ? Math.max(...transactions.map(t => t.id)) + 1 
      : 1;
    
    setTransactions([
      ...transactions, 
      { 
        ...newTransaction, 
        id: newId, 
        amount: parseFloat(newTransaction.amount) 
      }
    ]);
    
    // Reset form
    setNewTransaction({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().slice(0, 10)
    });
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  };

  // Functions for charts data
  const getExpensesByCategory = () => {
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        if (expensesByCategory[transaction.category]) {
          expensesByCategory[transaction.category] += parseFloat(transaction.amount);
        } else {
          expensesByCategory[transaction.category] = parseFloat(transaction.amount);
        }
      });
    
    return Object.keys(expensesByCategory).map(category => ({
      name: category,
      value: expensesByCategory[category]
    }));
  };

  const getIncomeByCategory = () => {
    const incomeByCategory = {};
    transactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        if (incomeByCategory[transaction.category]) {
          incomeByCategory[transaction.category] += parseFloat(transaction.amount);
        } else {
          incomeByCategory[transaction.category] = parseFloat(transaction.amount);
        }
      });
    
    return Object.keys(incomeByCategory).map(category => ({
      name: category,
      value: incomeByCategory[category]
    }));
  };

  const getMonthlyData = () => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // Extract YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += parseFloat(transaction.amount);
      } else {
        monthlyData[month].expenses += parseFloat(transaction.amount);
      }
    });
    
    return Object.keys(monthlyData)
      .sort()
      .map(month => ({
        name: month,
        income: monthlyData[month].income,
        expenses: monthlyData[month].expenses,
        balance: monthlyData[month].income - monthlyData[month].expenses
      }));
  };

  // Filtered transactions
  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions;
    return transactions.filter(t => t.type === filter);
  };

  // Unique categories for dropdown
  const uniqueCategories = [...new Set(transactions.map(t => t.category))];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Micro & Small Business Financial Tracker</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-800 text-white p-2">
        <div className="container mx-auto flex space-x-4">
          <button 
            onClick={() => setView('dashboard')} 
            className={`px-3 py-1 rounded ${view === 'dashboard' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('transactions')} 
            className={`px-3 py-1 rounded ${view === 'transactions' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >
            Transactions
          </button>
          <button 
            onClick={() => setView('add')} 
            className={`px-3 py-1 rounded ${view === 'add' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          >
            Add New
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 overflow-auto">
        <div className="container mx-auto">
          
          {/* Dashboard View */}
          {view === 'dashboard' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Balance Card */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Current Balance</p>
                      <h2 className={`text-2xl font-bold ${calculateBalance() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${calculateBalance().toFixed(2)}
                      </h2>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <DollarSign className="text-blue-500" size={24} />
                    </div>
                  </div>
                </div>

                {/* Income Card */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Income</p>
                      <h2 className="text-2xl font-bold text-blue-600">${calculateTotalIncome().toFixed(2)}</h2>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ArrowUpRight className="text-blue-500" size={24} />
                    </div>
                  </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">Total Expenses</p>
                      <h2 className="text-2xl font-bold text-blue-600">${calculateTotalExpenses().toFixed(2)}</h2>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ArrowDownRight className="text-blue-500" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense By Category Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getExpensesByCategory()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#3B82F6"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getExpensesByCategory().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Income By Category Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Income by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getIncomeByCategory()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#3B82F6"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getIncomeByCategory().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Overview Chart */}
                <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMonthlyData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#2563EB" />
                        <Bar dataKey="expenses" name="Expenses" fill="#60A5FA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transactions View */}
          {view === 'transactions' && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transaction History</h2>
                <div className="flex space-x-2">
                  <select 
                    className="border rounded p-2"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Transactions</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Description</th>
                      <th className="py-2 px-4 text-left">Category</th>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-right">Amount</th>
                      <th className="py-2 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTransactions()
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(transaction => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{transaction.date}</td>
                          <td className="py-2 px-4">{transaction.description}</td>
                          <td className="py-2 px-4">{transaction.category}</td>
                          <td className="py-2 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              transaction.type === 'income' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </td>
                          <td className={`py-2 px-4 text-right font-medium text-blue-600`}>
                            {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <button 
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {getFilteredTransactions().length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No transactions found.
                </div>
              )}
            </div>
          )}

          {/* Add Transaction View */}
          {view === 'add' && (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newTransaction.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. Product Sales"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={newTransaction.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={newTransaction.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Category</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="category"
                      value={newTransaction.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      placeholder="e.g. Sales, Rent, Supplies"
                      list="categories"
                    />
                    <datalist id="categories">
                      {uniqueCategories.map((category, index) => (
                        <option key={index} value={category} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={newTransaction.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <button
                  onClick={handleAddTransaction}
                  className="w-full bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center gap-2 hover:bg-blue-800"
                >
                  <Plus size={18} />
                  Add Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white p-4 text-center text-sm">
        <p>Micro & Small Business Financial Tracker © 2025</p>
      </footer>
    </div>
  );
}
