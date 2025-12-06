"use client";
import React from "react";
import { Clock, X } from "lucide-react";

const EndSessionConsentDialog = ({
  isOpen,
  onAccept,
  onReject,
  requesterName,
  requesterRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                End Session Request
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Requires your consent
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            <strong className="text-gray-900 dark:text-white">
              {requesterName}
            </strong>{" "}
            ({requesterRole === "user" ? "Patient" : "Doctor"}) has requested to end
            this consultation session early.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
            Do you agree to end the session now?
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <button
            onClick={onReject}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
          >
            Reject
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Accept & End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSessionConsentDialog;

