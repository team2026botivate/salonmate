export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(num);
  } catch {
    return `₹${num.toFixed(2)}`;
  }
};
