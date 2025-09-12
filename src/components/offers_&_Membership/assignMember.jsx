import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Crown,
  User,
  Check,
  X,
  ChevronDown,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import NotificationSystem from './notificationSystem';



const AssignMembership = () => {
  // Mock data
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com' },
    { id: 5, name: 'David Brown', email: 'david@example.com' },
  ];

  const mockMemberships = [
    {
      id: 1,
      name: 'Gold Membership',
      price: 499,
      duration: '3 Months',
      benefits: ['Priority Support', 'Exclusive Content', 'Advanced Features'],
    },
    {
      id: 2,
      name: 'Silver Membership',
      price: 299,
      duration: '2 Months',
      benefits: ['Standard Support', 'Basic Features'],
    },
    {
      id: 3,
      name: 'Platinum Membership',
      price: 999,
      duration: '6 Months',
      benefits: ['24/7 Priority Support', 'All Premium Features', 'Personal Account Manager'],
    },
  ];

  // State
  const [users] = useState(mockUsers);
  const [memberships] = useState(mockMemberships);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMembershipDropdown, setShowMembershipDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserSearchTerm(user.name);
    setShowUserDropdown(false);
  };

  // Handle membership selection
  const handleMembershipSelect = (membership) => {
    setSelectedMembership(membership);
    setShowMembershipDropdown(false);
  };

  // Handle opening assign modal
  const handleOpenAssignModal = () => {
    setSelectedUser(null);
    setSelectedMembership(null);
    setUserSearchTerm('');
    setShowAssignModal(true);
  };

  // Handle assignment
  const handleAssignMembership = async () => {
    if (!selectedUser || !selectedMembership) {
      showNotification('Please select both a user and a membership plan.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification(
        `Successfully assigned ${selectedMembership.name} to ${selectedUser.name}!`
      );
      
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedMembership(null);
      setUserSearchTerm('');
    } catch (error) {
      showNotification('Failed to assign membership. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowAssignModal(false);
    setSelectedUser(null);
    setSelectedMembership(null);
    setUserSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assign Membership</h2>
          <p className="mt-1 text-sm text-gray-600">Assign membership plans to users and manage user subscriptions</p>
        </div>
        <button
          onClick={handleOpenAssignModal}
          className="flex items-center px-4 py-2 space-x-2 text-white transition-colors duration-200 bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700"
        >
          <UserPlus size={18} />
          <span>Assign Membership</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Crown className="text-orange-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available Plans</p>
              <p className="text-2xl font-bold text-gray-900">{memberships.length}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">How to Assign Memberships</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full">
              <span className="font-bold text-purple-600">1</span>
            </div>
            <h4 className="mb-2 font-medium text-gray-900">Select User</h4>
            <p className="text-sm text-gray-600">Choose the user you want to assign a membership to</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full">
              <span className="font-bold text-purple-600">2</span>
            </div>
            <h4 className="mb-2 font-medium text-gray-900">Choose Plan</h4>
            <p className="text-sm text-gray-600">Select the appropriate membership plan for the user</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full">
              <span className="font-bold text-purple-600">3</span>
            </div>
            <h4 className="mb-2 font-medium text-gray-900">Confirm</h4>
            <p className="text-sm text-gray-600">Review and confirm the membership assignment</p>
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Membership
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Assigned Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
                      <User className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">John Doe</div>
                      <div className="text-sm text-gray-500">john@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Crown className="mr-2 text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-900">Gold Membership</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="mr-1 text-green-600" size={14} />
                    <span className="text-sm font-semibold text-gray-900">499</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  3 Months
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  2 days ago
                </td>
              </tr>
              <tr className="transition-colors hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
                      <User className="text-blue-600" size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                      <div className="text-sm text-gray-500">jane@example.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Crown className="mr-2 text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-900">Platinum Membership</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="mr-1 text-green-600" size={14} />
                    <span className="text-sm font-semibold text-gray-900">999</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  6 Months
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  1 week ago
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Membership Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCancel}></div>
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Assign Membership to User</h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Selection */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select User
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" size={18} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full py-3 pl-10 pr-10 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value);
                          setShowUserDropdown(true);
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                      />
                      <button
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>
                    
                    {showUserDropdown && (
                      <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleUserSelect(user)}
                              className="flex items-center w-full px-4 py-3 space-x-3 text-left transition-colors hover:bg-gray-50"
                            >
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                <User className="text-blue-600" size={16} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500">No users found</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {selectedUser && (
                    <div className="flex items-center p-3 mt-3 space-x-3 rounded-lg bg-blue-50">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <User className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{selectedUser.name}</div>
                        <div className="text-sm text-gray-500">{selectedUser.email}</div>
                      </div>
                      <Check className="ml-auto text-green-600" size={20} />
                    </div>
                  )}
                </div>

                {/* Membership Selection */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select Membership Plan
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowMembershipDropdown(!showMembershipDropdown)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <span className={selectedMembership ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedMembership ? selectedMembership.name : 'Choose a membership plan...'}
                      </span>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                    
                    {showMembershipDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        {memberships.map((membership) => (
                          <button
                            key={membership.id}
                            onClick={() => handleMembershipSelect(membership)}
                            className="w-full px-4 py-4 text-left transition-colors border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                  <Crown className="text-orange-600" size={16} />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{membership.name}</div>
                                  <div className="text-sm text-gray-500">{membership.duration}</div>
                                </div>
                              </div>
                              <div className="flex items-center text-green-600">
                                <DollarSign size={16} />
                                <span className="font-semibold">{membership.price}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedMembership && (
                    <div className="p-4 mt-3 rounded-lg bg-orange-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Crown className="text-orange-600" size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{selectedMembership.name}</div>
                            <div className="text-sm text-gray-500">{selectedMembership.duration}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-green-600">
                          <DollarSign size={18} />
                          <span className="text-xl font-bold">{selectedMembership.price}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {selectedMembership.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle2 size={14} className="flex-shrink-0 mr-2 text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignment Summary */}
                {selectedUser && selectedMembership && (
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                    <h4 className="mb-2 font-medium text-purple-900">Assignment Summary</h4>
                    <div className="text-sm text-purple-800">
                      <p><strong>{selectedMembership.name}</strong> will be assigned to <strong>{selectedUser.name}</strong></p>
                      <p className="mt-1">Duration: {selectedMembership.duration} • Price: ${selectedMembership.price}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 mt-6 space-x-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignMembership}
                  className="flex items-center px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  disabled={submitting || !selectedUser || !selectedMembership}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} className="mr-2" />
                      Assign Membership
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
};

export default AssignMembership;