'use client';
import React, { useRef, useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

import Image from 'next/image';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    petType: 'dog'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setIsSubmitted(true);

    
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        petType: 'dog'
      });
      setIsSubmitted(false);
    }, 3000);
  };
  const form = useRef();
  const [statusMessage, setStatusMessage] = useState('');

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSubmitted(true); 
    setStatusMessage('Sending your message...');

    try {
      const formData = new FormData(form.current);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setStatusMessage('Message sent successfully!');
        form.current.reset();
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setStatusMessage('Failed to send message.');
    } finally {
      setIsSubmitted(false);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1b3a34] mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Have questions about your pet's health? We're here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
          <form ref={form} onSubmit={sendEmail} className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1b3a34] mb-6">Send Us a Message</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>

                <input
                  type="text"
                  name="name"
                  required
                  className="mt-1 block w-full p-3 border border-gray-300 
                  hover:scale-103 hover:shadow-2xl transition-all
                  rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MR.Tony"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 block w-full p-3 border
                   hover:scale-103 hover:shadow-2xl transition-all
                  border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tony@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Message
              </label>
              <textarea
                name="message"
                rows={5}
                required
                className="mt-1 block w-full p-3  border
                 hover:scale-103 hover:shadow-2xl transition-all
                border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your message here..."
              />
            </div>

            {statusMessage ? <div className="mb-4 text-center">
              <div className="w-full sm:w-auto px-6 py-3 bg-[#1b3a34] text-[#fcf8ef] font-medium rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#1b3a34] focus:ring-opacity-50 animate-fade-in"
              >
                {statusMessage}
              </div>
            </div>

              :

              <div className="text-center">
                <button
                  type="submit"
                  value="Send"
                  className="w-100% sm:w-auto px-6 py-3 bg-[#1b3a34] 
                text-[#fcf8ef] font-medium rounded-lg shadow-md 
                hover:shadow-xl transition-all focus:outline-none focus:ring-2 
                focus:ring-[#1b3a34] focus:ring-opacity-50 cursor-pointer
                hover:bg-[#1b3a34] hover:hover: hover:scale-105
                " >
                  Send Message
                </button>
              </div>



            }


          </form>
          <div>
            <Image src={'/pets3.png'} alt="dog" width={1000} height={1000} className="w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1b3a34] mb-6">Contact Information</h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1b3a34] flex items-center justify-center text-white">
                  <FaPhone />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                  <p className="mt-1 text-gray-600">+1 (123) 456-7890</p>
                  <p className="mt-1 text-gray-600">+1 (987) 654-3210</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1b3a34] flex items-center justify-center text-white">
                  <FaEnvelope />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email</h3>
                  <p className="mt-1 text-gray-600">vetmeds2026@gmail.com</p>

                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1b3a34] flex items-center justify-center text-white">
                  <FaMapMarkerAlt />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Address</h3>
                  <p className="mt-1 text-gray-600">
                    Vet Meds Care Center,<br />
                    Karve Naka,<br />
                    Karad,<br />
                    Maharashtra, 415110
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#1b3a34] flex items-center justify-center text-white">
                  <FaClock />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Hours</h3>
                  <p className="mt-1 text-gray-600">
                    <span className="font-medium">Online Support:</span> 24/7<br />
                    <span className="font-medium">Office Hours:</span><br />
                    Monday - Friday: 9am - 5pm<br />
                    Saturday: 10am - 2pm<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1b3a34] mb-6">Emergency Contact</h2>
            <p className="text-gray-700 mb-4">
              For pet emergencies requiring immediate attention, please contact your local emergency veterinary clinic.
            </p>
            <a
              href="/dashboard/emergencysos"
              className="inline-block px-6 
               hover:scale-103 hover:shadow-2xl 
              py-3 bg-red-500 text-[#fcf8ef] font-medium rounded-lg shadow-md hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Emergency
            </a>
          </div>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 sm:p-8 mb-12">
        <h2 className="text-2xl font-bold text-[#1b3a34] mb-6 text-center">Frequently Asked Questions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">How quickly will I receive a response?</h3>
            <p className="text-gray-600">Our AI assistant provides immediate responses. For personalized inquiries sent through our contact form, we typically respond within 24-48 business hours.</p>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Is the pet health advice provided by real veterinarians?</h3>
            <p className="text-gray-600">Our AI assistant is trained on veterinary knowledge, but it's not a substitute for professional veterinary care. For serious concerns, always consult with a veterinarian.</p>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Can I use VetMeds for emergency situations?</h3>
            <p className="text-gray-600">VetMeds is not designed for emergency situations. If your pet is experiencing a medical emergency, please contact your local emergency veterinary clinic immediately.</p>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-[#1b3a34] mb-2">Is my information kept confidential?</h3>
            <p className="text-gray-600">Yes, all information shared with VetMeds is kept strictly confidential and is only used to provide you with the best possible service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
