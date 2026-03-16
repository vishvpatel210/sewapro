import { useState } from 'react';

const PriceEstimator = ({ pricePerHour = 100 }) => {
  const [hours, setHours] = useState(2);
  const total = hours * pricePerHour;

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-3">Price Estimator</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setHours(h => Math.max(1, h - 1))}
            className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700">−</button>
          <span className="w-8 text-center font-semibold text-gray-800 dark:text-white">{hours}</span>
          <button onClick={() => setHours(h => Math.min(12, h + 1))}
            className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center hover:bg-indigo-700">+</button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">hours × ₹{pricePerHour}/hr</p>
      </div>
      <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-3">₹{total.toLocaleString('en-IN')}</p>
    </div>
  );
};
export default PriceEstimator;
