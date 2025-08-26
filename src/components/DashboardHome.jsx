"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../Context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  Scissors,
  CheckCircle,
  XCircle,
  ShoppingBag,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react"

const DashboardHome = ({ setActiveTab }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate() // Initialize navigate from react-router
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    bookings: {
      today: 0,
      upcoming: 0,
      totalClients: 0,
      percentChange: 0, 
    },
    revenue: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      percentChange: 0,
    },
    services: {
      total: 0,
      popular: "",
      categories: 0,
      percentChange: 0,
    },
    staff: {
      total: 0,
      present: 0,
      absent: 0,
      percentChange: 0,
    },
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])

  // Google Sheet Details
  // const sheetId = "1ghSQ9d2dfSotfnh8yrkiqIT00kg_ej7n0pnygzP0B9w"
  const sheetId = user?.sheetId || '1ghSQ9d2dfSotfnh8yrkiqIT00kg_ej7n0pnygzP0B9w';
  const bookingSheetName = "Booking DB"
  const staffSheetName = "Staff DB"
  const serviceSheetName = "Service DB"
  const staffAttendanceSheet = "Staff Attendance"
  const dailyEntrySheet = "Daily Entry"

  // Helper function to format Google Sheets date string
  const formatGoogleSheetsDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return dateString;
    
    // Handle DD/MM/YYYY format (already formatted)
    if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      return dateString;
    }
    
    // Handle Google Sheets Date() format
    if (dateString.startsWith('Date(')) {
      const match = /Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+)(?:,(\d+))?)?\)/.exec(dateString);
      
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10); // 0-indexed month
        const day = parseInt(match[3], 10);
        
        // Special case for time-only values (Google Sheets epoch)
        if (year === 1899 && month === 11 && day === 30) {
          const hour = match[4] ? parseInt(match[4], 10) : 0;
          const minute = match[5] ? parseInt(match[5], 10) : 0;
          
          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          
          // Return just the time
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        }
        
        // Normal date (with or without time)
        const formattedDate = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
        
        // If time components exist, format them too
        if (match[4] && match[5]) {
          const hour = parseInt(match[4], 10);
          const minute = parseInt(match[5], 10);
          
          const date = new Date(year, month, day, hour, minute);
          const formattedTime = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
          
          return `${formattedDate}, ${formattedTime}`;
        }
        
        return formattedDate;
      }
    }
    
    return dateString; // Return original if no pattern matched
  };
  
  // Utility function to format Google Sheets time string (for time-only values)
  const formatGoogleSheetsTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return timeString;
    
    // Handle Google Sheets Date() format for time
    if (timeString.startsWith('Date(')) {
      const match = /Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+)(?:,(\d+))?)?\)/.exec(timeString);
      
      if (match) {
        // If it has hours and minutes
        if (match[4] && match[5]) {
          const hour = parseInt(match[4], 10);
          const minute = parseInt(match[5], 10);
          
          // Create a date object with today's date but the specified time
          const date = new Date();
          date.setHours(hour, minute, 0, 0);
          
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        }
      }
    }
    
    return timeString; // Return original if no pattern matched
  };
  
  // Helper function to parse date from various formats
  const parseDate = (dateValue) => {
    if (!dateValue) return null
    
    try {
      // Handle DD/MM/YYYY format
      if (typeof dateValue === 'string' && dateValue.includes('/')) {
        const dateParts = dateValue.split('/')
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10)
          const month = parseInt(dateParts[1], 10) - 1 // Convert to 0-indexed month
          const year = parseInt(dateParts[2], 10)
          return new Date(year, month, day)
        }
      }
      
      // Handle Google Sheets date format: Date(year,month,day)
      if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
        const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateValue)
        if (match) {
          const year = parseInt(match[1], 10)
          const month = parseInt(match[2], 10) // Month is 0-indexed in JS Date
          const day = parseInt(match[3], 10)
          return new Date(year, month, day)
        }
      }
      
      return null
    } catch (error) {
      console.error("Date parsing error:", error)
      return null
    }
  }
  
  // Helper function to parse date values from various formats
  const parseDateValue = (dateValue, formattedDate) => {
    if (!dateValue) return null
    
    try {
      // Check if we have a formatted date in DD/MM/YYYY format
      if (formattedDate && typeof formattedDate === 'string' && formattedDate.includes('/')) {
        const dateParts = formattedDate.split('/')
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0], 10)
          const month = parseInt(dateParts[1], 10) - 1 // Convert to 0-indexed month
          const year = parseInt(dateParts[2], 10)
          return new Date(year, month, day)
        }
      }
      
      // Handle Google Sheets date format: Date(year,month,day)
      if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
        const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateValue)
        if (match) {
          const year = parseInt(match[1], 10)
          const month = parseInt(match[2], 10) // Month is 0-indexed in JS Date
          const day = parseInt(match[3], 10)
          return new Date(year, month, day)
        }
      }
      
      // Try to parse as a JavaScript Date object
      if (dateValue instanceof Date) {
        return dateValue
      }
      
      return null
    } catch (error) {
      console.error("Date value parsing error:", error)
      return null
    }
  }
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }
  
  // Helper function to calculate percent change
  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    
    const change = ((current - previous) / previous) * 100
    return Math.round(change)
  }
  
  // Generate random payment method for demo
  const getRandomPaymentMethod = () => {
    const methods = ['Cash', 'Card', 'UPI', 'Online']
    return methods[Math.floor(Math.random() * methods.length)]
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Run all fetch operations in parallel
        await Promise.all([
          fetchBookingData(),
          fetchDailyEntryData(),
          fetchServicesData(),
          fetchStaffAttendanceData()
        ])
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Function to fetch booking data from Google Sheets
  const fetchBookingData = async () => {
    try {
      // Create URL to fetch the Booking DB sheet in JSON format
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(bookingSheetName)}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch booking data: ${response.status}`)
      }
      
      // Extract the JSON part from the response
      const text = await response.text()
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)
      
      // Extract headers from cols
      const headers = data.table.cols.map(col => ({
        id: col.id,
        label: col.label || col.id,
        type: col.type
      })).filter(header => header.label)
      
      // Calculate today's date for comparison
      const today = new Date()
      const todayMonth = today.getMonth() // JS months are 0-indexed (0-11)
      const todayDay = today.getDate()
      const todayYear = today.getFullYear()
      today.setHours(0, 0, 0, 0) // Reset time for accurate date comparison
      
      // Find the date column index (column F - index 5)
      const dateColumnIndex = 5
      const dateColumnId = headers[dateColumnIndex]?.id
      
      // Extract and transform data rows
      const rowsData = data.table.rows.map((row, rowIndex) => {
        const rowData = {}
        
        // Add an internal unique ID and row index
        rowData._id = Math.random().toString(36).substring(2, 15)
        rowData._rowIndex = rowIndex + 2
        
        // Process each cell
        row.c && row.c.forEach((cell, index) => {
          if (index < headers.length) {
            const header = headers[index]
            
            // Handle null or undefined cell
            if (!cell) {
              rowData[header.id] = ''
              return
            }
            
            // Get the value
            const value = cell.v !== undefined && cell.v !== null ? cell.v : ''
            rowData[header.id] = value
            
            // Store formatted version if available
            if (cell.f) {
              rowData[`${header.id}_formatted`] = cell.f
            }
          }
        })
        return rowData
      }).filter(row => Object.keys(row).length > 1) // Filter out empty rows
      
      // Count today's bookings
      const todayBookings = rowsData.filter(row => {
        try {
          if (!dateColumnId || !row[dateColumnId]) return false
          
          // Get the date value
          const dateValue = row[dateColumnId]
          
          // Handle DD/MM/YYYY format
          if (typeof dateValue === 'string' && dateValue.includes('/')) {
            const dateParts = dateValue.split('/')
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0], 10)
              const month = parseInt(dateParts[1], 10) - 1 // Convert to 0-indexed month
              const year = parseInt(dateParts[2], 10)
              
              // Check if it's today
              const isToday = day === todayDay && month === todayMonth && year === todayYear
              return isToday
            }
          }
          
          // Fallback to Google Sheets date format: Date(year,month,day)
          if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
            const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateValue)
            if (match) {
              const year = parseInt(match[1], 10)
              const month = parseInt(match[2], 10) // Month is 0-indexed in JS Date
              const day = parseInt(match[3], 10)
              
              // Check if it's today
              const isToday = day === todayDay && month === todayMonth && year === todayYear
              return isToday
            }
          }
          
          return false
        } catch (error) {
          return false
        }
      })
      
      // Count upcoming bookings (dates after today)
      const upcomingBookings = rowsData.filter(row => {
        try {
          if (!dateColumnId || !row[dateColumnId]) return false
          
          // Get the date value
          const dateValue = row[dateColumnId]
          
          // Handle DD/MM/YYYY format
          if (typeof dateValue === 'string' && dateValue.includes('/')) {
            const dateParts = dateValue.split('/')
            if (dateParts.length === 3) {
              const day = parseInt(dateParts[0], 10)
              const month = parseInt(dateParts[1], 10) - 1 // Convert to 0-indexed month
              const year = parseInt(dateParts[2], 10)
              
              // Create date objects for comparison
              const appointmentDate = new Date(year, month, day)
              const todayDate = new Date(todayYear, todayMonth, todayDay)
              
              // Reset time parts for accurate date comparison
              appointmentDate.setHours(0, 0, 0, 0)
              todayDate.setHours(0, 0, 0, 0)
              
              // Is this date in the future?
              const isFuture = appointmentDate > todayDate
              return isFuture
            }
          }
          
          // Fallback to Google Sheets date format
          if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
            const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateValue)
            if (match) {
              const year = parseInt(match[1], 10)
              const month = parseInt(match[2], 10) // Month is 0-indexed in JS Date
              const day = parseInt(match[3], 10)
              
              // Create date objects for comparison
              const appointmentDate = new Date(year, month, day)
              const todayDate = new Date(todayYear, todayMonth, todayDay)
              
              // Reset time parts for accurate date comparison
              appointmentDate.setHours(0, 0, 0, 0)
              todayDate.setHours(0, 0, 0, 0)
              
              // Is this date in the future?
              const isFuture = appointmentDate > todayDate
              return isFuture
            }
          }
          
          return false
        } catch (error) {
          return false
        }
      })
      
      // Get recent bookings
      const statusIndex = headers.findIndex(h => 
        h.label && (h.label.toLowerCase() === 'status' || h.label.toLowerCase().includes('booking status'))
      )
      
      // Find the indices for the relevant columns
      const customerNameIndex = headers.findIndex(h => 
        h.label && (h.label.toLowerCase().includes('customer name') || h.label.toLowerCase().includes('client'))
      )
      
      const serviceIndex = headers.findIndex(h => 
        h.label && h.label.toLowerCase().includes('service') && !h.label.toLowerCase().includes('price')
      )
      
      const timeIndex = headers.findIndex(h => 
        h.label && h.label.toLowerCase().includes('date') && !h.label.toLowerCase().includes('slot date')
      )
      
      // Get the most recent 4 bookings
      const sortedBookings = [...rowsData].sort((a, b) => {
        // Try to sort by date first
        const dateA = parseDate(a[dateColumnId])
        const dateB = parseDate(b[dateColumnId])
        
        if (dateA && dateB) {
          // If dates are the same, more recent bookings are at the top
          return dateB - dateA
        }
        
        // Fallback to row index if dates can't be parsed
        return a._rowIndex - b._rowIndex
      })
      
      // Take the 4 most recent bookings with formatted dates/times
      const recentBookingsData = sortedBookings.slice(0, 4).map(booking => {
        // Get raw values first
        const rawId = booking[headers.find(h => h.label && h.label.toLowerCase().includes('booking id'))?.id] || `BK-${Math.floor(Math.random() * 1000)}`;
        const rawCustomer = booking[headers[customerNameIndex]?.id] || 'Unknown Customer';
        const rawService = booking[headers[serviceIndex]?.id] || 'Unknown Service';
        const rawTime = booking[headers[timeIndex]?.id] || 'Unknown Time';
        const rawDate = booking[dateColumnId] || '';
        const rawStatus = booking[headers[statusIndex]?.id] || 'Unknown Status';
        
        // Format the time properly
        let displayTime = formatGoogleSheetsTime(rawTime);
        
        // Format the date if available
        let displayDate = '';
        if (rawDate) {
          displayDate = formatGoogleSheetsDate(rawDate);
          
          // If we have both date and time, combine them
          if (displayDate && displayTime && displayTime !== 'Unknown Time' && displayTime !== rawTime) {
            displayTime = `${displayDate}, ${displayTime}`;
          } else if (displayDate && displayTime === 'Unknown Time') {
            displayTime = displayDate;
          }
        }
        
        // For time-only values (like 3:50 PM), just use the time
        // If we have a Date(1899,11,30,...) format, treat it as time-only
        if (rawTime && typeof rawTime === 'string' && rawTime.startsWith('Date(')) {
          const timeMatch = /Date\(1899,11,30,(\d+),(\d+)(?:,\d+)?\)/.exec(rawTime);
          if (timeMatch) {
            const hour = parseInt(timeMatch[1], 10);
            const minute = parseInt(timeMatch[2], 10);
            
            const timeDate = new Date();
            timeDate.setHours(hour, minute, 0, 0);
            displayTime = timeDate.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
          }
        }
        
        // Debug what's happening (remove in production)
       
        
        return {
          id: rawId,
          customer: rawCustomer,
          service: rawService,
          time: displayTime,
          status: rawStatus
        };
      });
      
      // Count total unique clients
      const uniqueClients = new Set()
      rowsData.forEach(booking => {
        const client = booking[headers[customerNameIndex]?.id]
        if (client) {
          uniqueClients.add(client)
        }
      })
      
      // Update booking stats
      setStats(prev => ({
        ...prev,
        bookings: {
          today: todayBookings.length,
          upcoming: upcomingBookings.length,
          totalClients: uniqueClients.size,
          percentChange: calculatePercentChange(todayBookings.length, 7) // Mock percent change
        }
      }))
      
      // Update recent bookings
      setRecentBookings(recentBookingsData)
      
      
      
    } catch (error) {
      console.error("Error fetching booking data:", error)
    }
  }
  
  // Function to fetch daily entry (revenue) data
  const fetchDailyEntryData = async () => {
    try {
      // Create URL to fetch the Daily Entry sheet
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(dailyEntrySheet)}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch daily entry data: ${response.status}`)
      }
      
      // Extract the JSON part from the response
      const text = await response.text()
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)
      
      // Extract headers
      const headers = data.table.cols.map((col, index) => ({
        id: `col${index}`,
        label: col.label || col.id,
        type: col.type
      })).filter(header => header.label)
      
      // Calculate today's date for comparison
      const today = new Date()
      const todayMonth = today.getMonth() // JS months are 0-indexed (0-11)
      const todayDay = today.getDate()
      const todayYear = today.getFullYear()
      today.setHours(0, 0, 0, 0) // Reset time for accurate date comparison
      
      // Find the date field
      const dateField = headers.find(h => h.label && h.label.toLowerCase().includes('date'))?.id
      
      // Find the amount/price field
      const amountField = headers.find(h => 
        h.label && (h.label.toLowerCase().includes('amount') || 
                  h.label.toLowerCase().includes('price') || 
                  h.label.toLowerCase().includes('revenue'))
      )?.id
      
      // Extract transactions
      const transactionsData = data.table.rows
        .filter((row) => row.c && row.c.some((cell) => cell && cell.v))
        .map((row, rowIndex) => {
          const transactionData = {
            _id: Math.random().toString(36).substring(2, 15),
            _rowIndex: rowIndex + 2,
          }
          
          // Process each cell
          row.c && row.c.forEach((cell, index) => {
            if (index < headers.length) {
              const header = headers[index]
              
              // Handle null or undefined cell
              if (!cell) {
                transactionData[header.id] = ''
                return
              }
              
              // Get the value
              const value = cell.v !== undefined && cell.v !== null ? cell.v : ''
              transactionData[header.id] = value
              
              // For date cells, add formatted version
              if (header.type === 'date' || header.label.toLowerCase().includes('date')) {
                if (typeof value === 'string' && value.startsWith('Date(')) {
                  const match = /Date\((\d+),(\d+),(\d+)\)/.exec(value)
                  if (match) {
                    const year = parseInt(match[1], 10)
                    const month = parseInt(match[2], 10) // 0-indexed month
                    const day = parseInt(match[3], 10)
                    transactionData[`${header.id}_formatted`] = `${day}/${month+1}/${year}`
                  }
                }
              }
            }
          })
          
          return transactionData
        })
      
      // Calculate today's revenue
      let todayRevenue = 0
      let weekRevenue = 0
      let monthRevenue = 0
      
      // Get start of week and month
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay()) // First day of current week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      // Process transactions
      transactionsData.forEach(transaction => {
        if (!amountField || !transaction[amountField]) return
        
        // Extract price value
        let priceValue = transaction[amountField]
        if (typeof priceValue === 'string') {
          // Clean up the price string (remove ₹, commas, etc.)
          priceValue = priceValue.replace(/[^0-9.-]+/g, '')
        }
        
        const price = parseFloat(priceValue) || 0
        
        // Check transaction date
        if (dateField && transaction[dateField]) {
          const transactionDate = parseDateValue(transaction[dateField], transaction[`${dateField}_formatted`])
          
          if (transactionDate) {
            // Check if this transaction is from today
            if (isSameDay(transactionDate, today)) {
              todayRevenue += price
            }
            
            // Check if this transaction is from this week
            if (transactionDate >= startOfWeek) {
              weekRevenue += price
            }
            
            // Check if this transaction is from this month
            if (transactionDate >= startOfMonth) {
              monthRevenue += price
            }
          }
        }
      })
      
      // Get recent transactions for the dashboard
      const customerField = headers.find(h => h.label && (h.label.toLowerCase().includes('customer') || h.label.toLowerCase().includes('client')))?.id
      const serviceField = headers.find(h => h.label && h.label.toLowerCase().includes('service') && !h.label.toLowerCase().includes('totalamount'))?.id
      const paymentMethodField = headers.find(h => h.label && (h.label.toLowerCase().includes('payment') || h.label.toLowerCase().includes('method')))?.id
      
      // Sort transactions by date (most recent first)
      const sortedTransactions = [...transactionsData].sort((a, b) => {
        if (!dateField) return 0
        
        const dateA = parseDateValue(a[dateField], a[`${dateField}_formatted`])
        const dateB = parseDateValue(b[dateField], b[`${dateField}_formatted`])
        
        if (dateA && dateB) {
          return dateB - dateA // Descending order
        }
        
        return 0
      })
      
      // Take the 4 most recent transactions with formatted dates
      const recentTransactionsData = sortedTransactions
        .filter(transaction => {
          const priceValue = transaction[amountField];
          return priceValue && parseFloat(String(priceValue).replace(/[^0-9.-]+/g, '')) > 0;
        })
        .slice(0, 4)
        .map(transaction => {
          let priceValue = transaction[amountField] || '0';
          if (typeof priceValue === 'string') {
            priceValue = priceValue.replace(/[^0-9.-]+/g, '');
          }
          
          // Get transaction date if available
          let displayDate = '';
          if (dateField && transaction[dateField]) {
            displayDate = formatGoogleSheetsDate(transaction[dateField]);
          }
          
          return {
            id: `TR-${Math.floor(Math.random() * 1000)}`,
            customer: transaction[customerField] || 'Unknown Customer',
            service: transaction[serviceField] || 'Unknown Service',
            amount: parseFloat(priceValue) || 0,
            method: transaction[paymentMethodField] || getRandomPaymentMethod(),
            date: displayDate // Add date if you want to display it in the UI
          };
        });
      
      // Update revenue stats
      setStats(prev => ({
        ...prev,
        revenue: {
          today: todayRevenue,
          thisWeek: weekRevenue,
          thisMonth: monthRevenue,
          percentChange: calculatePercentChange(todayRevenue, prev.revenue.today)
        }
      }))
      
      // Update recent transactions
      setRecentTransactions(recentTransactionsData)
      
     
      
      
    } catch (error) {
      console.error("Error fetching daily entry data:", error)
    }
  }
  
  // Function to fetch services data
  const fetchServicesData = async () => {
    try {
      // Create URL to fetch the Service DB sheet
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(serviceSheetName)}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch services data: ${response.status}`)
      }
      
      // Extract the JSON part from the response
      const text = await response.text()
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}')
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)
      
      // Exclude the delete column (column G) - 6 is index for column G (0-indexed)
      const deleteColumnIndex = 6
      
      // Extract headers
      const headers = data.table.cols
        .filter((_, index) => index !== deleteColumnIndex)
        .map((col, index) => ({
          id: `col${index}`,
          label: col.label || `Column ${index + 1}`,
          type: col.type || 'string'
        }))
      
      // Extract services data
      const allRows = data.table.rows || []
      
      const servicesData = allRows
        .filter((row) => row.c && row.c.some((cell) => cell && cell.v))
        .map((row, rowIndex) => {
          const serviceData = {
            _id: Math.random().toString(36).substring(2, 15),
            _rowIndex: rowIndex + 2,
          }
          
          // Skip the delete column
          row.c && row.c.forEach((cell, index) => {
            // Skip the delete column 
            if (index === deleteColumnIndex) {
              // Store delete status but don't include it as a visible column
              serviceData['_deleted'] = cell && cell.v === 'Yes'
              return
            }
            
            // Adjust the index for columns after the delete column
            let adjustedIndex = index
            if (index > deleteColumnIndex) {
              adjustedIndex = index - 1
            }
            
            const header = headers[adjustedIndex]
            if (!header) return // Skip if no matching header
            
            // Get cell value
            serviceData[header.id] = cell ? cell.v : ''
          })
          
          return serviceData
        })
      
      // Filter out "deleted" services
      const activeServices = servicesData.filter(service => !service._deleted)
      
      // Find categories
      const categoryHeader = headers.find(h => h.label.toLowerCase().includes('category'))
      const categories = new Set()
      
      if (categoryHeader) {
        activeServices.forEach(service => {
          if (service[categoryHeader.id]) {
            categories.add(service[categoryHeader.id])
          }
        })
      }
      
      // Find most popular service category
      const categoryCount = {}
      if (categoryHeader) {
        activeServices.forEach(service => {
          const category = service[categoryHeader.id]
          if (category) {
            categoryCount[category] = (categoryCount[category] || 0) + 1
          }
        })
      }
      
      let popularCategory = ""
      let maxCount = 0
      
      for (const [category, count] of Object.entries(categoryCount)) {
        if (count > maxCount) {
          maxCount = count
          popularCategory = category
        }
      }
      
      // Update services stats
      setStats(prev => ({
        ...prev,
        services: {
          total: activeServices.length,
          popular: popularCategory,
          categories: categories.size,
          percentChange: calculatePercentChange(activeServices.length, 15) // Mock percent change
        }
      }))
      
      
      
    } catch (error) {
      console.error("Error fetching services data:", error)
    }
  }
  
  const handleViewAllBookings = () => {
    // Use setActiveTab instead of navigate
    if (setActiveTab) {
      setActiveTab("booking")
    }
  }

  const handleViewAllTransactions = () => {
    // Use setActiveTab instead of navigate
    if (setActiveTab) {
      setActiveTab("dailyEntry")
    }
  }

  // Function to fetch staff attendance data
  const fetchStaffAttendanceData = async () => {
    try {
      // Create URL to fetch Staff DB
      const staffDBUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(staffSheetName)}`
      
      const staffResponse = await fetch(staffDBUrl)
      if (!staffResponse.ok) {
        throw new Error(`Failed to fetch staff data: ${staffResponse.status}`)
      }
      
      // Extract the JSON part from the response
      const staffText = await staffResponse.text()
      const staffJsonStart = staffText.indexOf('{')
      const staffJsonEnd = staffText.lastIndexOf('}')
      const staffJsonString = staffText.substring(staffJsonStart, staffJsonEnd + 1)
      const staffData = JSON.parse(staffJsonString)
      
      // Extract columns C and D (indexes 2 and 3) - Staff ID and Name
      const columnCIndex = 2 // Column C is index 2 - Staff ID
      const columnDIndex = 3 // Column D is index 3 - Staff Name
      
      // Get all staff members
      const allStaff = staffData.table.rows
        .filter(row => row.c && row.c.length > columnDIndex && row.c[columnDIndex] && row.c[columnDIndex].v)
        .map(row => ({
          id: row.c[columnCIndex] && row.c[columnCIndex].v ? row.c[columnCIndex].v : '',
          name: row.c[columnDIndex] && row.c[columnDIndex].v ? row.c[columnDIndex].v : '',
        }))
        .filter(staff => staff.id && staff.name)
      
      const totalStaff = allStaff.length
      
      // Now fetch attendance data
      const attendanceUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(staffAttendanceSheet)}`
      
      const attendanceResponse = await fetch(attendanceUrl)
      if (!attendanceResponse.ok) {
        throw new Error(`Failed to fetch attendance data: ${attendanceResponse.status}`)
      }
      
      // Extract the JSON part from the response
      const attendanceText = await attendanceResponse.text()
      const attendanceJsonStart = attendanceText.indexOf('{')
      const attendanceJsonEnd = attendanceText.lastIndexOf('}')
      const attendanceJsonString = attendanceText.substring(attendanceJsonStart, attendanceJsonEnd + 1)
      const attendanceData = JSON.parse(attendanceJsonString)
      
      // Calculate today's date formatted for comparison
      const today = new Date()
      const formatDateForComparison = (date) => {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }
      
      const formattedToday = formatDateForComparison(today)
      
      // Initialize attendance counts
      const attendanceCounts = {
        total: totalStaff,
        present: 0,
        absent: 0,
        halfDay: 0,
        shortShift: 0
      }
      
      // Process attendance rows
      if (attendanceData.table && attendanceData.table.rows) {
        attendanceData.table.rows.forEach(row => {
          if (row.c && row.c.length > 4) {
            // Parse date from column A
            const dateCellValue = row.c[0] && row.c[0].v ? row.c[0].v : null
            let parsedDate = null
            
            // Handle different date formats
            if (typeof dateCellValue === 'string') {
              if (dateCellValue.startsWith('Date(')) {
                const match = /Date\((\d+),(\d+),(\d+)\)/.exec(dateCellValue)
                if (match) {
                  const year = parseInt(match[1], 10)
                  const month = parseInt(match[2], 10) + 1
                  const day = parseInt(match[3], 10)
                  parsedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
                }
              } else if (dateCellValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                parsedDate = dateCellValue
              }
            }
            
            // Check if this is today's record
            if (parsedDate === formattedToday) {
              // Get attendance status
              const attendanceStatus = row.c[4] && row.c[4].v ? row.c[4].v : null
              
              // Update counts based on attendance status
              switch(attendanceStatus) {
                case 'Present':
                  attendanceCounts.present++
                  break
                case 'Absent':
                  attendanceCounts.absent++
                  break
                case 'Half Day':
                  attendanceCounts.halfDay++
                  break
                case 'Short Shift':
                  attendanceCounts.shortShift++
                  break
              }
            }
          }
        })
      }
      
      // Calculate percent change (compared to expected 80% attendance)
      const expectedAttendance = totalStaff > 0 ? Math.round(totalStaff * 0.8) : 0
      const percentChange = calculatePercentChange(attendanceCounts.present, expectedAttendance)
      
      // Update staff stats
      setStats(prev => ({
        ...prev,
        staff: {
          total: totalStaff,
          present: attendanceCounts.present,
          absent: attendanceCounts.absent,
          halfDay: attendanceCounts.halfDay,
          shortShift: attendanceCounts.shortShift,
          percentChange: percentChange
        }
      }))
      
      
      
    } catch (error) {
      console.error("Error fetching staff attendance data:", error)
    }
  }
  
  // Helper function to parse date from various formats
  // Helper function to parse date from various formats
  
  
  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Booking Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Bookings</p>
              <h2 className="text-3xl font-bold mt-1">{stats.bookings.today}</h2>
              <div className="flex items-center mt-2">
                {stats.bookings.percentChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${stats.bookings.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.bookings.percentChange)}% from yesterday
                </span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-500 text-xs">Upcoming</p>
              <p className="font-semibold">{stats.bookings.upcoming}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Total Clients</p>
              <p className="font-semibold">{stats.bookings.totalClients}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Revenue Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Today's Revenue</p>
              <h2 className="text-3xl font-bold mt-1">{formatCurrency(stats.revenue.today)}</h2>
              <div className="flex items-center mt-2">
                {stats.revenue.percentChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${stats.revenue.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.revenue.percentChange)}% from yesterday
                </span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-500 text-xs">This Week</p>
              <p className="font-semibold">{formatCurrency(stats.revenue.thisWeek)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">This Month</p>
              <p className="font-semibold">{formatCurrency(stats.revenue.thisMonth)}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Service Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Services</p>
              <h2 className="text-3xl font-bold mt-1">{stats.services.total}</h2>
              <div className="flex items-center mt-2">
                {stats.services.percentChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${stats.services.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.services.percentChange)}% from last week
                </span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Scissors className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-500 text-xs">Categories</p>
              <p className="font-semibold">{stats.services.categories}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Popular</p>
              <p className="font-semibold truncate">{stats.services.popular}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Staff Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Staff Present Today</p>
              <h2 className="text-3xl font-bold mt-1">{stats.staff.present}</h2>
              <div className="flex items-center mt-2">
                {stats.staff.percentChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${stats.staff.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.staff.percentChange)}% from yesterday
                </span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-500 text-xs">Total Staff</p>
              <p className="font-semibold">{stats.staff.total}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Absent</p>
              <p className="font-semibold">{stats.staff.absent}</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Bookings</h3>
            <button onClick={handleViewAllBookings} className="text-sm text-blue-600 flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{booking.customer}</p>
                    <p className="text-sm text-gray-500">{booking.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{booking.time}</div>
                    <div className="flex items-center mt-1 justify-end">
                      {booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'complete' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'complete' 
                          ? 'text-green-500' 
                          : booking.status.toLowerCase() === 'cancelled' 
                            ? 'text-red-500' 
                            : 'text-orange-500'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Recent Transactions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <button onClick={handleViewAllTransactions} className="text-sm text-blue-600 flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{transaction.customer}</p>
                    <p className="text-sm text-gray-500">{transaction.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                    <div className="flex items-center mt-1 justify-end">
                      {transaction.method === 'Cash' ? (
                        <ShoppingBag className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-blue-500 mr-1" />
                      )}
                      <span className="text-xs text-gray-500">{transaction.method}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardHome