"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getSocket } from "@/lib/socket";

const illnesses = [
  { name: "Cold & Flu", image: "/images/health-illness/body.png" },
  { name: "Headache", image: "/images/health-illness/head.png" },
  { name: "Allergies", image: "/images/health-illness/allergy.png" },
  { name: "Stomach Pain", image: "/images/health-illness/colum.png" },
  { name: "Skin Rash", image: "/images/health-illness/skin.png" },
  { name: "Back Pain", image: "/images/health-illness/back.png" },
  { name: "UTI", image: "/images/health-illness/genetal.png" },
  { name: "Fever", image: "/images/health-illness/fever.png" },
  { name: "Menstrual Issues", image: "/images/health-illness/overies.png" },
  { name: "Constipation", image: "/images/health-illness/gesture.png" },
  { name: "Diarrhea", image: "/images/health-illness/purge.png" },
  { name: "Cough", image: "/images/health-illness/cough1.png" },
  { name: "Sore Throat", image: "/images/health-illness/shoulder.png" },
  { name: "Fatigue", image: "/images/health-illness/body.png" },
  { name: "Nausea", image: "/images/health-illness/cough.png" },
  { name: "Body Ache", image: "/images/health-illness/spine2.png" },
  { name: "Sinus Infection", image: "/images/health-illness/sinus.png" },
  { name: "Ear Pain", image: "/images/health-illness/ent.png" },
  { name: "Eye Irritation", image: "/images/health-illness/eye.png" },
  { name: "High Blood Pressure", image: "/images/health-illness/blood.png" },
  { name: "Acid Reflux", image: "/images/health-illness/gesture.png" },
  { name: "Asthma", image: "/images/health-illness/liver.png" },
  { name: "Anxiety", image: "/images/health-illness/brain.png" },
  { name: "Insomnia", image: "/images/health-illness/insomnia.png" },
];

const itemVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

const GPServicesIllnesses = ({ limit }) => {
  const router = useRouter();
  const { user } = useUser();
  const [onlineGPs, setOnlineGPs] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    
    socket.emit("get-online-specialists");
    socket.on("update-specialists", (data) => {
      const gpsOnly = data.filter((specialist) => specialist.category === "General Practitioner");
      setOnlineGPs(gpsOnly);
    });

    return () => {
      socket.off("update-specialists");
    };
  }, []);

  const openFindModal = () => {
    if (user) {
      // User is logged in, navigate to dashboard
      router.push('/admin');
    } else {
      // User is not logged in, navigate to login page
      router.push('/login');
    }
  };

  const displayedIllnesses = limit ? illnesses.slice(0, limit) : illnesses;
  const hasOnlineSpecialist = onlineGPs.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800">
        Common Conditions We Treat
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedIllnesses.map((illness, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={itemVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-center gap-4 p-4 rounded-2xl shadow-sm bg-white hover:shadow-lg transition duration-300 border border-gray-100"
          >
            <img
              src={illness.image}
              alt={illness.name}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
            />
            <div className="flex flex-col justify-between flex-1">
              <h3 className="text-md font-semibold text-gray-800">{illness.name}</h3>
              <button
                onClick={openFindModal}
                className={`mt-2 w-fit text-sm px-4 py-2 rounded-lg transition ${
                  hasOnlineSpecialist 
                    ? "bg-green-500 text-white hover:bg-green-600 shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {hasOnlineSpecialist ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Call now
                  </span>
                ) : (
                  "CONSULT NOW"
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GPServicesIllnesses;
