'use client';
import React, { useRef, useState, useEffect } from 'react';
import { FaExclamationTriangle, FaMapMarkerAlt, FaFirstAid, FaCarAlt, FaUpload, FaImage, FaTimes, FaHandHoldingHeart } from 'react-icons/fa';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useUser } from "@clerk/nextjs";
import Image from 'next/image';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { AiOutlineAlert } from 'react-icons/ai';

function EmergencySos() {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sosHistory, setSosHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [location, setLocation] = useState({ lat: 18.5204, lng: 73.8567, address: '' }); 
  const [mapLoaded, setMapLoaded] = useState(false);

  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const formRef = useRef();

  
  useEffect(() => {
    if (mapRef.current) return;

    const mapKey = process.env.NEXT_PUBLIC_MAP_KEY || '740c33e5c07642d3a2b37a1d05ea8301';

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${mapKey}`,
      center: [location.lng, location.lat],
      zoom: 12
    });

    mapRef.current.addControl(new maplibregl.NavigationControl());

    markerRef.current = new maplibregl.Marker({
      draggable: true,
      color: "#ef4444"
    })
      .setLngLat([location.lng, location.lat])
      .addTo(mapRef.current);

    markerRef.current.on('dragend', () => {
      const lngLat = markerRef.current.getLngLat();
      updateLocation(lngLat.lat, lngLat.lng);
    });

    mapRef.current.on('load', () => setMapLoaded(true));

    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
        mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });
        markerRef.current.setLngLat([longitude, latitude]);
      });
    }

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  const updateLocation = async (lat, lng) => {
    setLocation(prev => ({ ...prev, lat, lng }));
    
    try {
      const mapKey = process.env.NEXT_PUBLIC_MAP_KEY || '740c33e5c07642d3a2b37a1d05ea8301';
      const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${mapKey}`);
      const result = await response.json();
      if (result.features && result.features.length > 0) {
        setLocation(prev => ({ ...prev, address: result.features[0].properties.formatted }));
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const mapKey = process.env.NEXT_PUBLIC_MAP_KEY || '740c33e5c07642d3a2b37a1d05ea8301';
      const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${mapKey}`);
      const data = await response.json();
      if (data.features) {
        setSearchResults(data.features.slice(0, 5));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    const [lng, lat] = result.geometry.coordinates;
    const address = result.properties.formatted;

    updateLocation(lat, lng);
    setLocation(prev => ({ ...prev, address }));

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }

    setSearchResults([]);
    setSearchQuery('');
  };

  
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      fetchSosHistory();
    }
  }, [user]);

  const fetchSosHistory = async () => {
    try {
      setLoadingHistory(true);
      const email = user?.primaryEmailAddress?.emailAddress;
      const response = await fetch(`/api/emergencysos?userEmail=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.success) {
        setSosHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching SOS history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmitSos = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setStatusMessage('Processing emergency alert...');

    try {
      const formData = new FormData(formRef.current);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      formData.append('address', location.address);

      const response = await fetch('/api/emergencysos', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatusMessage('🚨 Emergency sent successfully! Help is on the way.');
        formRef.current.reset();
        setSelectedFile(null);
        setPreviewUrl(null);
        setMessageText('');
        setIsAgreed(false);
        fetchSosHistory(); 
      } else {
        throw new Error(data.error || 'Failed to send alert');
      }
    } catch (error) {
      console.error('SOS Error:', error);
      setStatusMessage('❌ Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMessage(''), 10000);
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
          <div className="flex-shrink-0 text-red-500 text-4xl sm:text-3xl">
            <AiOutlineAlert />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-red-700">Pet Emergency</h1>
            <p className="text-red-600 mt-1 text-sm sm:text-base">
              If your pet or any animal is experiencing a life-threatening emergency, please contact your nearest emergency veterinary clinic immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
        <form ref={formRef} onSubmit={handleSubmitSos} className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1b3a34] mb-6">Send Us a Message</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                defaultValue={user?.fullName || ''}
                required
                className="mt-1 block w-full p-3 border border-gray-300 
                hover:scale-103 hover:shadow-2xl transition-all
                rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="MR.Tony"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                name="email"
                defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
                required
                className="mt-1 block w-full p-3 border
                 hover:scale-103 hover:shadow-2xl transition-all
                border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="tony@example.com"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" />
              Pin Your Exact Location (Drag the marker)
            </label>
            <div
              ref={mapContainerRef}
              className="w-full h-[300px] rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner relative"
            >
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <FaSpinner className="animate-spin text-2xl text-red-500 mr-2" /> Initializing Map...
                </div>
              )}
              <div className="absolute top-4 left-4 z-20 w-64 sm:w-80 shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-red-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border-none bg-white rounded-xl shadow-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
                    placeholder="Search for city or address..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <FaSpinner className="animate-spin text-red-500" />
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 divide-y divide-gray-100">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSearchResult(result)}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-start gap-2"
                      >
                        <FaMapMarkerAlt className="text-red-400 mt-1 shrink-0" size={14} />
                        <span className="text-sm font-medium text-gray-700 line-clamp-2">{result.properties.formatted}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {location.address && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Detected Location:</p>
                  <p className="text-sm text-gray-700">{location.address}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Emergency Description</label>
            <textarea
              name="message"
              rows={4}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="mt-1 block w-full p-3 border
               hover:scale-103 hover:shadow-2xl transition-all
              border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the emergency situation (e.g. Pet is bleeding, fainted, etc.)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <FaImage className="inline mr-2" />
              Attach Photo (Emergency)
            </label>

            <div className="space-y-4">
              {!previewUrl ? (
                <div className="w-full">
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    <FaUpload className="mr-2 text-red-500" />
                    <span className="text-gray-600">Select Emergency Image</span>
                  </label>
                </div>
              ) : (
                <div className="relative w-full max-w-md mx-auto">
                  <img
                    src={previewUrl}
                    alt="Emergency Preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-red-500 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-3 -right-3 bg-red-600 text-[#fcf8ef] rounded-full p-2 shadow-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTimes size={16} />
                  </button>
                  <p className="text-center text-sm text-red-600 font-bold mt-2">🚨 Image Attached 🚨</p>
                </div>
              )}
            </div>
          </div>

          {statusMessage && (
            <div className="mb-4 text-center">
              <div className={`px-6 py-3 rounded-lg shadow-md font-medium animate-fade-in ${statusMessage.includes('🚨') ? 'bg-green-500 text-[#fcf8ef]' : 'bg-red-500 text-[#fcf8ef]'
                }`}>
                {statusMessage}
              </div>
            </div>
          )}
          <div className="bg-red-50/50 border-2 border-red-100 rounded-2xl p-6 space-y-4 shadow-inner">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-600 text-xl mt-1 shrink-0 animate-pulse" />
              <div className="space-y-2">
                <p className="text-sm font-black text-red-700 uppercase tracking-tight">Responsibility & Consequences Declaration</p>
                <p className="text-xs text-red-600/80 leading-relaxed font-bold italic">
                  "I solemnly declare that the emergency information I am providing is true and accurate. I understand that submitting a false emergency alert is a serious violation of VetMeds community guidelines. By checking the box below, I acknowledge that I am fully prepared to face relevant account restrictions, penalty fines, or permanent exclusion from this platform if this report is found to be fraudulent or malicious."
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer appearance-none w-6 h-6 border-2 border-red-300 rounded-lg checked:bg-red-600 checked:border-red-600 transition-all cursor-pointer shadow-sm group-hover:scale-105"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
                <div className="absolute text-white scale-0 peer-checked:scale-100 transition-transform left-1 pointer-events-none">
                  <FaCheckCircle size={16} />
                </div>
              </div>
              <span className="text-sm font-black text-gray-700 uppercase tracking-tight group-hover:text-red-700 transition-colors">
                I Agree & Am Responsible
              </span>
            </label>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting || !isAgreed}
              className="w-full sm:w-auto px-8 py-4 bg-red-400 enabled:hover:scale-103 enabled:hover:bg-red-500 from-red-600 to-red-400 text-[#fcf8ef] font-bold text-lg rounded-xl shadow-lg enabled:hover:shadow-2xl transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Sending ...
                </>
              ) : (
                <>
                  <FaExclamationTriangle /> SEND EMERGENCY
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8 mb-12 mt-10">
        <h2 className="text-2xl font-bold text-[#1b3a34] mb-6 flex items-center">
          <FaFirstAid className="mr-2 text-red-500" /> Pet First Aid Basics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Bleeding</h3>
            <p className="text-gray-700 mb-2">
              Apply direct pressure with a clean cloth or gauze. If bleeding doesn't stop within 5 minutes, seek immediate veterinary care.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Choking</h3>
            <p className="text-gray-700 mb-2">
              If your pet can still breathe, cough, and is conscious, monitor them and get to a vet. If they're unconscious, open their mouth to look for objects and seek immediate help.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Seizures</h3>
            <p className="text-gray-700 mb-2">
              Keep your pet away from furniture, don't restrain them, and don't put anything in their mouth. Time the seizure and seek veterinary care immediately afterward.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Heatstroke</h3>
            <p className="text-gray-700 mb-2">
              Move your pet to a cool area, apply cool (not cold) water to their body, and offer small amounts of water to drink. Seek immediate veterinary care.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Poisoning</h3>
            <p className="text-gray-700 mb-2">
              Contact Pet Poison Helpline or ASPCA Animal Poison Control immediately. Do not induce vomiting unless instructed by a professional.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Broken Bones</h3>
            <p className="text-gray-700 mb-2">
              Minimize movement, gently place your pet on a flat surface, and transport them to a veterinary clinic immediately.
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <p className="text-yellow-700">
            <strong>Important:</strong> These first aid tips are not a substitute for professional veterinary care. Always seek immediate veterinary attention in emergency situations.
          </p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1b3a34] mb-6 flex items-center">
          <FaCarAlt className="mr-2 text-red-500" /> Emergency Transportation Tips
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg  text-[#1b3a34] mb-2 font-bold uppercase tracking-tight">Preparing for Transport</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm sm:text-base">
              <li>Call the emergency clinic to let them know you're coming</li>
              <li>Keep your pet as still as possible during transport</li>
              <li>Use a secure carrier for small animals when possible</li>
              <li>For larger dogs, use a makeshift stretcher (board, blanket, etc.) if they can't walk</li>
            </ul>
          </div>

          <div className='flex flex-col sm:flex-row items-center justify-between gap-6'>
            <div className="flex-grow">
              <h3 className="text-lg text-[#1b3a34] mb-2 font-bold uppercase tracking-tight">During Transport</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm sm:text-base">
                <li>Drive carefully and avoid sudden stops or turns</li>
                <li>Have someone else drive while you monitor your pet if possible</li>
                <li>Keep the vehicle at a comfortable temperature</li>
                <li>Talk to your pet in a calm, reassuring voice</li>
              </ul>
            </div>
            <div className="shrink-0">
              <Image src={'/love.png'} alt="dog" width={400} height={400} className="w-48 sm:w-64 h-auto drop-shadow-xl" />
            </div>
          </div>

          <div>
            <h3 className="text-lg text-[#1b3a34] mb-2 font-bold uppercase tracking-tight">What to Bring</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1 text-sm sm:text-base">
              <li>Your pet's medical records if readily available</li>
              <li>Information about any medications your pet is taking</li>
              <li>Details about what happened and when symptoms started</li>
              <li>A sample of any substances your pet may have ingested</li>
              <li>Payment method (most emergency clinics require payment upfront)</li>
            </ul>
          </div>
        </div>
      </div>

      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8 mt-12 overflow-hidden">
        <h2 className="text-2xl font-bold text-[#1b3a34] mb-6 flex items-center gap-2">
          <FaHandHoldingHeart /> Your Kind Soulness
        </h2>

        
        {sosHistory.length > 0 && sosHistory[0].userStatus?.isBlocked && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-200 rounded-2xl flex items-center gap-4 animate-pulse">
            <FaExclamationTriangle className="text-3xl text-red-600 shrink-0" />
            <div>
              <p className="text-red-800 font-extrabold uppercase tracking-tight">Account Restricted</p>
              <p className="text-red-600 text-sm">
                Your emergency access is limited.
                {sosHistory[0].userStatus.blockedUntil === '9999-12-31T23:59:59.999Z'
                  ? ' This restriction is permanent.'
                  : ` Re-opens after ${new Date(sosHistory[0].userStatus.blockedUntil).toLocaleDateString()}.`}
              </p>
            </div>
          </div>
        )}

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-[#1b3a34]" />
          </div>
        ) : (
          <div className="space-y-6">

            {sosHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No emergency reports found in your history.
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Emergency Incident History</h3>
                {sosHistory.map((sos) => (
                  <div key={sos.id} className="p-5 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-grow">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-4 py-1.5 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase tracking-tighter shadow-sm">
                            🚨 Emergency Alert
                          </span>
                          <span className="text-xs font-bold text-gray-400">
                            {new Date(sos.createdAt).toLocaleString()}
                          </span>
                          {sos.status === 'completed' && (
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5 text-green-600 text-xs font-black uppercase tracking-tight">
                                <FaCheckCircle /> Resolved
                              </span>
                              <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-lg uppercase shadow-sm animate-bounce">
                                +50 PTS REWARD
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 font-semibold text-base leading-relaxed italic border-l-4 border-red-100 pl-4">"{sos.description}"</p>
                        {sos.address && (
                          <div className="mt-4 flex items-start gap-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                            <FaMapMarkerAlt className="text-red-400 mt-1 shrink-0" size={16} />
                            <span>{sos.address}</span>
                          </div>
                        )}
                      </div>
                      {sos.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={sos.imageUrl}
                            alt="Emergency Attachment"
                            className="w-full md:w-48 h-32 object-cover rounded-2xl border-4 border-white shadow-xl group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(sos.imageUrl, '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sosHistory.some(sos => sos.penalties?.length > 0) && (
              <div className="mt-10 p-6 bg-orange-50 border-2 border-orange-200 rounded-3xl animate-fadeIn">
                <h3 className="text-sm font-black text-orange-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FaExclamationTriangle className="animate-pulse" /> Applied Penalties & Restrictions
                </h3>
                <div className="grid gap-3">
                  {Array.from(new Map(
                    sosHistory.flatMap(sos => (sos.penalties || []))
                      .map(p => [p.id || p.createdAt, p])
                  ).values()).slice(0, 5).map((penalty, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/50 p-5 rounded-2xl border border-orange-100 shadow-sm transition-all hover:shadow-md hover:bg-white">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{new Date(penalty.createdAt).toLocaleString()}</p>
                        <p className="text-sm text-gray-700 font-bold leading-tight">{penalty.reason}</p>
                        {penalty.doctorName && (
                          <p className="text-[10px] text-orange-600/60 font-black uppercase mt-2 italic shadow-sm bg-orange-100/50 w-fit px-2 py-0.5 rounded-md">
                            Authorization: {penalty.doctorName}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-black text-red-600">-{penalty.amount} pts</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Fine Collected</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmergencySos;
