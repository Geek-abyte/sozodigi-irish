"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchData } from "@/utils/api";
import Link from "next/link";
import { FileText, Download, Eye, Calendar } from "lucide-react";

const MedicalCertificatesContent = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!token || !userId) return;

      try {
        setLoading(true);

        // Fetch certificates based on user role
        let endpoint = "";
        if (userRole === "user") {
          endpoint = `certificates/patient/${userId}`;
        } else if (userRole === "specialist" || userRole === "consultant") {
          endpoint = `certificates/doctor/${userId}`;
        } else if (userRole === "admin") {
          endpoint = `certificates/get-all/no-pagination`;
        }

        const response = await fetchData(endpoint, token);
        setCertificates(response || []);
      } catch (err) {
        console.error("Failed to fetch certificates:", err);
        setError("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [token, userId, userRole]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading certificates...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Medical Certificates
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {userRole === "user"
            ? "View and download your medical certificates"
            : userRole === "specialist" || userRole === "consultant"
              ? "Certificates you have issued"
              : "All medical certificates in the system"}
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Certificates Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === "user"
              ? "You haven't been issued any medical certificates yet."
              : "No certificates have been issued yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <div
              key={certificate._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-semibold">Certificate</span>
                  </div>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">
                    {certificate.certID}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {certificate.diagnosis}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {certificate.comment}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  {userRole !== "user" && certificate.patient && (
                    <div className="flex items-start">
                      <span className="text-gray-500 dark:text-gray-400 w-20">
                        Patient:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {certificate.patient.firstName}{" "}
                        {certificate.patient.lastName}
                      </span>
                    </div>
                  )}

                  {userRole === "user" && certificate.doctor && (
                    <div className="flex items-start">
                      <span className="text-gray-500 dark:text-gray-400 w-20">
                        Doctor:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {certificate.doctor.firstName}{" "}
                        {certificate.doctor.lastName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatDate(certificate.validFrom)} -{" "}
                      {formatDate(certificate.validTo)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Issued: {formatDate(certificate.issueDate)}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <Link
                    href={`/admin/medical-certificates/${certificate._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <button
                    onClick={() => {
                      window.open(
                        `/admin/medical-certificates/${certificate._id}`,
                        "_blank",
                      );
                      setTimeout(() => window.print(), 500);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalCertificatesContent;
