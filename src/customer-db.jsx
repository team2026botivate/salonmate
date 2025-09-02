import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Filter,
  MessageCircle,
  MessageSquare,
  Phone,
  Search,
  Send,
  Users,
  X,
  Mail,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGetCustomerDataFetch } from './hook/dbOperation'
import { useSendEmail } from './hook/sendEmail'

// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-4 left-1/2 z-50 transform"
        >
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${
              type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Message Modal Component

const MessageModal = ({
  isOpen,
  onClose,
  customer,
  onSendEmail,
  onSendWhatsApp,
}) => {
  const [activeTab, setActiveTab] = useState('email')
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const maxLength = 300

  // Email Templates
  const emailTemplates = [
    {
      id: 'appointment',
      name: 'Appointment Reminder',
      content:
        'Hi {name}, this is a reminder for your appointment tomorrow at {time}. Please confirm your attendance.',
    },
    {
      id: 'promo',
      name: 'Promo Offer',
      content:
        'Hi {name}! 🎉 Special offer just for you - 20% off your next purchase. Use code SAVE20. Valid until {date}.',
    },
    {
      id: 'payment',
      name: 'Payment Reminder',
      content:
        'Hi {name}, your payment of ${amount} is due on {date}. Please make the payment to avoid late fees.',
    },
    {
      id: 'welcome',
      name: 'Welcome Message',
      content:
        "Welcome {name}! Thank you for choosing our services. We're excited to work with you.",
    },
  ]

  // WhatsApp Templates
  const whatsappTemplates = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      content:
        "Hi {name}! 👋 Welcome to our service. We're here to help you every step of the way. Feel free to reach out anytime!",
    },
    {
      id: 'followup',
      name: 'Follow-Up Reminder',
      content:
        "Hi {name}, just checking in! How was your experience with us? We'd love to hear your feedback. 😊",
    },
    {
      id: 'order',
      name: 'Order Update',
      content:
        'Hi {name}! 📦 Your order #{orderNumber} has been shipped and will arrive by {date}. Track your package here: {link}',
    },
    {
      id: 'support',
      name: 'Support Message',
      content:
        'Hi {name}, our support team is here to help! Please let us know how we can assist you today. 💬',
    },
  ]

  const getCurrentTemplates = () => {
    return activeTab === 'email' ? emailTemplates : whatsappTemplates
  }

  const handleTemplateSelect = (templateContent) => {
    setSelectedTemplate(templateContent)
    // Replace placeholders with customer data
    let processedMessage = templateContent
    if (customer) {
      processedMessage = processedMessage
        .replace(/{name}/g, customer.name)
        .replace(/{email}/g, customer.email)
        .replace(/{time}/g, '2:00 PM')
        .replace(/{date}/g, new Date().toLocaleDateString())
        .replace(/{amount}/g, '100')
        .replace(/{orderNumber}/g, '12345')
        .replace(/{link}/g, 'https://track.example.com')
    }
    setMessage(processedMessage)
  }
  const handleSend = async () => {
    if (!message.trim()) return
    // Call appropriate handler based on active tab
    if (activeTab === 'email') {
      try {
        setIsLoading(true)
        const res = await onSendEmail?.(message, customer?.email)
        if (res?.success) {
          handleClose()
        }
      } finally {
        setIsLoading(false)
      }
    } else {
      onSendWhatsApp?.(message, customer?.phone)
    }
  }

  const handleClose = () => {
    setMessage('')
    setSelectedTemplate('')
    setActiveTab('email')
    onClose()
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setMessage('')
    setSelectedTemplate('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Send Message
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Customer Info */}
            {customer && (
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <span className="font-semibold text-purple-600">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="mb-4">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => handleTabChange('email')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === 'email'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail size={16} />
                  Email
                </button>
                <button
                  onClick={() => handleTabChange('whatsapp')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    activeTab === 'whatsapp'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare size={16} />
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Choose Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a template...</option>
                {getCurrentTemplates().map((template) => (
                  <option key={template.id} value={template.content}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Message
              </label>
              <motion.textarea
                key={activeTab} // Force re-render on tab change
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
                placeholder={`Type your ${activeTab === 'email' ? 'Email' : 'WhatsApp'} message here...`}
                className="h-32 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {message.length}/{maxLength} characters
                </span>
                <span
                  className={`text-xs ${
                    message.length > maxLength * 0.9
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}
                >
                  {maxLength - message.length} remaining
                </span>
              </div>
            </div>

            {/* Live Preview */}
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Preview
                </label>
                <div
                  className={`rounded-lg border-2 border-dashed p-3 ${
                    activeTab === 'email'
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        activeTab === 'email'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {activeTab === 'email' ? (
                        <Mail size={12} />
                      ) : (
                        <MessageSquare size={12} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap text-gray-700">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:bg-gray-300 ${
                  activeTab === 'email'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send size={16} />
                )}
                Send {activeTab === 'email' ? 'Email' : 'WhatsApp'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Table Component
const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-4 rounded-lg bg-white p-4"
        >
          <div className="h-10 w-10 rounded-full bg-gray-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 rounded bg-gray-300"></div>
            <div className="h-3 w-1/6 rounded bg-gray-300"></div>
          </div>
          <div className="hidden h-4 w-1/6 rounded bg-gray-300 md:block"></div>
          <div className="hidden h-4 w-1/8 rounded bg-gray-300 lg:block"></div>
          <div className="hidden h-4 w-1/8 rounded bg-gray-300 lg:block"></div>
          <div className="hidden h-4 w-1/8 rounded bg-gray-300 lg:block"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-gray-300"></div>
            <div className="h-8 w-8 rounded bg-gray-300"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Main Customer Management Component
const CustomerManagement = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [toast, setToast] = useState({
    message: '',
    type: 'success',
    isVisible: false,
  })

  const { loading, error, data } = useGetCustomerDataFetch()

  const sendEmail = useSendEmail()

  const itemsPerPage = 10

  // Map DB rows to UI and handle loading state from hook
  useEffect(() => {
    setIsLoading(loading)
  }, [loading])

  useEffect(() => {
    if (!data) return
    const mapped = (data || []).map((row) => ({
      id: row.id,
      name: row.customer_name || 'Unknown',
      phone: row.mobile_number || '',
      email: row.email || '',
      lastVisit: row.timestamp || row.created_at || null,
      totalVisits: row.total_visits ?? null,
      totalSpent: row.total_spent ?? null,
    }))

    setCustomers(mapped)
    setFilteredCustomers(mapped)
  }, [data])

  // Search functionality
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCustomers(filtered)
    setCurrentPage(1)
  }, [searchTerm, customers])

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex)

  const handleSendMessage = (message) => {
    setToast({
      message: `Message sent to ${selectedCustomer?.name} successfully!`,
      type: 'success',
      isVisible: true,
    })
  }

  const handleViewProfile = (customer) => {
    // This would typically navigate to a detailed customer profile page
    setToast({
      message: `Opening profile for ${customer.name}`,
      type: 'success',
      isVisible: true,
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleSendEmail = async (message, emailAddress) => {
    const res = await sendEmail(message, emailAddress)
    // Fallback local toast in case global toasts are not visible
    // console.log(res, "res")
    setToast({
      message:
        res?.message || (res?.success ? 'Email sent' : 'Failed to send email'),
      type: res?.success ? 'success' : 'error',
      isVisible: true,
    })
    return res
  }

  const handleSendWhatsApp = (message, phoneNumber) => {
    // console.log(message)
    // console.log(customer, 'customer')
    // sendWhatsApp(message, phoneNumber)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600">
            Manage your salon customers and their information
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </motion.div>

        {/* Customer Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-hidden rounded-xl bg-white shadow-lg"
        >
          {error && (
            <div className="mx-6 mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              Failed to load customers: {String(error)}
            </div>
          )}
          {isLoading ? (
            <div className="p-6">
              <TableSkeleton />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Last Visit
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Visits
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Total Spent
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                              <span className="font-semibold text-purple-600">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {customer.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            {customer.lastVisit
                              ? formatDate(customer.lastVisit)
                              : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {customer.totalVisits ?? '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign size={14} className="text-green-500" />
                            <span className="font-semibold text-green-600">
                              {customer.totalSpent != null
                                ? formatCurrency(customer.totalSpent)
                                : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewProfile(customer)}
                              className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                              title="View Profile"
                            ></motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setIsMessageModalOpen(true)
                              }}
                              className="rounded-lg p-2 text-green-600 transition-colors hover:cursor-pointer hover:bg-green-50"
                              title="Send Message"
                            >
                              <MessageCircle size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 p-4 lg:hidden">
                {currentCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="rounded-lg bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-lg font-semibold text-purple-600">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {customer.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewProfile(customer)}
                          className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                        ></motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setIsMessageModalOpen(true)
                          }}
                          className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                        >
                          <MessageCircle size={16} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Last Visit</p>
                        <p className="font-medium text-gray-900">
                          {customer.lastVisit
                            ? formatDate(customer.lastVisit)
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Visits</p>
                        <p className="font-medium text-gray-900">
                          {customer.totalVisits ?? '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Spent</p>
                        <p className="font-semibold text-green-600">
                          {customer.totalSpent != null
                            ? formatCurrency(customer.totalSpent)
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to{' '}
                    {Math.min(endIndex, filteredCustomers.length)} of{' '}
                    {filteredCustomers.length} customers
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </motion.button>

                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <motion.button
                          key={i + 1}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                            currentPage === i + 1
                              ? 'bg-purple-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Message Modal */}
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          customer={selectedCustomer}
          onSendMessage={handleSendMessage}
          onSendWhatsApp={handleSendWhatsApp}
          onSendEmail={handleSendEmail}
        />

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  )
}

export default CustomerManagement
