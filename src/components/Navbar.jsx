"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, LogOut, Globe, User } from "lucide-react"
import { useAuth } from "../Context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"

// Import the ImgWithFallback component from ProfilePage.jsx
const ImgWithFallback = ({ src, alt, name }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loadFailed, setLoadFailed] = useState(false);
  
  // Handle image load errors
  const handleError = () => {
    if (imgSrc === src) {
      // First failure - try to extract fileId and use a different format
      let fileId = null;
      if (imgSrc.includes('drive.google.com') || imgSrc.includes('googleusercontent.com')) {
        const match = imgSrc.match(/\/d\/([^\/&=]+)|id=([^&=]+)/);
        fileId = match ? (match[1] || match[2]) : null;
        
        if (fileId) {
          // Try thumbnail format which often works with limited permissions
          setImgSrc(`https://drive.google.com/thumbnail?id=${fileId}&sz=w800`);
          return;
        }
      }
      // If we can't extract a fileId or it's not a Google Drive URL
      setLoadFailed(true);
    } else {
      // Second failure - give up and use initials
      setLoadFailed(true);
    }
  };
  
  // If all image loading attempts failed, show a fallback with initials
  if (loadFailed) {
    // Extract initials from name
    const initials = name ? name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2) : 'U';
    
    // Return a styled div with initials
    return (
      <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <span className="text-white text-sm font-bold">{initials}</span>
      </div>
    );
  }
  
  // Return the image with error handling
  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className="h-full w-full object-cover"
      onError={handleError}
      style={{objectFit: 'cover', width: '100%', height: '100%'}}
    />
  );
};

// Enhanced Google Drive URL converter with multiple formats
const convertGoogleDriveImageUrl = (originalUrl) => {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return null;
  }
  
  // If it's not a Google Drive URL, return as is
  if (!originalUrl.includes('drive.google.com')) {
    return originalUrl;
  }

  // Extract file ID from various Google Drive URL formats
  const fileIdMatch = originalUrl.match(/\/d\/([^\/]+)|id=([^&]+)/);
  const fileId = fileIdMatch ? (fileIdMatch[1] || fileIdMatch[2]) : null;

  if (!fileId) return originalUrl;

  // Return an array of possible URLs to try
  return [
    // Direct Google Drive CDN URLs
    `https://lh3.googleusercontent.com/d/${fileId}`,
    // Export view URLs (more likely to work with permissions)
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    // Thumbnail URLs (often work even with limited permissions)
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    // Alternative format
    `https://drive.google.com/uc?id=${fileId}`,
    // Original URL as fallback
    originalUrl
  ];
};

