import React from 'react';

function Dashboard() {
  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded shadow">
          <p className="font-semibold">Total Income</p>
          <p className="text-2xl">NPR 0</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <p className="font-semibold">Total Expense</p>
          <p className="text-2xl">NPR 0</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          <p className="font-semibold">Estimated Tax</p>
          <p className="text-2xl">NPR 0</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
