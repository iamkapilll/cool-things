import React, { useState } from 'react';

function IncomeExpenseForm() {
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Income: NPR ${income}\nExpense: NPR ${expense}`);
    setIncome('');
    setExpense('');
  }

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Income & Expense Entry</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Income (NPR)"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          value={expense}
          onChange={(e) => setExpense(e.target.value)}
          placeholder="Expense (NPR)"
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Add Entry
        </button>
      </form>
    </div>
  );
}

export default IncomeExpenseForm;
