import { X, ChevronDown, Upload, User, Users, Phone, Mail, Calendar, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ✅ Strong mobile number validation
export const isValidMobile = (mobile) => {
  return /^[6-9]\d{9}$/.test(mobile);
};


// ✅ Required CSV columns
const REQUIRED_COLUMNS = [
  "customer_name",
  "mobile_number",
];

function GenderSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const options = [
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
  ];


  const selectedLabel =
    options.find((o) => o.value === value)?.label || "Select Gender";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm"
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow">
          {options.map((g) => (
            <div
              key={g.value}
              onClick={() => {
                onChange(g.value); // ✅ sends M or F
                setOpen(false);
              }}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
            >
              {g.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddCustomerDrawer({ open, onClose, storeId }) {
  const [form, setForm] = useState({
    customer_name: "",
    mobile_number: "",
    email: "",
    gender: null,
    timestamp: null,
    store_id: storeId,
  });

  const [csvData, setCsvData] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error", // success | error
  });
  const normalizeGender = (value) => {
    if (!value) return null;

    const g = value.toString().trim().toLowerCase();

    if (g === "m" || g === "male") return "M";
    if (g === "f" || g === "female") return "F";

    return null; // invalid
  };

  const showToast = (msg, type = "error") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "error" });
    }, 9000);
  };

  const handleCloseModal = () => {
    // Reset all data
    setForm({
      customer_name: "",
      mobile_number: "",
      email: "",
      gender: null,
      timestamp: null,
      store_id: storeId,
    });
    setCsvData([]);
    setCsvFileName("");
    setToast({ show: false, message: "", type: "error" });
    onClose();
  };

  // -------- Manual Insert ----------
  const handleSubmit = async () => {
    if (!form.customer_name || !form.mobile_number) {
      alert("Name & Mobile are required");
      return;
    }

    if (!isValidMobile(form.mobile_number)) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from("customer_info")
      .insert([
        {
          ...form,
          store_id: storeId,
        },
      ]);

    setLoading(false);

    if (error) alert(error.message);
    else {
      onClose();
    }
  };

  // -------- CSV Upload ----------
  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (!res.data || res.data.length === 0) {
          showToast("CSV file is empty", "error");
          return;
        }

        const headers = Object.keys(res.data[0] || {});

        // ✅ Only check REQUIRED columns
        const missingRequired = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col)
        );

        if (missingRequired.length > 0) {
          showToast(
            "CSV upload failed. Required headers: customer_name, mobile_number. Please rename your CSV columns and try again.",
            "error"
          );
          return;
        }

        const cleanedRows = [];
        const invalidRows = [];

        res.data.forEach((row, index) => {
          const name = row.customer_name?.trim();
          const mobile = row.mobile_number?.trim();

          if (!name || !mobile) {
            invalidRows.push(`Row ${index + 1}: Missing name or mobile`);
            return;
          }

          if (!isValidMobile(mobile)) {
            invalidRows.push(`Row ${index + 1}: Invalid mobile`);
            return;
          }

          const gender = normalizeGender(row.gender);

          if (row.gender && !gender) {
            invalidRows.push(
              `Row ${index + 1}: Gender must be Male/Female or M/F`
            );
            return;
          }

          cleanedRows.push({
            customer_name: name,
            mobile_number: mobile,
            email: row.email?.trim() || null,
            gender,
            timestamp: row.timestamp
              ? new Date(row.timestamp).toISOString()
              : null
          });
        });


        if (cleanedRows.length === 0) {
          showToast("No valid rows found", "error");
          return;
        }

        setCsvData(cleanedRows);
        showToast(
          `${cleanedRows.length} records ready to upload`,
          "success"
        );
      },
    });
  };

  const uploadCSV = async () => {
    setLoading(true);

    // ✅ Remove duplicate mobile numbers inside CSV
    const uniqueRows = [];
    const seen = new Set();

    for (const row of csvData) {
      if (!seen.has(row.mobile_number)) {
        seen.add(row.mobile_number);
        uniqueRows.push({
          ...row,
          store_id: storeId,
        });
      }
    }

    const { error } = await supabase
      .from("customer_info")
      .upsert(uniqueRows, {
        onConflict: "mobile_number",
      });

    setLoading(false);

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast(
        `${uniqueRows.length} records uploaded successfully`,
        "success"
      );
      setCsvData([]);
      setCsvFileName("");
      handleCloseModal();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${open ? "bg-black/40 backdrop-blur-sm" : "pointer-events-none"
        }`}
    >
      <div
        className={`h-full w-full max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out
  ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Add Customer</h2>
          <button onClick={handleCloseModal}>
            <X className="text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`mx-4 mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${toast.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
              }`}
          >
            <AlertCircle size={16} />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Manual Entry */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Manual Entry
            </h3>

            <div className="space-y-4">
              <Input
                icon={<User size={16} />}
                placeholder="Customer Name *"
                onChange={(e) =>
                  setForm({ ...form, customer_name: e.target.value })
                }
              />

              <Input
                icon={<Phone size={16} />}
                placeholder="Mobile Number (10 digits) *"
                type="text"
                maxLength="10"
                inputMode="numeric"
                value={form.mobile_number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                  setForm({ ...form, mobile_number: value });
                }}
              />
              <Input
                type="date"
                icon={<Calendar size={16} />}
                onChange={(e) =>
                  setForm({ ...form, timestamp: e.target.value })
                }
              />

              <Input
                icon={<Mail size={16} />}
                placeholder="Email (optional)"
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
              <GenderSelect
                value={form.gender}
                onChange={(val) => setForm({ ...form, gender: val })}
              />
              <button
                disabled={loading}
                onClick={handleSubmit}
                className="w-full rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* CSV Upload */}
          <div>
            <h3 className="mb-3 text-center text-sm font-semibold text-gray-700">
              Bulk Upload (CSV)
            </h3>
            <p className=" text-sm text-red-500">Required</p>
            <p className=" pb-2 text-sm">The header name should be <strong>customer_name</strong> and <strong>mobile_number</strong> in the csv file</p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50">
              <Upload className="mb-2 text-gray-500" />
              <span className="text-sm text-gray-600">
                Click to upload CSV file
              </span>
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleCSV}
              />
            </label>

            {csvData.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-900">
                    {csvData.length} valid records detected
                  </p>
                  <p className="text-xs text-blue-700">{csvFileName}</p>
                </div>

                <button
                  onClick={uploadCSV}
                  disabled={loading}
                  className="w-full rounded-lg bg-green-600 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Upload CSV"}
                </button>

                <label className="block">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCsvData([]);
                      setCsvFileName("");
                      // Trigger file input
                      e.currentTarget.parentElement?.querySelector('input[type="file"]')?.click();
                    }}
                    className="w-full rounded-lg bg-gray-200 py-2 text-gray-700 hover:bg-gray-300"
                  >
                    Choose Another File
                  </button>
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleCSV}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable Input ---------- */
function Input({ icon, ...props }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
      <span className="text-gray-400">{icon}</span>
      <input
        {...props}
        className="w-full border-none outline-none text-sm"
      />
    </div>
  );
}
