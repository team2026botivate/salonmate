import React from 'react'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import logoPng from '/3.png'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 4,
  },
  brandText: {
    flexDirection: 'column',
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  tagline: {
    fontSize: 10,
    color: '#6b7280',
  },
  salonDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  salonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  salonText: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 2,
  },

  // Invoice Info Section
  invoiceInfo: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 32,
  },
  infoColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 4,
    marginTop: 2,
  },
  invoiceNumber: {
    fontSize: 8,
    fontWeight: 'normal',
    color: '#2563eb',
    marginBottom: 4,
    marginTop: 6,
  },

  // Table Styles
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#d1d5db',
    borderRightColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: '#d1d5db',
    borderRightColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
    paddingHorizontal: 4,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },
  serviceName: {
    flex: 2,
  },
  price: {
    flex: 1,
    textAlign: 'right',
  },
  total: {
    flex: 1,
    textAlign: 'right',
  },

  // Summary Styles
  summarySection: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  summaryTable: {
    width: 200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  summaryTotal: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: 'bold',
  },

  // Footer Styles
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  thankYou: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  poweredBy: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

export const InvoicePDF = ({
  salonInfo,
  customerInfo,
  services,
  extraServices = [],
  summary,
  invoiceNumber = `INV-${Date.now()}`,
}) => {
  // Safe guards and fallbacks to avoid runtime errors
  const salon = salonInfo || {}
  const customer = customerInfo || {}
  const svc = Array.isArray(services) ? services : []
  const extras = Array.isArray(extraServices) ? extraServices : []
  const sum = summary || { subtotal: 0, discount: 0, tax: 0, total: 0 }

  // Vite static import resolves to a URL that react-pdf can fetch
  const logoSrc = logoPng
  // Plain number formatting (no currency symbol)
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  // Compute subtotal and total from line items and given discount/tax
  const subtotalComputed = [...svc, ...extras].reduce(
    (acc, item) => acc + (Number(item?.price) || 0),
    0
  )
  const totalComputed = Math.max(
    0,
    subtotalComputed - (Number(sum.discount) || 0) + (Number(sum.tax) || 0)
  )

  // Format date and time in Indian style
  const formatDateTime = (value) => {
    const date = new Date(value)
    if (isNaN(date)) return ''
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getDate = (date) => {
    return date.toISOString().split('T')[0]
  }
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <Image src={logoSrc} style={styles.logoImage} />
            <View style={styles.brandText}>
              <Text style={styles.logo}>SALON MATE</Text>
              <Text style={styles.tagline}>Professional Salon Management</Text>
            </View>
          </View>
          <View style={styles.salonDetails}>
            <Text style={styles.salonName}>{salon.name || ''}</Text>
            <Text style={styles.salonText}>{salon.address || ''}</Text>
            <Text style={styles.salonText}>Phone: {salon.phone || ''}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.infoText}>Name: {customer.name || ''}</Text>
            <Text style={styles.infoText}>Phone: {customer.phone || ''}</Text>
            {extras.length > 0 && (
              <Text style={styles.infoText}>Extras: {extras.length} items</Text>
            )}
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
            <Text style={styles.infoText}>
              Date & Time: {formatDateTime(customer.date || customer.transactions_date || new Date().toISOString())}
            </Text>
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.serviceName]}>
              Service
            </Text>
            <Text style={[styles.tableCellHeader, styles.price]}>Price</Text>
            <Text style={[styles.tableCellHeader, styles.total]}>Total</Text>
          </View>
          {svc.map((service, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={[styles.tableCell, styles.serviceName]}>
                {service.name}
              </Text>
              <Text style={[styles.tableCell, styles.price]}>
                {formatCurrency(service.price)}
              </Text>
              <Text style={[styles.tableCell, styles.total]}>
                {formatCurrency(service.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Extra Services Table */}
        {extras.length > 0 && (
          <View style={[styles.table, { marginTop: 8 }]}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, styles.serviceName]}>
                Extra Services
              </Text>
              <Text style={[styles.tableCellHeader, styles.price]}>Price</Text>
              <Text style={[styles.tableCellHeader, styles.total]}>Total</Text>
            </View>
            {extras.map((service, index) => (
              <View
                key={`extra-${index}`}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.tableCell, styles.serviceName]}>
                  {service.name}
                </Text>
                <Text style={[styles.tableCell, styles.price]}>
                  {formatCurrency(service.price)}
                </Text>
                <Text style={[styles.tableCell, styles.total]}>
                  {formatCurrency(service.price)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(subtotalComputed)}
              </Text>
            </View>
            {sum.discount && sum.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={styles.summaryValue}>
                  -{formatCurrency(Number(sum.discount) || 0)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(Number(sum.tax) || 0)}
              </Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryTotal}>Total:</Text>
              <Text style={styles.summaryTotal}>
                {formatCurrency(totalComputed)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>
            Thank you for choosing {salon.name || 'our salon'}!
          </Text>
          <Text style={styles.poweredBy}>Powered by Botivate Pvt Ltd</Text>
        </View>
      </Page>
    </Document>
  )
}
