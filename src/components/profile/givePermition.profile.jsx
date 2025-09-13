import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Check,
  X,
  Save,
  Search,
  ChevronRight,
  UserCheck,
  Settings,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import NotificationSystem from '../offers_&_Membership/notificationSystem';
import { useAuth } from '@/Context/AuthContext';
import supabase from '@/dataBase/connectdb';

// Permissions master: ids MUST match what Sidebar/Dashboard expect and what DB stores
const PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'appointment', label: 'Appointment' },
  { id: 'runningappointment', label: 'Running Appointment' },
  { id: 'appointmenthistory', label: 'Appointment History' },
  { id: 'staff', label: 'Staff' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'services', label: 'Services' },
  { id: 'paymentcommission', label: 'Payment Commission' },
  { id: 'customers', label: 'Customers' },
  { id: 'promocards', label: 'Offers & Memberships' },
  { id: 'license', label: 'License' },
];

// Fetch staff for the current store with their permissions
async function fetchStaffWithPermissions(storeId) {
  const { data: staff, error: staffErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('store_id', storeId)
    .neq('role', 'admin');

    console.log(staff,"all staff form givePermition.profile.jsx")
  if (staffErr) throw staffErr;

  if (!staff?.length) return [];

  const userIds = staff.map((s) => s.id);
  const { data: perms, error: permsErr } = await supabase
    .from('user_permissions')
    .select('user_id, permission_id')
    .in('user_id', userIds)
    .eq('store_id', storeId);
  if (permsErr) throw permsErr;

  const grouped = new Map(staff.map((s) => [s.id, []]));
  for (const row of perms || []) {
    grouped.get(row.user_id)?.push(row.permission_id);
  }

  return staff.map((s) => ({
    id: s.id,
    name: s.full_name || s.email || s.id,
    email: s.email,
    role: s.role,
    permissions: grouped.get(s.id) || [],
    isActive: true,
  }));
}

// Replace permissions for a user in a given store
async function updateStaffPermissions(storeId, userId, permissionIds) {
  const { error: delErr } = await supabase
    .from('user_permissions')
    .delete()
    .eq('store_id', storeId)
    .eq('user_id', userId);
  if (delErr) throw delErr;

  if (!permissionIds?.length) return;

  const rows = permissionIds.map((pid) => ({
    user_id: userId,
    store_id: storeId,
    permission_id: pid,
  }));

  const { error: insErr } = await supabase.from('user_permissions').insert(rows);

  console.log(insErr)
  if (insErr) throw insErr;
}

const StaffPermissions = () => {
  const { user } = useAuth();
  const storeId = user?.profile?.store_id;
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPermissions, setPendingPermissions] = useState({});
  const [notifications, setNotifications] = useState([]);

  // Initial load by store
  useEffect(() => {
    if (!storeId) return;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchStaffWithPermissions(storeId);
        setStaffList(data);
        if (data.length > 0 && !selectedStaff) {
          setSelectedStaff(data[0]);
          setPendingPermissions(
            data[0].permissions.reduce((acc, perm) => {
              acc[perm] = true;
              return acc;
            }, {})
          );
        }
      } catch (e) {
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: e.message || 'Failed to load staff', type: 'error' },
        ]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [storeId]);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Filter staff by search term
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle staff selection
  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    // Initialize pending permissions based on current staff permissions
    const currentPermissions = staff.permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {});
    setPendingPermissions(currentPermissions);
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey) => {
    setPendingPermissions((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }));
  };

  // Handle grant all permissions
  const handleGrantAll = () => {
    const allPermissions = PERMISSIONS.reduce((acc, p) => {
      acc[p.id] = true;
      return acc;
    }, {});
    setPendingPermissions(allPermissions);
  };

  // Handle revoke all permissions
  const handleRevokeAll = () => {
    const noPermissions = PERMISSIONS.reduce((acc, p) => {
      acc[p.id] = false;
      return acc;
    }, {});
    setPendingPermissions(noPermissions);
  };

  // Handle save permissions
  const handleSavePermissions = () => {
    setShowConfirmDialog(true);
  };

  // Confirm save permissions
  const confirmSavePermissions = async () => {
    if (!selectedStaff) return;

    setIsLoading(true);
    try {
      // Build set from toggles
      const updatedPermissions = Object.keys(pendingPermissions).filter((key) => pendingPermissions[key]);

      // Persist to Supabase
      await updateStaffPermissions(storeId, selectedStaff.id, updatedPermissions);

      // Update local state
      const updatedStaffList = staffList.map((staff) =>
        staff.id === selectedStaff.id ? { ...staff, permissions: updatedPermissions } : staff
      );
      setStaffList(updatedStaffList);
      setSelectedStaff({ ...selectedStaff, permissions: updatedPermissions });

      showNotification(`Permissions updated successfully for ${selectedStaff.name}!`);
    } catch (error) {
      showNotification('Failed to update permissions. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  // Check if permissions have changed
  const hasChanges = () => {
    if (!selectedStaff) return false;
    const currentPermissions = selectedStaff.permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {});

    return JSON.stringify(currentPermissions) !== JSON.stringify(pendingPermissions);
  };

  return (
    <div className="absolute z-50 w-full min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2 space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Permissions</h1>
          </div>
          <p className="text-gray-600">Manage access permissions for your salon staff members</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Staff List - Left Sidebar */}
          <div className="lg:col-span-4">
            <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center text-lg font-semibold text-gray-900">
                    <Users size={20} className="mr-2 text-purple-600" />
                    Staff Members
                  </h2>
                  <span className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
                    {filteredStaff.length}
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    className="w-full py-3 pl-10 pr-4 transition-colors border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Staff List */}
              <div className="overflow-y-auto max-h-96 custom-scrollbar">
                {filteredStaff.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff)}
                    className={`w-full p-4 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      selectedStaff?.id === staff.id
                        ? 'bg-purple-50 border-r-4 border-r-purple-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={staff.profileImage || '/3.png'}
                          alt={staff.name}
                          className="object-cover w-12 h-12 border-2 border-white rounded-full shadow-sm"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            staff.isActive ? 'bg-green-400' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{staff.name}</p>
                        <p className="text-sm text-gray-500 truncate">{staff.role}</p>
                        <p className="text-xs text-gray-400 truncate">{staff.email}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permission Matrix - Right Content */}
          <div className="lg:col-span-8">
            {selectedStaff ? (
              <div className="space-y-6">
                {/* Selected Staff Header */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={selectedStaff.profileImage || '/3.png'}
                          alt={selectedStaff.name}
                          className="object-cover w-16 h-16 border-4 border-white rounded-full shadow-lg"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            selectedStaff.isActive ? 'bg-green-400' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h3>
                        <p className="text-gray-600">{selectedStaff.role}</p>
                        <p className="text-sm text-gray-500">{selectedStaff.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedStaff.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {selectedStaff.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="mb-1 text-lg font-semibold text-gray-900">Quick Actions</h4>
                      <p className="text-sm text-gray-600">
                        Grant or revoke all permissions at once
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleGrantAll}
                        className="flex items-center px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Grant All
                      </button>
                      <button
                        onClick={handleRevokeAll}
                        className="flex items-center px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        <X size={16} className="mr-2" />
                        Revoke All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permission Matrix */}
                <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
                  <div className="p-6 border-b border-gray-200">
                    <h4 className="flex items-center text-lg font-semibold text-gray-900">
                      <Settings size={20} className="mr-2 text-indigo-600" />
                      Permission Matrix
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Configure access permissions for different sections and features
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {PERMISSIONS.map(({ id, label }) => (
                        <div
                          key={id}
                          className="flex items-center justify-between p-4 transition-colors border border-gray-200 rounded-xl hover:border-purple-300"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                pendingPermissions[id]
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {pendingPermissions[id] ? <Eye size={16} /> : <EyeOff size={16} />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{label}</p>
                              <p className="text-xs text-gray-500">
                                Access to {label.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={pendingPermissions[id] || false}
                              onChange={() => handlePermissionToggle(id)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {hasChanges() && (
                  <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Unsaved Changes</p>
                        <p className="text-sm text-gray-600">You have pending permission changes</p>
                      </div>
                      <button
                        onClick={handleSavePermissions}
                        disabled={isLoading}
                        className="flex items-center px-6 py-3 text-white transition-all duration-200 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} className="mr-2" />
                            Save Permissions
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">
                <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">Select a Staff Member</h3>
                <p className="text-gray-600">
                  Choose a staff member from the list to manage their permissions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={() => setShowConfirmDialog(false)}
              ></div>

              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Update Permissions</h3>
                  <p className="mb-6 text-sm text-gray-500">
                    Are you sure you want to update permissions for{' '}
                    <strong>{selectedStaff?.name}</strong>? This will change their access to various
                    sections of the system.
                  </p>
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDialog(false)}
                    className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmSavePermissions}
                    className="flex items-center px-4 py-2 text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} className="mr-2" />
                        Update Permissions
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
    </div>
  );
};

export default StaffPermissions;
