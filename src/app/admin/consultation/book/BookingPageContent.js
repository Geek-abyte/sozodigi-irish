"use client";

import React, { useState, useEffect } from "react";
import ConsultationBooking from "@/components/BookingPage";

const ConsultationBookingPageContent = () => {
  // For admin consultation booking, show specialist categories
  const showSpecialistCategories = true;
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-0">
      <ConsultationBooking
        showSpecialistCategories={showSpecialistCategories}
      />
    </div>
  );
};

export default ConsultationBookingPageContent;
