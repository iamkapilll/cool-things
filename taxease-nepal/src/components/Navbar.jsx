import React from 'react';
import { FaHome } from 'react-icons/fa';

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <FaHome className="text-2xl"/>
        <span className="font-bold text-xl">TaxEase Nepal</span>
      </div>
      <div>
        <button className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-100 transition">Login</button>
      </div>
    </nav>
  );
}

export default Navbar;
