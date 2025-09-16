'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Globe, User, UserIcon, ChevronDown } from 'lucide-react';
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

  // Safely derive user initials for avatar fallback
  const getUserInitials = () => {
    try {
      const display =
        user?.profile?.name ||
        user?.name ||
        user?.profile?.email ||
        user?.email ||
        '';
      const cleaned = String(display).trim();
      if (!cleaned) return 'U';
      const parts = cleaned.split(/\s+/).filter(Boolean);
      const first = parts[0]?.[0] || '';
      const second = parts[1]?.[0] || '';
      const initials = (first + second).toUpperCase();
      return initials || 'U';
    } catch (_) {
      return 'U';
    }
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
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Menu & Title */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                className="inline-flex items-center justify-center p-2 text-gray-600 transition-colors duration-200 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <Menu size={20} aria-hidden="true" />
              </button>

              {/* Dashboard Title */}
              <div className="flex items-center">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  Salon Dashboard
                </h1>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Hidden Google Translate Element */}
              <div id="google_translate_element" className="hidden"></div>

              {/* Language Selector */}
              <button
                ref={translateBtnRef}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={handleTranslateClick}
                aria-label="Change language"
              >
                <Globe size={16} className="mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Language</span>
                <ChevronDown size={14} className="ml-1 text-gray-400" aria-hidden="true" />
              </button>

              {/* Profile Button */}
              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={navigateToProfile}
                aria-label="View profile"
              >
                {/* Profile Avatar */}
                <div className="flex-shrink-0 w-6 h-6 mr-2 overflow-hidden bg-gray-100 rounded-full">
                  {user?.profile.profile_image ? (
                    <img
                      src={user.profile.profile_image}
                      alt=""
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs font-semibold text-gray-600 bg-gradient-to-br from-blue-100 to-blue-200">
                      {getUserInitials()}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline">Profile</span>
              </button>

              {/* Logout Button */}
              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white transition-colors duration-200 bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <LogOut size={16} className="mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
