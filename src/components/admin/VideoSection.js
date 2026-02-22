import { useState, useEffect } from 'react';
import ConfirmationDialog from "@/components/ConfirmationDialog";

const VideoSection = ({
  appointment,
  sessionEnded,
  iframeRef,
  iframeUrl,
  handleEndUserSession
}) => {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  // Listen for postMessage from the iframe (video widget) requesting end-call confirmation
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "requestEndCallConfirmation") {
        setShowConfirmEnd(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (appointment.session.appointment.status === "pending" && !sessionEnded) {
    return (
      <div className="relative z-99999 w-full h-[100vh] rounded-xl overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Consultation Video Chat"
          className="w-full h-full"
          allow="camera; microphone; fullscreen; speaker; display-capture"
        />

        <ConfirmationDialog
          isOpen={showConfirmEnd}
          onClose={() => setShowConfirmEnd(false)}
          onConfirm={handleEndUserSession}
          title="End Session?"
          message="Are you sure you want to end this consultation session? This action cannot be undone."
          confirmText="Yes, End Session"
          cancelText="Cancel"
        />
      </div>
    );
  }

  return null;
};

export default VideoSection;
