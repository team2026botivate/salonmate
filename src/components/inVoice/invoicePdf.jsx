import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

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
  },
  logoSection: {
    flex: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
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
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
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
  quantity: {
    flex: 1,
    textAlign: 'center',
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

const InvoicePDF = ({
  salonInfo,
  customerInfo,
  services,
  extraServices = [],
  summary,
  invoiceNumber = `INV-${Date.now()}`,
}) => {
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.logo}>SALON MATE</Text>
            <Text style={styles.tagline}>Professional Salon Management</Text>
          </View>
          <View style={styles.salonDetails}>
            <Text style={styles.salonName}>{salonInfo.name}</Text>
            <Text style={styles.salonText}>{salonInfo.address}</Text>
            <Text style={styles.salonText}>Phone: {salonInfo.phone}</Text>
            <Text style={styles.salonText}>Email: {salonInfo.email}</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.infoText}>{customerInfo.name}</Text>
            <Text style={styles.infoText}>Phone: {customerInfo.phone}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <Text style={styles.invoiceNumber}>#{invoiceNumber}</Text>
            <Text style={styles.infoText}>
              Date: {formatDate(customerInfo.date)}
            </Text>
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.serviceName]}>
              Service
            </Text>
            <Text style={[styles.tableCellHeader, styles.quantity]}>Qty</Text>
            <Text style={[styles.tableCellHeader, styles.price]}>Price</Text>
            <Text style={[styles.tableCellHeader, styles.total]}>Total</Text>
          </View>

          {/* Table Rows */}
          {services.map((service, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={[styles.tableCell, styles.serviceName]}>
                {service.name}
              </Text>
              <Text style={[styles.tableCell, styles.quantity]}>
                {service.qty}
              </Text>
              <Text style={[styles.tableCell, styles.price]}>
                {formatCurrency(service.price)}
              </Text>
              <Text style={[styles.tableCell, styles.total]}>
                {formatCurrency(service.qty * service.price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Extra Services Table (if any) */}
        {extraServices && extraServices.length > 0 && (
          <View style={styles.table}>
            {/* Extra Services Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, styles.serviceName]}>
                Extra Services
              </Text>
              <Text style={[styles.tableCellHeader, styles.quantity]}>Qty</Text>
              <Text style={[styles.tableCellHeader, styles.price]}>Price</Text>
              <Text style={[styles.tableCellHeader, styles.total]}>Total</Text>
            </View>

            {/* Extra Services Rows */}
            {extraServices.map((service, index) => (
              <View
                key={`extra-${index}`}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={[styles.tableCell, styles.serviceName]}>
                  {service.name}
                </Text>
                <Text style={[styles.tableCell, styles.quantity]}>
                  {service.qty}
                </Text>
                <Text style={[styles.tableCell, styles.price]}>
                  {formatCurrency(service.price)}
                </Text>
                <Text style={[styles.tableCell, styles.total]}>
                  {formatCurrency(service.qty * service.price)}
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
                {formatCurrency(summary.subtotal)}
              </Text>
            </View>

            {summary.discount && summary.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount:</Text>
                <Text style={styles.summaryValue}>
                  -{formatCurrency(summary.discount)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.tax)}
              </Text>
            </View>

            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryTotal}>Total:</Text>
              <Text style={styles.summaryTotal}>
                {formatCurrency(summary.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.thankYou}>
            Thank you for choosing {salonInfo.name}!
          </Text>
          <Text style={styles.poweredBy}>Powered by Salon Mate</Text>
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDF
