"use client";
import React from "react";
import { Loader2, X } from "lucide-react";

const EndSessionRequestDialog = ({
  isOpen,
  onCancel,
  targetName,
  targetRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Waiting for Consent
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                End session request sent
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            Waiting for{" "}
            <strong className="text-gray-900 dark:text-white">{targetName}</strong>{" "}
            ({targetRole === "user" ? "Patient" : "Doctor"}) to accept your request
            to end this session.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
            The session will continue until they respond.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition font-medium"
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndSessionRequestDialog;

