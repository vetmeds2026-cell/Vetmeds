import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

export default function Page() {
  return (
    <div className='min-h-screen flex flex-col md:flex-row relative overflow-hidden'
      style={{
        backgroundImage: `url('/pup.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="md:hidden absolute top-4 left-4 z-10 flex items-center">
        <Link href="/">
          <div className="flex items-center bg-white/80 p-2 rounded-lg backdrop-blur-sm shadow-md">
            <Image src="/logo.png" alt="VetMeds Logo" width={40} height={40} />
            <span className="font-bold text-[#1b3a34] ml-2">VetMeds</span>
          </div>
        </Link>
      </div>
      <div className='flex items-center justify-center p-6 sm:p-8 md:p-10  bg-white/70 backdrop-blur-sm
        min-h-screen w-full md:w-[50%] md:rounded-br-[100px] lg:rounded-br-[150px]'>
        <div className="max-w-md w-full">
          <SignIn />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Need pet health advice? Sign in to chat with our veterinary AI assistant.</p>
          </div>
        </div>
      </div>
      <div className='hidden md:block md:w-[50%]'></div>
    </div>
  )
}