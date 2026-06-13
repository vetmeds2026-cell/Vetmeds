"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaClock, FaUserMd, FaStethoscope, FaPaw, FaHistory, FaDownload, FaBriefcaseMedical, FaMapMarkerAlt, FaHandHoldingHeart } from 'react-icons/fa';
import Image from 'next/image';
import jsPDF from 'jspdf';
import { FaEye } from "react-icons/fa";
import { GiMedicines } from "react-icons/gi";
import { useToast } from "@/components/ToastProvider";

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

const doctors = [
  {
    id: 1,
    name: "Dr. Shrileela",
    specialization: "Small Animal Surgery",
    experience: "15 years",
    email: "Shrileela@vetmeds.com",
    image: "/sara.jpg",
    timeSlot: "morning",
    description: "Expert in surgical procedures for small animals including cats, dogs, and rabbits.",
    education: "DVM from Cornell University"
  },
  {
    id: 2,
    name: "Dr. Omkar Veershaiv Wangi",
    specialization: "Emergency & Critical Care",
    experience: "12 years",
    email: "omkar@vetmeds.com",
    image: "/rocky.jpg",
    timeSlot: "evening",
    description: "Specialist in emergency medicine and critical care for all types of pets.",
    education: "DVM from UC Davis"
  },
  {
    id: 3,
    name: "Dr. Sanchit Mohite",
    specialization: "Exotic Animal Medicine",
    experience: "10 years",
    email: "sanchit@vetmeds.com",
    image: "/san.jpg",
    timeSlot: "night",
    description: "Specialized in treating exotic pets including birds, reptiles, and small mammals.",
    education: "DVM from University of Florida"
  }
];

