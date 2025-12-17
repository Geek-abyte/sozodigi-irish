"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

const CertificateDialog = ({
  showCertificates,
  setShowCertificates,
  onCreateCertificate,
  savingCertificate,
}) => {
  const [diagnosis, setDiagnosis] = useState("");
  const [comment, setComment] = useState("");
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [validTo, setValidTo] = useState("");

  const handleCreate = async () => {
    if (!diagnosis.trim() || !comment.trim() || !validFrom || !validTo) {
      alert("Please fill all required fields");
      return;
    }

    await onCreateCertificate({ diagnosis, comment, validFrom, validTo });

    // Reset form
    setDiagnosis("");
    setComment("");
    setValidFrom(new Date().toISOString().split("T")[0]);
    setValidTo("");
  };

  if (!showCertificates) return null;

  return (
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Issue Medical Certificate
          </h3>
          <button
            onClick={() => setShowCertificates(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagnosis / Condition <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g., Viral URTI, Acute Bronchitis"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valid From <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Valid To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valid To <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              min={validFrom}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Comment / Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Certificate Note <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Enter medical recommendation or sick leave details..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will appear on the certificate as the doctor's recommendation
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowCertificates(false)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            disabled={savingCertificate}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={savingCertificate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingCertificate ? "Creating..." : "Issue Certificate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateDialog;