const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const translateBtnRef = useRef(null)
  const [profileImage, setProfileImage] = useState(null)
  const [profileName, setProfileName] = useState("")

  // Fetch profile data to get profile image
  useEffect(() => {
    if (user && user.email) {
      fetchUserProfileImage(user.email)
    }
  }, [user])

  // Function to fetch just the profile image from the spreadsheet
  const fetchUserProfileImage = async (userEmail) => {
    try {
      const sheetId = "1zEik6_I7KhRQOucBhk1FW_67IUEdcSfEHjCaR37aK_U"
      const sheetName = "Clients"
      
      // Fetch the Clients sheet data
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }
      
      // Extract the JSON part from the response
      const text = await response.text()
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}")
      const jsonString = text.substring(jsonStart, jsonEnd + 1)
      const data = JSON.parse(jsonString)
      
      // Find the user's row by matching email (column C/index 2)
      const userRow = data.table.rows.find(row => 
        row.c && row.c[2] && row.c[2].v && row.c[2].v.toString().trim().toLowerCase() === userEmail.toLowerCase()
      )
      
      if (userRow) {
        const extractValue = (index) => {
          return userRow.c[index] && userRow.c[index].v 
            ? userRow.c[index].v.toString().trim() 
            : ""
        }
        
        const fullName = extractValue(9)
        const driveImageUrl = extractValue(15)
        
        // Set the profile name for fallback initials
        setProfileName(fullName)
        
        // Process the image URL (if any)
        if (driveImageUrl && driveImageUrl.includes('drive.google.com')) {
          const possibleUrls = convertGoogleDriveImageUrl(driveImageUrl);
          // Just use the first URL from the list - fallbacks will be handled by the component
          const imageUrl = Array.isArray(possibleUrls) ? possibleUrls[0] : possibleUrls;
          setProfileImage(imageUrl)
        } else if (driveImageUrl) {
          setProfileImage(driveImageUrl)
        }
      }
    } catch (error) {
      console.error("Error fetching profile image:", error)
    }
  }

  // Function to handle logout
  const handleLogout = () => {
    console.log("Logging out...")
    logout()
    navigate("/login")
  }

  const navigateToProfile = () => {
    navigate("/profile")
  }

  // Initialize Google Translate Element
  useEffect(() => {
    // Add Google Translate script to the document
    const addScript = () => {
      const script = document.createElement("script")
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)

      // Initialize the translate element
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi", // Only include English and Hindi
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element",
        )
      }
    }

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      addScript()
    }

    // Create a style to position the Google Translate element correctly
    const style = document.createElement("style")
    style.textContent = `
      #google_translate_element {
        position: fixed;
        top: -1000px;
        right: -1000px;
        height: 0;
        overflow: hidden;
      }
      
      .goog-te-banner-frame {
        display: none !important;
      }
      
      body {
        top: 0 !important;
      }
      
      /* Make sure the dropdown shows up in the right position */
      .goog-te-menu-frame {
        box-shadow: 0 0 8px rgba(0,0,0,0.2) !important;
        position: fixed !important;
      }
    `
    document.head.appendChild(style)

    // Cleanup function
    return () => {
      delete window.googleTranslateElementInit
      const script = document.querySelector('script[src*="translate.google.com"]')
      if (script) {
        script.remove()
      }
      if (style) {
        style.remove()
      }
    }
  }, [])

  // Function to trigger Google Translate popup
  const handleTranslateClick = () => {
    // Try different methods to trigger the Google Translate dropdown

    // Method 1: Find and click the translate button
    const googleElement = document.getElementById("google_translate_element")

    if (googleElement) {
      // Try to find the clickable element in Google Translate widget
      const translateButton =
        googleElement.querySelector(".goog-te-gadget-simple") ||
        googleElement.querySelector(".goog-te-menu-value") ||
        googleElement.querySelector(".VIpgJd-ZVi9od-l4eHX-hSRGPd")

      if (translateButton) {
        // Click the element to show the dropdown
        translateButton.click()
        return
      }

      // Method 2: If we can't find the button, try to programmatically position and show the dropdown
      // Get button position for dropdown placement
      const buttonRect = translateBtnRef.current.getBoundingClientRect()

      // Position the Google element near our button temporarily
      googleElement.style.position = "absolute"
      googleElement.style.top = `${buttonRect.bottom + window.scrollY}px`
      googleElement.style.right = `${window.innerWidth - buttonRect.right - window.scrollX}px`
      googleElement.style.height = "auto"
      googleElement.style.overflow = "visible"
      googleElement.style.zIndex = "1000"

      // Force Google Translate to create its dropdown
      const select = googleElement.querySelector("select.goog-te-combo")
      if (select) {
        // Programmatically open the dropdown
        const event = new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
        select.dispatchEvent(event)

        // Reset position after a delay
        setTimeout(() => {
          googleElement.style.position = "fixed"
          googleElement.style.top = "-1000px"
          googleElement.style.right = "-1000px"
          googleElement.style.height = "0"
          googleElement.style.overflow = "hidden"
        }, 5000) // Hide it after 5 seconds
      }
    }
  }

  return (
    <>
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center">
            <button
              className="p-2 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            {/* Title visible on all screen sizes, but styled differently */}
            <h1 className="ml-2 text-xl font-semibold text-blue-800 md:text-2xl">Salon Dashboard</h1>
          </div>

          {/* Responsive button container */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hidden Google Translate Element */}
            <div id="google_translate_element"></div>

            {/* Custom Translate Button - Text hidden on small screens */}
            <button
              ref={translateBtnRef}
              className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-100 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              onClick={handleTranslateClick}
              aria-label="Change language"
            >
              <Globe size={16} />
              <span className="hidden sm:inline text-sm">Language</span>
            </button>

            {/* Profile Button with Profile Image - No Border */}
            {user?.role === "admin" && (
            <button
  className="flex items-center space-x-2 p-0 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
  onClick={navigateToProfile}
  aria-label="View profile"
>
  {/* Profile Image - Completely Borderless */}
  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
    {profileImage ? (
      <ImgWithFallback 
        src={profileImage}
        alt="Profile"
        name={profileName}
      />
    ) : (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <User size={18} className="text-gray-400" />
      </div>
    )}
  </div>
  <span className="hidden sm:inline text-sm pr-2">Profile</span>
</button>
            )}

            {/* Logout Button - Text hidden on extra small screens */}
            <button
              className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span className="hidden xs:inline sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar