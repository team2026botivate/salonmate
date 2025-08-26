export function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
  
    return date.toLocaleString("en-IN", {
      dateStyle: "medium", // e.g. 23 Aug 2025
      timeStyle: "short",  // e.g. 12:22 PM
    });
  }
  
 