import React from 'react'
import { PDFViewer } from '@react-pdf/renderer'
import InvoicePDF from './InvoicePDF'

const InvoiceExample = () => {
  // Sample data for demonstration
  const sampleSalonInfo = {
    name: 'Glamour Studio',
    address: '123 Beauty Street, Fashion District, Mumbai - 400001',
    phone: '+91 9876543210',
    email: 'info@glamourstudio.com',
  }

  const sampleCustomerInfo = {
    name: 'Priya Sharma',
    phone: '9123456789',
    date: '2025-01-20',
  }

  const sampleServices = [
    { name: 'Hair Cut & Styling', qty: 1, price: 500 },
    { name: 'Hair Wash & Blow Dry', qty: 1, price: 300 },
    { name: 'Facial Treatment', qty: 1, price: 1200 },
    { name: 'Manicure', qty: 1, price: 400 },
    { name: 'Pedicure', qty: 1, price: 500 },
  ]

  const sampleExtraServices = [
    { name: 'Hair Spa Treatment', qty: 1, price: 800 },
    { name: 'Eyebrow Threading', qty: 1, price: 150 },
    { name: 'Hair Color Touch-up', qty: 1, price: 600 },
  ]

  const sampleSummary = {
    subtotal: 4450,
    discount: 300,
    tax: 747,
    total: 4897,
  }

  return (
    <div className="h-screen w-full">
      <div className="mb-4 rounded-lg bg-blue-50 p-4">
        <h2 className="mb-2 text-xl font-bold text-blue-800">
          Salon Mate - Invoice PDF Template
        </h2>
        <p className="text-blue-600">
          This is a production-ready invoice template using @react-pdf/renderer.
          The component accepts props for salon info, customer details,
          services, and summary.
        </p>
      </div>

      <PDFViewer width="100%" height="600">
        <InvoicePDF
          salonInfo={sampleSalonInfo}
          customerInfo={sampleCustomerInfo}
          services={sampleServices}
          extraServices={sampleExtraServices}
          summary={sampleSummary}
          invoiceNumber="INV-2025-001"
        />
      </PDFViewer>
    </div>
  )
}

export default InvoiceExample
