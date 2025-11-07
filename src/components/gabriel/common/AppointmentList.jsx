import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

import ModalContainer from '@/components/gabriel/ModalContainer';
import RescheduleDialog from './RescheduleDialog.jsx';

const AppointmentList = ({ userRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/appointments/my-appointments', {
        params: {
          upcoming: activeTab === 'upcoming',
          status: activeTab === 'upcoming' ? 'scheduled' : undefined,
        },
      });
      setAppointments(response.data.data);
    } catch (error) {
      toast.error('Error fetching appointments');
    }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      toast.error('Error fetching notifications');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await axios.post('/api/appointments/cancel', {
        appointmentId,
        cancellationReason: 'Cancelled by user',
      });

      if (response.data.success) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling appointment');
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error('Error marking notification as read');
    }
  };

  const openRescheduleDialog = (appointment) => {
    if (!token) {
      toast.error('You must be logged in to reschedule an appointment.');
      return;
    }
    setRescheduleTarget(appointment);
  };

  const closeRescheduleDialog = () => {
    setRescheduleTarget(null);
  };

  const handleRescheduled = async (updatedAppointment) => {
    if (updatedAppointment?._id) {
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === updatedAppointment._id
            ? { ...appointment, ...updatedAppointment }
            : appointment
        )
      );
    }
    await fetchAppointments();
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">
                        {userRole === 'specialist'
                          ? `Patient: ${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : `Dr. ${appointment.specialist.firstName} ${appointment.specialist.lastName}`}
                      </h3>
                      <p className="text-gray-600">
                        {new Date(appointment.dateTime).toLocaleString()}
                      </p>
                      <p className="text-gray-600">
                        Specialty: {appointment.specialistCategory}
                      </p>
                      <p className="text-gray-600">Reason: {appointment.reason}</p>
                      {appointment.duration && (
                        <p className="text-gray-600">Duration: {appointment.duration} mins</p>
                      )}
                      <p className="mt-2 text-sm text-gray-600">
                        Changes left: {Math.max(0, 2 - (appointment.rescheduleCount ?? 0))}
                      </p>
                      {Array.isArray(appointment.rescheduleHistory) && appointment.rescheduleHistory.length > 0 && (
                        <div className="mt-2 rounded-md bg-gray-50 p-2">
                          <p className="text-xs font-semibold text-gray-700">Reschedule history</p>
                          <ul className="mt-1 space-y-1 text-xs text-gray-600">
                            {appointment.rescheduleHistory.map((historyItem, index) => (
                              <li key={historyItem.rescheduledAt || index}>
                                {historyItem.previousDateTime
                                  ? `From ${new Date(historyItem.previousDateTime).toLocaleString()}`
                                  : 'Rescheduled'}{' '}
                                {historyItem.rescheduledAt
                                  ? `on ${new Date(historyItem.rescheduledAt).toLocaleString()}`
                                  : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {activeTab === 'upcoming' && appointment.status === 'scheduled' && (
                      <div className="flex flex-col items-end space-y-2 md:flex-row md:items-center md:space-x-3 md:space-y-0">
                        {appointment.rescheduleCount < 2 && (
                          <button
                            onClick={() => openRescheduleDialog(appointment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Reschedule
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelAppointment(appointment._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No {activeTab} appointments found.
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Notifications</h3>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white p-4 rounded-lg shadow-md ${
                    !notification.isRead ? 'border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification._id)}
                >
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No notifications</div>
          )}
        </div>
      </div>
      {rescheduleTarget && (
        <ModalContainer
          modal={
            <RescheduleDialog
              appointment={rescheduleTarget}
              token={token}
              onClose={closeRescheduleDialog}
              onRescheduled={handleRescheduled}
            />
          }
        />
      )}
    </div>
  );
};

export default AppointmentList; 