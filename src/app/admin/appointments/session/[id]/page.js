"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback } from "react";
import { EllipsisVertical } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";

import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

import VideoSection from "@/components/admin/VideoSection";
import RatingForm from "@/components/admin/RatingForm";
import SessionTimer from "@/components/admin/SessionTimer";
import NotesDialog from "@/components/admin/NotesDialog";
import PrescriptionDialog from "@/components/admin/PrescriptionDialog";
import LabReferralDialog from "@/components/admin/LabReferralDialog";
import ModalContainer from "@/components/gabriel/ModalContainer";

import QuestionsDialog from "@/components/admin/QuestionsDialog";

import useAppointment from "@/hooks/useAppointment";

import { postData, fetchData, updateData, getApiErrorMessage } from "@/utils/api";
import { getSocket } from "@/lib/socket";



const SessionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  

  // const videoUrl = `https://videowidget.sozodigicare.com/?room=${id}`
  const videoUrl = `http://localhost:4000/?room=${id}`

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;
  const { user } = useUser();
  const { addToast } = useToast();

  const { appointment, loading } = useAppointment(id, token);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);


  const iframeRef = useRef(null);

  const [remainingTime, setRemainingTime] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  const [sessionEnded, setSessionEnded] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingField, setShowRatingField] = useState(false);

  const [sessionNotes, setSessionNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [savingPrescription, setsavingPrescription] = useState(false);

  const [specialistToken, setSpecialistToken] = useState(null);
  const [patientToken, setPatientToken] = useState(null);

  const [showQuestions, setShowQuestions] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [healthQuestions, setHealthQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [showReferrals, setShowReferrals] = useState(false);
  const [labReferrals, setLabReferrals] = useState([]);
  const [newReferral, setNewReferral] = useState({
    testName: "",
    labName: "",
    note: "",
    status: "pending"
  });
  const [savingReferral, setSavingReferral] = useState(false);

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certForm, setCertForm] = useState({
    diagnosis: "",
    comment: "",
    signatureDataUrl: null,
  });
  const [certError, setCertError] = useState("");
  const [certSubmitting, setCertSubmitting] = useState(false);
  const openCertificateModal = () => {
    setShowOptions(false);
    setCertError("");
    setShowCertificateModal(true);
  };
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);

  const [newPrescription, setNewPrescription] = useState({ medication: '', dosage: '', frequency: '' });

  const videoRef = useRef();
  const appointmentRef = useRef(appointment);
  const socketRef = useRef();
  
  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  useEffect(() => {
    appointmentRef.current = appointment;
  }, [appointment]);

  const handleEndCall = () => {
    if (videoRef.current) {
      videoRef.current.endCall();
    }
  };

  useEffect(()=> {
    if(appointment?.session?.appointment?.status === "completed"){
      setIsTimerRunning(false)
      router.push(`/admin/appointments/session/completed/${id}`)
    }
  }, [appointment])

  useEffect(()=> {
    if(appointmentRef.current?.session && appointmentRef.current?.session?.appointment?.status === "pending"){
      setIsTimerRunning(true)
    }
  }, [appointmentRef.current])

  const handleEndSession = async () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session._id || !token || currentAppointment.status === "completed") return;
    try {
      setEndingSession(true);
      socketRef.current.emit("session-ended", {
        specialist: user,
        appointmentId: currentAppointment.session.appointment._id
      });
      await updateData(`consultation-appointments/update/custom/${currentAppointment.session.appointment._id}`, { status: "completed" }, token);
      const endTime = new Date().toISOString();
      const startTime = new Date(currentAppointment.session.startTime);
      const durationInMinutes = Math.round((new Date() - startTime) / 60000);
      await updateData(`video-sessions/${currentAppointment.session._id}`, { endTime, durationInMinutes }, token);
    } catch (err) {
      console.error("Failed to end session", err);
    } finally {
      localStorage.removeItem(`sessionStartTime-${currentAppointment.session.appointment._id}`);
      setSessionEnded(true);
      handleEndCall();
      setIsTimerRunning(false);
      setEndingSession(false);
      setConsentAcknowledged(false);
      router.push(`/admin/appointments/session/completed/${id}`)
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const handleCertFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCertForm((f) => ({ ...f, signatureDataUrl: null }));
      return;
    }
    try {
      const dataUrl = await toBase64(file);
      setCertForm((f) => ({ ...f, signatureDataUrl: dataUrl }));
    } catch (err) {
      console.error("Failed to read signature", err);
      setCertError("Could not read signature file.");
    }
  };

  const handleIssueCertificate = async (e) => {
    e?.preventDefault?.();
    const patientId =
      appointment?.session?.appointment?.patient?._id ||
      appointment?.session?.appointment?.patient ||
      appointment?.session?.user?._id;
    // Prefer the logged-in specialist; fall back to appointment specialist
    const doctorId =
      session?.user?.id ||
      session?.user?._id ||
      appointment?.session?.specialist?._id ||
      user?._id;

    if (!patientId || !doctorId) {
      setCertError("Missing patient or doctor info.");
      addToast("Missing patient or doctor info.", "error");
      return;
    }
    if (!certForm.diagnosis || !certForm.comment) {
      setCertError("Please add diagnosis and comment.");
      return;
    }
    setCertError("");
    setCertSubmitting(true);
    try {
      console.log("Issuing certificate", {
        patientId,
        doctorId,
        appointmentId: appointment?.session?._id,
      });
      const payload = {
        patient: patientId,
        doctor: doctorId,
        diagnosis: certForm.diagnosis,
        comment: certForm.comment,
        certID: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        signatureDataUrl: certForm.signatureDataUrl,
      };
      const res = await postData("certificates/create", payload, token);
      addToast(res?.message || "Certificate issued", "success");
      setShowCertificateModal(false);
      setCertForm({ diagnosis: "", comment: "", signatureDataUrl: null });
    } catch (err) {
      console.error("Issue certificate failed", err);
      setCertError(err?.userMessage || "Failed to issue certificate.");
      addToast("Failed to issue certificate", "error");
    } finally {
      setCertSubmitting(false);
    }
  };

   // load documentation when dialog is opened
   useEffect(() => {
    const fetchDocumentation = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;
  
      try {
        setSessionNotes("loading...");
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        // console.log(response.success && response.session)
        if (response.success && response.session) {
          setSessionNotes(response.session.sessionNotes || '');
        } else {
          setSessionNotes('');
        }
      } catch (error) {
        console.error('Failed to fetch documentation:', error);
        setSessionNotes('');
      }
    };
  
    if (showDocs) {
      fetchDocumentation();
    }
  }, [showDocs]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;
  
      try {
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        if (response.success && response.session) {
          setPrescriptions(response.session.prescriptions || []);
        } else {
          setPrescriptions([]);
        }
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
        setPrescriptions([]);
      }
    };
  
    if (showPrescriptions) {
      fetchPrescriptions();
    }
  }, [showPrescriptions]);

  useEffect(() => {
    const storedSession = localStorage.getItem('activeVideoSession');
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      setSpecialistToken(sessionData?.session?.specialistToken || sessionData?.specialistToken);
      setPatientToken(sessionData?.session?.patientToken || sessionData?.patientToken);
    }
  }, []);

  useEffect(() => {
    const fetchLabReferrals = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;

      try {
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        if (response.success && response.session) {
          setLabReferrals(response.session.labReferrals || []);
        } else {
          setLabReferrals([]);
        }
      } catch (error) {
        console.error('Failed to fetch lab referrals:', error);
        setLabReferrals([]);
      }
    };

    if (showReferrals) {
      fetchLabReferrals();
    }
  }, [showReferrals]);

  const handleSaveNotes = async () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session?._id || !token) return;
  
    try {
      setSavingNotes(true);
      await updateData(
        `video-sessions/${currentAppointment.session._id}`,
        { sessionNotes },
        token
      );
      addToast("Notes saved successfully!", "success");
      setShowDocs(false);
    } catch (err) {
      console.error("Failed to save notes", err);
      addToast("Failed to save notes.", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddPrescription = async () => {
    setsavingPrescription(true)
    if (
      !newPrescription.medication ||
      !newPrescription.dosage ||
      !newPrescription.frequency
    ) {
      alert('Please fill all fields');
      return;
    }
  
    const updatedPrescriptions = [...prescriptions, newPrescription];

    // console.log(updatedPrescriptions)
  
    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { prescriptions: updatedPrescriptions },
        token
      );
      setPrescriptions(updatedPrescriptions);
      setNewPrescription({ medication: '', dosage: '', frequency: '' });
    } catch (error) {
      console.error('Failed to add prescription:', error);
    }finally{
      setsavingPrescription(false)
    }
  };
  
  const handleDeletePrescription = async (index) => {
    const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
  
    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { prescriptions: updatedPrescriptions },
        token
      );
      setPrescriptions(updatedPrescriptions);
    } catch (error) {
      console.error('Failed to delete prescription:', error);
    }
  };

  const loadHealthQuestions = async (userId) => {
    try {
      setLoadingQuestions(true);
      const res = await fetchData(`health-questionnaires/user/${userId}`, token);
      setHealthQuestions(res);
    } catch (err) {
      console.error("Failed to fetch health questions", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

 const handleAddReferral = async () => {
    if (!newReferral.testName.trim()) {
      addToast("Test name is required", "error");
      return;
    }

    setSavingReferral(true);
    const updated = [...labReferrals, newReferral];

    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { labReferrals: updated },
        token
      );
      setLabReferrals(updated);
      setNewReferral({ testName: "", labName: "", note: "", status: "pending" });
    } catch (error) {
      console.error("Failed to add referral", error);
      addToast("Failed to add referral", "error");
    } finally {
      setSavingReferral(false);
    }
  };

  const handleDeleteReferral = async (index) => {
    const updated = labReferrals.filter((_, i) => i !== index);

    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { labReferrals: updated },
        token
      );
      setLabReferrals(updated);
    } catch (error) {
      console.error("Failed to delete referral", error);
      addToast("Failed to delete referral", "error");
    }
  };



  const patient = appointment?.session?.user;
  const specialist = appointment?.session?.specialist;

  const handleSessionEnded = useCallback(({ specialist, appointmentId }) => {
    try {
      console.log("🔔 session-ended event received:", { specialist, appointmentId });
  
      const currentAppointment = appointmentRef.current;
      console.log("📋 Current appointment:", currentAppointment);
  
      const toStringId = (val) => (typeof val === "string" ? val : val?._id) || val;

      const sessionIdMatch =
        toStringId(currentAppointment?.session?.appointment?._id) === toStringId(appointmentId);
      const userIdMatch =
        toStringId(currentAppointment?.session?.user) ===
        toStringId(session?.user?.id || session?.user?._id);
  
      console.log("✅ sessionIdMatch:", sessionIdMatch);
      console.log("✅ userIdMatch:", userIdMatch);
  
      if (sessionIdMatch && userIdMatch) {
        setSessionEnded(true);
        setIsTimerRunning(false);
        setShowRatingField(true);
        handleEndCall();
        if(specialist.role === "user"){
          addToast("Patient has ended the session", "info", 5000);
        }else{
          addToast("Specialist has ended the session", "info", 5000);
        }
        router.push(`/admin/appointments/session/completed/${id}`)
      } else {
        console.warn("⚠️ session-ended received but session or user ID did not match");
      }
    } catch (error) {
      console.error("❌ Error in handleSessionEnded:", error);
    }
  }, [appointmentRef, session?.user?.id, handleEndSession, handleEndCall]); // Add only necessary dependencies
  

  const handleOpenQuestions = async () => {
    // console.log("Question clicked", appointment.session)
    if (appointment.session.appointment.patient) {
      await loadHealthQuestions(appointment.session.appointment.patient);
      setShowQuestions(true);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading session...</div>;
  }

  if (!appointment) {
    return <div className="text-center mt-10 text-red-500">Appointment not found</div>;
  }

  

  return (
    <div className={`absolute top-0 left-0 w-full transition-all duration-300 z-9999999999`}>
      <div className="bg-black relative">
        <div className="absolute top-4 right-4 flex gap-2 z-[100000001] sm:top-4 sm:right-4 pointer-events-auto">
          {/* <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="bg-white dark:bg-gray-800 px-3 py-1 rounded text-sm shadow hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </button> */}
          {isTimerRunning && userRole === "specialist" && (
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-3 py-2 rounded-full shadow-lg hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              title="Session options"
            >
              <EllipsisVertical className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Timer */}
        <div className="absolute top-4 left-4 sm:left-6 z-999999">
          <SessionTimer
            appointment={appointment}
            setRemainingTime={setRemainingTime}
            setIsTimerRunning={setIsTimerRunning}
            setSessionEnded={setSessionEnded}
            handleEndSession={handleEndSession}
            handleEndCall={handleEndCall}
            addToast={addToast}
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-white z-[99999999] bg-black/60 backdrop-blur px-4 py-2 rounded
          top-16 sm:top-6 max-w-[90vw] text-sm sm:text-base text-center">
          {userRole === "user"
            ? `Consultant: ${appointment.session.specialist.firstName} ${appointment.session.specialist.lastName}`
            : `Patient: ${appointment.session.user.firstName} ${appointment.session.user.lastName}`}
        </div>


        {/* Video Area */}
        <div className="mb-6">
          <VideoSection
            appointment={appointment}
            session={session}
            sessionEnded={sessionEnded}
            specialistToken={specialistToken}
            patientToken={patientToken}
            userRole={userRole}
            iframeRef={iframeRef}
            iframeUrl={videoUrl}
            id={id}
            videoRef={videoRef}
            handleSessionEnded={handleSessionEnded}
            handleEndUserSession={handleEndSession}
          />
        </div>

        {/* Overlay to block video clicks when menu open */}
        {showOptions && (
          <div className="absolute inset-0 z-[100000000] pointer-events-auto" />
        )}

        {showOptions &&
          (userRole === "specialist" || userRole === "consultant") &&
          appointment.session.appointment.status === "pending" &&
          !sessionEnded && (
            <div className="absolute top-16 right-4 sm:right-6 bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl p-4 w-64 z-[100000010] space-y-3 animate-fade-in border border-indigo-100 dark:border-gray-700 backdrop-blur pointer-events-auto">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Session actions
              </p>

              <button
                onClick={() => setShowConfirmEnd(true)}
                className="flex items-center gap-2 w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white px-4 py-2 rounded-lg shadow-sm transition hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                disabled={endingSession}
              >
                <span>🔚</span>
                {endingSession ? "Ending..." : "End Session"}
              </button>

              <button
                onClick={() => setShowDocs(true)}
                className="flex items-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm transition hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <span>📄</span>
                Documentation
              </button>

              <button
                onClick={() => setShowPrescriptions(true)}
                className="flex items-center gap-2 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-sm transition hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <span>💊</span>
                Prescriptions
              </button>

              <button
                onClick={() => setShowReferrals(true)}
                className="flex items-center gap-2 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg shadow-sm transition hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <span>⚕️</span>
                Lab Referral
              </button>

              <button
                onClick={openCertificateModal}
                className="flex items-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg shadow-sm transition hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                <span>📑</span>
                Issue Certificate
              </button>
            </div>
          )}

        {/* Dialogs */}
        <NotesDialog
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          sessionNotes={sessionNotes}
          setSessionNotes={setSessionNotes}
          handleSaveNotes={handleSaveNotes}
          savingNotes={savingNotes}
        />

        <PrescriptionDialog
          showPrescriptions={showPrescriptions}
          setShowPrescriptions={setShowPrescriptions}
          prescriptions={prescriptions}
          handleDeletePrescription={handleDeletePrescription}
          newPrescription={newPrescription}
          setNewPrescription={setNewPrescription}
          handleAddPrescription={handleAddPrescription}
          savingPrescription={savingPrescription}
        />

        <LabReferralDialog
          showReferrals={showReferrals}
          setShowReferrals={setShowReferrals}
          labReferrals={labReferrals}
          handleDeleteReferral={handleDeleteReferral}
          newReferral={newReferral}
          setNewReferral={setNewReferral}
          handleAddReferral={handleAddReferral}
          savingReferral={savingReferral}
        />

        {/* Certificate issue modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 z-[100000020] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-indigo-100 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Issue Certificate</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This will create a certificate for the current patient.
                  </p>
                </div>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {certError && (
                <div className="text-sm text-rose-600 dark:text-rose-400">{certError}</div>
              )}
              <form className="space-y-3" onSubmit={handleIssueCertificate}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis</label>
                  <input
                    className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    value={certForm.diagnosis}
                    onChange={(e) => setCertForm((f) => ({ ...f, diagnosis: e.target.value }))}
                    placeholder="e.g., Viral URTI"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comment</label>
                  <textarea
                    className="mt-1 w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2"
                    value={certForm.comment}
                    onChange={(e) => setCertForm((f) => ({ ...f, comment: e.target.value }))}
                    placeholder="Additional notes"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Signature (PNG/JPG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertFile}
                    className="mt-1 block w-full text-sm text-gray-600 dark:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Required if you haven't uploaded a signature before. It will be saved for reuse.
                  </p>
                  {certForm.signatureDataUrl && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">Signature ready to send.</span>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(false)}
                    className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={certSubmitting}
                    className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {certSubmitting ? "Issuing..." : "Issue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmEnd && (
          <div className="fixed inset-0 z-[100000030] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-gray-700 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">End Session</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Please confirm both you and the client have agreed to end this call.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmEnd(false);
                    setConsentAcknowledged(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={consentAcknowledged}
                  onChange={(e) => setConsentAcknowledged(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  I confirm there is mutual consent with the patient/client to end this session.
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmEnd(false);
                    setConsentAcknowledged(false);
                  }}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!consentAcknowledged || endingSession}
                  onClick={handleEndSession}
                  className="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {endingSession ? "Ending..." : "End Session"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

  );
};

export default SessionPage;
