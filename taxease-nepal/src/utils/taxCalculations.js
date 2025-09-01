// Nepali tax slabs example for FY 2080/81
export function calculateTax(income) {
  let tax = 0;
  if (income <= 500000) tax = income * 0.01; // 1%
  else if (income <= 1000000) tax = 5000 + (income - 500000) * 0.10;
  else if (income <= 2000000) tax = 55000 + (income - 1000000) * 0.20;
  else tax = 255000 + (income - 2000000) * 0.30;

  return Math.round(tax);
}

export function calculatePenalty(taxDue, daysLate) {
  const dailyRate = 0.001; // 0.1% per day
  return Math.round(taxDue * dailyRate * daysLate);
}
