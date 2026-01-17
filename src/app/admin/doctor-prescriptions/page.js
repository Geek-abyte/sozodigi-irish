"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData, getApiErrorMessage } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

const PrescriptionsList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const { user } = useUser();
  const toast = useToast();
  const addToast = toast?.addToast ?? (() => {});
  const token = session?.user?.jwt;
  const hasFetchedRef = useRef(false);

  const isDoctor = user?.role === "specialist";
  const isUser = user?.role === "user";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const loadPrescriptions = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      const controller = new AbortController();
      setLoading(true);
      try {
        let endpoint= ""
        if(isDoctor){
          endpoint = `video-sessions/by-specialist/${user?._id}/prescriptions`
        }else if(isUser){
          endpoint = `video-sessions/by-user/${user?._id}/prescriptions`;
        }else if(isAdmin){
          endpoint = `video-sessions/by-user/${user?._id}/prescriptions`
        }

        if (!endpoint) {
          addToast("Unable to determine prescriptions for your role.", "error");
          setSessions([]);
          return;
        }

        const res = await fetchData(endpoint, token, { signal: controller.signal });
        console.log(res)
        setSessions(res?.sessions || []);
      } catch (error) {
        if (error?.name === "AbortError") return;
        const message = getApiErrorMessage(error);
        console.error("Failed to load prescriptions:", error);
        addToast(message, "error");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id && token) {
      loadPrescriptions();
    }

    return () => {
      hasFetchedRef.current = false;
    };
  }, [user?._id, user?.role, token, addToast, isDoctor, isUser, isAdmin]);

  if (loading)
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md mt-6 animate-pulse">
        <div className="h-6 w-48 bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-gradient-to-r from-indigo-50 via-indigo-100 to-indigo-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded"
            />
          ))}
        </div>
      </div>
    );

  if (sessions.length === 0) {
    return <p className="text-center mt-8">No prescriptions found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 dark:text-gray-300 p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {isDoctor ? "Prescriptions You've Issued" : "Your Prescriptions"}
      </h2>

      {sessions.map((session) => (
        <div
          key={session._id}
          className="mb-6 border p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <div className="mb-2">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(session.createdAt).toLocaleString()}
            </p>
            {isDoctor && session.user?.fullName && (
              <p>
                <strong>Patient:</strong> {session.user.fullName}
              </p>
            )}
            {isUser && session.specialist?.fullName && (
              <p>
                <strong>Doctor:</strong> {session.specialist.fullName}
              </p>
            )}
          </div>
          <ul className="space-y-2 pl-4 border-l-2 border-indigo-500">
            {session.prescriptions.map((prescription, idx) => (
              <li
                key={prescription._id || idx}
                className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <p>
                    { prescription.medication } <small>({ prescription.dosage } { prescription.frequency })</small>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          
          <div>
            {session && (
                <a
                    href={`/admin/doctor-prescriptions/${session._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                >
                    View
                </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrescriptionsList;
