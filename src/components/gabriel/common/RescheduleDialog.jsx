import React, { useEffect, useMemo, useState } from "react";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { toast } from "react-toastify";

import { rescheduleAppointment, fetchData } from "@/utils/api";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const RescheduleDialog = ({ appointment, token, onClose, onRescheduled }) => {
  const consultantId = appointment.consultant?._id || appointment.consultant;
  const { minimumDate, initialDate } = useMemo(() => {
    const now = Date.now();
    const existing = new Date(appointment.dateTime || appointment.date);
    const cutoff = new Date(now + TWENTY_FOUR_HOURS_MS);
    const minDate = existing.getTime() - now >= TWENTY_FOUR_HOURS_MS ? existing : cutoff;
    return {
      minimumDate: minDate,
      initialDate: new Date(Math.max(existing.getTime(), minDate.getTime())),
    };
  }, [appointment.dateTime, appointment.date]);

  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date(initialDate);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minimumDateStartOfDay = useMemo(() => {
    const date = new Date(minimumDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [minimumDate]);

  useEffect(() => {
    if (selectedDate && consultantId) {
      fetchAvailableSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, consultantId]);

  const fetchAvailableSlots = async () => {
    if (!consultantId || !selectedDate) return;
    
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);

    try {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selectedDayName = weekdays[selectedDate.getDay()];
      const selectedDateString = selectedDate.toISOString().split('T')[0];

      // 1. Fetch appointments for selected date to exclude booked slots
      const appointmentRes = await fetchData(
        `consultation-appointments/all/no/pagination/?dateFrom=${selectedDateString}&dateTo=${selectedDateString}`,
        token
      );
      const bookedAppointments = appointmentRes || [];
      const bookedSlotIds = new Set(
        bookedAppointments
          .filter(apt => apt._id !== appointment._id) // Exclude current appointment
          .map((apt) => apt.slot?._id)
      );

      // 2. Fetch available slots for the consultant
      const res = await fetchData(
        `availabilities/slots/by?userRole=specialist&consultantId=${consultantId}&isBooked=false`,
        token
      );

      const slots = res?.data || [];
      const filtered = slots.filter((slot) => {
        const slotId = slot._id;
        // Exclude already booked slots (except current appointment's slot)
        if (bookedSlotIds.has(slotId)) return false;
        
        // Only show "general" category slots
        if (slot.category !== "general") return false;

        // Check date/day match
        if (slot.type === 'recurring') {
          return slot.dayOfWeek === selectedDayName;
        } else if (slot.type === 'one-time') {
          if (!slot.date) return false;
          const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
          const slotDateStr = slotDate.toISOString().split('T')[0];
          return slotDateStr === selectedDateString;
        }

        return false;
      });

      // Filter slots that are at least 24 hours in the future
      const now = new Date();
      const minDateTime = new Date(now.getTime() + TWENTY_FOUR_HOURS_MS);
      
      const validSlots = filtered.filter((slot) => {
        const slotDate = new Date(selectedDate);
        const [startH, startM] = slot.startTime.split(':').map(Number);
        slotDate.setHours(startH, startM, 0, 0);
        return slotDate.getTime() >= minDateTime.getTime();
      });

      setAvailableSlots(validSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Please select an available time slot.");
      return;
    }

    if (!token) {
      toast.error("You must be logged in to reschedule an appointment.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create the new date/time from selected date and slot
      const newDate = new Date(selectedDate);
      const [startH, startM] = selectedSlot.startTime.split(':').map(Number);
      newDate.setHours(startH, startM, 0, 0);

      const rescheduleHistory = Array.isArray(appointment.rescheduleHistory)
        ? [...appointment.rescheduleHistory]
        : [];
      rescheduleHistory.push({
        previousDateTime: appointment.date,
        rescheduledAt: new Date().toISOString(),
      });

      const payload = {
        date: newDate.toISOString(),
        slot: selectedSlot._id,
        rescheduleCount: (appointment.rescheduleCount || 0) + 1,
        rescheduleHistory,
      };
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      console.log('Rescheduling appointment:', {
        appointmentId: appointment._id,
        payload,
        newDate: newDate.toISOString(),
        token: token ? 'present' : 'missing',
        endpoint: `consultation-appointments/${appointment._id}/reschedule`
      });

      const response = await rescheduleAppointment(appointment._id, payload, token);

      console.log('Reschedule response:', response);

      toast.success("Appointment rescheduled successfully.");

      if (onRescheduled) {
        await onRescheduled(response);
      }
      onClose?.();
    } catch (error) {
      console.error('Reschedule error:', error);
      
      let message = "Unable to reschedule appointment. Please try again.";
      
      // Try to extract error message safely
      try {
        if (error?.data?.message) {
          message = error.data.message;
        } else if (error?.message) {
          message = error.message;
        } else if (error?.status) {
          message = `Request failed with status ${error.status}`;
        }
      } catch (e) {
        // If error extraction fails, use default message
        console.error('Error extracting message:', e);
      }
      
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDayName = weekdays[selectedDate.getDay()];

  return (
    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
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
          <label className="mb-2 block text-sm font-medium text-gray-700">Select Date</label>
          <p className="mb-2 text-sm text-gray-600">
            {selectedDayName}, {selectedDate.toLocaleDateString()}
          </p>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                const newDate = new Date(date);
                newDate.setHours(0, 0, 0, 0);
                setSelectedDate(newDate);
                setSelectedSlot(null);
              }
            }}
            disabled={{ before: minimumDateStartOfDay }}
            weekStartsOn={1}
            className="rounded-lg border border-gray-300 p-2"
            styles={{
              caption: { textAlign: 'center' },
              day_selected: { backgroundColor: '#2563eb', color: 'white' },
            }}
          />
          <p className="mt-2 text-xs text-gray-500">
            Original appointment: {new Date(appointment.dateTime || appointment.date).toLocaleString()}
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Available Time Slots for {selectedDayName}, {selectedDate.toLocaleDateString()}
          </label>
          {loadingSlots ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
              {availableSlots.map((slot) => (
                <div
                  key={slot._id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedSlot?._id === slot._id
                      ? 'border-blue-600 bg-blue-50'
                      : 'hover:border-blue-300 border-gray-200'
                  }`}
                >
                  <div className="font-medium">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 border border-gray-200 rounded-md">
              No available slots for this date. Please select another date.
            </div>
          )}
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
            disabled={isSubmitting || !selectedSlot}
          >
            {isSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RescheduleDialog;

