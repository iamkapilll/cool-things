import React, { useState } from 'react';

function AIAssistant() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleAsk = () => {
    // Mock AI response
    setAnswer(`You asked: "${question}". TaxEase Nepal suggests checking official IRD guidelines.`);
  };

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">AI Assistant (Mock)</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Ask a tax question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={handleAsk}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition"
        >
          Ask
        </button>
      </div>
      {answer && <p className="mt-4 p-2 bg-gray-100 rounded">{answer}</p>}
    </div>
  );
}

export default AIAssistant;
