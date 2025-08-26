export const calculatediscount = (price, discount) => {
    
   const p = Number(price)
   let d = Number(discount)

   if (isNaN(p)) return 0
   if (isNaN(d)) d = 0

   // If discount is between 0 and 1, treat it as a fraction (e.g., 0.1 => 10%)
   if (d >= 0 && d <= 1) d = d * 100

   // Clamp to [0, 100]
   d = Math.min(Math.max(d, 0), 100)

   const result = p - (p * d) / 100
   // Prevent negative totals and normalize to 2 decimals precision
   return Math.max(0, Number(result.toFixed(2)))
 }