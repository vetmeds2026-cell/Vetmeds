import Image from 'next/image'
import React from 'react'
import { IoSettings } from "react-icons/io5";

function page() {
  return (
    <div className='items-center justify-center md:px-15'>
        <Image src={'/cat.gif'} alt='logo' width={100} height={100}
        className='md:h-[40vh] md:w-[30vw] h-40 w-44 mt-10 object-cover mx-auto md:mt-5 mb-5 '
        />
      <h1 className='text-3xl font-bold md:ml-[10%] animate-pulse justify-center items-center flex gap-1 md:gap-5'>Under Development <span className='text-5xl animate-spin'><IoSettings/></span></h1>
      <p className='font-medium text-lg text-gray-500 items-center md:ml-[45%] animate-pulse'>will be available soon....... </p>
    </div>
  )
}

export default page
