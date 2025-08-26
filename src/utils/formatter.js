export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  export const exportToCSV = (services, filename) => {
    const headers = ['Service Name', 'Duration', 'Price', 'Description', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...services.map(service => [
        `"${service.name}"`,
        `"${service.duration}"`,
        service.price,
        `"${service.description}"`,
        service.isDeleted ? 'Deleted' : 'Active',
        `"${formatDate(service.createdAt)}"`
      ].join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };