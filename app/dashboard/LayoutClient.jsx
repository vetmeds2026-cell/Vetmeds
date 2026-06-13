"use client";
import React, { useState, useEffect } from 'react'
import Sidebar from './_components/Sidebar'
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AiOutlineHome } from "react-icons/ai";
import { LuCat } from "react-icons/lu";
import { RiContactsLine, RiStackFill } from "react-icons/ri";
import { MdOutlineEmergencyShare, MdOutlineShoppingCart } from "react-icons/md";
import { UserButton, useUser } from "@clerk/nextjs";
import Footer from "@/app/_components/Footer";
import { IoPawOutline } from 'react-icons/io5';
import { LuDog } from "react-icons/lu";
import { FaUserDoctor } from "react-icons/fa6";
import BlockGuard from './_components/BlockGuard';

function DashboardLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  // Dynamic Page Ttle
  useEffect(() => {
    const currentItem = menu.find(item => pathname.includes(item.path));
    if (currentItem) {
      document.title = `${currentItem.name} | VetMeds`;
    } else if (pathname === '/dashboard') {
      document.title = 'Dashboard | VetMeds';
    } else {
      document.title = 'VetMeds';
    }
  }, [pathname]);

  const menu = [
    {
      id: 1,
      name: "Home",
      icon: <AiOutlineHome />,
      path: "/dashboard/aboutus",
    },
    {
      id: 2,
      name: "Paw Bot",
      icon: <LuDog />,
      path: "/dashboard/chatbot",
    },
    {
      id: 3,
      name: "Pet Profile",
      icon: <IoPawOutline />,
      path: "/dashboard/profile",
    },

    // {
    //   id: 3,
    //   name: "Shopping",
    //   icon: <MdOutlineShoppingCart />,
    //   path: "/dashboard/shopping",
    // },
    // {
    //   id: 4,
    //   name: "About Us",
    //   icon: <LuCat />,
    //   path: "/dashboard/aboutus",
    // },
    {
      id: 4,
      name: "Take Appointment",
      icon: <FaUserDoctor />,
      path: "/dashboard/petAppointment",
    },
    {
      id: 5,
      name: "Contact Us",
      icon: <RiContactsLine />,
      path: "/dashboard/contactus",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Menu Button - Floating on top right */}
      <div className="md:hidden fixed top-6 right-6 z-[70]">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 rounded-full bg-white/50 backdrop-blur-sm text-[#1b3a34] shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          {mobileMenuOpen ? <AiOutlineClose size={24} /> : <RiStackFill size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setMobileMenuOpen(false)}>
          <div className="h-full w-72" onClick={(e) => e.stopPropagation()}>
            <Sidebar closeMenu={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className='md:w-72 hidden md:block'>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className='md:ml-64 p-4 sm:p-6 md:p-10 flex-grow h-full'>
        <BlockGuard>
          {children}
        </BlockGuard>
      </div>

      {/* Footer */}
      <div className="w-full md:w-fit md:ml-72 overflow-hidden">
        <Footer />
      </div>
    </div>
  )
}

export default DashboardLayout
