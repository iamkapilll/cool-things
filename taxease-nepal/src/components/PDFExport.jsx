import React from 'react';
import jsPDF from 'jspdf';

function PDFExport() {
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text("TaxEase Nepal - Summary Report", 10, 10);
    doc.text("Income, Expenses, Tax, Penalties - Placeholder", 10, 20);
    doc.save("TaxEaseNepal_Summary.pdf");
  };

  return (
    <div className="bg-white shadow rounded p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Download Summary</h2>
      <button
        onClick={handleDownload}
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
      >
        Download PDF
      </button>
    </div>
  );
}

export default PDFExport;
