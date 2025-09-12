import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Tag, Crown, UserPlus } from 'lucide-react';
import PromoCard from '../offers_&_Membership/promoCard';
import Membership from '../offers_&_Membership/membership';
import AssignMembership from '../offers_&_Membership/assignMember';

const OffersAndMemberships = () => {
  const [activeSection, setActiveSection] = useState('promos'); // 'promos', 'memberships', 'assign' or null for collapsed

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Offers & Memberships</h1>
          <p className="text-gray-600">Manage promotional campaigns, membership programs, and user assignments</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="border-b border-gray-200">
            <nav className="flex px-6 space-x-8" aria-label="Tabs">
              <button
                onClick={() => toggleSection('promos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeSection === 'promos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Tag size={18} />
                  <span>Promotional Cards</span>
                </div>
              </button>
              <button
                onClick={() => toggleSection('memberships')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeSection === 'memberships'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Crown size={18} />
                  <span>Membership Plans</span>
                </div>
              </button>
              <button
                onClick={() => toggleSection('assign')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeSection === 'assign'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserPlus size={18} />
                  <span>Assign Membership</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Sections */}
        <div className="transition-all duration-300 ease-in-out">
          {activeSection === 'promos' && (
            <div className="animate-fade-in">
              <PromoCard />
            </div>
          )}
          
          {activeSection === 'memberships' && (
            <div className="animate-fade-in">
              <Membership />
            </div>
          )}

          {activeSection === 'assign' && (
            <div className="animate-fade-in">
              <AssignMembership />
            </div>
          )}

          {!activeSection && (
            <div className="py-16 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
              <div className="max-w-sm mx-auto">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">Select a Section</h3>
                <p className="text-gray-600">Choose between Promotional Cards, Membership Plans, or Assign Membership to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffersAndMemberships;