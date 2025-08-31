'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { fetchData, postData } from '@/utils/api'
import { useUser } from '@/context/UserContext'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useToast } from '@/context/ToastContext'

import { useSelector, useDispatch } from "react-redux";
import ModalContainer from "@/components/gabriel/ModalContainer";

import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import BookingInstructions from '@/components/BookingInstructions'
import getMinutesDifference from '@/utils/getMinutesDifference'
import { 
  setPrice,
  setSpecialist,
  setDuration,
  setConsultMode,
  setSlot,
  resetBooking, 
  setAppointmentDate} from '@/store/specialistSlice'

import {
  PricingModal,
  CheckoutModal,
  FindSpecialistModal,
} from "@/components/gabriel";

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)


const ConsultationBookingPageContent = ({showSpecialistCategories}) => {
  const dispatch = useDispatch();

  // console.log(!showSpecialistCategories)
  
  const specialist = useSelector((state) => state.specialist.specialist);
  const price = useSelector((state) => state.specialist.price);
  const duration = useSelector((state) => state.specialist.duration);

  const appointmentDate = useSelector(
    (state) => state.specialist.appointmentDate
  );

  
  const router = useRouter()

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const [mounted, setMounted] = useState(false)
  const { user } = useUser()
  const { addToast } = useToast()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const token = session?.user?.jwt

  const [selectedDate, setSelectedDate] = useState(startOfToday)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reason, setReason] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [loadingBooking, setLoadingBooking] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [specialistsByCategory, setSpecialistsByCategory] = useState([])

  const pathname = usePathname();

  const COST_PER_MINUTE = 1.33

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (token) fetchSpecialistCategories()
  }, [token])

  useEffect(() => {
    if(showSpecialistCategories){
      if (token && selectedDate && specialistsByCategory.length > 0) {
        fetchAvailableSlots()
      }
    }else{
      if (token && selectedDate) {
        fetchAvailableSlots()
      }
    }
    
  }, [selectedDate, specialistsByCategory, token])

  const fetchSpecialistCategories = async () => {
    setLoadingCategories(true)
    try {
      const res = await fetchData('users/get-all/doctors/no-pagination', token)
      
      const grouped = res.reduce((acc, specialist) => {
        const category = specialist.category || 'Uncategorized'
        if (!acc[category]) acc[category] = []
        acc[category].push(specialist)
        return acc
      }, {})

      const categoryList = Object.entries(grouped).map(([name, members]) => ({
        name,
        count: members.length,
        members,
      }))

      if(!showSpecialistCategories){
        setSpecialistsByCategory(res)
      }

      setCategories(categoryList)
    } catch (err) {
      console.error('Failed to load categories:', err)
      addToast('Could not load specialist categories.', 'error')
    } finally {
      setLoadingCategories(false)
    }
  }
  
  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    setAvailableSlots([]);
  
    try {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const selectedDayName = weekdays[selectedDate.getDay()];
      const selectedDateString = selectedDate.toISOString().split('T')[0];
  
      const allSlots = [];
  
      // 1. Fetch appointments for selected date
      const appointmentRes = await fetchData(
        `consultation-appointments/all/no/pagination/?dateFrom=${selectedDateString}&dateTo=${selectedDateString}`,
        token
      );
      const bookedAppointments = appointmentRes || [];
  
      // 2. Create a set of booked slot IDs for fast lookup
      const bookedSlotIds = new Set(
        bookedAppointments.map((appointment) => appointment.slot?._id)
      );
  
      // 3. Loop through all specialists in the selected category
      for (const specialist of specialistsByCategory) {
        const res = await fetchData(
          `availabilities/slots/by?userRole=specialist&consultantId=${specialist._id}&isBooked=false`,
          token
        );
  
        const filtered = res.data.filter((slot) => {
          const slotId = slot._id;
          if (bookedSlotIds.has(slotId)) return false; // Exclude already booked slots
  
          if (!showSpecialistCategories) {
            if (slot.category !== "cert") return false;
  
            if (slot.type === 'recurring') {
              return slot.dayOfWeek === selectedDayName;
            } else if (slot.type === 'one-time') {
              return new Date(slot.date).toISOString().split('T')[0] === selectedDateString;
            }
          } else {
            if (slot.category !== "general") return false;
  
            if (slot.type === 'recurring') {
              return slot.dayOfWeek === selectedDayName;
            } else if (slot.type === 'one-time') {
              return new Date(slot.date).toISOString().split('T')[0] === selectedDateString;
            }
          }
  
          return false;
        });
  
        filtered.forEach((slot) => {
          allSlots.push({ ...slot, consultant: specialist });
        });
      }
  
      setAvailableSlots(allSlots);
      setLoadingSlots(false);
    } catch (err) {
      console.error('Error fetching slots:', err);
      addToast('Failed to load slots', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };
  

  if (!mounted) return null

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const selectedDayName = weekdays[selectedDate.getDay()]

  const openCheckoutModal = (price, duration) => {
    console.log(price)
    dispatch(setPrice(price));
    dispatch(setDuration(duration));
    setModalContent("checkoutModal");
    dispatch(setConsultMode("appointment"));
    dispatch(setSpecialist(selectedSlot.consultant))
    dispatch(setAppointmentDate(selectedDate.toISOString()))
    dispatch(setSlot(selectedSlot))
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
    dispatch(resetBooking());
  };

  if (!session) {
    const callbackUrl = encodeURIComponent(pathname);
    router.push(`/login?callbackUrl=${callbackUrl}`);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-0">
      <h2 className="text-2xl font-bold mb-2">Book an Appointment</h2>
      <BookingInstructions showSpecialistCategories={showSpecialistCategories} />

      <div className={`grid grid-cols-1 lg:grid-cols-2 [${showSpecialistCategories ? 'lg:grid-cols-3' : ''}] gap-3`}>
        { (showSpecialistCategories) &&  
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
            {loadingCategories ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setSpecialistsByCategory(cat.members)
                    setAvailableSlots([])
                    setSelectedSlot(null)
                  }}
                  className={`cursor-pointer p-3 rounded-md border transition-all duration-150 ${
                    selectedCategory?.name === cat.name
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'hover:border-indigo-400 hover:bg-gray-50'
                  }`}
                >
                  <h4 className="text-base font-semibold">{cat.name}</h4>
                  <p className="text-xs text-gray-500">{cat.count} specialist{cat.count > 1 ? 's' : ''}</p>
                </div>
              ))
            )}
          </div>
        }

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date {selectedCategory && `for ${selectedCategory.name}`}
          </label>
          <div className="mb-2 font-semibold text-lg text-gray-700">
            {selectedDayName}, {selectedDate.toLocaleDateString()}
          </div>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) setSelectedDate(date)
            }}
            disabled={{ before: startOfToday }}
            weekStartsOn={1}
            className="rounded-lg shadow-md bg-white p-2"
            styles={{
              caption: { textAlign: 'center' },
              day_selected: { backgroundColor: '#4f46e5', color: 'white' },
            }}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          {loadingSlots ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <>
              <h3 className="text-lg font-medium mb-4">
                Available Time Slots for {selectedDayName}, {selectedDate.toLocaleDateString()}
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {availableSlots.map((slot) => (
                  <div
                    key={slot._id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedSlot?._id === slot._id ? 'border-indigo-600 bg-indigo-50' : 'hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="text-sm text-gray-600">
                      Consultant: {slot.consultant.firstName} {slot.consultant.lastName}
                    </div>

                    { (!showSpecialistCategories && price) ? 
                      <div className="text-sm text-indigo-700 font-semibold mt-1">
                        Service Fee:  €{price}
                      </div>
                    :
                      <div className="text-sm text-indigo-700 font-semibold mt-1">
                        Appointment Fee:  €{ getMinutesDifference(slot.startTime, slot.endTime) * COST_PER_MINUTE}
                      </div>
                    }
                  </div>
                ))}
              </div>


              {selectedSlot && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Why are you booking this consultation?"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                  />
                </div>
              )}

              { selectedSlot && 
                <button
                  onClick={() => openCheckoutModal(
                    (!showSpecialistCategories && price) ? price : getMinutesDifference(selectedSlot.startTime, selectedSlot.endTime) * COST_PER_MINUTE,
                    getMinutesDifference(selectedSlot.startTime, selectedSlot.endTime)
                  )}
                  disabled={!selectedSlot || !reason || loadingBooking}
                  className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingBooking && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {loadingBooking ? 'Processing...' : 'Book Appointment'}
                </button>
              }
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>No available slots for the selected date.</p>
              <p className="mt-2">
                Please contact us at{' '}
                <a href="tel:+1234567890" className="text-indigo-600">
                  +1 (234) 567-890
                </a>{' '}
                if you need help.
              </p>
            </div>
          )}
        </div>

        {showModal && modalContent === "checkoutModal" && selectedSlot.consultant && (
          <ModalContainer
            modal={
              <Elements stripe={stripePromise}>
                <CheckoutModal
                  closeModal={closeModal}
                  amount={price}
                  currency="EUR"
                  duration={duration}
                  date={new Date(selectedSlot.date)}
                  consultMode="appointment"
                />
              </Elements>
            }
          />
        )}
      </div>
    </div>
  )
}

export default ConsultationBookingPageContent
