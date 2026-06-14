"use client";
import React, { useState } from "react";
import { FaPaw, FaFeatherAlt, FaEdit, FaTrash, FaEye, FaCamera, FaUpload } from "react-icons/fa";
import { useToast } from "@/components/ToastProvider";
import Image from "next/image";

export default function ProfileClient({ initialProfiles, userEmail, userName }) {
  const [showForm, setShowForm] = useState(false);
  const [profiles, setProfiles] = useState(initialProfiles || []);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    petName: '', species: '', breed: '', gender: '', dateOfBirth: '',
    age: '', colorMarkings: '', weight: '', allergies: '', chronicConditions: '',
    currentMedications: '', vaccinationRecords: '', lastVetVisitDate: '',
    dietType: '', exerciseLevel: '', favoriteActivities: '', behaviorNotes: '',
    ownerName: userName || '', ownerContact: '', ownerEmail: userEmail || '', address: '', petImageUrl: ''
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();


  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchProfiles = async () => {
    try {
      if (!userEmail) return;
      const response = await fetch(`/api/pet-profiles?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      if (data.success) {
        setProfiles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (profile) => {
    setIsEditing(true);
    setEditingId(profile.id);
    setFormData({
      petName: profile.petName || '',
      species: profile.species || '',
      breed: profile.breed || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth || '',
      age: profile.age || '',
      colorMarkings: profile.colorMarkings || '',
      weight: profile.weight || '',
      allergies: profile.allergies || '',
      chronicConditions: profile.chronicConditions || '',
      currentMedications: profile.currentMedications || '',
      vaccinationRecords: profile.vaccinationRecords || '',
      lastVetVisitDate: profile.lastVetVisitDate || '',
      dietType: profile.dietType || '',
      exerciseLevel: profile.exerciseLevel || '',
      favoriteActivities: profile.favoriteActivities || '',
      behaviorNotes: profile.behaviorNotes || '',
      ownerName: profile.ownerName || userName || '',
      ownerContact: profile.ownerContact || '',
      ownerEmail: profile.ownerEmail || userEmail || '',
      address: profile.address || '',
      petImageUrl: profile.petImageUrl || ''
    });
    setUploadedImageUrl(profile.petImageUrl || '');
    setPreviewUrl(profile.petImageUrl || '');
    setShowForm(true);

    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      petName: '', species: '', breed: '', gender: '', dateOfBirth: '',
      age: '', colorMarkings: '', weight: '', allergies: '', chronicConditions: '',
      currentMedications: '', vaccinationRecords: '', lastVetVisitDate: '',
      dietType: '', exerciseLevel: '', favoriteActivities: '', behaviorNotes: '',
      ownerName: userName || '', ownerContact: '', ownerEmail: userEmail || '', address: '', petImageUrl: ''
    });
    setUploadedImageUrl('');
    setPreviewUrl('');
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalOwnerName = formData.ownerName?.trim() || userName || '';
      const finalOwnerEmail = formData.ownerEmail?.trim() || userEmail || '';

      const submissionData = {
        ...formData,
        id: editingId,
        ownerEmail: finalOwnerEmail,
        ownerName: finalOwnerName,
        petImageUrl: uploadedImageUrl || formData.petImageUrl || '',
      };

      if (!submissionData.petName || !submissionData.species || !finalOwnerName) {
        const missing = [];
        if (!submissionData.petName) missing.push('Pet Name');
        if (!submissionData.species) missing.push('Species');
        if (!finalOwnerName) missing.push('Owner Name');
        showToast(`Please fill in required fields: ${missing.join(', ')}`, 'warning');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/pet-profiles', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      const data = await response.json();

      if (data.success) {
        showToast(isEditing ? 'Pet profile updated successfully!' : 'Pet profile created successfully!');
        cancelEdit();
        fetchProfiles();
      } else {
        showToast(`Error: ${data.error || 'Failed to process request'}`, 'error');
      }
    } catch (error) {
      showToast('Error processing request: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const deleteProfile = async (id) => {
    if (!userEmail) {
      showToast('You must be logged in to delete profiles', 'error');
      return;
    }

    const profileToDelete = profiles.find(p => p.id === id);
    if (profileToDelete && profileToDelete.ownerEmail !== userEmail) {
      showToast('You can only delete your own pet profiles', 'error');
      return;
    }

    if (confirm('Are you sure you want to delete this profile?')) {
      try {
        const response = await fetch(`/api/pet-profiles?id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          showToast('Profile deleted successfully!');
          fetchProfiles();
        }
      } catch (error) {
        showToast('Error deleting profile', 'error');
      }
    }
  };

  const viewProfileDetails = (profile) => {
    setSelectedProfile(profile);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProfile(null);
  };

  const onSelectImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "petProfile");
    formData.append("folder", "petProfile");

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.secure_url) {
        setUploadedImageUrl(data.secure_url);
        setPreviewUrl(data.secure_url);
        showToast('Image uploaded successfully!');
      } else {
        showToast('Upload failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Error uploading image: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-5 text-3xl md:text-4xl font-bold justify-center mt-5">
        <h1 className="text-[#1b3a34]"><FaPaw /></h1>
        <h1 className="text-4xl font-bold text-[#1b3a34] hover:text-[#1b3a34]">
          PET<span className="text-[#1b3a34] hover:text-[#1b3a34]">PROFILE</span>
        </h1>
        <h1 className="text-[#1b3a34]"><FaFeatherAlt /></h1>
      </div>

      <div className="text-center mt-5 space-x-4">
        <button
          onClick={() => {
            if (isEditing) {
              cancelEdit();
            } else {
              setShowForm(!showForm);
            }
          }}
          className="px-6 py-3 bg-[#1b3a34] text-[#fcf8ef] font-medium rounded-lg shadow-md hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#1b3a34] focus:ring-opacity-50 cursor-pointer hover:bg-[#1b3a34] hover:hover:hover:scale-105"
        >
          {showForm ? (isEditing ? 'Cancel Edit' : 'Hide Form') : 'Create Pet Profile'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-10 bg-white rounded-xl shadow-lg p-6 border-2 border-[#1b3a34]/10 transition-all">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-[#1b3a34]">
              {isEditing ? `✏️ Edit Profile: ${formData.petName}` : '🐾 Create New Pet Profile'}
            </h1>
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          <h1 className="text-xl font-bold text-[#1b3a34]">Basic Information</h1>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name *</label>
              <input
                type="text"
                name="petName"
                value={formData.petName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-3 border border-gray-300 hover:scale-103 hover:shadow-2xl transition-all rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tommy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
              <input
                type="text"
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dog, Cat, Bird, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <input
                type="text"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Male, Female, Neutered/Spayed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color/Markings</label>
              <input
                type="text"
                name="colorMarkings"
                value={formData.colorMarkings}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Plain, Dots etc..."
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1b3a34]">📸 Pet Photo</h1>
          <div className="bg-gray-50 rounded-xl p-6 ">
            <div className="gap-6 ">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FaCamera className="inline mr-2" />
                  Pet Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1b3a34] transition-colors">
                  {(previewUrl || uploadedImageUrl) ? (
                    <div className="relative inline-block">
                      <Image
                        src={previewUrl || uploadedImageUrl}
                        alt="Pet preview"
                        width={200}
                        height={200}
                        className="mx-auto rounded-lg object-cover w-48 h-48"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageUrl('');
                          setPreviewUrl('');
                          setFormData(prev => ({ ...prev, petImageUrl: '' }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-[#fcf8ef] rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <FaCamera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Upload a photo of your pet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full mt-4 md:mt-10">
                <label htmlFor="pet-image-upload" className="w-full block cursor-pointer">
                  <input
                    id="pet-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={onSelectImage}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <div className="w-full px-6 py-3 bg-[#1b3a34] text-[#fcf8ef] font-medium rounded-lg shadow-md hover:shadow-xl transition-all text-center cursor-pointer">
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1b3a34]">🩺 Medical & Health Info</h1>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border border-gray-300 hover:scale-103 hover:shadow-2xl transition-all rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="20 kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Food allergies, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
              <input
                type="text"
                name="chronicConditions"
                value={formData.chronicConditions}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Diabetes, arthritis"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
              <input
                type="text"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Good, bad etc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Records</label>
              <input
                type="text"
                name="vaccinationRecords"
                value={formData.vaccinationRecords}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Vet Visit Date</label>
              <input
                type="date"
                name="lastVetVisitDate"
                value={formData.lastVetVisitDate}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1b3a34]">😺 Lifestyle & Care</h1>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diet Type</label>
              <input
                type="text"
                name="dietType"
                value={formData.dietType}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border border-gray-300 hover:scale-103 hover:shadow-2xl transition-all rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dry Food, Wet Food, Home-cooked, Raw Diet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Level</label>
              <input
                type="text"
                name="exerciseLevel"
                value={formData.exerciseLevel}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Low, Moderate, High"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Activities</label>
              <input
                type="text"
                name="favoriteActivities"
                value={formData.favoriteActivities}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Playing, Running etc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Behavior Notes</label>
              <input
                type="text"
                name="behaviorNotes"
                value={formData.behaviorNotes}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#1b3a34]">👤 Owner Information</h1>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder={userName || 'Enter owner name'}
                required
                className="mt-1 block w-full p-3 border border-gray-300 hover:scale-103 hover:shadow-2xl transition-all rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Contact Number</label>
              <input
                type="tel"
                name="ownerContact"
                maxLength={10}
                value={formData.ownerContact}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                placeholder={userEmail || 'Enter email'}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border hover:scale-103 hover:shadow-2xl transition-all border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="A/P NY, USA"
              />
            </div>
          </div>

          <div className="text-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-10 py-4 bg-[#1b3a34] text-[#fcf8ef] font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Profile' : 'Create Profile')}
            </button>
          </div>
        </form>
      )}
      <div className="mt-10">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-3xl font-bold text-center text-[#1b3a34]">🐾 Pet Profiles</h2>
        </div>

        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-center">
            <FaPaw className="text-4xl mb-4 text-[#1b3a34]" />
            <p className="text-lg">No pet profiles found. Create your first pet profile!</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="min-w-full table-auto">
              <thead className="bg-[#1b3a34] text-[#fcf8ef]">
                <tr>
                  <th className="px-4 py-3 text-left">Pet Name</th>
                  <th className="px-4 py-3 text-left">Species</th>
                  <th className="px-4 py-3 text-left">Breed</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {profiles.map((profile, index) => (
                  <tr key={profile.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{profile.petName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{profile.species}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{profile.breed || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => viewProfileDetails(profile)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(profile)}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Edit Profile"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProfile(profile.id)}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Profile"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedProfile && (
        <div className="fixed inset-0 bg-white/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#1b3a34] text-[#fcf8ef] p-6 rounded-t-xl flex justify-between">
              <h2 className="text-2xl font-bold">{selectedProfile.petName} Details</h2>
              <button onClick={closeModal} className="text-2xl font-bold">×</button>
            </div>
            <div className="p-6 space-y-8">
              {selectedProfile.petImageUrl && (
                <div className="flex justify-center mb-4">
                  <Image
                    src={selectedProfile.petImageUrl}
                    alt={selectedProfile.petName}
                    width={256}
                    height={256}
                    className="rounded-xl object-cover"
                  />
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <p><span className="font-semibold">Species:</span> {selectedProfile.species}</p>
                <p><span className="font-semibold">Breed:</span> {selectedProfile.breed || 'N/A'}</p>
                <p><span className="font-semibold">Age:</span> {selectedProfile.age ? `${selectedProfile.age} years` : 'N/A'}</p>
                <p><span className="font-semibold">Gender:</span> {selectedProfile.gender || 'N/A'}</p>
                <p><span className="font-semibold">Weight:</span> {selectedProfile.weight || 'N/A'}</p>
                <p><span className="font-semibold">Allergies:</span> {selectedProfile.allergies || 'N/A'}</p>
                <p><span className="font-semibold">Chronic Conditions:</span> {selectedProfile.chronicConditions || 'N/A'}</p>
                <p><span className="font-semibold">Medications:</span> {selectedProfile.currentMedications || 'N/A'}</p>
                <p><span className="font-semibold">Diet Type:</span> {selectedProfile.dietType || 'N/A'}</p>
                <p><span className="font-semibold">Owner Name:</span> {selectedProfile.ownerName}</p>
                <p><span className="font-semibold">Owner Contact:</span> {selectedProfile.ownerContact || 'N/A'}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
              <button onClick={closeModal} className="px-6 py-2 bg-gray-500 text-[#fcf8ef] rounded-lg hover:bg-gray-600 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
