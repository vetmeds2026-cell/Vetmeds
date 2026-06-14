"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaHome, FaCalendarAlt, FaHistory, FaPaw, FaSignOutAlt,
  FaUserMd, FaBars, FaTimes, FaCheckCircle, FaTimesCircle,
  FaClock, FaDownload, FaEye, FaExclamationTriangle, FaHandHoldingHeart,
  FaMapMarkerAlt, FaMap, FaShieldAlt, FaSkullCrossbones
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import Image from 'next/image';
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


function DoctorDashboard() {
  const router = useRouter();

  
  const [doctorData, setDoctorData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); 
  const [appointments, setAppointments] = useState([]);
  const [petProfiles, setPetProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [selectedMedicineAppointment, setSelectedMedicineAppointment] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [customMedicine, setCustomMedicine] = useState({ name: '', type: '', disease: '' });
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); 
  const [selectedDisease, setSelectedDisease] = useState(null); 
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState(null);
  const [blockDuration, setBlockDuration] = useState('7');
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const { showToast } = useToast();


  
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBillingAppointment, setSelectedBillingAppointment] = useState(null);
  const [pointsToDeduct, setPointsToDeduct] = useState('');
  const [userPointsBalance, setUserPointsBalance] = useState(0);
  const [collectedPointsData, setCollectedPointsData] = useState([]);
  const [loadingCollectedPoints, setLoadingCollectedPoints] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null); 


  useEffect(() => {
    const tabNames = {
      'home': 'Home',
      'all-appointments': 'Appointments',
      'previous': 'History',
      'all-pets': 'Pets',
      'emergency-sos': 'Emergency',
      'collected-points': 'Points'
    };
    const activeTabName = tabNames[activeTab] || 'Dashboard';
    document.title = `${activeTabName} | Doctor Dashboard | VetMeds`;
  }, [activeTab]);

  
  useEffect(() => {
    const authData = localStorage.getItem('doctorAuth');
    if (!authData) {
      router.push('/doctor-login');
    } else {
      let parsedAuth = JSON.parse(authData);

      
      let needsUpdate = false;
      if (parsedAuth.email === 'omkar@happytails.com' || parsedAuth.email === 'omkar@vetmed.com') {
        parsedAuth.email = 'omkar@vetmeds.com';
        needsUpdate = true;
      }

      if (parsedAuth.email === 'omkar@vetmeds.com' && parsedAuth.name !== 'Omkar M. VeershaivWangi') {
        parsedAuth.name = 'Omkar M. VeershaivWangi';
        needsUpdate = true;
      }

      if (needsUpdate) {
        localStorage.setItem('doctorAuth', JSON.stringify(parsedAuth));
      }
      setDoctorData(parsedAuth);
    }
  }, []);

  
  useEffect(() => {
    if (doctorData) {
      fetchAppointments();
      fetchAllPetProfiles();
      fetchEmergencyAlerts();
      fetchCollectedPoints();
    }
  }, [doctorData]);

  const fetchCollectedPoints = async () => {
    try {
      setLoadingCollectedPoints(true);
      const res = await fetch(`/api/collected-points?doctorEmail=${encodeURIComponent(doctorData.email)}`);
      const data = await res.json();
      if (data.success) {
        setCollectedPointsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching collected points:', error);
    } finally {
      setLoadingCollectedPoints(false);
    }
  };

  const handleTransferPoints = async () => {
    try {
      const res = await fetch('/api/collected-points', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorEmail: doctorData.email })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully sent ${data.count} collected records to Main Doctor (omkar@vetmeds.com)!`);
        fetchCollectedPoints(); 
      } else {
        showToast('Failed to transfer points.', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error transferring points.', 'error');
    }
  };

  const fetchEmergencyAlerts = async () => {
    try {
      setLoadingEmergencies(true);
      const response = await fetch('/api/emergencysos');
      const data = await response.json();
      if (data.success) {
        setEmergencyAlerts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
    } finally {
      setLoadingEmergencies(false);
    }
  };

  const askConfirm = (config) => setConfirmConfig(config);

  const resolveEmergency = async (id) => {
    askConfirm({
      title: 'Resolve Emergency?',
      message: 'Mark this emergency as completed? The user will receive +50 Kind Soul points.',
      icon: '✅',
      confirmLabel: 'Yes, Resolve',
      confirmClass: 'bg-green-600 hover:bg-green-700',
      onConfirm: async () => {
        try {
          setLoadingEmergencies(true);
          const response = await fetch('/api/emergencysos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'completed' })
          });
          const data = await response.json();
          if (data.success) {
            showToast('Emergency resolved successfully (+50 points for user)', 'success');
            fetchEmergencyAlerts();
          }
        } catch (error) {
          console.error('Error resolving emergency:', error);
          showToast('Failed to resolve emergency', 'error');
        } finally {
          setLoadingEmergencies(false);
        }
      }
    });
  };

  const handleBlockUser = async () => {
    if (!selectedUserToBlock) return;
    try {
      setIsBlocking(true);
      const response = await fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUserToBlock,
          duration: blockDuration,
          reason: blockReason
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast(`User blocked successfully`, 'success');
        setShowBlockModal(false);
        fetchEmergencyAlerts();
      } else {
        showToast(data.error || 'Failed to block user', 'error');
      }
    } catch (error) {
      showToast('Error blocking user', 'error');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockUser = async (email) => {
    askConfirm({
      title: 'Unblock & Fine User?',
      message: 'This will reset their Kind Soul Points to 10 and collect the remainder as a penalty. This action cannot be undone.',
      icon: '⚠️',
      confirmLabel: 'Yes, Unblock & Fine',
      confirmClass: 'bg-blue-600 hover:bg-blue-700',
      onConfirm: async () => {
        try {
          setLoadingEmergencies(true);
          const response = await fetch('/api/users/block', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              doctorEmail: doctorData.email,
              doctorName: doctorData.name
            })
          });
          const data = await response.json();
          if (data.success) {
            showToast(`User unblocked. Penalty collected: ${data.penaltyCollected} pts`, 'success');
            fetchEmergencyAlerts();
            fetchCollectedPoints();
          } else {
            showToast(data.error || 'Failed to unblock user', 'error');
          }
        } catch (error) {
          showToast('Error unblocking user', 'error');
        } finally {
          setLoadingEmergencies(false);
        }
      }
    });
  };


  
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointments?doctorEmail=${encodeURIComponent(doctorData.email)}`);
      const data = await response.json();

      if (data.success) {
        
        const doctorAppointments = data.data
          .filter(apt => apt.doctorEmail?.toLowerCase() === doctorData.email?.toLowerCase())
          .map(apt => {
            
            if (typeof apt.medicines === 'string') {
              try {
                apt.medicines = JSON.parse(apt.medicines || '[]');
              } catch (e) {
                apt.medicines = [];
              }
            }
            return apt;
          });
        setAppointments(doctorAppointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const fetchAllPetProfiles = async () => {
    try {
      const response = await fetch('/api/pet-profiles');
      const data = await response.json();
      if (data.success) {
        setPetProfiles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pet profiles:', error);
    }
  };

  
  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        showToast(`Appointment status updated to ${newStatus.toUpperCase()}!`);
        fetchAppointments(); 
      } else {
        showToast('Failed to update status: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error updating status', 'error');
    } finally {
      setLoading(false);
    }
  };

  
  const openBillingModal = async (appointment) => {
    setSelectedBillingAppointment(appointment);
    try {
      const res = await fetch(`/api/users/points?email=${encodeURIComponent(appointment.ownerEmail)}&name=${encodeURIComponent(appointment.ownerName)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setUserPointsBalance(data.data.points);
      }
    } catch (e) { console.error('Error fetching points', e); }

    setPointsToDeduct('');
    setShowBillingModal(true);
  };

  const handleDeductPoints = async () => {
    if (!pointsToDeduct || pointsToDeduct <= 0) return;
    if (pointsToDeduct > userPointsBalance) {
      showToast("Cannot deduct more points than the user has available.", 'warning');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/users/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedBillingAppointment.ownerEmail,
          name: selectedBillingAppointment.ownerName,
          pointsToAdd: -Math.abs(pointsToDeduct)
        })
      });
      const data = await res.json();
      if (data.success) {
        
        try {
          await fetch('/api/collected-points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: selectedBillingAppointment.ownerEmail,
              userName: selectedBillingAppointment.ownerName,
              petName: selectedBillingAppointment.petName,
              doctorEmail: doctorData.email,
              doctorName: doctorData.name,
              points: Math.abs(pointsToDeduct),
              petIssue: selectedBillingAppointment.petProblem,
              appointmentId: selectedBillingAppointment.id
            })
          });
        } catch (postErr) {
          console.warn('Failed to post collected points log', postErr);
        }

        
        try {
          await fetch('/api/appointments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selectedBillingAppointment.id,
              pointsDeducted: true
            })
          });
        } catch (patchErr) {
          console.warn('Failed to update pointsDeducted flag', patchErr);
        }

        showToast('Points deducted successfully!');
        fetchAppointments(); 
        fetchCollectedPoints(); 
        setUserPointsBalance(data.data.points);
        setPointsToDeduct('');
        setShowBillingModal(false);
      } else {
        showToast('Failed to deduct points: ' + data.error, 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error deducting points.', 'error');
    } finally {
      setLoading(false);
    }
  };

  
  const generateUpdatedPDF = async (appointment) => {
    const doc = new jsPDF({ compress: true });
    const logoBase64 = await getImageBase64('/logo2.png', 400); 

    
    let petDetails = {};
    try {
      petDetails = appointment.petProfileDetails ? JSON.parse(appointment.petProfileDetails) : {};
    } catch (e) { petDetails = {}; }

    
    let medicines = [];
    try {
      medicines = typeof appointment.medicines === 'string' ? JSON.parse(appointment.medicines) : (appointment.medicines || []);
    } catch (e) { medicines = []; }

    
    doc.setFillColor(20, 150, 127);
    doc.rect(0, 0, 210, 40, 'F');
    doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20, undefined, 'FAST');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('APPOINTMENT REPORT', 105, 25, { align: 'center' });

    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const clinicName = 'Vet Meds Care Center';
    const clinicAddress = 'karve Naka, Karad, Maharashtra 415110';
    doc.text(clinicName, 195, 50, { align: 'right' });
    doc.text(clinicAddress, 195, 55, { align: 'right' });
    doc.text('Contact: +91 9876543210', 195, 60, { align: 'right' });

    
    doc.setFontSize(14);
    doc.setTextColor(20, 150, 127);
    doc.setFont(undefined, 'bold');
    doc.text(`Status: ${appointment.status?.toUpperCase()}`, 20, 65);

    
    if (appointment.pointsCollected) {
      doc.setFontSize(9);
      doc.setTextColor(219, 39, 119); 
      doc.text(`Kind Soulness Contribution: ${appointment.pointsCollected} Points`, 195, 65, { align: 'right' });
      doc.setTextColor(0, 0, 0); 
    }

    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    
    doc.text(`Doctor: ${appointment.doctorName.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`}`, 20, 80);
    doc.text(`Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, 190, 80, { align: 'right' });

    
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

    
    if (medicines.length > 0) {
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
      medicines.forEach((med) => {
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

    
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(20, 150, 127);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VetMeds - Your Trusted Pet Health Partner', 105, pageHeight - 7, { align: 'center' });

    doc.save(`VetMeds_Report_${appointment.petName}_${appointment.id}.pdf`);
  };

  
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      showToast('Logging out...', 'info');
      localStorage.removeItem('doctorAuth');
      router.push('/doctor-login');
    }
  };

  
  const viewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  
  const getFilteredAppointments = () => {
    if (activeTab === 'all-appointments') {
      return appointments.filter(apt => apt.status === 'pending');
    } else if (activeTab === 'previous') {
      return appointments.filter(apt =>
        apt.status === 'confirmed' || apt.status === 'completed' || apt.status === 'cancelled'
      );
    }
    return appointments;
  };

  
  const medicineCategories = {
    animals: [
      {
        name: 'Dog',
        diseases: {
          'Fever & Pain': [
            { id: 1, name: 'Paracetamol (Vebol)', type: 'Syrup/Tab' },
            { id: 2, name: 'Meloxicam', type: 'Anti-inflammatory' },
            { id: 105, name: 'Carprofen', type: 'NSAID' }
          ],
          'Bacterial Infection': [
            { id: 3, name: 'Amoxicillin', type: 'Antibiotic' },
            { id: 7, name: 'Erythromycin', type: 'Antibiotic' },
            { id: 106, name: 'Cephalexin', type: 'Antibiotic' }
          ],
          'Ticks & Fleas': [
            { id: 6, name: 'Bravecto', type: 'Chewable' },
            { id: 107, name: 'Frontline Plus', type: 'Spot-on' },
            { id: 108, name: 'Simparica Trio', type: 'Tablet' }
          ],
          'Digestive Issues': [
            { id: 4, name: 'Ondansetron (Omet)', type: 'Vomiting' },
            { id: 5, name: 'Digene', type: 'Antacid' },
            { id: 109, name: 'Metrobactin', type: 'Diarrhea' }
          ],
          'Skin Allergies': [
            { id: 8, name: 'Prednisolone', type: 'Steroid' },
            { id: 110, name: 'Apoquel', type: 'Anti-itch' }
          ],
          'Weakness & Vitamins': [
            { id: 10, name: 'Vitamin B-Complex', type: 'Syrup' },
            { id: 111, name: 'Nutri-plus Gel', type: 'Supplement' }
          ]
        }
      },
      {
        name: 'Cat',
        diseases: {
          'Fever & Pain': [
            { id: 20, name: 'Cat Fever Relief', type: 'Syrup' },
            { id: 24, name: 'Gabapentin', type: 'Pain/Anxiety' }
          ],
          'Digestive/Diarrhea': [
            { id: 21, name: 'Metrobactin', type: 'Antibiotic' },
            { id: 112, name: 'Pro-Kolin', type: 'Probiotic' }
          ],
          'URI (Respiratory)': [
            { id: 22, name: 'Clavamox', type: 'Antibiotic' },
            { id: 113, name: 'Doxycycline', type: 'Antibiotic' }
          ],
          'Parasites': [
            { id: 25, name: 'Frontline', type: 'Spot-on' },
            { id: 114, name: 'Revolution Plus', type: 'Spot-on' }
          ]
        }
      },
      {
        name: 'Cow & Buffalo',
        diseases: {
          'Fever/Pain': [
            { id: 40, name: 'Nimesulide + Paracetamol', type: 'Inj/Bolus' },
            { id: 115, name: 'Ketoprofen', type: 'Injection' }
          ],
          'HS/BQ (Bacterial)': [
            { id: 41, name: 'Oxytetracycline', type: 'Antibiotic' },
            { id: 116, name: 'Enrofloxacin', type: 'Antibiotic' }
          ],
          'Foot & Mouth (FMD)': [
            { id: 43, name: 'Topicure Spray', type: 'Wound Care' },
            { id: 117, name: 'KMNO4 Solution', type: 'Antiseptic' }
          ],
          'Mastitis': [
            { id: 118, name: 'Pendistrin-SH', type: 'Intramammary' },
            { id: 119, name: 'Ceftiofur', type: 'Injection' }
          ],
          'Digestive/Bloat': [
            { id: 120, name: 'Afanil', type: 'Anti-bloat' },
            { id: 121, name: 'Himalayan Batisa', type: 'Digestive' }
          ]
        }
      },
      {
        name: 'Sheep & Goat',
        diseases: {
          'Fever/PPR': [
            { id: 60, name: 'Fever-Vet', type: 'Syrup' },
            { id: 61, name: 'Enrofloxacin', type: 'Antibiotic' }
          ],
          'Diarrhea/Worms': [
            { id: 62, name: 'Safelee (Fenbendazole)', type: 'Dewormer' },
            { id: 122, name: 'Albendazole', type: 'Dewormer' }
          ],
          'Ectoparasites (Mange)': [
            { id: 123, name: 'Ivermectin Injection', type: 'Parasiticide' },
            { id: 124, name: 'Butox', type: 'Liquid' }
          ]
        }
      },
      {
        name: 'Pig',
        diseases: {
          'Swine Fever/Infection': [
            { id: 70, name: 'Sulfadiazine + Trimethoprim', type: 'Antibiotic' },
            { id: 125, name: 'Tylosin', type: 'Antibiotic' }
          ],
          'Anemia (Piglets)': [
            { id: 71, name: 'Iron Dextran (Imferon)', type: 'Injection' }
          ]
        }
      },
      {
        name: 'Rabbit',
        diseases: {
          'Snuffles (Respiratory)': [{ id: 80, name: 'Baytril (Enrofloxacin)', type: 'Antibiotic' }],
          'Coccidiosis': [{ id: 81, name: 'Amprolium', type: 'Water soluble' }],
          'Skin Scurf': [{ id: 126, name: 'Ivermectin Oral', type: 'Dewormer' }]
        }
      }
    ],
    birds: [
      {
        name: 'Poultry (Chicken)',
        diseases: {
          'Respiratory (CRD)': [
            { id: 31, name: 'Baytril 10%', type: 'Antibiotic' },
            { id: 127, name: 'Tylosin Tartrate', type: 'Antibiotic' }
          ],
          'Coccidiosis': [{ id: 128, name: 'Supercox', type: 'Medicine' }],
          'Growth/Immunity': [
            { id: 91, name: 'V-Stim', type: 'Multivitamin' },
            { id: 129, name: 'Vimeral', type: 'Supplement' }
          ]
        }
      },
      {
        name: 'Pigeon',
        diseases: {
          'Canker (Trichomoniasis)': [{ id: 95, name: 'Metronidazole', type: 'Tablet' }],
          'Worming': [{ id: 130, name: 'Worm-Out', type: 'Syrup' }],
          'General Health': [{ id: 96, name: 'Bird-Immune', type: 'Supplement' }]
        }
      },
      {
        name: 'Parrot/Lovebird',
        diseases: {
          'Egg Binding': [{ id: 33, name: 'Calcium-Gluconate', type: 'Supplement' }],
          'Feather Problems': [{ id: 98, name: 'Multi-Vit Drops', type: 'Supplement' }],
          'Diarrhea': [{ id: 131, name: 'Bird-Safe Antibiotic', type: 'Liquid' }]
        }
      }
    ]
  };

  
  const getFilteredMedicineOptions = () => {
    
    if (medicineSearch) {
      const allMedicines = [];
      [...medicineCategories.animals, ...medicineCategories.birds].forEach(cat => {
        Object.values(cat.diseases).forEach(meds => {
          allMedicines.push(...meds.map(m => ({ ...m, species: cat.name })));
        });
      });
      return allMedicines.filter(m =>
        m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        (m.type && m.type.toLowerCase().includes(medicineSearch.toLowerCase())) ||
        (m.species && m.species.toLowerCase().includes(medicineSearch.toLowerCase()))
      );
    }

    
    if (selectedDisease && selectedSubCategory && selectedCategory) {
      const subCat = medicineCategories[selectedCategory].find(c => c.name === selectedSubCategory);
      return subCat?.diseases[selectedDisease] || [];
    }

    return [];
  };

  
  const openMedicineModal = (appointment) => {
    setSelectedMedicineAppointment(appointment);

    
    const species = (appointment.petProfileDetails ?
      JSON.parse(appointment.petProfileDetails).species?.toLowerCase() :
      'other') || 'other';

    
    let found = false;
    for (const cat of ['animals', 'birds']) {
      const match = medicineCategories[cat].find(c =>
        c.name.toLowerCase().includes(species.toLowerCase()) ||
        species.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        setSelectedCategory(cat);
        setSelectedSubCategory(match.name);
        found = true;
        break;
      }
    }

    if (!found) {
      setSelectedCategory(null);
      setSelectedSubCategory(null);
    }
    setSelectedDisease(null);

    
    let existingMedicines = [];
    try {
      if (Array.isArray(appointment.medicines)) {
        existingMedicines = appointment.medicines;
      } else if (typeof appointment.medicines === 'string') {
        existingMedicines = JSON.parse(appointment.medicines || '[]');
      } else {
        existingMedicines = [];
      }
    } catch (e) {
      existingMedicines = [];
    }
    setMedicines(existingMedicines);
    setShowMedicineModal(true);
  };

  
  const addMedicine = (medicine) => {
    setMedicines(prev => [...prev, { ...medicine, dosage: '', duration: '' }]);
    showToast(`${medicine.name} added to prescription`, 'success');
  };

  
  const updateMedicine = (index, field, value) => {
    setMedicines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  
  const removeMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  
  const saveMedicines = async () => {
    if (!selectedMedicineAppointment) return;

    try {
      setLoading(true);
      const response = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMedicineAppointment.id,
          medicines: medicines
        })
      });

      const data = await response.json();

      if (data.success) {
        showToast('Medicines saved successfully!');
        setShowMedicineModal(false);
        fetchAppointments(); 
      } else {
        showToast('Failed to save medicines: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error saving medicines:', error);
      showToast('Error saving medicines', 'error');
    } finally {
      setLoading(false);
    }
  };

  
  const generatePrescriptionPDF = async (appointment) => {
    const doc = new jsPDF({ compress: true });
    const logoBase64 = await getImageBase64('/logo2.png', 400);

    
    doc.setFillColor(20, 150, 127);
    doc.rect(0, 0, 210, 40, 'F');
    doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20, undefined, 'FAST');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('MEDICAL PRESCRIPTION', 105, 25, { align: 'center' });

    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const clinicName = 'Vet Meds Care Center';
    const clinicAddress = 'karve Naka, Karad, Maharashtra 415110';
    doc.text(clinicName, 195, 50, { align: 'right' });
    doc.text(clinicAddress, 195, 55, { align: 'right' });
    doc.text('Contact: +91 9876543210', 195, 60, { align: 'right' });

    
    doc.setFontSize(30);
    doc.setTextColor(20, 150, 127);
    doc.text('Rx', 20, 65);

    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    const docName = appointment.doctorName.startsWith('Dr.') ? appointment.doctorName : `Dr. ${appointment.doctorName}`;
    doc.text(`Doctor: ${docName}`, 20, 80);
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
    let medList = [];
    try {
      medList = typeof appointment.medicines === 'string' ? JSON.parse(appointment.medicines) : (appointment.medicines || []);
    } catch (e) { medList = []; }

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

    
    yPos += 20;
    doc.setFont(undefined, 'bold');
    doc.text('General Advice:', 20, yPos);
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.text('1. Complete the full course of medicines.', 20, yPos);
    yPos += 5;
    doc.text('2. Ensure fresh water is always available for your pet.', 20, yPos);

    
    const pageHeight = doc.internal.pageSize.height;
    doc.line(140, pageHeight - 40, 190, pageHeight - 40);
    doc.setFont(undefined, 'bold');
    doc.text('Doctor Signature', 165, pageHeight - 35, { align: 'center' });

    
    doc.setFillColor(20, 150, 127);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('VetMeds - Your Trusted Pet Health Partner', 105, pageHeight - 7, { align: 'center' });

    doc.save(`Prescription_${appointment.petName}_${new Date().toLocaleDateString()}.pdf`);
  };

  
  if (!doctorData) {
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
    <div className="min-h-screen bg-[#fcf8ef]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1b3a34] text-[#fcf8ef] shadow-2xl transform transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16  flex items-center justify-center">
              <Image src={'/whitelogo.png'} alt='logo' width={100} height={100} className='w-20' />
            </div>
            <div>
              <h2 className="font-bold text-lg">{doctorData.name}</h2>
              <p className="text-xs text-[#fcf8ef]/80">
                {doctorData.email}
              </p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('home'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'home'
              ? 'bg-white text-[#1b3a34] shadow-lg'
              : 'hover:bg-white/10'
              }`}
          >
            <FaHome size={20} />
            <span className="font-semibold">Home</span>
          </button>
          <button
            onClick={() => { setActiveTab('all-appointments'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'all-appointments'
              ? 'bg-white text-[#1b3a34] shadow-lg'
              : 'hover:bg-white/10'
              }`}
          >
            <FaCalendarAlt size={20} />
            <span className="font-semibold">All Appointments</span>
            {appointments.filter(a => a.status === 'pending').length > 0 && (
              <span className="ml-auto bg-red-500 text-[#fcf8ef] text-xs px-2 py-1 rounded-full">
                {appointments.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('previous'); setSidebarOpen(false); }}
            className={`w-full flex gap-1 items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'previous'
              ? 'bg-white text-[#1b3a34] shadow-lg'
              : 'hover:bg-white/10'
              }`}
          >
            <FaHistory size={15} />
            <span className="font-semibold">Previous Appointments</span>
          </button>
          <button
            onClick={() => { setActiveTab('all-pets'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'all-pets'
              ? 'bg-white text-[#1b3a34] shadow-lg'
              : 'hover:bg-white/10'
              }`}
          >
            <FaPaw size={20} />
            <span className="font-semibold">All Pets</span>
          </button>
          <button
            onClick={() => { setActiveTab('emergency-sos'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'emergency-sos'
              ? 'bg-white text-[#1b3a34] shadow-lg'
              : 'hover:bg-red-500/30 text-red-50'
              }`}
          >
            <FaExclamationTriangle size={20} className={activeTab === 'emergency-sos' ? 'text-red-500' : 'text-red-200'} />
            <span className="font-semibold">Emergency</span>
            {emergencyAlerts.filter(e => e.status === 'pending').length > 0 && (
              <span className="ml-auto bg-red-600 text-[#fcf8ef] text-xs px-2 py-1 rounded-full animate-pulse">
                {emergencyAlerts.filter(e => e.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('collected-points'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'collected-points'
              ? 'bg-white text-[#1b3a34] shadow-lg'
              : 'hover:bg-white/10'
              }`}
          >
            <FaHandHoldingHeart size={20} className={activeTab === 'collected-points' ? 'text-[#1b3a34]' : 'text-yellow-400'} />
            <span className="font-semibold">Collected Points</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/20 transition-all mt-8"
          >
            <FaSignOutAlt size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </nav>
      </aside>
      <div className="md:ml-64 min-h-screen">
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-20 flex flex-row items-center justify-between shadow-sm border-b border-gray-100 px-4 py-2 sm:py-0 h-16 sm:h-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden bg-[#1b3a34] text-[#fcf8ef] p-2 rounded-xl shadow-md active:scale-95 transition-all"
            >
              {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>

            <div className="flex flex-col justify-center">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-[#1b3a34] tracking-tight leading-tight">
                {activeTab === 'home' && 'Home'}
                {activeTab === 'all-appointments' && 'Appointments'}
                {activeTab === 'previous' && 'History'}
                {activeTab === 'all-pets' && 'Pets'}
                {activeTab === 'emergency-sos' && 'emergency'}
                {activeTab === 'collected-points' && 'Points'}
              </h1>
              <p className="text-[#1b3a34]/40 text-[9px] font-bold uppercase tracking-widest hidden xs:block">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center ">
            <div className=" flex items-center mr-4">
              <Image src={'/logo1.png'} alt="logo" width={120} height={100} className="w-40 h-auto object-contain " />
            </div>

            <div className="flex items-center ">

              <div className="relative">
                <Image
                  src={'/doc.png'}
                  alt="doctor"
                  width={100}
                  height={100}
                  className="md:w-32 w-25 lg:w-32  object-cover"
                />
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Pending</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {appointments.filter(a => a.status === 'pending').length}
                      </p>

                    </div>
                    <Image src={'/wait.png'} alt='dog' width={100} height={100} className='w-30' />

                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Confirmed</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {appointments.filter(a => a.status === 'confirmed').length}
                      </p>
                    </div>
                    <Image src={'/ok.png'} alt='dog' width={100} height={100} className='w-50' />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Completed</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {appointments.filter(a => a.status === 'completed').length}
                      </p>
                    </div>
                    <Image src={'/happy.png'} alt='dog' width={100} height={100} className='w-32' />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Cancelled</p>
                      <p className="text-3xl font-bold text-gray-800">
                        {appointments.filter(a => a.status === 'cancelled').length}
                      </p>
                    </div>
                    <Image src={'/can.png'} alt='dog' width={100} height={100} className='w-30' />
                  </div>

                </div>
              </div>
              <div className="bg-[#1b3a34] rounded-xl shadow-lg p-8 text-[#fcf8ef]">
                <h2 className="text-3xl font-bold mb-2">Welcome back, {doctorData.name}!</h2>
                <p className="text-lg">You have {appointments.filter(a => a.status === 'pending').length} pending appointments waiting for your attention.</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-[#1b3a34] mb-4">Recent Appointments</h3>
                {appointments.slice(0, 5).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No appointments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-bold text-gray-800">{apt.petName}</p>
                          <p className="text-sm text-gray-600">{new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {apt.status?.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {(activeTab === 'all-appointments' || activeTab === 'previous') && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b3a34] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading appointments...</p>
                </div>
              ) : getFilteredAppointments().length === 0 ? (
                <div className="text-center py-12">
                  <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No appointments found.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full table-auto">
                      <thead className="bg-[#1b3a34] text-[#fcf8ef]">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Pet Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Owner</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Problem</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Medicines</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getFilteredAppointments().map((apt, index) => (
                          <tr key={apt.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{apt.id}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{apt.petName}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{apt.ownerName}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {new Date(apt.appointmentDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{apt.appointmentTime}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              <span className="line-clamp-1">{apt.petProblem}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {apt.status?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {(apt.status === 'confirmed' || apt.status === 'completed') && (
                                <button
                                  onClick={() => openMedicineModal(apt)}
                                  className="w-9 h-9 flex items-center justify-center bg-[#1b3a34] text-[#fcf8ef] rounded-full hover:bg-[#0d7a6a] transition-all transform hover:scale-110 shadow-sm mx-auto"
                                  title="Add/View Medicines"
                                >
                                  <FaEye size={16} />
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center gap-2 flex-wrap">
                                {apt.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                      className="w-9 h-9 flex items-center justify-center bg-green-500 text-[#fcf8ef] rounded-full hover:bg-green-600 transition-all shadow-sm"
                                      title="Confirm"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                      className="w-9 h-9 flex items-center justify-center bg-red-500 text-[#fcf8ef] rounded-full hover:bg-red-600 transition-all shadow-sm"
                                      title="Cancel"
                                    >
                                      ✗
                                    </button>
                                  </>
                                )}
                                {apt.status === 'confirmed' && (
                                  <button
                                    onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                    className="w-9 h-9 flex items-center justify-center bg-blue-500 text-[#fcf8ef] rounded-full hover:bg-blue-600 transition-all shadow-sm"
                                    title="Mark Complete"
                                  >
                                    ✓
                                  </button>
                                )}
                                <button
                                  onClick={() => viewDetails(apt)}
                                  className="w-9 h-9 flex items-center justify-center bg-[#1b3a34] text-[#fcf8ef] rounded-full hover:bg-[#1b3a34] transition-all shadow-sm"
                                  title="View Details"
                                >
                                  <FaEye size={14} />
                                </button>
                                {(apt.status === 'confirmed' || apt.status === 'completed') && !apt.pointsDeducted && (
                                  <button
                                    onClick={() => openBillingModal(apt)}
                                    className="w-9 h-9 flex items-center justify-center bg-yellow-500 text-[#fcf8ef] rounded-full hover:bg-yellow-600 transition-all shadow-sm"
                                    title="Deduct Kind Soul Points (Billing)"
                                  >
                                    <FaHandHoldingHeart size={14} />
                                  </button>
                                )}
                                {(apt.status === 'completed' || (apt.medicines && apt.medicines.length > 0)) && (
                                  <button
                                    onClick={() => generatePrescriptionPDF(apt)}
                                    className="w-9 h-9 flex items-center justify-center bg-green-600 text-[#fcf8ef] rounded-full hover:bg-green-700 transition-all shadow-sm"
                                    title="Download Prescription"
                                  >
                                    <GiMedicines size={16} />
                                  </button>
                                )}
                                <button
                                  onClick={() => generateUpdatedPDF(apt)}
                                  className="w-9 h-9 flex items-center justify-center bg-purple-500 text-[#fcf8ef] rounded-full hover:bg-purple-600 transition-all shadow-sm"
                                  title="Download Full Report"
                                >
                                  <FaDownload size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {getFilteredAppointments().map((apt) => (
                      <div key={apt.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">#{apt.id}</p>
                            <h4 className="text-xl font-bold text-[#1b3a34]">{apt.petName}</h4>
                            <p className="text-sm text-gray-500 font-medium">{apt.ownerName}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {apt.status?.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-200/50">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-[#1b3a34]/40" size={14} />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                              <p className="text-sm font-bold text-gray-700">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-[#1b3a34]/40" size={14} />
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Time</p>
                              <p className="text-sm font-bold text-gray-700">{apt.appointmentTime}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reason for visit</p>
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed italic">"{apt.petProblem}"</p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                                className="flex-grow py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                                className="flex-grow py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                              className="flex-grow py-3 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => viewDetails(apt)}
                            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-[#1b3a34]"
                          >
                            <FaEye size={18} />
                            <span className="text-[8px] font-bold uppercase mt-1">View</span>
                          </button>

                          {(apt.status === 'confirmed' || apt.status === 'completed') && (
                            <button
                              onClick={() => openMedicineModal(apt)}
                              className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-[#1b3a34]"
                            >
                              <GiMedicines size={18} />
                              <span className="text-[8px] font-bold uppercase mt-1">Prescribe</span>
                            </button>
                          )}

                          {(apt.status === 'confirmed' || apt.status === 'completed') && !apt.pointsDeducted && (
                            <button
                              onClick={() => openBillingModal(apt)}
                              className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-yellow-600"
                            >
                              <FaHandHoldingHeart size={18} />
                              <span className="text-[8px] font-bold uppercase mt-1">Bill</span>
                            </button>
                          )}

                          <button
                            onClick={() => generateUpdatedPDF(apt)}
                            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-purple-600"
                          >
                            <FaDownload size={18} />
                            <span className="text-[8px] font-bold uppercase mt-1">Report</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === 'all-pets' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-[#1b3a34] mb-6">All Registered Pets</h3>
              {petProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <FaPaw className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No pet profiles found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {petProfiles.map((pet) => (
                    <div
                      key={pet.id}
                      className="bg-[#fcf8ef] rounded-xl shadow-md p-6 border-2 border-[#1b3a34]/10 hover:border-[#1b3a34]/50 hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => { setSelectedPet(pet); setShowPetModal(true); }}
                    >
                      <div className="w-full h-48 bg-white rounded-lg mb-4 border border-[#1b3a34]/10 overflow-hidden flex items-center justify-center">
                        {pet.petImageUrl ? (
                          <img
                            src={pet.petImageUrl}
                            alt={pet.petName}
                            className="w-full h-full object-contain group-hover:scale-[1.05] transition-transform duration-500"
                          />
                        ) : (
                          <FaPaw className="text-4xl text-[#1b3a34]/20" />
                        )}
                      </div>
                      <h4 className="text-2xl font-bold text-[#1b3a34] mb-2">{pet.petName}</h4>
                      <p className="text-[#1b3a34]/80 font-semibold mb-2">{pet.species} • {pet.breed || 'Mixed'}</p>
                      <div className="space-y-1 text-sm text-[#1b3a34]/90">
                        <p><span className="font-bold text-[#1b3a34] uppercase text-xs tracking-wider">Age:</span> {pet.age || 'N/A'} years</p>
                        <p><span className="font-bold text-[#1b3a34] uppercase text-xs tracking-wider">Gender:</span> {pet.gender || 'N/A'}</p>
                        <p><span className="font-bold text-[#1b3a34] uppercase text-xs tracking-wider">Owner:</span> {pet.ownerName}</p>
                        <p><span className="font-bold text-[#1b3a34] uppercase text-xs tracking-wider">Contact:</span> {pet.ownerContact || 'N/A'}</p>
                      </div>
                      <p className="mt-3 text-[10px] text-[#1b3a34] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-center">Tap to view full profile →</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'emergency-sos' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-red-600 flex items-center gap-2">
                  <FaExclamationTriangle /> Active Emergency Alerts
                </h3>
                <button
                  onClick={fetchEmergencyAlerts}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-all"
                >
                  Refresh Alerts
                </button>
              </div>

              {loadingEmergencies ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                </div>
              ) : emergencyAlerts.length === 0 ? (
                <div className="text-center py-12">
                  <FaCheckCircle className="text-6xl text-green-200 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No active emergencies. Good job!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {emergencyAlerts.map((sos) => (
                    <div key={sos.id} className={`p-6 rounded-2xl border-2 transition-all ${sos.status === 'pending' ? 'bg-red-50 border-red-200 shadow-md' : 'bg-gray-50 border-gray-200 opacity-75'
                      }`}>
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-grow space-y-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${sos.status === 'pending' ? 'bg-red-600 text-[#fcf8ef] animate-pulse' : 'bg-green-100 text-green-700'
                              }`}>
                              {sos.status?.toUpperCase()}
                            </span>
                            <span className="text-sm font-semibold text-gray-500">
                              {new Date(sos.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white/50 p-3 rounded-lg relative overflow-hidden group">
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Reported By</p>
                              <p className="font-bold text-gray-800">{sos.userName}</p>
                              <p className="text-sm text-[#1b3a34]">{sos.userEmail}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <FaHandHoldingHeart className="text-yellow-500" />
                                <span className="text-sm font-bold text-gray-700">{sos.userStatus?.points || 0} pts</span>
                              </div>
                              {sos.userStatus?.isBlocked && (
                                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                                  <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter flex items-center gap-1">
                                    <FaSkullCrossbones /> ACCOUNT RESTRICTED
                                  </p>
                                  {sos.userStatus?.blockedUntil && (
                                    <p className="text-[10px] text-red-500 font-medium">
                                      Until: {sos.userStatus.blockedUntil === '9999-12-31T23:59:59.999Z' ? 'PERMANENT' : new Date(sos.userStatus.blockedUntil).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            {sos.penalties && sos.penalties.length > 0 && (
                              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 overflow-y-auto max-h-[120px]">
                                <p className="text-[10px] text-orange-600 font-black uppercase tracking-wider mb-1">Previous Penalties</p>
                                {sos.penalties.map((penalty, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-1 border-b border-orange-100 last:border-0">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-gray-600">{new Date(penalty.createdAt).toLocaleDateString()}</span>
                                      {penalty.doctorName && <span className="text-[8px] text-orange-400 font-bold uppercase italic">By Dr. {penalty.doctorName}</span>}
                                    </div>
                                    <span className="text-xs font-bold text-red-600">-{penalty.amount} pts</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Incident Details</p>
                            <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm space-y-3">
                              <p className="text-gray-800 font-medium whitespace-pre-wrap italic">"{sos.description}"</p>

                              {sos.latitude && (
                                <div className="pt-2 border-t border-red-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 text-red-600">
                                    <FaMapMarkerAlt className="shrink-0" />
                                    <span className="text-sm font-bold">{sos.address || 'Location Shared'}</span>
                                  </div>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${sos.latitude},${sos.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-red-600 text-[#fcf8ef] text-xs font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm"
                                  >
                                    <FaMap /> VIEW ON GOOGLE MAPS
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-3 min-w-[200px]">
                          {sos.imageUrl && (
                            <div className="text-center lg:text-left">
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Emergency Photo</p>
                              <img
                                src={sos.imageUrl}
                                alt="Emergency Attachment"
                                className="w-full h-32 object-cover rounded-xl border-2 border-white shadow-md cursor-zoom-in hover:scale-105 transition-transform"
                                onClick={() => window.open(sos.imageUrl, '_blank')}
                              />
                            </div>
                          )}
                          {(doctorData.email === 'omkar@vetmeds.com') && sos.status === 'pending' && (
                            <button
                              onClick={() => resolveEmergency(sos.id)}
                              className="w-full py-3 bg-green-600 text-[#fcf8ef] font-bold rounded-xl shadow-md hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              <FaCheckCircle /> RESOLVE INCIDENT
                            </button>
                          )}
                          {(doctorData.email === 'omkar@vetmeds.com') && (
                            sos.userStatus?.isBlocked ? (
                              <button
                                onClick={() => handleUnblockUser(sos.userEmail)}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm"
                              >
                                <FaShieldAlt /> UNBLOCK & FINE
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUserToBlock(sos.userEmail);
                                  setShowBlockModal(true);
                                }}
                                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-sm"
                              >
                                <FaSkullCrossbones /> RESTRICT ACCOUNT
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'collected-points' && (
            <div className="space-y-6">
              <div className="bg-[#1b3a34] rounded-xl shadow-lg p-8 text-[#fcf8ef] flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <FaHandHoldingHeart className="text-yellow-400" /> Collected Points Ledger
                  </h2>
                  <p className="text-lg opacity-90">Points collected from patient check-ups waiting to be transferred.</p>
                </div>
                <div className="text-center bg-white/10 p-6 rounded-xl border border-white/20 min-w-[200px]">
                  <p className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-1">Active Total</p>
                  <p className="text-5xl font-bold">
                    {collectedPointsData.filter(p => p.status === 'collected' || p.status === 'penalty' || (doctorData.email === 'omkar@vetmeds.com' && p.status === 'transferred')).reduce((sum, item) => sum + item.points, 0)}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                  <h3 className="text-2xl font-bold text-[#1b3a34]">Points History</h3>
                  {doctorData.email !== 'omkar@vetmeds.com' && (
                    <button
                      onClick={handleTransferPoints}
                      disabled={collectedPointsData.filter(p => p.status === 'collected').length === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-md hover:shadow-xl hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send to Boss
                    </button>
                  )}
                </div>

                {loadingCollectedPoints ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b3a34] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading records...</p>
                  </div>
                ) : collectedPointsData.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <FaHandHoldingHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No points collected yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-bold rounded-tl-lg">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-bold">Patient</th>
                          <th className="px-4 py-3 text-left text-sm font-bold">Owner</th>
                          <th className="px-4 py-3 text-left text-sm font-bold">Issue</th>
                          {doctorData.email === 'omkar@vetmeds.com' && (
                            <th className="px-4 py-3 text-left text-sm font-bold">Collected By</th>
                          )}
                          <th className="px-4 py-3 text-center text-sm font-bold">Points</th>
                          <th className="px-4 py-3 text-center text-sm font-bold rounded-tr-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {collectedPointsData.map((pt, index) => (
                          <tr key={pt.id || index} className={`hover:bg-gray-50 transition-colors ${pt.status === 'penalty' ? 'bg-red-50/50' : ''}`}>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(pt.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900">{pt.petName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{pt.userName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={pt.petIssue}>
                              {pt.status === 'penalty' && <FaExclamationTriangle className="inline mr-1 text-red-500" />} {pt.petIssue}
                            </td>
                            {doctorData.email === 'omkar@vetmeds.com' && (
                              <td className="px-4 py-3 text-sm font-semibold text-[#1b3a34]">{pt.doctorName}</td>
                            )}
                            <td className="px-4 py-3 text-center">
                              <span className={`font-bold ${pt.status === 'penalty' ? 'text-red-600' : 'text-green-600'}`}>
                                {pt.status === 'penalty' ? '' : '+'}{pt.points}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${pt.status === 'transferred' ? 'bg-blue-100 text-blue-700' :
                                pt.status === 'penalty' ? 'bg-red-600 text-white' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                {pt.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {showPetModal && selectedPet && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowPetModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1b3a34] text-[#fcf8ef] p-5 sm:p-6 flex items-center justify-between shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <FaPaw size={20} className="text-yellow-400" /> {selectedPet.petName}'s Profile
              </h2>
              <button onClick={() => setShowPetModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all text-2xl font-bold">×</button>
            </div>

            
            <div className="overflow-y-auto p-5 sm:p-8 space-y-6 bg-gray-50/40">
              <div className="w-full h-80 bg-white rounded-2xl border border-[#1b3a34]/10 shadow-sm overflow-hidden flex items-center justify-center">
                {selectedPet.petImageUrl ? (
                  <img
                    src={selectedPet.petImageUrl}
                    alt={selectedPet.petName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <FaPaw className="text-6xl text-[#1b3a34]/10" />
                )}
              </div>

              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[['Name', selectedPet.petName], ['Species', selectedPet.species], ['Breed', selectedPet.breed || 'Mixed'], ['Gender', selectedPet.gender || 'N/A'], ['Age', selectedPet.age ? `${selectedPet.age} yrs` : 'N/A'], ['Weight', selectedPet.weight || 'N/A'], ['Color / Markings', selectedPet.colorMarkings || 'N/A'], ['Date of Birth', selectedPet.dateOfBirth || 'N/A'], ['Last Vet Visit', selectedPet.lastVetVisitDate || 'N/A']].map(([label, val]) => (
                  <div key={label} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="font-bold text-[#1b3a34] text-sm">{val}</p>
                  </div>
                ))}
              </div>

              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Medical &amp; Health</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Allergies: </span><span className="text-gray-600">{selectedPet.allergies || 'None'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Chronic Conditions: </span><span className="text-gray-600">{selectedPet.chronicConditions || 'None'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Current Medications: </span><span className="text-gray-600">{selectedPet.currentMedications || 'None'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Vaccination Records: </span><span className="text-gray-600">{selectedPet.vaccinationRecords || 'N/A'}</span></div>
                </div>
              </div>

              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Lifestyle &amp; Care</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Diet: </span><span className="text-gray-600">{selectedPet.dietType || 'N/A'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Exercise Level: </span><span className="text-gray-600">{selectedPet.exerciseLevel || 'N/A'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Favorite Activities: </span><span className="text-gray-600">{selectedPet.favoriteActivities || 'N/A'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Behavior Notes: </span><span className="text-gray-600">{selectedPet.behaviorNotes || 'N/A'}</span></div>
                </div>
              </div>

              
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Owner Information</h3>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Name: </span><span className="text-gray-600">{selectedPet.ownerName}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Contact: </span><span className="text-gray-600">{selectedPet.ownerContact || 'N/A'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Email: </span><span className="text-blue-600">{selectedPet.ownerEmail || 'N/A'}</span></div>
                  <div><span className="font-bold text-[#1b3a34] text-xs uppercase">Address: </span><span className="text-gray-600">{selectedPet.address || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            
            <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowPetModal(false)} className="px-8 py-3 bg-[#1b3a34] text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      
      {confirmConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-gray-100">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">{confirmConfig.icon}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{confirmConfig.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{confirmConfig.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmConfig(null)}
                className="py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { confirmConfig.onConfirm(); setConfirmConfig(null); }}
                className={`py-3 text-white font-bold rounded-2xl shadow-lg transition-all ${confirmConfig.confirmClass}`}
              >
                {confirmConfig.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-red-50">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
                <FaSkullCrossbones />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Restrict Account?</h2>
              <p className="text-gray-500 text-sm mt-2">Restricting <b>{selectedUserToBlock}</b> will prevent them from sending emergency alerts.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Restriction Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: '7', label: '7 Days' },
                    { val: '30', label: '30 Days' },
                    { val: 'perm', label: 'Permanent' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setBlockDuration(opt.val)}
                      className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${blockDuration === opt.val
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-red-200'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reason for Restriction</label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Repeated false emergency reports..."
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm focus:border-red-500 focus:ring-0 transition-all outline-none h-24 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                onClick={() => setShowBlockModal(false)}
                className="py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={isBlocking}
                className="py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg hover:shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBlocking ? 'Processing...' : 'Confirm Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-[#1b3a34] text-[#fcf8ef] p-5 sm:p-6 flex items-center justify-between shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <FaCalendarAlt size={20} className="text-yellow-400" /> Appointment Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Appointment ID</p>
                  <p className="font-extrabold text-lg text-[#1b3a34]">#{selectedAppointment.id}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Status</p>
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold ${selectedAppointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    selectedAppointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {selectedAppointment.status?.toUpperCase()}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Pet Name</p>
                  <p className="font-extrabold text-xl text-[#1b3a34]">{selectedAppointment.petName}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Owner</p>
                  <p className="font-bold text-lg text-gray-700">{selectedAppointment.ownerName}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Scheduled For</p>
                  <p className="font-bold text-gray-700">
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    <span className="block text-sm text-[#1b3a34] mt-0.5">at {selectedAppointment.appointmentTime}</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Contact Email</p>
                  <p className="font-medium text-blue-600 underline decoration-blue-200">{selectedAppointment.ownerEmail}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Chief Complaint / Reason</p>
                <p className="text-gray-700 leading-relaxed italic border-l-4 border-[#1b3a34]/20 pl-4 py-1">"{selectedAppointment.petProblem}"</p>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-8 py-3 bg-[#1b3a34] text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      
      {showBillingModal && selectedBillingAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-yellow-500 text-white p-5 sm:p-6 flex items-center justify-between shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <FaHandHoldingHeart className="animate-bounce" /> Kind Soul Billing
              </h2>
              <button
                onClick={() => setShowBillingModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
              <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100 shadow-inner">
                <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1 tracking-widest">Patient / Owner</p>
                <p className="font-extrabold text-lg text-gray-800">{selectedBillingAppointment.petName} <span className="text-gray-400 font-medium">({selectedBillingAppointment.ownerName})</span></p>

                <div className="mt-4 pt-4 border-t border-yellow-200/50">
                  <p className="text-[10px] font-bold text-yellow-600 uppercase mb-1 tracking-widest">Available Balance</p>
                  <p className="font-black text-4xl text-red-500">{userPointsBalance} <span className="text-sm font-bold uppercase">pts</span></p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 tracking-tight">Points to Deduct</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={userPointsBalance}
                    value={pointsToDeduct}
                    onChange={(e) => setPointsToDeduct(e.target.value)}
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-500 focus:bg-white outline-none transition-all text-3xl font-black text-[#1b3a34]"
                    placeholder="0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">PTS</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic">Enter points for check-up or prescribed medicines</p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleDeductPoints}
                  disabled={loading || !pointsToDeduct || pointsToDeduct <= 0 || pointsToDeduct > userPointsBalance}
                  className="w-full py-5 bg-yellow-500 text-white font-black text-xl rounded-2xl shadow-lg hover:shadow-2xl hover:bg-yellow-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>Confirm</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showMedicineModal && selectedMedicineAppointment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="bg-[#1b3a34] text-[#fcf8ef] p-4 sm:p-6 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl">
                  <GiMedicines size={24} className="text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold leading-none">Prescription</h2>
                  <p className="text-xs text-white/60 mt-1 uppercase tracking-widest font-bold">Patient: {selectedMedicineAppointment.petName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMedicineModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-all text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 sm:p-8 bg-gray-50/30">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="relative">
                      <FaUserMd className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1b3a34]/30" />
                      <input
                        type="text"
                        placeholder="Search medicines, diseases, or categories..."
                        value={medicineSearch}
                        onChange={(e) => setMedicineSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-[#1b3a34] focus:bg-white outline-none transition-all font-medium"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                        {!selectedCategory ? 'Medical Category' :
                          !selectedSubCategory ? 'Select Species' :
                            !selectedDisease ? `${selectedSubCategory} Conditions` :
                              `${selectedDisease} Therapeutics`}
                      </h3>
                      {(selectedCategory || selectedSubCategory || selectedDisease) && (
                        <button
                          onClick={() => {
                            if (selectedDisease) setSelectedDisease(null);
                            else if (selectedSubCategory) setSelectedSubCategory(null);
                            else setSelectedCategory(null);
                          }}
                          className="text-xs bg-[#1b3a34] text-white px-3 py-1.5 rounded-lg hover:shadow-md active:scale-95 transition-all font-bold"
                        >
                          ← BACK
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      
                      {!selectedCategory && !medicineSearch && (
                        <>
                          <button
                            onClick={() => setSelectedCategory('animals')}
                            className="p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#1b3a34] hover:bg-white transition-all text-center flex flex-col items-center gap-3 group"
                          >
                            <div className="w-14 h-14 bg-[#1b3a34] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                              <FaPaw size={28} />
                            </div>
                            <p className="font-black text-gray-800">Animals</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Dogs, Cats, Cattle</p>
                          </button>
                          <button
                            onClick={() => setSelectedCategory('birds')}
                            className="p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#1b3a34] hover:bg-white transition-all text-center flex flex-col items-center gap-3 group"
                          >
                            <div className="w-14 h-14 bg-[#1b3a34] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                              <FaEye size={28} />
                            </div>
                            <p className="font-black text-gray-800">Birds</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Poultry, Exotic, Domestic</p>
                          </button>
                        </>
                      )}

                      
                      {selectedCategory && !selectedSubCategory && !medicineSearch && (
                        medicineCategories[selectedCategory].map((sub) => (
                          <button
                            key={sub.name}
                            onClick={() => setSelectedSubCategory(sub.name)}
                            className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#1b3a34] hover:bg-white transition-all text-left flex items-center justify-between group"
                          >
                            <div>
                              <p className="font-black text-gray-800">{sub.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{Object.keys(sub.diseases).length} Types</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1b3a34] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                              →
                            </div>
                          </button>
                        ))
                      )}

                      
                      {selectedSubCategory && !selectedDisease && !medicineSearch && (
                        Object.keys(medicineCategories[selectedCategory].find(c => c.name === selectedSubCategory).diseases).map((disease) => (
                          <button
                            key={disease}
                            onClick={() => setSelectedDisease(disease)}
                            className="p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-[#1b3a34] hover:bg-white transition-all text-left flex items-center justify-between group"
                          >
                            <p className="font-bold text-gray-700 leading-tight">{disease}</p>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1b3a34] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm shrink-0">
                              →
                            </div>
                          </button>
                        ))
                      )}

                      
                      {(selectedDisease || medicineSearch) && (
                        getFilteredMedicineOptions().map((medicine) => (
                          <button
                            key={medicine.id + medicine.name}
                            onClick={() => addMedicine(medicine)}
                            className="p-4 bg-blue-50/50 rounded-2xl border-2 border-transparent hover:border-[#1b3a34] hover:bg-white transition-all text-left relative overflow-hidden group"
                          >
                            <div className="flex justify-between items-center relative z-10">
                              <p className="font-bold text-gray-800 group-hover:text-[#1b3a34]">{medicine.name}</p>
                              <span className="text-[9px] bg-[#1b3a34] text-white px-2 py-0.5 rounded-full font-bold">{medicine.type}</span>
                            </div>
                            {medicine.species && <p className="text-[9px] text-gray-400 font-black uppercase mt-1 relative z-10">{medicine.species}</p>}
                            <div className="absolute right-2 bottom-2 text-3xl font-black text-[#1b3a34]/5 group-hover:text-[#1b3a34]/10 transition-colors">+</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                      Manual Prescription Entry
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="Medicine Name"
                        value={customMedicine.name}
                        onChange={(e) => setCustomMedicine({ ...customMedicine, name: e.target.value })}
                        className="flex-grow p-4 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-[#1b3a34] focus:bg-white outline-none transition-all text-sm font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Type (Syrup/Tab)"
                        value={customMedicine.type}
                        onChange={(e) => setCustomMedicine({ ...customMedicine, type: e.target.value })}
                        className="sm:w-40 p-4 bg-gray-50 border-2 border-gray-50 rounded-xl focus:border-[#1b3a34] focus:bg-white outline-none transition-all text-sm font-bold"
                      />
                      <button
                        onClick={() => {
                          if (!customMedicine.name) return;
                          addMedicine(customMedicine);
                          setCustomMedicine({ name: '', type: '', disease: '' });
                        }}
                        className="px-8 py-4 bg-[#1b3a34] text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all shrink-0"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>

                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-black text-[#1b3a34] tracking-tight uppercase">Order Summary</h3>
                      <span className="bg-red-50 text-red-600 font-black text-sm px-3 py-1 rounded-full">{medicines.length}</span>
                    </div>

                    <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                      {medicines.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                          <GiMedicines size={64} className="mb-4 text-gray-300" />
                          <p className="text-gray-500 font-bold">No medications<br />prescribed yet</p>
                        </div>
                      ) : (
                        medicines.map((medicine, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative group animate-slideRight">
                            <button
                              onClick={() => removeMedicine(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-90"
                            >
                              ×
                            </button>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-black text-[#1b3a34] leading-tight">{medicine.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{medicine.type}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-tighter">Dosage</label>
                                <input
                                  type="text"
                                  value={medicine.dosage || ''}
                                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                  placeholder="1 daily"
                                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:border-[#1b3a34] outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase block tracking-tighter">Duration</label>
                                <input
                                  type="text"
                                  value={medicine.duration || ''}
                                  onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                  placeholder="5 days"
                                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:border-[#1b3a34] outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white border-t border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px] text-center sm:text-left">
                  Please review all medications before finalizing this prescription.
                </p>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
                  <button
                    onClick={() => setShowMedicineModal(false)}
                    className="flex-grow sm:flex-none px-4 sm:px-8 py-3 sm:py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all text-sm sm:text-base"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  {medicines.length > 0 && (
                    <button
                      onClick={() => generatePrescriptionPDF({ ...selectedMedicineAppointment, medicines })}
                      className="flex-grow sm:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white rounded-2xl font-bold hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FaDownload /> Prescription
                    </button>
                  )}
                  <button
                    onClick={saveMedicines}
                    className="flex-grow sm:flex-none px-6 sm:px-12 py-3 sm:py-4 bg-[#1b3a34] text-white rounded-2xl font-black shadow-xl hover:shadow-2xl active:scale-95 transition-all disabled:opacity-50 text-sm sm:text-base"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'SAVE & FINALIZE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
