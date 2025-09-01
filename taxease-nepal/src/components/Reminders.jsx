import React, { useState, useEffect } from 'react';

function Reminders() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Example mock reminders
    const reminders = [
      "File individual tax before Jesth 31!",
      "Business turnover crossed NPR 30 lakhs!",
    ];
    setMessages(reminders);
  }, []);

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-bold mb-4">Reminders & Alerts</h2>
      <ul className="list-disc list-inside space-y-2">
        {messages.map((msg, idx) => (
          <li key={idx} className="bg-yellow-100 p-2 rounded">{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default Reminders;
