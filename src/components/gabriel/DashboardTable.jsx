import React from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { PATH } from "../routes/path";
import { useUser } from "@/context/UserContext";
const DashboardTable = ({ calls, loading, limit = Infinity }) => {
  // const navigate = useNavigate();
  // const { user } = useSelector((state) => state.auth);

  const { user } = useUser()

  const handleRowClick = (id) => {
    if (user?.role === "user") {
      navigate(`${PATH.dashboard.callDetail}/${id}`);
    } else {
      navigate(`${PATH.doctor.callDetail}/${id}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return "Ongoing";
    const duration = new Date(endTime) - new Date(startTime);
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="text-center py-10 bg-white shadow-sm sm:rounded-lg border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-500 text-lg mt-4">Loading calls...</p>
      </div>
    );
  }

  if (!calls || calls.length === 0) {
    return (
      <div className="text-center py-10 bg-white shadow-sm sm:rounded-lg border border-gray-200">
        <p className="text-gray-500 text-lg">No calls found.</p>
        <p className="text-gray-400 mt-2">When you make or receive calls, they will appear here.</p>
      </div>
    );
  }

  const displayedCalls = calls.slice(0, limit);

  return (
    <div className="overflow-x-auto shadow-sm sm:rounded-lg border border-gray-200">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold">
              {user?.role === "user" ? "Specialist" : "User"}
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Category
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Duration
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Start Time
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {displayedCalls.map((call) => (
            <tr
              key={call._id}
              className="bg-white border-b hover:bg-blue-50 cursor-pointer transition duration-300"
              onClick={() => handleRowClick(call._id)}
            >
              <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                {/* { JSON.stringify(call) } */}
                {user?.role === "user" ? `${call.specialist?.firstName} ${call.specialist?.lastName}` : `${call.user?.firstName} ${call.user?.lastName}`}
              </td>
              <td className="px-6 py-4">
                {call.specialist.category}
              </td>
              <td className="px-6 py-4">
                {/* {console.log("see the time here", call.startTime, call.endTime)} */}
                {calculateDuration(call.startTime, call.endTime)}
              </td>
              <td className="px-6 py-4">
                {formatDate(call.startTime)}
              </td>
              <td className="px-6 py-4">
                {call.appointment.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {calls.length > limit && (
        <div className="text-center py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Showing {limit} of {calls.length} calls
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardTable;