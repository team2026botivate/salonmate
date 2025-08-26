"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Calendar, CheckCircle, Clock, Mail, Phone, RefreshCw, X } from "lucide-react"
import { useAuth } from "./Context/AuthContext"

// Add keyframe animations for the notification
const License = () => {
  const { user } = useAuth()
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "", // success or error
  })
  const [loading, setLoading] = useState(true)
  const [clientData, setClientData] = useState(null)
  const [error, setError] = useState(null)

  // Add CSS for animations
  const animationStyles = `
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeOutUp {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
    .animate-fadeIn {
      animation: fadeInDown 0.3s ease-out;
    }
  `

  // Add style tag to the component
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = animationStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Google Sheet Details - using the user context pattern from WhatsApp template
  const sheetId = user?.sheetId || "1ghSQ9d2dfSotfnh8yrkiqIT00kg_ej7n0pnygzP0B9w"
  const clientSheetId = "1zEik6_I7KhRQOucBhk1FW_67IUEdcSfEHjCaR37aK_U"
  const clientSheetName = "Clients"
  const clientScriptUrl =
    "https://script.google.com/macros/s/AKfycbz6-tMsYOC4lbu4XueMyMLccUryF9HkY7HZLC22FB9QeB5NxqCcxedWKS8drwgVwlM/exec"
  const contactSheetName = "Contact License" // The sheet name requested for license contact form data

  // Fetch client data from Google Sheet
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true)
        console.log("Fetching client data for sheet ID:", sheetId)

        const url = `https://docs.google.com/spreadsheets/d/${clientSheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(clientSheetName)}`

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`)
        }

        const text = await response.text()
        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}")
        const jsonString = text.substring(jsonStart, jsonEnd + 1)
        const data = JSON.parse(jsonString)

        if (!data.table || !data.table.rows || data.table.rows.length === 0) {
          console.log("No data found in the client sheet")
          setClientData(null)
          setLoading(false)
          return
        }

        // Define column indexes
        const sheetIdColumnIndex = 0 // Column A - Sheet ID
        const expiryDateColumnIndex = 5 // Column F - Expiry Date
        const daysRemainingColumnIndex = 6 // Column G - Days Remaining

        // Find the client row that matches the current sheet ID
        const clientRow = data.table.rows.find(
          (row) => row.c && row.c[sheetIdColumnIndex] && row.c[sheetIdColumnIndex].v === sheetId,
        )

        if (!clientRow) {
          console.log("No matching client found for sheet ID:", sheetId)
          setClientData(null)
          setLoading(false)
          return
        }

        // Extract expiry date and days remaining
        const expiryDate =
          clientRow.c[expiryDateColumnIndex] && clientRow.c[expiryDateColumnIndex].v
            ? String(clientRow.c[expiryDateColumnIndex].v)
            : null

        let daysRemaining = null
        if (clientRow.c[daysRemainingColumnIndex] && clientRow.c[daysRemainingColumnIndex].v !== null) {
          daysRemaining = Number.parseInt(clientRow.c[daysRemainingColumnIndex].v, 10)
        }

        // Format the expiry date if needed
        let formattedExpiryDate = expiryDate
        if (expiryDate && expiryDate.toString().indexOf("Date") === 0) {
          const dateString = expiryDate.toString()
          const dateParts = dateString.substring(5, dateString.length - 1).split(",")

          if (dateParts.length >= 3) {
            const year = Number.parseInt(dateParts[0])
            const month = Number.parseInt(dateParts[1]) + 1
            const day = Number.parseInt(dateParts[2])

            // Format as YYYY-MM-DD
            formattedExpiryDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
          }
        }

        setClientData({
          expiryDate: formattedExpiryDate,
          daysRemaining: daysRemaining,
        })

        console.log("Client data:", { expiryDate: formattedExpiryDate, daysRemaining })
        setLoading(false)
      } catch (error) {
        console.error("Error fetching client data:", error)
        setError("Failed to load license data. Please try again later.")
        setLoading(false)
      }
    }

    fetchClientData()
  }, [sheetId, clientSheetId, clientSheetName])

  // License data with dynamic values from client data
  const licenseData = {
    status: clientData && clientData.daysRemaining < 30 ? "expiring" : "active", // active, expiring, expired
    type: "Professional",
    expiryDate: clientData ? clientData.expiryDate : "Loading...",
    daysRemaining: clientData ? clientData.daysRemaining : 0,
    maxUsers: 10,
    currentUsers: 6,
    features: [
      "Booking Management",
      "Staff Management",
      "Inventory Control",
      "Customer Database",
      "Payment Processing",
      "Reporting & Analytics",
    ],
    supportContact: {
      email: "support@example.com",
      phone: "+1 (555) 123-4567",
    },
  }

  // Determine license status color
  const getStatusColor = () => {
    if (licenseData.status === "expired") return "text-red-600 bg-red-50"
    if (licenseData.status === "expiring" || (clientData && clientData.daysRemaining < 30))
      return "text-amber-600 bg-amber-50"
    return "text-green-600 bg-green-50"
  }

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Create a contact entry with current timestamp
      const contactEntry = {
        id: `contact-${Date.now()}`,
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        date: new Date().toLocaleDateString("en-GB"), // DD/MM/YYYY format
        time: new Date().toLocaleTimeString("en-GB"), // HH:MM:SS format
      }

      // Prepare data for Google Sheets
      const contactData = [
        contactEntry.id,
        contactEntry.name,
        contactEntry.email,
        contactEntry.message,
        contactEntry.date,
        contactEntry.time,
      ]

      // Send to Google Sheets
      const formData = new FormData()
      formData.append("sheetName", contactSheetName)
      formData.append("rowData", JSON.stringify(contactData))
      formData.append("action", "insert")

      const scriptUrl =
        user?.appScriptUrl ||
        "https://script.google.com/macros/s/AKfycbx-5-79dRjYuTIBFjHTh3_Q8WQa0wWrRKm7ukq5854ET9OCHiAwno-gL1YmZ9juotMH/exec"

      const response = await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      })

      console.log("Contact form submitted to Google Sheets")

      // Reset form and close it
      setContactForm({
        name: "",
        email: "",
        message: "",
      })
      setIsContactDialogOpen(false)

      // Show success notification with improved styling
      setNotification({
        show: true,
        message: "Your message has been sent successfully! Our support team will contact you soon.",
        type: "success",
      })

      // Keep notification visible longer (5 seconds)
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" })
      }, 5000)
    } catch (error) {
      console.error("Error submitting contact form:", error)

      // Show error notification
      setNotification({
        show: true,
        message: `Failed to send message: ${error.message}`,
        type: "error",
      })

      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" })
      }, 5000)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  // Hide notification after timeout
  const hideNotification = () => {
    setNotification({
      show: false,
      message: "",
      type: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">License Management</h1>
          <p className="text-gray-500">View and manage your software license details</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsContactDialogOpen(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Phone className="mr-2 h-4 w-4" />
            Contact Support
          </button>
          <button
            onClick={() => setIsRenewDialogOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Renew License
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading license information...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* License Status Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">License Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor()}`}>
                {licenseData.status}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-4">Your current license information</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                  {licenseData.expiryDate}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Days Remaining</p>
                <p className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-gray-500" />
                  {licenseData.daysRemaining} days
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium text-gray-500">Time until expiration</p>
                <p className="text-sm">{Math.round((licenseData.daysRemaining / 365) * 100)}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((licenseData.daysRemaining / 365) * 100))}%` }}
                ></div>
              </div>
            </div>

            {clientData && clientData.daysRemaining < 30 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">License Expiring Soon</p>
                  <p className="text-sm">
                    Your license will expire in {clientData.daysRemaining} days. Please renew to avoid service
                    interruption.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsRenewDialogOpen(true)}
              className="w-full mt-4 flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew License
            </button>
          </div>

          {/* License Details Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-1">License Details</h2>
            <p className="text-gray-500 text-sm mb-4">Features and limitations of your current plan</p>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">User Allocation</p>
              <div className="flex justify-between mb-1">
                <p className="text-sm">
                  Users: {licenseData.currentUsers} / {licenseData.maxUsers}
                </p>
                <p className="text-sm">{Math.round((licenseData.currentUsers / licenseData.maxUsers) * 100)}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.round((licenseData.currentUsers / licenseData.maxUsers) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Included Features</p>
              <ul className="space-y-2">
                {licenseData.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-2">Support Contact</p>
              <div className="flex flex-col space-y-1">
                <p className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {licenseData.supportContact.email}
                </p>
                <p className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {licenseData.supportContact.phone}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Dialog */}
      {isContactDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Contact License Support</h3>
              <button onClick={() => setIsContactDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-500 mb-4">Fill out this form to get in touch with our license support team.</p>
              <form onSubmit={handleContactSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsContactDialogOpen(false)}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Renew License Dialog */}
      {isRenewDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Renew Your License</h3>
              <button onClick={() => setIsRenewDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-500 mb-4">
                Extend your license to continue using all features without interruption.
              </p>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">Current Plan: {licenseData.type}</p>
                  <p className="text-sm text-gray-500">Expires: {licenseData.expiryDate}</p>
                </div>
                <p className="text-xl font-bold">
                  $299<span className="text-sm font-normal">/year</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-start mb-4">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Renewal Offer</p>
                  <p className="text-sm">Renew now and get 10% off your subscription for the next year!</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsRenewDialogOpen(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would redirect to payment page
                    setIsRenewDialogOpen(false)
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification popup */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-xl z-50 animate-fadeIn ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
          style={{
            animation: "fadeInDown 0.3s ease-out, fadeOutUp 0.3s ease-in 4.7s",
          }}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 mr-3 text-red-600" />
            )}
            <div>
              <p className="font-medium text-base">{notification.message}</p>
              {notification.type === "success" && (
                <p className="text-sm text-green-600 mt-1">Thank you for contacting us!</p>
              )}
            </div>
            <button
              onClick={() => setNotification({ show: false, message: "", type: "" })}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default License
