import React from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import IncomeExpenseForm from './components/IncomeExpenseForm';
import TaxCalculator from './components/TaxCalculator';
import PenaltySimulator from './components/PenaltySimulator';
import PDFExport from './components/PDFExport';
import Reminders from './components/Reminders';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        <IncomeExpenseForm />
        <Dashboard />
        <TaxCalculator />
        <PenaltySimulator />
        <Reminders />
        <PDFExport />
      </div>
    </div>
  );
}

export default App;