export default function AppointmentClient({ initialAppointments, userEmail }) {
  const { showToast } = useToast();

  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Format received appointments
  const formattedAppointments = (initialAppointments || []).map(apt => {
    let parsedMedicines = [];
    if (typeof apt.medicines === 'string') {
      try {
        parsedMedicines = JSON.parse(apt.medicines || '[]');
      } catch (e) { }
    } else if (Array.isArray(apt.medicines)) {
      parsedMedicines = apt.medicines;
    }
    return {
      ...apt,
      medicines: parsedMedicines,
      hasNewStatus: apt.statusUpdated || false,
      statusMessage: apt.statusUpdateMessage || ''
    };
  });

  const [appointments, setAppointments] = useState(formattedAppointments);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [selectedAppointmentMedicines, setSelectedAppointmentMedicines] = useState([]);

  React.useEffect(() => {
    if (selectedTimeSlot) {
      const filtered = doctors.filter(doc => doc.timeSlot === selectedTimeSlot);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  }, [selectedTimeSlot]);

  // Optionally could keep a fetch flag if you want polling or refetching, but data is now SSR'd

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  const handleBookAppointment = (doctor) => {
    if (!selectedDate) {
      showToast('Please select a date first!', 'warning');
      return;
    }
    router.push(`/dashboard/petAppointment/book?doctorId=${doctor.id}&date=${selectedDate}&timeSlot=${selectedTimeSlot}`);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.setMonth(today.getMonth() + 3));
    return maxDate.toISOString().split('T')[0];
  };

  const isShiftAvailable = (shift) => {
    if (!selectedDate) return false;

    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    if (selectedDate === todayStr) {
      const currentHours = today.getHours();
      const currentMinutes = today.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      // Last slot times in minutes
      const shiftEndTimes = {
        'morning': 17 * 60 + 30, // 5:30 PM = 1050
        'evening': 25 * 60 + 30, // 1:30 AM next day = 1530
        'night': 9 * 60 + 30     // 9:30 AM = 570
      };

      return shiftEndTimes[shift] > currentTimeInMinutes;
    }
    return true;
  };

  const getTimeSlotLabel = (slot) => {
    switch (slot) {
      case 'morning': return '10:00 AM - 6:00 PM';
      case 'evening': return '6:00 PM - 2:00 AM';
      case 'night': return '2:00 AM - 10:00 AM';
      default: return '';
    }
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const viewMedicines = (appointment) => {
    setSelectedAppointmentMedicines(appointment.medicines || []);
    setShowMedicineModal(true);
  };

  /**
   * Generate Full Appointment Report PDF
   */
  const generatePDF = async (appointment) => {
    const doc = new jsPDF({ compress: true });
    const logoBase64 = await getImageBase64('/logo2.png', 400);

    // Parse pet details
    let petDetails = {};
    try {
      petDetails = appointment.petProfileDetails ? JSON.parse(appointment.petProfileDetails) : {};
    } catch (e) { petDetails = {}; }

    // Header
    doc.setFillColor(20, 150, 127);
    doc.rect(0, 0, 210, 40, 'F');
    doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20, undefined, 'FAST');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('APPOINTMENT REPORT', 105, 25, { align: 'center' });

    // Clinic Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const clinicName = 'Vet Meds Care Center';
    const clinicAddress = 'karve Naka, Karad, Maharashtra 415110';
    doc.text(clinicName, 195, 50, { align: 'right' });
    doc.text(clinicAddress, 195, 55, { align: 'right' });
    doc.text('Contact: +91 9876543210', 195, 60, { align: 'right' });

    // Kind Soulness Points
    if (appointment.pointsCollected) {
      doc.setFontSize(10);
      doc.setTextColor(219, 39, 119); // Pink-600
      doc.text(`Kind Soulness Contribution: ${appointment.pointsCollected} Points`, 195, 65, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Reset color for the rest of the document
    }

    // Info Sections
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Doctor & Date
    const doctorNameFormatted = appointment.doctorName.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`;
    doc.text(`Doctor: ${doctorNameFormatted}`, 20, 80);
    doc.text(`Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, 190, 80, { align: 'right' });

    // Pet & Owner
    doc.text(`Pet Name: ${appointment.petName}`, 20, 90);
    doc.text(`Owner: ${appointment.ownerName}`, 190, 90, { align: 'right' });

    doc.line(20, 95, 190, 95);

    let yPos = 110;
    doc.setFont(undefined, 'bold');
    doc.text('Appointment Details:', 20, yPos);
    yPos += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Time: ${appointment.appointmentTime} (${appointment.timeSlot})`, 20, yPos);
    yPos += 8;
    doc.text(`Species/Breed: ${petDetails.species || 'N/A'} - ${petDetails.breed || 'N/A'}`, 20, yPos);

    yPos += 12;
    doc.setFont(undefined, 'bold');
    doc.text('Reason for Visit:', 20, yPos);
    yPos += 8;
    doc.setFont(undefined, 'normal');
    const problemLines = doc.splitTextToSize(appointment.petProblem || 'N/A', 170);
    doc.text(problemLines, 20, yPos);

    yPos += (problemLines.length * 7) + 10;

    // Prescribed Medicines
    if (appointment.medicines && appointment.medicines.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('Prescribed Medications:', 20, yPos);

      yPos += 10;
      doc.setFontSize(10);
      doc.text('Medicine Name', 25, yPos);
      doc.text('Dosage', 90, yPos);
      doc.text('Duration', 130, yPos);
      doc.text('Notes', 160, yPos);

      yPos += 5;
      doc.line(20, yPos, 190, yPos);

      doc.setFont(undefined, 'normal');
      appointment.medicines.forEach((med) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        yPos += 8;
        doc.text(med.name || '-', 25, yPos);
        doc.text(med.dosage || '-', 90, yPos);
        doc.text(med.duration || '-', 130, yPos);
        doc.text(med.type || med.disease || '-', 160, yPos);
        yPos += 2;
        doc.setDrawColor(240, 240, 240);
        doc.line(20, yPos, 190, yPos);
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(20, 150, 127);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VetMeds - Your Trusted Pet Health Partner', 105, pageHeight - 7, { align: 'center' });

    doc.save(`VetMeds_Report_${appointment.petName}_${appointment.id}.pdf`);
  };

  /**
   * Generate Medical Prescription PDF
   */
  const generatePrescriptionPDF = async (appointment) => {
    const doc = new jsPDF({ compress: true });
    const logoBase64 = await getImageBase64('/logo2.png', 400);

    // Header
    doc.setFillColor(20, 150, 127);
    doc.rect(0, 0, 210, 40, 'F');
    doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20, undefined, 'FAST');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('MEDICAL PRESCRIPTION', 105, 25, { align: 'center' });

    // Clinic Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const clinicName = 'Vet Meds Care Center';
    const clinicAddress = 'karve Naka, Karad, Maharashtra 415110';
    doc.text(clinicName, 195, 50, { align: 'right' });
    doc.text(clinicAddress, 195, 55, { align: 'right' });
    doc.text('Contact: +91 9876543210', 195, 60, { align: 'right' });

    // Kind Soulness Points
    if (appointment.pointsCollected) {
      doc.setFontSize(9);
      doc.setTextColor(219, 39, 119); // Pink-600
      doc.text(`Kind Soulness Contribution: ${appointment.pointsCollected} Points`, 195, 65, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Reset color
    }

    // Rx Symbol
    doc.setFontSize(30);
    doc.setTextColor(20, 150, 127);
    doc.text('Rx', 20, 65);

    // Info
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    const doctorNameFormattedPresc = appointment.doctorName.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`;
    doc.text(`Doctor: ${doctorNameFormattedPresc}`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 80, { align: 'right' });
    doc.text(`Pet Name: ${appointment.petName}`, 20, 90);
    doc.text(`Owner: ${appointment.ownerName}`, 190, 90, { align: 'right' });

    doc.line(20, 95, 190, 95);

    let yPos = 110;
    doc.setFontSize(14);
    doc.text('Prescribed Medications:', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Medicine Name', 25, yPos);
    doc.text('Dosage', 90, yPos);
    doc.text('Duration', 130, yPos);
    doc.text('Notes', 160, yPos);

    yPos += 5;
    doc.line(20, yPos, 190, yPos);

    doc.setFont(undefined, 'normal');
    const medList = appointment.medicines || [];

    if (medList.length === 0) {
      yPos += 10;
      doc.text('No medicines prescribed.', 105, yPos, { align: 'center' });
    } else {
      medList.forEach((med) => {
        yPos += 8;
        doc.text(med.name || '-', 25, yPos);
        doc.text(med.dosage || '-', 90, yPos);
        doc.text(med.duration || '-', 130, yPos);
        doc.text(med.type || med.disease || '-', 160, yPos);
        yPos += 2;
        doc.setDrawColor(240, 240, 240);
        doc.line(20, yPos, 190, yPos);
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(20, 150, 127);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VetMeds - Your Trusted Pet Health Partner', 105, pageHeight - 7, { align: 'center' });

    doc.save(`Prescription_${appointment.petName}_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#fcf8ef] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
            <FaStethoscope className="text-3xl sm:text-4xl text-[#1b3a34]" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-[#1b3a34]">PET</span>
              <span className="text-[#1b3a34]"> APPOINTMENT</span>
            </h1>
            <FaPaw className="text-3xl sm:text-4xl text-[#1b3a34]" />
          </div>
          <p className="text-gray-600 text-base sm:text-lg">Book an appointment with our expert veterinarians</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 mb-8">
          <div className="mb-6 pb-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
                <FaMapMarkerAlt className="text-xl" />
              </div>
              <div>
                <p className="text-[#1b3a34] font-bold text-lg leading-tight mb-1">Vet Meds Care Center</p>
                <p className="text-gray-500 text-sm sm:text-base leading-snug">
                  Karve Naka, Karad, Maharashtra 415110
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
            <div className="w-full md:w-2/3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1b3a34] mb-6 flex items-center gap-2">
                <FaCalendarAlt /> Select Date & Time Slot
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#1b3a34] focus:border-[#1b3a34] transition-all text-lg"
                />
              </div>
            </div>
            <div className="hidden sm:block md:w-1/3">
              <Image src={'/docdog.png'} alt="dog" width={400} height={400} className='w-50 max-w-[200px] md:max-w-xs mx-auto drop-shadow-lg' />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FaClock className="inline mr-2" />
              Select Time Slot
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleTimeSlotSelect('morning')}
                disabled={!isShiftAvailable('morning')}
                className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedTimeSlot === 'morning'
                    ? 'border-[#1b3a34] bg-[#1b3a34] text-[#fcf8ef] shadow-lg'
                    : 'border-gray-300 bg-white hover:border-[#1b3a34] hover:shadow-md'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="text-center">
                  <FaClock className="mx-auto text-3xl mb-2" />
                  <h3 className="font-bold text-lg mb-1">Morning Shift</h3>
                  <p className="text-sm">10:00 AM - 6:00 PM</p>
                  {!isShiftAvailable('morning') && selectedDate && <p className="text-xs text-red-500 mt-2 font-bold">Shift Ended</p>}
                </div>
              </button>
              <button
                onClick={() => handleTimeSlotSelect('evening')}
                disabled={!isShiftAvailable('evening')}
                className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedTimeSlot === 'evening'
                    ? 'border-[#1b3a34] bg-[#1b3a34] text-[#fcf8ef] shadow-lg'
                    : 'border-gray-300 bg-white hover:border-[#1b3a34] hover:shadow-md'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="text-center">
                  <FaClock className="mx-auto text-3xl mb-2" />
                  <h3 className="font-bold text-lg mb-1">Evening Shift</h3>
                  <p className="text-sm">6:00 PM - 2:00 AM</p>
                  {!isShiftAvailable('evening') && selectedDate && <p className="text-xs text-red-500 mt-2 font-bold">Shift Ended</p>}
                </div>
              </button>
              <button
                onClick={() => handleTimeSlotSelect('night')}
                disabled={!isShiftAvailable('night')}
                className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedTimeSlot === 'night'
                    ? 'border-[#1b3a34] bg-[#1b3a34] text-[#fcf8ef] shadow-lg'
                    : 'border-gray-300 bg-white hover:border-[#1b3a34] hover:shadow-md'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                <div className="text-center">
                  <FaClock className="mx-auto text-3xl mb-2" />
                  <h3 className="font-bold text-lg mb-1">Night Shift</h3>
                  <p className="text-sm">2:00 AM - 10:00 AM</p>
                  {!isShiftAvailable('night') && selectedDate && <p className="text-xs text-red-500 mt-2 font-bold">Shift Ended</p>}
                </div>
              </button>
            </div>
          </div>
        </div>

        {selectedTimeSlot && filteredDoctors.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#1b3a34] mb-6 flex items-center gap-2">
              <FaUserMd /> Available Doctors ({getTimeSlotLabel(selectedTimeSlot)})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-[#1b3a34] hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <div>
                    <Image src={doctor.image} alt={doctor.name} width={400} height={400} className="w-full h-auto" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1b3a34] mb-2">{doctor.name}</h3>
                    <p className="text-gray-600 font-semibold mb-2">{doctor.specialization}</p>
                    <p className="text-sm text-gray-500 mb-1">
                      <strong className="text-[#1b3a34]">Experience:</strong> {doctor.experience}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      <strong className="text-[#1b3a34]">Education:</strong> {doctor.education}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 md:line-clamp-3">{doctor.description}</p>
                    <button
                      onClick={() => handleBookAppointment(doctor)}
                      className="w-full py-3 bg-[#1b3a34] text-[#fcf8ef] font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      Get Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[#1b3a34] mb-6 flex items-center gap-2">
            <FaHistory /> Previous Appointments
          </h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <Image src={'/logo.png'} alt="dog" width={500} height={500} className='w-30 opacity-50 mx-auto ' />
              <p className="text-gray-500 text-lg">No appointments yet. Book your first appointment!</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-[#1b3a34] text-[#fcf8ef]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Pet Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Doctor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Problem</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Medicines</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {appointments.map((appointment, index) => (
                      <tr
                        key={appointment.id}
                        className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors ${appointment.hasNewStatus ? 'border-l-4 border-yellow-500' : ''}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatAppointmentDate(appointment.appointmentDate)}
                          {appointment.hasNewStatus && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              NEW
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{appointment.appointmentTime}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {appointment.petName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{appointment.doctorName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="line-clamp-1">{appointment.petProblem}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-28 text-center py-1 rounded-full text-xs font-semibold ${appointment.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : appointment.status === 'completed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {appointment.status?.toUpperCase()}
                            </span>
                            {appointment.pointsCollected && (
                              <div className="relative group">
                                <button
                                  className="p-1.5 bg-pink-50 text-pink-600 rounded-full border border-pink-100 hover:bg-pink-100 transition-all animate-pulse"
                                  title={`Kind Soulness: ${appointment.pointsCollected} Points Given`}
                                >
                                  <FaHandHoldingHeart size={14} />
                                </button>
                                {/* Premium Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                                  <div className="bg-[#1b3a34] text-white text-[10px] font-black py-1 px-3 rounded-lg whitespace-nowrap shadow-xl border border-white/20">
                                    KIND SOULNESS: {appointment.pointsCollected} PTS
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#1b3a34]"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => generatePDF(appointment)}
                              className="px-2 py-1 bg-purple-500 text-[#fcf8ef] text-sm rounded-lg hover:bg-purple-600 transition-colors shadow-sm flex items-center gap-1"
                              title="Download PDF"
                            >
                              <FaDownload size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {appointment.status === 'completed' && appointment.medicines && appointment.medicines.length > 0 && (
                              <>
                                <button
                                  onClick={() => viewMedicines(appointment)}
                                  className="w-8 h-8 flex items-center justify-center bg-[#1b3a34] text-[#fcf8ef] rounded-full hover:bg-[#0d7a6a] transition-all transform hover:scale-110 shadow-sm"
                                  title="View Medicines"
                                >
                                  <FaEye size={14} />
                                </button>
                                <button
                                  onClick={() => generatePrescriptionPDF(appointment)}
                                  className="w-8 h-8 flex items-center justify-center bg-green-600 text-[#fcf8ef] rounded-full hover:bg-green-700 transition-all transform hover:scale-110 shadow-sm"
                                  title="Download Prescription"
                                >
                                  <GiMedicines size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`bg-white rounded-xl border-2 p-4 shadow-sm active:scale-95 transition-all ${appointment.hasNewStatus ? 'border-yellow-400 bg-yellow-50/30' : 'border-gray-100'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1b3a34]/10 rounded-lg text-[#1b3a34]">
                          <FaPaw size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1b3a34] text-lg uppercase leading-tight">
                            {appointment.petName}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <FaCalendarAlt size={10} />
                            <span>{formatAppointmentDate(appointment.appointmentDate)}</span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${appointment.status === 'confirmed'
                            ? 'bg-green-500 text-white'
                            : appointment.status === 'pending'
                              ? 'bg-yellow-500 text-white'
                              : appointment.status === 'completed'
                                ? 'bg-blue-500 text-white'
                                : 'bg-red-500 text-white'
                          }`}
                      >
                        {appointment.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaUserMd className="text-[#1b3a34] shrink-0" />
                          <span className="truncate">{appointment.doctorName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaClock className="text-[#1b3a34] shrink-0" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                      </div>
                      <div className="p-2 bg-[#fcf8ef] rounded-lg border border-[#1b3a34]/5">
                        <p className="text-[10px] text-[#1b3a34] font-bold uppercase mb-1 flex items-center gap-1">
                          <FaStethoscope size={10} /> Problem
                        </p>
                        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed italic">
                          "{appointment.petProblem}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-2 flex-grow">
                        {appointment.status === 'completed' && appointment.medicines && appointment.medicines.length > 0 && (
                          <>
                            <button
                              onClick={() => viewMedicines(appointment)}
                              className="px-3 py-1.5 bg-[#1b3a34] text-[#fcf8ef] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-90 transition-transform"
                            >
                              <FaEye /> Meds
                            </button>
                            <button
                              onClick={() => generatePrescriptionPDF(appointment)}
                              className="px-3 py-1.5 bg-green-600 text-[#fcf8ef] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-90 transition-transform"
                            >
                              <GiMedicines /> Rx
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {appointment.pointsCollected && (
                          <div className="flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-lg border border-pink-100">
                            <FaHandHoldingHeart className="text-pink-600 text-xs animate-pulse" />
                            <span className="text-[10px] font-black text-pink-700">{appointment.pointsCollected} PTS</span>
                          </div>
                        )}
                        <button
                          onClick={() => generatePDF(appointment)}
                          className="px-3 py-1.5 bg-purple-500 text-[#fcf8ef] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-90 transition-transform"
                        >
                          <FaDownload /> Report
                        </button>
                      </div>
                    </div>

                    {appointment.hasNewStatus && (
                      <div className="mt-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold text-center rounded uppercase tracking-tighter">
                        Recently Updated by Doctor
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {showMedicineModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-[#1b3a34] text-[#fcf8ef] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Prescribed Medicines</h2>
                  <button
                    onClick={() => setShowMedicineModal(false)}
                    className="text-[#fcf8ef] hover:text-red-200 text-3xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                {selectedAppointmentMedicines.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No medicines prescribed for this appointment.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedAppointmentMedicines.map((medicine, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{medicine.name}</h3>
                            <p className="text-gray-600">Type: {medicine.type}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-600">Dosage</p>
                            <p className="font-medium">{medicine.dosage || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-medium">{medicine.duration || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
