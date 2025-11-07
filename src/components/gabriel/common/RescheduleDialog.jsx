import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

import { rescheduleAppointment } from "@/utils/api";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const RescheduleDialog = ({ appointment, token, onClose, onRescheduled }) => {
  const { minimumDate, initialDate } = useMemo(() => {
    const now = Date.now();
    const existing = new Date(appointment.dateTime);
    const cutoff = new Date(now + TWENTY_FOUR_HOURS_MS);
    const minDate = existing.getTime() - now >= TWENTY_FOUR_HOURS_MS ? existing : cutoff;
    return {
      minimumDate: minDate,
      initialDate: new Date(Math.max(existing.getTime(), minDate.getTime())),
    };
  }, [appointment.dateTime]);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedDate(initialDate);
  }, [initialDate]);

  const minimumDateStartOfDay = useMemo(() => {
    const date = new Date(minimumDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [minimumDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate) {
      toast.error("Please select a new date and time.");
      return;
    }

    if (selectedDate.getTime() < minimumDate.getTime()) {
      toast.error("Appointments can only be rescheduled at least 24 hours in advance.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        newDateTime: selectedDate.toISOString(),
      };
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      const response = await rescheduleAppointment(appointment._id, payload, token);

      toast.success("Appointment rescheduled successfully.");

      if (onRescheduled) {
        await onRescheduled(response);
      }
      onClose?.();
    } catch (error) {
      const message = error?.message || "Unable to reschedule appointment.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reschedule Appointment</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
        You can move this appointment up to two times, at least 24 hours in advance.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">New date &amp; time</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            timeIntervals={30}
            minDate={minimumDateStartOfDay}
            filterTime={(time) => {
              if (!minimumDate) return true;
              const minDay = minimumDate.getDate();
              const minMonth = minimumDate.getMonth();
              const minYear = minimumDate.getFullYear();
              if (
                time.getDate() === minDay &&
                time.getMonth() === minMonth &&
                time.getFullYear() === minYear
              ) {
                return time.getTime() >= minimumDate.getTime();
              }
              return true;
            }}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Original slot: {new Date(appointment.dateTime).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Add a note for the specialist"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RescheduleDialog;

