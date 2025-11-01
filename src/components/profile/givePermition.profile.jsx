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

const PERMISSIONS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'appointment', label: 'Appointment' },
  { id: 'runningappointment', label: 'Running Appointment' },
  { id: 'appointmenthistory', label: 'Appointment History' },
  { id: 'staff', label: 'Staff' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'dailyexpences', label: 'Daily Expenses' },
  { id: 'services', label: 'Services' },
  { id: 'paymentcommission', label: 'Payment Commission' },
  { id: 'customers', label: 'Customers' },
  { id: 'promocards', label: 'Offers & Memberships' },
  { id: 'license', label: 'License' },
  { id: 'storepurches', label: 'Store & Purches' },
];

async function fetchStaffWithPermissions(storeId) {
  const { data: staff, error: staffErr } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('store_id', storeId)
    .neq('role', 'admin');

  if (staffErr) throw staffErr;

  if (!staff?.length) return [];

  const emails = staff.map((s) => s.email).filter(Boolean);
  let staffInfoByEmail = new Map();
  if (emails.length > 0) {
    const { data: staffInfo, error: siErr } = await supabase
      .from('staff_info')
      .select('email_id, staff_name')
      .eq('store_id', storeId)
      .in('email_id', emails);
    if (siErr) throw siErr;
    staffInfoByEmail = new Map((staffInfo || []).map((r) => [String(r.email_id).toLowerCase(), r]));
  }

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
    name:
      staffInfoByEmail.get(String(s.email || '').toLowerCase())?.staff_name ||
      s.full_name ||
      s.email ||
      s.id,
    email: s.email || '',
    role: s.role || '',
    permissions: grouped.get(s.id) || [],
    isActive: true,
  }));
}

async function updateStaffPermissions(storeId, userId, permissionIds) {
  if (!storeId) throw new Error('Missing storeId when updating permissions');
  if (!userId) throw new Error('Missing userId when updating permissions');

  const { error: delErr } = await supabase
    .from('user_permissions')
    .delete()
    .eq('store_id', storeId)
    .eq('user_id', userId);
  if (delErr) {
    console.error('Failed to clear existing permissions', delErr);
    throw delErr;
  }

  if (!permissionIds?.length) {
    return [];
  }

  // Validate permission IDs against DB to avoid FK errors
  const { data: permRows, error: permErr } = await supabase.from('permissions').select('id');
  if (permErr) {
    console.error('Failed to fetch permissions list', permErr);
    throw permErr;
  }
  const dbIds = new Set((permRows || []).map((r) => r.id));
  const safeIds = (permissionIds || []).filter((id) => dbIds.has(id));

  if (!safeIds.length) {
    return [];
  }

  const rows = safeIds.map((pid) => ({
    user_id: userId,
    store_id: storeId,
    permission_id: pid,
  }));

  const { data: inserted, error: insErr } = await supabase
    .from('user_permissions')
    .insert(rows)
    .select('user_id, store_id, permission_id');

  if (insErr) {
    console.error('Insert permissions error', insErr);
    throw insErr;
  }

  return inserted;
}

const StaffPermissions = ({ setStaffGivePermission }) => {
  const { user } = useAuth();
  const storeId = user?.profile?.store_id;
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPermissions, setPendingPermissions] = useState({});
  const [notifications, setNotifications] = useState([]);

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
      // Build set from toggles and normalize any legacy/alias keys
      const validIds = new Set(PERMISSIONS.map((p) => p.id));
      const aliasMap = {
        dailyExpences: 'dailyexpences',
      };
      const updatedPermissions = Object.keys(pendingPermissions)
        .filter((key) => pendingPermissions[key])
        .map((key) => aliasMap[key] ?? key)
        .filter((key) => validIds.has(key));

      // Fetch actual permission IDs from DB to ensure FK validity
      const { data: permRows, error: permErr } = await supabase.from('permissions').select('id');
      if (permErr) {
        throw permErr;
      }
      const dbIds = new Set((permRows || []).map((r) => r.id));
      const filteredForDb = updatedPermissions.filter((id) => dbIds.has(id));

      // Notify if any selected permissions are not present in DB
      const skipped = updatedPermissions.filter((id) => !dbIds.has(id));
      if (skipped.length > 0) {
        showNotification(`Skipped unknown permissions (not in DB): ${skipped.join(', ')}`, 'error');
      }

      // Persist to Supabase
      await updateStaffPermissions(storeId, selectedStaff.id, filteredForDb);

      // Refetch to ensure DB state is reflected
      const fresh = await fetchStaffWithPermissions(storeId);
      setStaffList(fresh);
      const refreshed = fresh.find((s) => s.id === selectedStaff.id) || null;
      if (refreshed) setSelectedStaff(refreshed);

      showNotification(`Permissions updated successfully for ${selectedStaff.name}!`);
    } catch (error) {
      console.error('Permissions update failed', error);
      showNotification(
        `Failed to update permissions: ${error?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
      setStaffGivePermission(false);
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
    <div className="absolute z-50 min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-2">
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
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center text-lg font-semibold text-gray-900">
                    <Users size={20} className="mr-2 text-purple-600" />
                    Staff Members
                  </h2>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                    {filteredStaff.length}
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-10 transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Staff List */}
              <div className="custom-scrollbar max-h-96 overflow-y-auto">
                {filteredStaff.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff)}
                    className={`w-full border-b border-gray-100 p-4 text-left transition-colors last:border-b-0 hover:bg-purple-50 ${
                      selectedStaff?.id === staff.id
                        ? 'border-r-4 border-r-purple-500 bg-purple-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={staff.profileImage || '/3.png'}
                          alt={staff.name}
                          className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                        <div
                          className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white ${
                            staff.isActive ? 'bg-green-400' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">{staff.name}</p>
                        <p className="truncate text-sm text-gray-500">{staff.role}</p>
                        <p className="truncate text-xs text-gray-400">{staff.email}</p>
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
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={selectedStaff.profileImage || '/3.png'}
                          alt={selectedStaff.name}
                          className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg"
                        />
                        <div
                          className={`absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-white ${
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
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
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
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
                        className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                      >
                        <CheckCircle2 size={16} className="mr-2" />
                        Grant All
                      </button>
                      <button
                        onClick={handleRevokeAll}
                        className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                      >
                        <X size={16} className="mr-2" />
                        Revoke All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permission Matrix */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 p-6">
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
                          className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-colors hover:border-purple-300"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`rounded-lg p-2 ${
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
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              checked={pendingPermissions[id] || false}
                              onChange={() => handlePermissionToggle(id)}
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-purple-600 peer-focus:ring-4 peer-focus:ring-purple-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {hasChanges() && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Unsaved Changes</p>
                        <p className="text-sm text-gray-600">You have pending permission changes</p>
                      </div>
                      <button
                        onClick={handleSavePermissions}
                        disabled={isLoading}
                        className="flex items-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <UserCheck className="mx-auto mb-4 h-16 w-16 text-gray-400" />
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
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="bg-opacity-75 fixed inset-0 bg-gray-500 transition-opacity"
                onClick={() => setShowConfirmDialog(false)}
              ></div>

              <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-4 flex items-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Shield className="h-6 w-6 text-purple-600" />
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
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmSavePermissions}
                    className="flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
