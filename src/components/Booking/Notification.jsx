import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const Notification = ({ notification, onClose }) => (
  <motion.div
    key="notification"
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 flex items-center ${
      notification.type === "success" ? "bg-green-100" : "bg-red-100"
    }`}
  >
    {notification.type === "success" ? (
      <CheckCircle2 className="text-green-600 mr-3" size={20} />
    ) : (
      <AlertCircle className="text-red-600 mr-3" size={20} />
    )}
    <p className={`font-medium ${notification.type === "success" ? "text-green-800" : "text-red-800"}`}>
      {notification.message}
    </p>
    <button
      onClick={onClose}
      className="ml-4 text-gray-500 hover:text-gray-700"
    >
      <X size={16} />
    </button>
  </motion.div>
);

export default Notification;
