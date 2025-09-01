import React, { useState } from 'react';
import { calculatePenalty, calculateTax } from '../utils/taxCalculations';

function PenaltySimulator() {
  const [income, setIncome] = useState('');
  const [daysLate, setDaysLate] = useState('');
  const [penalty, setPenalty] = useState(null);

  const handleSimulate = () => {
    const taxDue = calculateTax(Number(income));
    const result = calculatePenalty(taxDue, Number(daysLate));
    setPenalty(result);
  };

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Penalty Simulator</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="number"
          placeholder="Income (NPR)"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          type="number"
          placeholder="Days Late"
          value={daysLate}
          onChange={(e) => setDaysLate(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleSimulate}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Simulate
        </button>
      </div>
      {penalty !== null && (
        <p className="mt-4 text-lg font-semibold">
          Estimated Penalty: NPR {penalty}
        </p>
      )}
    </div>
  );
}

export default PenaltySimulator;

