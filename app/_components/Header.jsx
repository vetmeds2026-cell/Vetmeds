"use client";
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai'
import { FaUserMd } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { RiStackFill } from 'react-icons/ri';

function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    setMobileMenuOpen(false);
    router.push('/dashboard');
  };

  return (
    <header className='relative'>
      <div className='flex justify-between items-center p-3 sm:p-4 md:px-5 shadow-md bg-white/50 backdrop-blur-sm'>
        <div className="flex-1 md:flex-initial flex justify-center md:justify-start">
          <Link href="/" className='flex items-center cursor-pointer'>
            <Image src={'/logo1.png'} alt={'logo'} width={150} height={150} className="w-32 sm:w-32 md:w-32 lg:w-40" />
          </Link>
        </div>
        <div className='hidden md:flex items-center gap-6 lg:gap-8'>
          <Link href="/dashboard/aboutus">
            <span className='font-semibold cursor-pointer hover:text-[#1b3a34] transition-colors'>About us</span>
          </Link>
          <Link href="/dashboard/contactus">
            <span className='font-semibold cursor-pointer hover:text-[#1b3a34] transition-colors'>Contact us</span>
          </Link>
          <Link href="/doctor-login">
            <span className='flex items-center gap-2 font-semibold cursor-pointer hover:text-[#1b3a34] transition-colors'>
              <FaUserMd />
              <span className='hidden lg:inline'>Doctor Login</span>
            </span>
          </Link>
          
          <Link href={'/dashboard/emergencysos'}>
            <Button className='cursor-pointer font-bold bg-red-500 hover:bg-red-600 hover:scale-105 transition-all hover:shadow-2xl'>
              Emergency
            </Button>
          </Link>
        </div>
        <div className="md:hidden flex-1 flex justify-end">
          <button 
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1b3a34] active:scale-90 transition-transform"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? 
              <AiOutlineClose className="h-6 w-6 text-[#1b3a34]" /> : 
              <RiStackFill  className="h-6 w-6 text-[#1b3a34]" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/50 backdrop-blur-sm shadow-lg z-50 py-4 px-6 flex flex-col gap-4 border-t border-gray-200 animate-slideDown">
          <Link href="/dashboard/aboutus" onClick={() => setMobileMenuOpen(false)}>
            <span className='block py-2 font-semibold text-center hover:text-[#1b3a34] transition-colors'>About us</span>
          </Link>
          <Link href="/dashboard/contactus" onClick={() => setMobileMenuOpen(false)}>
            <span className='block py-2 font-semibold text-center hover:text-[#1b3a34] transition-colors'>Contact us</span>
          </Link>
          <Link href="/doctor-login" onClick={() => setMobileMenuOpen(false)}>
            <span className='flex items-center justify-center gap-2 py-2 font-semibold text-center hover:text-[#1b3a34] transition-colors'>
              <FaUserMd />
              Doctor Login
            </span>
          </Link>
          <Button 
            onClick={handleGetStarted}
            disabled={isLoading}
            className='w-full cursor-pointer font-bold bg-[#1b3a34] hover:hover:transition-all hover:shadow-2xl flex items-center justify-center gap-2'>
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
            {isLoading ? 'Loading...' : 'Get Started'}
          </Button>
        </div>
      )}
    </header>
  )
}

export default Header