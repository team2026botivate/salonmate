
export const LOW_STOCK_THRESHOLD = 5

export const calculateStockStatus = (quantity) => {
  if (quantity === 0) return 'Out of Stock'
  if (quantity <= LOW_STOCK_THRESHOLD) return 'Low Stock'
  return 'In Stock'
}

export const calculateInventoryStats = (products) => {
  return {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stockStatus === 'Low Stock').length,
    outOfStock: products.filter((p) => p.stockStatus === 'Out of Stock').length,
  }
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'In Stock':
      return 'text-green-600 bg-green-100'
    case 'Low Stock':
      return 'text-yellow-600 bg-yellow-100'
    case 'Out of Stock':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export const sortProducts = (products, field, direction) => {
  return [...products].sort((a, b) => {
    let aValue = a[field]
    let bValue = b[field]

    if (field === 'purchaseDate') {
      aValue = new Date(a.purchaseDate).getTime()
      bValue = new Date(b.purchaseDate).getTime()
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export const filterProducts = (products, searchTerm, statusFilter) => {
  return products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || product.stockStatus === statusFilter
    return matchesSearch && matchesStatus
  })
}

export const exportToCSV = (products) => {
  const headers = [
    'Product Name',
    'Stock Quantity',
    'Purchase Date',
    'Cost Price',
    'Stock Status',
  ]
  const csvContent = [
    headers.join(','),
    ...products.map((product) =>
      [
        `"${product.name}"`,
        product.stockQuantity,
        product.purchaseDate,
        product.costPrice,
        `"${product.stockStatus}"`,
      ].join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `salon-inventory-${new Date().toISOString().split('T')[0]}.csv`
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
