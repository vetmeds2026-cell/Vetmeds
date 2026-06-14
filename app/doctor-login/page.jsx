"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserMd, FaLock, FaEnvelope, FaStethoscope } from 'react-icons/fa';
import Image from 'next/image';


function DoctorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const doctorData = localStorage.getItem('doctorAuth');
    if (doctorData) {
      router.push('/doctor-dashboard');
    }
  }, []);


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/doctor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        
        localStorage.setItem('doctorAuth', JSON.stringify({
          email: data.email,
          name: data.name,
          loginTime: new Date().toISOString()
        }));

        
        router.push('/doctor-dashboard');
      } else {
        setError(data.error || 'Invalid email or password. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please check your connection and try again.');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#fcf8ef] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="bg-[#1b3a34] rounded-3xl p-12 text-[#fcf8ef] shadow-2xl">
            <FaStethoscope className="text-8xl mb-6 opacity-80" />
            <h1 className="text-5xl font-bold mb-4">VetMeds</h1>
            <h2 className="text-3xl font-semibold mb-6">Doctor Portal</h2>
            <p className="text-lg mb-8 leading-relaxed">
              Access your dashboard to manage appointments, view patient information,
              and provide the best care for your furry patients.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-8">
              <div>
                <Image src={'/doc.jpg'} alt="dog" width={1000} height={1000} className='rounded-full' />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border border-gray-100">
          <div className="md:hidden text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-[#1b3a34]/10 p-5 rounded-full">
                <FaUserMd className="text-5xl text-[#1b3a34]" />
              </div>
            </div>
            <Image src={'/logo1.png'} alt="logo" width={200} height={200} className="w-48 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#1b3a34] uppercase tracking-tight">Doctor Portal</h1>
            <div className="h-1 w-20 bg-[#1b3a34] mx-auto mt-2 rounded-full"></div>
          </div>
          <div className="hidden md:block text-center mb-10">
            <div className="bg-[#1b3a34]/5 p-4 rounded-2xl inline-block mb-4">
              <FaUserMd className="text-5xl text-[#1b3a34]" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome back</h2>
            <p className="text-gray-500 font-medium italic">Please sign in to your dashboard</p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="flex items-center gap-2">
                <span className="font-bold">⚠️</span>
                {error}
              </p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-[#1b3a34]" />
                Doctor Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="doctor@vetmeds.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1b3a34] focus:border-[#1b3a34] transition-all text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaLock className="inline mr-2 text-[#1b3a34]" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1b3a34] focus:border-[#1b3a34] transition-all text-lg"
              />

            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1b3a34] text-[#fcf8ef] font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-[#1b3a34] hover:text-[#1b3a34] font-semibold transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
