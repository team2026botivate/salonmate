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
  IndianRupee,
} from 'lucide-react';

import NotificationSystem from './notificationSystem';
import {
  useMembershipOperations,
  useGetCustomerDataFetch,
  useMembershipUserOperations,
  useRecentMembershipAssignments,
} from '../../hook/dbOperation';

const AssignMembership = () => {
  // Data hooks
  const {
    data: customers,
    loading: customersLoading,
    error: customersError,
  } = useGetCustomerDataFetch();
  const { memberships, loading, error } = useMembershipOperations();
  const {
    assignMembershipToUser,
    loading: assignLoading,
    error: assignError,
  } = useMembershipUserOperations();
  const {
    data: recentAssignments,
    loading: recentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = useRecentMembershipAssignments(20);
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
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Filter users by search term
  const filteredUsers = (customers || []).filter((user) => {
    const name = (user.customer_name || '').toLowerCase();
    const mobile = (user.mobile_number || '').toLowerCase();
    const q = userSearchTerm.toLowerCase();
    return name.includes(q) || mobile.includes(q);
  });

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUserSearchTerm(user.customer_name || '');
    setShowUserDropdown(false);
  };

  // Handle membership selection
  const handleMembershipSelect = (membership) => {
    // Normalize benefits as array for UI safety
    const normalized = {
      ...membership,
      benefits: Array.isArray(membership?.benefits) ? membership.benefits : [],
    };
    setSelectedMembership(normalized);
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
      const result = await assignMembershipToUser({
        customer_id: selectedUser.id,
        membership_id: selectedMembership.id,
        // Optional: derive end_date from duration if you want
        // end_date: computeEndDate(selectedMembership.duration),
        is_active: true,
      });

      if (result?.success) {
        showNotification(
          `Successfully assigned ${selectedMembership.name} to ${selectedUser.customer_name || 'User'}!`
        );
        // refresh recent list
        refetchRecent();
      } else {
        showNotification(
          `Failed to assign membership: ${result?.error || 'Unknown error'}`,
          'error'
        );
        return;
      }

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
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 ">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assign Membership</h2>
          <p className="mt-1 text-sm text-gray-600">
            Assign membership plans to users and manage user subscriptions
          </p>
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
              <p className="text-2xl font-bold text-gray-900">{customers?.length || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{memberships?.length || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{recentAssignments?.length || 0}</p>
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
            <p className="text-sm text-gray-600">
              Choose the user you want to assign a membership to
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full">
              <span className="font-bold text-purple-600">2</span>
            </div>
            <h4 className="mb-2 font-medium text-gray-900">Choose Plan</h4>
            <p className="text-sm text-gray-600">
              Select the appropriate membership plan for the user
            </p>
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
          {recentLoading ? (
            <div className="p-4 text-gray-500">Loading recent assignments...</div>
          ) : recentError ? (
            <div className="p-4 text-red-600">{recentError}</div>
          ) : (
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
                {recentAssignments && recentAssignments.length > 0 ? (
                  recentAssignments.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-full">
                            <User className="text-blue-600" size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {row.customer?.customer_name || '-'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {row.customer?.mobile_number || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Crown className="mr-2 text-orange-600" size={16} />
                          <span className="text-sm font-medium text-gray-900">
                            {row.membership?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IndianRupee className="mr-1 text-green-600" size={14} />
                          <span className="text-sm font-semibold text-gray-900">
                            {row.membership?.price ?? '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {row.membership?.duration || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Assign Membership Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 min-h-screen overflow-y-auto ">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCancel}
            ></div>

            <div className="inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-[85vh] overflow-y-auto">
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
                      <Search
                        className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search customers by name or mobile..."
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
                      <div className="absolute z-20 w-full pb-10 mt-1 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
                        {customersLoading ? (
                          <div className="px-4 py-3 text-gray-500">Loading customers...</div>
                        ) : customersError ? (
                          <div className="px-4 py-3 text-red-600">{customersError}</div>
                        ) : filteredUsers.length > 0 ? (
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
                                <div className="font-medium text-gray-900">
                                  {user.customer_name}
                                </div>
                                <div className="text-sm text-gray-500">{user.mobile_number}</div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500">No customers found</div>
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
                        <div className="font-medium text-gray-900">
                          {selectedUser.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">{selectedUser.mobile_number}</div>
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
                        {selectedMembership
                          ? selectedMembership.name
                          : 'Choose a membership plan...'}
                      </span>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>

                    {showMembershipDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[60vh] overflow-y-auto overscroll-contain pb-2">
                        {loading ? (
                          <div className="px-4 py-3 text-gray-500">Loading memberships...</div>
                        ) : error ? (
                          <div className="px-4 py-3 text-red-600">{error}</div>
                        ) : memberships && memberships.length > 0 ? (
                          memberships.map((membership) => (
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
                                    <div className="font-medium text-gray-900">
                                      {membership.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {membership.duration}
                                    </div>
                                    {Array.isArray(membership?.benefits) &&
                                      membership.benefits.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                                          {membership.benefits.slice(0, 2).join(', ')}
                                          {membership.benefits.length > 2 &&
                                            ` +${membership.benefits.length - 2} more`}
                                        </div>
                                      )}
                                  </div>
                                </div>
                                <div className="flex items-center text-green-600">
                                  <IndianRupee size={16} />
                                  <span className="font-semibold">{membership.price}</span>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500">No membership plans found</div>
                        )}
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
                            <div className="font-medium text-gray-900">
                              {selectedMembership.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {selectedMembership.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-green-600">
                          <IndianRupee size={18} />
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
                      <p>
                        <strong>{selectedMembership.name}</strong> will be assigned to{' '}
                        <strong>{selectedUser.customer_name}</strong>
                      </p>
                      <p className="mt-1">
                        Duration: {selectedMembership.duration} • Price: ₹{selectedMembership.price}
                      </p>
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
                  disabled={submitting || assignLoading || !selectedUser || !selectedMembership}
                >
                  {submitting || assignLoading ? (
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
      <NotificationSystem notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
};

export default AssignMembership;
