import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { getSocket } from "@/lib/socket";
import { postData, fetchData, getApiErrorMessage } from "@/utils/api";
import IncomingCallDialog from "@/components/IncomingCallDialog"; // ensure this component exists

export default function useSocketEmitOnline() {
  const { data: session } = useSession();
  const { user } = useUser();
  const toast = useToast();
  const addToast = toast?.addToast ?? (() => {});
  const socketRef = useRef(null);
  const ringtoneRef = useRef(null);

  const [showSoundPrompt, setShowSoundPrompt] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const enableSoundNotifications = () => {
    const silentAudio = new Audio("/sounds/silence.mp3");
    silentAudio
      .play()
      .then(() => {
        setSoundEnabled(true);
        localStorage.setItem("soundEnabled", "true");
        localStorage.setItem("soundPromptShown", "true");
      })
      .catch(() => {});
  };

  const handleAccept = async (appointmentId) => {
    socketRef.current.emit("accept-call", {
      specialistId: user._id,
      appointmentId,
    });

    try {
      const appointment = await fetchData(`consultation-appointments/${appointmentId}`);
      const payload = {
        appointment: appointmentId,
        specialist: user._id,
        user: appointment.patient,
      };

      const res = await postData("video-sessions", payload, session?.user?.jwt);
      if (res.success) {
        const sessionData = res.session;
        const { specialistToken, patientToken } = sessionData;

        localStorage.setItem(
          "activeVideoSession",
          JSON.stringify({ session: sessionData, specialistToken, patientToken })
        );

        if (specialistToken && patientToken) {
          socketRef.current.emit("session-created", {
            appointmentId,
            session: sessionData,
            specialistToken,
            patientToken,
          });
        }

        window.location.href = `/admin/appointments/session/${sessionData._id}`;
      } else {
        const message =
          res?.message ||
          "Unable to start the session right now. Please try again.";
        addToast(message, "error");
        console.error("❌ Failed to create session:", message);
      }
    } catch (err) {
      const message = getApiErrorMessage(err);
      addToast(message, "error");
      console.error("💥 Error creating session:", err);
    } finally {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      setIncomingCall(null);
    }
  };

  const handleReject = (appointmentId) => {
    socketRef.current.emit("reject-call", {
      specialistId: user._id,
      appointmentId,
    });
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    setIncomingCall(null);
  };

  const userIdRef = useRef(user?._id);
  const userRef = useRef(user);
  userIdRef.current = user?._id;
  userRef.current = user;

  const soundEnabledRef = useRef(soundEnabled);
  const showSoundPromptRef = useRef(showSoundPrompt);
  soundEnabledRef.current = soundEnabled;
  showSoundPromptRef.current = showSoundPrompt;

  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;

  const userRole = session?.user?.role;
  const userId = user?._id;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !session?.user ||
      !["specialist", "consultant"].includes(userRole) ||
      !userId
    )
      return;

    socketRef.current = getSocket();

    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current.preload = "auto";
    }

    const emitSpecialistOnline = () => {
      if (socketRef.current?.connected && userRef.current?.role === "specialist") {
        socketRef.current.emit("specialist-online", userRef.current);
      }
    };

    const handleConnect = () => {
      setTimeout(emitSpecialistOnline, 500);
    };

    const handleReconnect = () => {
      emitSpecialistOnline();
    };

    socketRef.current.on("connect", handleConnect);
    socketRef.current.io.on("reconnect", handleReconnect);
    socketRef.current.off("incoming-call");

    socketRef.current.on("incoming-call", async ({ appointmentId }) => {
      try {
        const appointment = await fetchData(`consultation-appointments/${appointmentId}`);

        if (soundEnabledRef.current && ringtoneRef.current) {
          ringtoneRef.current.play().catch(() => {});
        }

        if (showSoundPromptRef.current) return;

        setIncomingCall({ appointmentId, appointment });
      } catch (err) {
        const message = getApiErrorMessage(err);
        addToastRef.current?.(message, "error");
      }
    });

    return () => {
      setShowSoundPrompt(false);
      socketRef.current?.off("connect", handleConnect);
      socketRef.current?.io?.off("reconnect", handleReconnect);
      socketRef.current?.off("incoming-call");
    };
  }, [userRole, userId]);

  const IncomingCallDialogWrapper =
    incomingCall && !showSoundPrompt ? (
      <IncomingCallDialog
        appointment={incomingCall}
        onAccept={() => handleAccept(incomingCall.appointmentId)}
        onReject={() => handleReject(incomingCall.appointmentId)}
      />
    ) : null;

  return {
    showSoundPrompt,
    setShowSoundPrompt,
    enableSoundNotifications,
    IncomingCallDialogWrapper,
  };
}