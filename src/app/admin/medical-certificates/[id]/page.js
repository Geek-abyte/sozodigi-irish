"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { Download, ArrowLeft, Printer } from "lucide-react";

const MedicalCertificate = () => {
  const { id } = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const API_URL = process.env.NEXT_PUBLIC_NODE_BASE_URL;

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetchData(`medical-tourism/certificates/custom/get/${id}`, token);
        setCertificate(res);
      } catch (error) {
        console.error("Failed to load certificate:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchCertificate();
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading)
    return <div className="text-center py-20">Loading certificate...</div>;
  if (!certificate)
    return (
      <div className="text-center py-20 text-red-500">
        Certificate not found.
      </div>
    );

  const {
    diagnosis = "N/A",
    comment = "",
    issueDate,
    validFrom,
    validTo,
    certID,
    patient,
    doctor,
    qrCodeUrl,
  } = certificate;

  const patientName =
    patient?.firstName + " " + patient?.lastName || "Unknown Patient";
  const patientAddress = patient?.address || {};
  const patientAddressLine =
    [
      patientAddress.street,
      patientAddress.city,
      patientAddress.state,
      patientAddress.country,
    ]
      .filter(Boolean)
      .join(", ") || "Address not provided";

  const doctorName =
    doctor?.firstName + " " + doctor?.lastName || "Unknown Doctor";
  const doctorRegistration = doctor?.doctorRegistrationNumber || "N/A";
  const durationMatch = comment.match(/(\d+)\s*day/i);
  const duration = durationMatch ? durationMatch[1] : "a few";

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-10 print:p-0 print:bg-white">
      {/* Action Buttons - Hidden on Print */}
      <div className="max-w-[794px] mx-auto mb-6 flex gap-3 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {/* Certificate Container */}
      <div className="flex justify-center">
        <div className="bg-white w-full max-w-[794px] border shadow print:shadow-none print:border-none p-6 sm:p-10 text-gray-900 relative">
          {/* Watermark */}
          <img
            src="/images/logo/icon.png"
            className="absolute inset-0 w-full h-full opacity-5 pointer-events-none object-contain"
            alt="Watermark"
          />

          <div className="border-4 border-[#9bb5b4] p-4 sm:p-6 md:p-10 relative">
            {/* Header */}
            <div className="text-center mb-8">
              <img
                src="/images/logo/logo.png"
                alt="Sozo Digicare"
                className="h-14 mx-auto mb-3"
              />
              <h2 className="text-lg font-bold text-gray-800">Sozo Digicare</h2>
              <p className="text-sm text-gray-600">
                11 The Avenue Folkstown Park
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Balbriggan Co Dublin, A92 XKR8
              </p>
              <p className="text-sm text-gray-600">
                Phone: 0419804419 | Fax: 0419803286
              </p>
            </div>

            <div className="border-t-2 border-b-2 border-[#9bb5b4] py-4 mb-8">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#335b75] uppercase tracking-wide text-center"
                style={{ fontFamily: "serif" }}
              >
                Medical Certificate
              </h1>
            </div>

            {/* Patient Information */}
            <div className="mb-6 text-left">
              <p className="text-sm mb-1">
                <strong>Patient Name:</strong> {patientName}
              </p>
              <p className="text-sm mb-1">
                <strong>Address:</strong> {patientAddressLine}
              </p>
              <p className="text-sm">
                <strong>Date:</strong>{" "}
                {new Date(issueDate).toLocaleDateString("en-GB")}
              </p>
            </div>

            {/* Body */}
            <div className="leading-7 mb-8 text-sm sm:text-base text-justify">
              <p className="mb-4">
                This is to certify in my opinion that the above named patient
                is/was suffering from <strong>{diagnosis}</strong>
              </p>

              <p className="mb-4">And is unable to attend Work</p>

              <div className="flex gap-8 mb-4">
                <p>
                  From:{" "}
                  <strong>
                    {new Date(validFrom).toLocaleDateString("en-GB")}
                  </strong>
                </p>
                <p>
                  To:{" "}
                  <strong>
                    {new Date(validTo).toLocaleDateString("en-GB")}
                  </strong>
                </p>
              </div>

              <p className="mb-4">
                <strong>Comments:</strong>
              </p>
              <p className="ml-4">{comment}</p>
            </div>

            {/* Footer with signature and QR */}
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <div className="mb-4">
                    <img
                      src={
                        qrCodeUrl
                          ? `${API_URL}${qrCodeUrl}`
                          : "/images/qrcode.png"
                      }
                      alt="QR Code - Doctor Profile"
                      className="w-20 h-20"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Scan to verify doctor
                    </p>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <div className="mb-2">
                    <p className="text-sm mb-1">
                      Signed: ___________________________
                    </p>
                    <p className="font-semibold text-base">{doctorName}</p>
                    <p className="text-sm text-gray-600">
                      MCN: {doctorRegistration}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-gray-500">
                <p>
                  Certificate ID: <strong>{certID}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalCertificate;
