// src/components/CartList.jsx
import React, { useEffect } from "react";
import { useFetchCart } from "@/hook/ecommerce-store-hook";

const formatCurrency = (v) =>
  typeof v === "number" ? `₹${v.toFixed(2)}` : v ?? "-";

const ErrorDetails = ({ err }) => {
  if (!err) return null;

  // If err is a string, show it.
  if (typeof err === "string") {
    return <pre className="whitespace-pre-wrap text-sm text-red-700">{err}</pre>;
  }

  // Try to display common Supabase error keys
  const { message, details, hint, code, status } = err || {};

  return (
    <div className="bg-red-50 border border-red-200 p-3 rounded">
      <div className="font-semibold text-red-700 mb-1">Error summary</div>
      <div className="text-sm text-red-800 mb-2">{message ?? JSON.stringify(err)}</div>

      {details && (
        <>
          <div className="font-medium text-sm">Details</div>
          <div className="text-xs mb-1">{String(details)}</div>
        </>
      )}

      {hint && (
        <>
          <div className="font-medium text-sm">Hint</div>
          <div className="text-xs mb-1">{String(hint)}</div>
        </>
      )}

      <div className="text-xs text-gray-600 mt-2">
        <strong>code:</strong> {code ?? "—"} <span className="ml-2"><strong>status:</strong> {status ?? "—"}</span>
      </div>

      <details className="mt-2 text-xs">
        <summary className="cursor-pointer">Show raw error object</summary>
        <pre className="text-xs mt-2 overflow-auto max-h-40">{JSON.stringify(err, null, 2)}</pre>
      </details>
    </div>
  );
};

const CartList = () => {
  const { fetchCart, cartItems, loading, error } = useFetchCart();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Debug helper to log full error object to console (useful for nested fields)
  const debugLog = () => {
    console.log("----- debug cart error -----");
    console.log("error (raw):", error);
    try {
      // if it's an object, expand it
      console.dir(error, { depth: null });
    } catch (e) {
      console.log("Could not dir() the error:", e);
    }
    // Also try a JSON stringify (catch circular refs)
    try {
      console.log("error (json):", JSON.stringify(error, null, 2));
    } catch (e) {
      console.log("Could not JSON.stringify error (circular?):", e);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">🛒 Cart</h2>

      {loading && (
        <div className="text-center py-8 text-gray-600">Loading cart items …</div>
      )}

      {!loading && error && (
        <div className="mb-4 space-y-3">
          <ErrorDetails err={error} />
          <div className="flex gap-2">
            <button
              onClick={() => fetchCart()}
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
            >
              Retry
            </button>
            <button
              onClick={debugLog}
              className="px-3 py-1 rounded border text-sm"
            >
              Log raw error to console
            </button>
          </div>
        </div>
      )}

      {!loading && !error && cartItems?.length === 0 && (
        <div className="text-center text-gray-500 py-8">Your cart is empty 🧾</div>
      )}

      {!loading && !error && cartItems?.length > 0 && (
        <div className="bg-white rounded shadow p-3">
          <ul className="divide-y">
            {cartItems.map((item) => (
              <li key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {item.product?.name ?? "Unnamed product"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Price: {formatCurrency(item.product_id?.price ?? item.product_id.price_snapshot)}
                  </div>
                </div>
                <div className="text-sm text-gray-700">Qty: {item.quantity}</div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between font-semibold">
            <div>Total items</div>
            <div>{cartItems.reduce((acc, it) => acc + (it.quantity || 0), 0)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartList;
