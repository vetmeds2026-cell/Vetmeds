"use client"
import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from 'next/navigation';
import { FaUserMd, FaPaw, FaCalendarAlt, FaClock, FaFileDownload, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import Image from 'next/image';
import { useToast } from "@/components/ToastProvider";

// Add the getImageBase64 function directly to this file
const getImageBase64 = (url, maxWidth = 800) => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const isPng = url.toLowerCase().endsWith('.png') || url.startsWith('data:image/png');
      const dataURL = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.8);
      resolve(dataURL);
    };
    img.onerror = () => {
      resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+HgAHggJ/PCHI7wAAAABJRU5ErkJggg==');
    };
    img.src = url;
  });
};

// Doctor data (same as main page)
const doctors = [
  {
    id: 1,
    name: "Dr. Shrileela",
    specialization: "Small Animal Surgery",
    experience: "15 years",
    email: "Shrileela@vetmeds.com",
    timeSlot: "morning",
    image: "/sara.jpg",
    description: "Expert in surgical procedures for small animals including cats, dogs, and rabbits.",
    education: "DVM from Cornell University",
    phone: "9876543210"
  },
  {
    id: 2,
    name: "Dr. Omkar Veershaiv Wangi",
    specialization: "Emergency & Critical Care",
    experience: "12 years",
    email: "omkar@vetmeds.com",
    timeSlot: "evening",
    image: "/rocky.jpg",
    description: "Specialist in emergency medicine and critical care for all types of pets.",
    education: "DVM from UC Davis",
    phone: "9898989898"
  },
  {
    id: 3,
    name: "Dr. Sanchit Mohite",
    specialization: "Exotic Animal Medicine",
    experience: "10 years",
    email: "sanchit@vetmeds.com",
    timeSlot: "night",
    image: "/san.jpg",
    description: "Specialized in treating exotic pets including birds, reptiles, and small mammals.",
    education: "DVM from University of Florida",
    phone: "9090909090"
  }
];

function BookingPageContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const { showToast } = useToast();


  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [petProfiles, setPetProfiles] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [petProblem, setPetProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const isSubmitting = useRef(false);

  useEffect(() => {
    // Get URL parameters
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const timeSlot = searchParams.get('timeSlot');

    if (doctorId && date && timeSlot) {
      const foundDoctor = doctors.find(d => d.id === parseInt(doctorId));
      setDoctor(foundDoctor);
      setSelectedDate(date);
      setSelectedTimeSlot(timeSlot);

      // Generate available times based on time slot
      generateAvailableTimes(timeSlot, date);
    }

    // Fetch user's pet profiles
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchPetProfiles();
    }
  }, [searchParams, user]);

  // Fetch booked appointments when doctor and date change
  useEffect(() => {
    if (doctor && selectedDate) {
      fetchBookedAppointments();
    }
  }, [doctor, selectedDate]);

  const fetchPetProfiles = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const response = await fetch(`/api/pet-profiles?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      if (data.success) {
        setPetProfiles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pet profiles:', error);
    }
  };

  /**
   * Fetch booked appointments for the selected doctor and date
   */
  const fetchBookedAppointments = async () => {
    try {
      const response = await fetch(`/api/appointments?doctorEmail=${encodeURIComponent(doctor.email)}&appointmentDate=${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        const booked = data.data.map(apt => apt.appointmentTime);
        setBookedTimes(booked);
      }
    } catch (error) {
      console.error('Error fetching booked appointments:', error);
    }
  };

  const generateAvailableTimes = (timeSlot, selectedDateStr = '') => {
    let times = [];
    switch (timeSlot) {
      case 'morning': // 10 AM - 6 PM
        times = [
          '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
          '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
          '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
          '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
        ];
        break;
      case 'evening': // 6 PM - 2 AM
        times = [
          '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
          '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
          '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM',
          '12:00 AM', '12:30 AM', '01:00 AM', '01:30 AM'
        ];
        break;
      case 'night': // 2 AM - 10 AM
        times = [
          '02:00 AM', '02:30 AM', '03:00 AM', '03:30 AM',
          '04:00 AM', '04:30 AM', '05:00 AM', '05:30 AM',
          '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
          '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM'
        ];
        break;
    }

    if (selectedDateStr) {
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

      if (selectedDateStr === todayStr) {
        const currentHours = today.getHours();
        const currentMinutes = today.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;

        times = times.filter(timeStr => {
          const [time, period] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);

          if (period === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }

          if (timeSlot === 'evening' && period === 'AM') {
            hours += 24;
          }

          const slotTimeInMinutes = hours * 60 + minutes;
          return slotTimeInMinutes > currentTimeInMinutes;
        });
      }
    }

    setAvailableTimes(times);
  };

  const generatePDF = async (appointmentData) => {
    const doc = new jsPDF({ compress: true });
    const logoBase64 = await getImageBase64('/logo2.png', 400);

    // Header
    doc.setFillColor(20, 150, 127);
    doc.rect(0, 0, 210, 40, 'F');
    doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20, undefined, 'FAST');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('BOOKING RECEIPT', 105, 25, { align: 'center' });

    // Clinic Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const clinicName = 'Vet Meds Care Center';
    const clinicAddress = 'karve Naka, Karad, Maharashtra 415110';
    doc.text(clinicName, 195, 50, { align: 'right' });
    doc.text(clinicAddress, 195, 55, { align: 'right' });
    doc.text('Contact: +91 9876543210', 195, 60, { align: 'right' });

    // Status Badge
    doc.setFontSize(14);
    doc.setTextColor(20, 150, 127);
    doc.setFont(undefined, 'bold');
    doc.text(`Status: PENDING`, 20, 65);

    // Info Sections
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Doctor & Date
    const doctorNameFormatted = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;
    doc.text(`Doctor: ${doctorNameFormatted}`, 20, 80);
    doc.text(`Date: ${new Date(selectedDate).toLocaleDateString()}`, 190, 80, { align: 'right' });

    // Pet & Owner
    doc.text(`Pet Name: ${selectedPet.petName}`, 20, 90);
    doc.text(`Owner: ${selectedPet.ownerName}`, 190, 90, { align: 'right' });

    doc.line(20, 95, 190, 95);

    let yPos = 110;
    doc.setFont(undefined, 'bold');
    doc.text('Appointment Details:', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Time: ${selectedTime} (${selectedTimeSlot})`, 20, yPos);
    yPos += 8;
    doc.text(`Species/Breed: ${selectedPet.species || 'N/A'} - ${selectedPet.breed || 'N/A'}`, 20, yPos);

    yPos += 12;
    doc.setFont(undefined, 'bold');
    doc.text('Reason for Visit:', 20, yPos);
    yPos += 8;
    doc.setFont(undefined, 'normal');
    const problemLines = doc.splitTextToSize(petProblem || 'N/A', 170);
    doc.text(problemLines, 20, yPos);

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(20, 150, 127);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VetMeds - Thank you for choosing us!', 105, pageHeight - 7, { align: 'center' });

    // Save PDF
    doc.save(`VetMeds_Receipt_${selectedPet.petName}_${new Date().getTime()}.pdf`);
  };

  const handleConfirmAppointment = async (e) => {
    e.preventDefault();

    if (!selectedPet) {
      showToast('Please select a pet profile!', 'warning');
      return;
    }

    if (!selectedTime) {
      showToast('Please select an appointment time!', 'warning');
      return;
    }

    if (!petProblem.trim()) {
      showToast('Please describe the problem!', 'warning');
      return;
    }

    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);

    try {
      // Prepare pet profile details
      const petDetails = `
Pet Name: ${selectedPet.petName}
Species: ${selectedPet.species}
Breed: ${selectedPet.breed || 'N/A'}
Age: ${selectedPet.age || 'N/A'} years
Gender: ${selectedPet.gender || 'N/A'}
Weight: ${selectedPet.weight || 'N/A'}
Allergies: ${selectedPet.allergies || 'None'}
Chronic Conditions: ${selectedPet.chronicConditions || 'None'}
Current Medications: ${selectedPet.currentMedications || 'None'}
      `.trim();

      // Create appointment in database
      const appointmentData = {
        petName: selectedPet.petName,
        petProblem: petProblem,
        ownerName: selectedPet.ownerName,
        ownerEmail: selectedPet.ownerEmail,
        doctorName: doctor.name,
        doctorEmail: doctor.email,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        timeSlot: selectedTimeSlot,
        petProfileDetails: JSON.stringify(selectedPet),
        status: 'pending'
      };



      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create appointment');
      }



      // Generate PDF (handled locally)
      generatePDF(data.data);

      showToast('Appointment confirmed successfully!');


      // Redirect back to appointments page
      router.push('/dashboard/petAppointment');

    } catch (error) {
      console.error('Error confirming appointment:', error);
      showToast('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1b3a34] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8ef] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-[#1b3a34] hover:text-[#1b3a34] font-semibold transition-colors"
        >
          <FaArrowLeft /> Back to Appointments
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#1b3a34]">Confirm</span>
            <span className="text-[#1b3a34]"> Appointment</span>
          </h1>
          <p className="text-gray-600">Complete your booking with {doctor.name}</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Side - Doctor Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8">

            <div>
              <Image src={doctor.image} alt="dog" width={1000} height={1000} className='rounded-2xl mb-5' />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-3">{doctor.name}</h2>
            <p className="text-[#1b3a34] font-semibold text-xl mb-4">{doctor.specialization}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700">Experience:</span>
                <span className="text-gray-600">{doctor.experience}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700">Education:</span>
                <span className="text-gray-600">{doctor.education}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700">Phone:</span>
                <span className="text-gray-600">{doctor.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-600">{doctor.email}</span>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">{doctor.description}</p>

            {/* Hospital Address */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl mb-4 border border-gray-100">
              <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0" />
              <div>
                <p className="text-[#1b3a34] font-bold text-sm">Vet Meds Care Center</p>
                <p className="text-gray-500 text-xs">Karve Naka, Karad, Maharashtra 415110</p>
              </div>
            </div>

            {/* Selected Date & Time Slot */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">Selected Schedule:</h3>
              <p className="text-gray-700">
                <FaCalendarAlt className="inline mr-2" />
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleConfirmAppointment} className="space-y-6">
              {/* Select Pet Profile */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <FaPaw className="inline mr-2" />
                  Select Your Pet *
                </label>
                {petProfiles.length === 0 ? (
                  <div className="text-center py-8 bg-yellow-50 rounded-lg">
                    <p className="text-gray-600">No pet profiles found.</p>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/profile')}
                      className="mt-3 text-[#1b3a34] hover:text-[#1b3a34] font-semibold"
                    >
                      Create a pet profile first →
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {petProfiles.map((pet) => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setSelectedPet(pet)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${selectedPet?.id === pet.id
                            ? 'border-[#1b3a34] bg-blue-50 shadow-md'
                            : 'border-gray-300 hover:border-[#1b3a34] hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {pet.petImageUrl ? (
                            <img
                              src={pet.petImageUrl}
                              alt={pet.petName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-[#1b3a34] flex items-center justify-center">
                              <FaPaw className="text-[#fcf8ef]" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800">{pet.petName}</p>
                            <p className="text-sm text-gray-600">{pet.species} • {pet.breed || 'Mixed'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Select Time */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <FaClock className="inline mr-2" />
                  Select Appointment Time *
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b3a34] focus:border-[#1b3a34] transition-all"
                >
                  <option value="">Choose a time</option>
                  {availableTimes.map((time) => (
                    <option
                      key={time}
                      value={time}
                      disabled={bookedTimes.includes(time)}
                      className={bookedTimes.includes(time) ? 'text-gray-400 bg-gray-100' : ''}
                    >
                      {time} {bookedTimes.includes(time) ? '(Booked)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pet Problem */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Describe the Problem *
                </label>
                <textarea
                  value={petProblem}
                  onChange={(e) => setPetProblem(e.target.value)}
                  required
                  rows={5}
                  placeholder="Please describe your pet's symptoms or reason for visit..."
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1b3a34] focus:border-[#1b3a34] transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedPet || !selectedTime || !petProblem.trim()}
                className="w-full py-4 bg-[#1b3a34] text-[#fcf8ef] font-bold text-lg rounded-lg shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">

                    Confirm Appointment
                  </span>
                )}
              </button>


            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#1b3a34] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
