"use client"
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

function Hero() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/dashboard/aboutus');
  };

  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center  overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24 relative z-10">
        {/* Background decorative elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-[#d9ecfc]/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-[#1b3a34]/30 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

        <div className="max-w-4xl mx-auto text-center bg-white/50 p-10 rounded-full shadow-2xl shadow-white items-center justify-center">
          {/* Main heading with responsive sizing */}
          <Image src={'/logo2.png'} alt={'logo'} width={500} height={500} className="w-40 sm:w-28 md:w-72 mx-auto" />


          {/* Subheading */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#0b4a7a] mb-4 md:mb-6">
            Your Pet's Smartest Health Companion
          </h2>

          {/* Description text */}
          <p className="mt-4 text-base md:text-lg text-black font-semibold max-w-3xl mx-auto leading-relaxed">
            Instantly get trusted answers, health tips, and care advice tailored to your pet's needs.
            <br className="hidden sm:block" />
            VetMeds is here 24/7 to support your pet's well-being anytime, anywhere.
          </p>
          <div className="mt-6 md:mt-8 flex justify-center">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              className='cursor-pointer bg-[#1b3a34] scale-110 sm:scale-125 md:scale-150
                hover:hover:hover:scale-115 sm:hover:scale-130 md:hover:scale-155 
                transition-all font-bold px-6 py-3 hover:shadow-xl hover:shadow-black flex items-center gap-2'>
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
              {isLoading ? '' : 'Get Started'}
            </Button>
          </div>

          {/* Trust indicators */}
          <p className="mt-6 text-sm text-gray-500">
            Trusted by thousands of pet owners worldwide
          </p>
        </div>
      </div>
    </section>
  )
}

export default Hero
