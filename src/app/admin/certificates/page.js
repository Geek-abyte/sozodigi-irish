"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { fetchData, postData, getApiErrorMessage } from "@/utils/api";

const CertificatesPage = () => {
  const { data: session } = useSession();
  const { user } = useUser();
  const { addToast } = useToast();
  const token = session?.user?.jwt;
  const role = session?.user?.role;
  const userId = session?.user?.id || session?.user?._id;

  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [form, setForm] = useState({
    patient: "",
    diagnosis: "",
    comment: "",
  });

  const isDoctor = role === "specialist";
  const isAdmin = role === "admin" || role === "superAdmin";
  const isUser = role === "user";

  const fetchEndpoint = useMemo(() => {
    if (isDoctor) return `certificates/by-doctor/${userId}`;
    if (isUser) return `certificates/by-patient/${userId}`;
    if (isAdmin) return "certificates/get-all/no-pagination";
    return null;
  }, [isDoctor, isUser, isAdmin, userId]);

  useEffect(() => {
    const load = async () => {
      if (!token || !fetchEndpoint) return;
      setLoading(true);
      try {
        const data = await fetchData(fetchEndpoint, token);
        setCerts(data || []);
      } catch (err) {
        addToast(getApiErrorMessage(err), "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchEndpoint, token, addToast]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return setSignatureDataUrl(null);
    const reader = new FileReader();
    reader.onload = () => setSignatureDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!isDoctor && !isAdmin) return addToast("Only doctors can issue certificates.", "error");
    if (!form.patient || !form.diagnosis || !form.comment) {
      return addToast("Please complete patient, diagnosis, and comment.", "error");
    }
    setIssuing(true);
    try {
      const certID =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}`;
      const payload = {
        ...form,
        doctor: userId,
        certID,
        signatureDataUrl, // may be null; backend requires if doctor has none
      };
      const res = await postData("certificates/create", payload, token);
      addToast(res?.message || "Certificate issued", "success");
      setCerts((prev) => [res.certificate, ...prev]);
      setForm({ patient: "", diagnosis: "", comment: "" });
      setSignatureDataUrl(null);
    } catch (err) {
      addToast(getApiErrorMessage(err), "error");
    } finally {
      setIssuing(false);
    }
  };

  const heading = isDoctor
    ? "Certificates You've Issued"
    : isUser
    ? "Your Certificates"
    : "Certificates";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{heading}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Certificates include QR linking to the doctor profile and signature.
          </p>
        </div>
      </div>

      {(isDoctor || isAdmin) && (
        <form
          onSubmit={handleIssue}
          className="grid gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Patient ID</label>
            <input
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700"
              value={form.patient}
              onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}
              placeholder="Patient user ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Diagnosis</label>
            <input
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700"
              value={form.diagnosis}
              onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
              placeholder="e.g., Viral URTI"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700"
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Additional comments"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Signature (PNG/JPG)</label>
            <input type="file" accept="image/*" onChange={handleFile} />
            <p className="text-xs text-gray-500 mt-1">
              If you already uploaded a signature, you can skip this.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={issuing}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {issuing ? "Issuing..." : "Issue Certificate"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <p className="p-4 text-sm">Loading certificates...</p>
        ) : certs.length === 0 ? (
          <p className="p-4 text-sm">No certificates found.</p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {certs.map((cert) => (
              <div key={cert._id} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Cert ID: {cert.certID}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Diagnosis: {cert.diagnosis}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                    {cert.issuedByName && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Doctor: {cert.issuedByName} ({cert.issuedByRegistration || "—"})
                      </p>
                    )}
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 text-sm"
                      >
                        Verification link
                      </a>
                    )}
                  </div>
                  {cert.qrCodeUrl && (
                    <img
                      src={cert.qrCodeUrl}
                      alt="QR"
                      className="w-20 h-20 border rounded"
                    />
                  )}
                </div>
                {cert.doctorSignatureUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Signature:</span>
                    <img
                      src={cert.doctorSignatureUrl}
                      alt="Signature"
                      className="h-12 object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;
