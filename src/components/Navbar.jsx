'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Globe, User, UserIcon } from 'lucide-react';
import { useAuth } from '../Context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';





const Navbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const translateBtnRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateToProfile = () => {
    navigate(`/profile/${user?.id}`);
  };

  useEffect(() => {
    // Add Google Translate script to the document
    const addScript = () => {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      // Initialize the translate element
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi', // Only include English and Hindi
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };
    };

    if (!document.querySelector('script[src*="translate.google.com"]')) {
      addScript();
    }

    // Create a style to position the Google Translate element correctly
    const style = document.createElement('style');
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
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      delete window.googleTranslateElementInit;
      const script = document.querySelector('script[src*="translate.google.com"]');
      if (script) {
        script.remove();
      }
      if (style) {
        style.remove();
      }
    };
  }, []);

  // Function to trigger Google Translate popup
  const handleTranslateClick = () => {
    // Try different methods to trigger the Google Translate dropdown

    // Method 1: Find and click the translate button
    const googleElement = document.getElementById('google_translate_element');

    if (googleElement) {
      // Try to find the clickable element in Google Translate widget
      const translateButton =
        googleElement.querySelector('.goog-te-gadget-simple') ||
        googleElement.querySelector('.goog-te-menu-value') ||
        googleElement.querySelector('.VIpgJd-ZVi9od-l4eHX-hSRGPd');

      if (translateButton) {
        // Click the element to show the dropdown
        translateButton.click();
        return;
      }

      // Method 2: If we can't find the button, try to programmatically position and show the dropdown
      // Get button position for dropdown placement
      const buttonRect = translateBtnRef.current.getBoundingClientRect();

      // Position the Google element near our button temporarily
      googleElement.style.position = 'absolute';
      googleElement.style.top = `${buttonRect.bottom + window.scrollY}px`;
      googleElement.style.right = `${window.innerWidth - buttonRect.right - window.scrollX}px`;
      googleElement.style.height = 'auto';
      googleElement.style.overflow = 'visible';
      googleElement.style.zIndex = '1000';

      // Force Google Translate to create its dropdown
      const select = googleElement.querySelector('select.goog-te-combo');
      if (select) {
        // Programmatically open the dropdown
        const event = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        select.dispatchEvent(event);

        // Reset position after a delay
        setTimeout(() => {
          googleElement.style.position = 'fixed';
          googleElement.style.top = '-1000px';
          googleElement.style.right = '-1000px';
          googleElement.style.height = '0';
          googleElement.style.overflow = 'hidden';
        }, 5000); // Hide it after 5 seconds
      }
    }
  };

  return (
    <>
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="container flex items-center justify-between px-4 py-3 mx-auto md:px-6">
          <div className="flex items-center">
            <button
              className="p-2 text-blue-600 transition-colors duration-300 rounded-md hover:bg-blue-100 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
            {/* Title visible on all screen sizes, but styled differently */}
            <h1 className="ml-2 text-xl font-semibold text-blue-800 md:text-2xl">
              Salon Dashboard
            </h1>
          </div>

          {/* Responsive button container */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Hidden Google Translate Element */}
            <div id="google_translate_element"></div>

            {/* Custom Translate Button - Text hidden on small screens */}
            <button
              ref={translateBtnRef}
              className="flex items-center space-x-1 rounded-md border border-blue-200 px-2 py-1.5 text-blue-600 transition-colors duration-300 hover:bg-blue-100 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:px-3"
              onClick={handleTranslateClick}
              aria-label="Change language"
            >
              <Globe size={16} />
              <span className="hidden text-sm sm:inline">Language</span>
            </button>

            {/* Profile Button with Profile Image - No Border */}

            <button
              className="flex items-center p-0 space-x-2 transition-colors duration-300 rounded-md hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onClick={navigateToProfile}
              aria-label="View profile"
            >
              {/* Profile Image - Completely Borderless */}
              <div className="flex-shrink-0 overflow-hidden rounded-full h-9 w-9">
                {user?.profile.profile_image ? (
                  <img
                    src={user.profile.profile_image}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    {user?.user_metadata?.name?.slice(0, 1)}
                  </div>
                )}
              </div>
              <span className="hidden pr-2 text-sm sm:inline">Profile</span>
            </button>

            {/* Logout Button - Text hidden on extra small screens */}
            <button
              className="flex items-center space-x-1 rounded-md bg-red-600 px-2 py-1.5 text-white transition-colors duration-300 hover:cursor-pointer hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none sm:px-3"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span className="hidden text-sm xs:inline sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
