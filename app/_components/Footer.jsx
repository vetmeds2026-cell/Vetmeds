import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="bg-[#fcf8ef] py-4 w-full text-sm text-[#1b3a34]">
      <div className="container mx-auto px-2 w-full ">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 ">
          <div className="space-y-2">
            <div className="flex items-center">
              <Image src="/logo1.png" alt="VetMeds Logo" width={500} height={500} className="w-24 sm:w-28 md:w-54" />

            </div>
            <p className="text-xs text-gray-600">
              Your trusted partner for pet health advice and information.
            </p>
            <div className="flex space-x-2">
              <a href="#" className="text-[#1b3a34] hover:text-[#1b3a34] transition-colors">
                <FaFacebook size={16} />
              </a>
              <a href="#" className="text-[#1b3a34] hover:text-[#1b3a34] transition-colors">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="text-[#1b3a34] hover:text-[#1b3a34] transition-colors">
                <FaInstagram size={16} />
              </a>
              <a href="#" className="text-[#1b3a34] hover:text-[#1b3a34] transition-colors">
                <FaYoutube size={16} />
              </a>
            </div>
            <Image src={'/pets.png'} alt='dog' width={1000} height={1000} className='w-52' />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#1b3a34]">Quick Links</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard/aboutus" className="text-xs text-gray-600 hover:text-[#1b3a34] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="text-xs text-gray-600 hover:text-[#1b3a34] transition-colors">
                  Pet Profile
                </Link>
              </li>

              <li>
                <Link href="/dashboard/contactus" className="text-xs text-gray-600 hover:text-[#1b3a34] transition-colors">
                  Contact Us
                </Link>
              </li>


              <li>
                <Link href="/dashboard/emergencysos" className="text-xs text-gray-600 hover:text-[#1b3a34] transition-colors">
                  Emergency
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#1b3a34]">Our Services</h4>
            <ul className="space-y-1">
              <li className="text-xs text-gray-600">Pet Health Advice</li>
              <li className="text-xs text-gray-600">Preventative Care</li>
              <li className="text-xs text-gray-600">Nutrition Guidance</li>
              <li className="text-xs text-gray-600">Behavioral Support</li>
              <li className="text-xs text-gray-600">Emergency Help</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#1b3a34]">Contact Us</h4>
            <p className="text-xs text-gray-600">
              Vet Meds Care Center,<br />
              Karve Naka,<br />
              Karad,<br />
              Maharashtra, 415110
            </p>
            <p className="text-xs text-gray-600">
              Email: vetmeds2026@gmail.com<br />
              Phone: (123) 456-7890
            </p>
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 mb-1 sm:mb-0">
              © {new Date().getFullYear()} VetMeds. All rights reserved.
            </p>
            <div className="flex space-x-2 text-xs text-gray-500">
              <Link href="#" className="hover:text-[#1b3a34] transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-[#1b3a34] transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-[#1b3a34] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer