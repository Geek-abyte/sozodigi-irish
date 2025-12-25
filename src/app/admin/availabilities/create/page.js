"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData } from "@/utils/api";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

// Pricing tiers in minutes
const PRICING_TIERS = [
  { duration: 15, label: "Basic", price: 20, discount: 0 },
  { duration: 45, label: "Delux", price: 40, discount: 10 },
  { duration: 60, label: "Premium", price: 70, discount: 20 },
];

const CreateConsultantAvailabilityPage = () => {
  const [form, setForm] = useState({
    type: "recurring",
    category: "general",
    dayOfWeek: "",
    date: new Date(),
    startTime: "09:00",
    duration: "", // Duration in minutes (15, 45, or 60)
  });

  const [submitting, setSubmitting] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "";

    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    const endHours = String(endDate.getHours()).padStart(2, "0");
    const endMinutes = String(endDate.getMinutes()).padStart(2, "0");

    return `${endHours}:${endMinutes}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartTimeChange = (value) => {
    setForm((prev) => ({ ...prev, startTime: value }));
  };

  const handleDurationSelect = (durationMinutes) => {
    setForm((prev) => ({ ...prev, duration: durationMinutes.toString() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate duration is selected
    if (!form.duration) {
      addToast("Please select a duration tier.", "error");
      setSubmitting(false);
      return;
    }

    // Validate start time is selected
    if (!form.startTime) {
      addToast("Please select a start time.", "error");
      setSubmitting(false);
      return;
    }

    // Validate duration is one of the allowed tiers
    const durationNum = parseInt(form.duration);
    const isValidTier = PRICING_TIERS.some(
      (tier) => tier.duration === durationNum,
    );
    if (!isValidTier) {
      addToast(
        "Please select a valid duration tier (15, 45, or 60 minutes).",
        "error",
      );
      setSubmitting(false);
      return;
    }

    // Calculate end time
    const endTime = calculateEndTime(form.startTime, durationNum);
    if (!endTime) {
      addToast(
        "Error calculating end time. Please check your start time.",
        "error",
      );
      setSubmitting(false);
      return;
    }

    const payload = {
      user: session?.user?.id,
      type: form.type,
      startTime: form.startTime,
      endTime: endTime,
      category: form.category,
      ...(form.type === "recurring"
        ? { dayOfWeek: form.dayOfWeek }
        : { date: form.date }),
    };

    try {
      await postData("medical-tourism/availabilities/create/custom", payload, token);
      addToast("Availability created successfully!", "success");
      router.push("/admin/availabilities");
    } catch (error) {
      console.error(error);
      addToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Set Consultant Availability</h1>
        <Link
          href="/admin/medical-tourism/consultations/availability"
          className="text-sm text-indigo-600 hover:underline"
        >
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selector */}
        <div>
          <label className="block mb-1 font-medium">Availability Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="recurring">Recurring (weekly)</option>
            <option value="one-time">One-Time</option>
          </select>
        </div>

        {/* Type Selector */}
        <div>
          <label className="block mb-1 font-medium">
            Consultation Reason <br /> (
            <small className="text-red-500">
              Note: No action required if consultation is not for medical
              certificate
            </small>
            )
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="general">General Consultation</option>
            <option value="cert">Medical Certificate Consultation</option>
          </select>
        </div>

        {/* Conditional Field */}
        {form.type === "recurring" ? (
          <div>
            <label className="block mb-1 font-medium">Day of the Week</label>
            <select
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">Select Day</option>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block mb-1 font-medium">Select Date</label>
            <DatePicker
              selected={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
              dateFormat="MMMM d, yyyy"
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        )}

        {/* Start Time Picker */}
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <TimePicker
            value={form.startTime}
            onChange={handleStartTimeChange}
            disableClock
            className="w-full"
          />
        </div>

        {/* Duration Tier Selector */}
        <div>
          <label className="block mb-2 font-medium">
            Select Duration <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            End time will be calculated automatically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRICING_TIERS.map((tier) => {
              const isSelected = form.duration === tier.duration.toString();

              return (
                <div
                  key={tier.duration}
                  onClick={() => handleDurationSelect(tier.duration)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all text-center ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm"
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {tier.duration}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    minutes
                  </div>
                  {isSelected && (
                    <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      ✓ Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          } text-white py-2 rounded font-medium transition`}
        >
          {submitting ? "Creating..." : "Create Availability"}
        </button>
      </form>
    </div>
  );
};

export default CreateConsultantAvailabilityPage;
