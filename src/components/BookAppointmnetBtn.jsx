import { useState } from "react";
import ModalContainer from "@/components/gabriel/ModalContainer";
import { FindSpecialistModal } from "@/components/gabriel";
import BookAppointment from "./gabriel/patient/BookAppointment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const BookAppointmentBTN = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleConsultNow = () => {
    const isAuthenticated = status === "authenticated" && session?.user;
    if (isAuthenticated) {
      router.push("/admin");
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      {/* CTA Button */}
      <div className="mt-12 z-9999">
        <button
          onClick={handleConsultNow}
          className="bg-blue-900 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition inline-flex items-center"
        >
          Consult Now
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <ModalContainer
          modal={
            <FindSpecialistModal
              category="General Practice" // or leave blank: category=""
              closeModal={closeModal}
            />
          }
        />
      )}
    </>
  );
};

export default BookAppointmentBTN;
