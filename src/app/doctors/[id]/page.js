"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { fetchData } from "@/utils/api";
import { defaultUser } from "@/assets";
import {
  FaCalendarAlt,
  FaLocationArrow,
  FaStar,
  FaGraduationCap,
  FaUserMd,
  FaEnvelope,
  FaPhone,
  FaCertificate,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";

const DoctorProfilePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;

  useEffect(() => {
    async function fetchDoctorProfile() {
      try {
        setLoading(true);
        const response = await fetchData(`users/${id}`);
        if (
          response &&
          (response.role === "specialist" || response.role === "consultant")
        ) {
          setDoctor(response);
        } else {
          setError("Doctor profile not found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        setError("Failed to load doctor profile");
        setLoading(false);
      }
    }

    if (id) {
      fetchDoctorProfile();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary-6)] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-500 text-5xl mb-4 flex justify-center">
            <FaUserMd />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "This doctor profile could not be found."}
          </p>
          <button
            onClick={() => router.push("/doctors")}
            className="px-4 py-2 bg-[var(--color-primary-6)] text-white rounded-lg hover:bg-[var(--color-primary-7)] transition-colors"
          >
            Browse All Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href="/doctors"
          className="inline-flex items-center text-[var(--color-primary-6)] hover:text-[var(--color-primary-7)] mb-4"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to All Doctors
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary-7)] to-[var(--color-primary-5)] p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <img
                  src={
                    doctor.profileImage
                      ? `${apiUrl}${doctor.profileImage}`
                      : defaultUser.src
                  }
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                  crossOrigin="anonymous"
                />
                {doctor.isApproved && (
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-2">
                    <FaCheckCircle className="text-white w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h1>
                <p className="text-xl text-[var(--color-primary-1)] font-medium mb-4">
                  {doctor.specialistCategory ||
                    doctor.category ||
                    "Medical Specialist"}
                </p>

                <div className="flex items-center justify-center md:justify-start mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-5 w-5 ${i < (doctor.rating || 5) ? "text-yellow-400" : "text-white text-opacity-30"}`}
                    />
                  ))}
                  <span className="ml-2 font-medium">
                    {doctor.rating || 5}.0
                  </span>
                </div>

                {doctor.doctorRegistrationNumber && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                    <FaCertificate className="text-[var(--color-primary-1)]" />
                    <span>
                      Registration No: {doctor.doctorRegistrationNumber}
                    </span>
                  </div>
                )}
              </div>

              {session && (
                <div className="mt-4 md:mt-0">
                  <Link
                    href={`/admin/consultation/book?specialist=${doctor._id}`}
                    className="inline-flex items-center px-6 py-3 bg-white text-[var(--color-primary-6)] rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Book Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-[var(--color-primary-6)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {doctor.email && (
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm">{doctor.email}</span>
                    </div>
                  )}
                  {doctor.phone && (
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm">{doctor.phone}</span>
                    </div>
                  )}
                  {(doctor.address?.city || doctor.address?.country) && (
                    <div className="flex items-center text-gray-600">
                      <FaLocationArrow className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm">
                        {[doctor.address?.city, doctor.address?.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Qualifications */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaGraduationCap className="w-5 h-5 mr-2 text-[var(--color-primary-6)]" />
                  Qualifications
                </h3>
                <p className="text-gray-600 text-sm">
                  {doctor.qualifications || "Licensed Medical Professional"}
                </p>
                {doctor.yearsOfExperience && (
                  <p className="text-gray-600 text-sm mt-2">
                    <strong>Experience:</strong> {doctor.yearsOfExperience}{" "}
                    years
                  </p>
                )}
              </div>

              {/* Availability */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaCalendarAlt className="w-5 h-5 mr-2 text-[var(--color-primary-6)]" />
                  Availability
                </h3>
                <div className="space-y-2">
                  {doctor.isOnline ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Available Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                      Offline
                    </span>
                  )}
                  <p className="text-gray-600 text-sm mt-2">
                    Book an appointment to secure your preferred time slot
                  </p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                About Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {doctor.bio ||
                  doctor.specialistDescription ||
                  `Dr. ${doctor.firstName} ${doctor.lastName} is a dedicated healthcare professional specializing in ${doctor.specialistCategory || doctor.category}. With a commitment to patient care and extensive experience in the field, Dr. ${doctor.lastName} provides high-quality medical services to address patient needs effectively.`}
              </p>
            </div>

            {/* Verification Badge */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="flex-shrink-0">
                <FaCheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Verified Healthcare Professional
                </h4>
                <p className="text-sm text-gray-600">
                  This doctor's credentials have been verified by Sozo Digicare.
                  All consultations are conducted in a secure and professional
                  environment.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
