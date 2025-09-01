import React, { useState } from 'react';
import { calculateTax } from '../utils/taxCalculations';

function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [tax, setTax] = useState(null);

  const handleCalculate = () => {
    const result = calculateTax(Number(income));
    setTax(result);
  };

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Tax Calculator</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="number"
          placeholder="Enter income (NPR)"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleCalculate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Calculate Tax
        </button>
      </div>
      {tax !== null && (
        <p className="mt-4 text-lg font-semibold">Estimated Tax: NPR {tax}</p>
      )}
    </div>
  );
}

export default TaxCalculator;
