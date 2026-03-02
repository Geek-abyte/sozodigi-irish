const VideoSection = ({
  appointment,
  sessionEnded,
  iframeRef,
  iframeUrl,
}) => {
  if (appointment.session.appointment.status === "pending" && !sessionEnded) {
    return (
      <div className="relative z-99999 w-full h-[100vh] rounded-xl overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Consultation Video Chat"
          className="w-full h-full"
          allow="camera; microphone; autoplay; fullscreen; speaker; display-capture"
        />
      </div>
    );
  }

  return null;
};

export default VideoSection;
