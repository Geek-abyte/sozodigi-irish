"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { defaultUser } from "@/assets";
import { FaGraduationCap, FaLocationArrow, FaUserMd } from "react-icons/fa";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSpecialist, setPrice, setDuration } from "@/store/specialistSlice";
import {
  PricingModal,
  CheckoutModal,
  FindSpecialistModal,
} from "@/components/gabriel";
import ModalContainer from "@/components/gabriel/ModalContainer";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import io from "socket.io-client";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export default function GeneralPractitionersPageContent() {
  const [generalPractitioners, setGeneralPractitioners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGP, setSelectedGP] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [onlineGPs, setOnlineGPs] = useState([]);

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const { addToast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;
  const dispatch = useDispatch();
  const specialist = useSelector((state) => state.specialist.specialist);
  const duration = useSelector((state) => state.specialist.duration);

  const loadGeneralPractitioners = async () => {
    setLoading(true);
    try {
      const res = await fetchData("medical-tourism/users/get-all/doctors/no-pagination", token);
      // Filter to show only general practitioners
      const gpsOnly = res.filter(
        (doctor) =>
          (doctor.category || "").trim().toLowerCase() ===
          "general practitioner",
      );
      setGeneralPractitioners(gpsOnly);
    } catch (err) {
      addToast("Failed to load general practitioners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && token) loadGeneralPractitioners();
  }, [session, token]);

  useEffect(() => {
    socket.emit("get-online-specialists");
    socket.on("update-specialists", (data) => {
      const gpsOnly = data.filter(
        (specialist) => specialist.category === "General Practitioner",
      );
      setOnlineGPs(gpsOnly);
    });

    return () => {
      socket.off("update-specialists");
    };
  }, []);

  const isOnline = onlineGPs[0];

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  const handleConsultGP = () => {
    if (isOnline) {
      const specialist = onlineGPs[0];
      dispatch(setSpecialist(specialist));
      setModalContent("pricingModal");
      setIsOpen(true);
    } else {
      openDialog();
    }
  };

  const DoctorImage = ({ profileImage, alt = "Doctor" }) => {
    const [imgSrc, setImgSrc] = useState(
      profileImage ? `${apiUrl}${profileImage}` : defaultUser.src,
    );

    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={150}
        height={150}
        onError={() => setImgSrc(defaultUser.src)}
        className="h-48 w-full object-cover transition-transform group-hover:scale-105"
      />
    );
  };

  const handleGPSelect = (gp) => {
    setSelectedGP(gp);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedGP(null);
    document.body.style.overflow = "auto";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">General Practitioners</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View all general practitioners available in the system
          </p>
        </div>
        <button
          onClick={handleConsultGP}
          className="bg-[var(--color-primary-6)] hover:bg-[var(--color-primary-7)] text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <FaUserMd />
          Consult GP Now
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : generalPractitioners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generalPractitioners.map((gp, index) => (
            <motion.div
              key={gp._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              onClick={() => handleGPSelect(gp)}
            >
              <div className="relative">
                <DoctorImage profileImage={gp.profileImage} />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Dr. {gp.firstName} {gp.lastName}
                </h3>
                <p className="text-[var(--color-primary-6)] text-sm font-medium mb-3">
                  {gp.category || "General Practitioner"}
                </p>

                {gp.qualifications && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                    <FaGraduationCap className="mr-2 text-gray-500" />
                    <span>{gp.qualifications}</span>
                  </div>
                )}

                {gp.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                    <FaLocationArrow className="mr-2 text-gray-500" />
                    <span>{gp.location}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No general practitioners found.
          </p>
        </div>
      )}

      {/* GP Profile Modal */}
      {selectedGP && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-8">
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex flex-col items-center text-center">
                  <img
                    src={
                      selectedGP.profileImage
                        ? `${apiUrl}${selectedGP.profileImage}`
                        : defaultUser.src
                    }
                    alt={`Dr. ${selectedGP.firstName} ${selectedGP.lastName}`}
                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg mb-4"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = defaultUser.src;
                    }}
                  />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Dr. {selectedGP.firstName} {selectedGP.lastName}
                  </h2>
                  <p className="text-[var(--color-primary-6)] dark:text-[var(--color-primary-4)] font-medium mb-6">
                    {selectedGP.category || "General Practitioner"}
                  </p>

                  <div className="w-full space-y-4 text-left">
                    {selectedGP.qualifications && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
                          Qualifications
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedGP.qualifications}
                        </p>
                      </div>
                    )}

                    {selectedGP.yearsOfExperience && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
                          Experience
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedGP.yearsOfExperience} years
                        </p>
                      </div>
                    )}

                    {selectedGP.location && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
                          Location
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedGP.location}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold mb-1">
                        Status
                      </h3>
                      <p
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          selectedGP.approvalStatus === "approved" ||
                          selectedGP.isApproved
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {selectedGP.approvalStatus
                          ? selectedGP.approvalStatus.charAt(0).toUpperCase() +
                            selectedGP.approvalStatus.slice(1)
                          : selectedGP.isApproved
                            ? "Approved"
                            : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3 dark:text-gray-100">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      About Dr. {selectedGP.firstName} {selectedGP.lastName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedGP.bio ||
                        `Dr. ${selectedGP.firstName} ${selectedGP.lastName} is a dedicated general practitioner committed to providing comprehensive primary healthcare services. With a focus on preventive care and patient well-being, Dr. ${selectedGP.lastName} offers personalized medical consultations to address a wide range of health concerns.`}
                    </p>
                  </div>

                  {selectedGP.services && selectedGP.services.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Services Offered
                      </h3>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                        {selectedGP.services.map((service, idx) => (
                          <li key={idx}>{service}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Specialization
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedGP.category || "General Practitioner"} -
                      Providing comprehensive primary healthcare services
                      including routine check-ups, diagnosis, treatment, and
                      preventive care.
                    </p>
                  </div>

                  {selectedGP.specialty && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Specialty
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedGP.specialty}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      {isOpen && modalContent === "findSpecialistModal" && (
        <ModalContainer
          modal={
            <FindSpecialistModal
              category="General Practitioner"
              closeModal={closeDialog}
            />
          }
        />
      )}

      {isOpen && modalContent === "pricingModal" && (
        <ModalContainer
          modal={
            <PricingModal
              closeModal={closeDialog}
              setPrice={(p) => dispatch(setPrice(p))}
              setDuration={(d) => dispatch(setDuration(d))}
              onConfirm={(p, d) => {
                setModalContent("checkoutModal");
              }}
            />
          }
        />
      )}

      {isOpen && modalContent === "checkoutModal" && specialist && (
        <Elements stripe={stripePromise}>
          <ModalContainer
            modal={
              <CheckoutModal
                closeModal={closeDialog}
                currency="EUR"
                duration={duration}
                date={new Date()}
                consultMode="now"
              />
            }
          />
        </Elements>
      )}
    </div>
  );
}
