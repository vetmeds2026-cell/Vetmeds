"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AiOutlineAlert, AiOutlineHome } from "react-icons/ai";
import { LuCat } from "react-icons/lu";
import { RiContactsLine } from "react-icons/ri";
import { MdOutlineEmergencyShare } from "react-icons/md";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { IoPawOutline } from "react-icons/io5";
import { MdOutlineShoppingCart } from "react-icons/md";
import { LuDog } from "react-icons/lu";
import { FaUserDoctor } from "react-icons/fa6";
import { FaCoins, FaHandHoldingHeart, FaTimes } from "react-icons/fa";
function Sidebar({ closeMenu }) {
  const { user } = useUser();
  const [userPoints, setUserPoints] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      const fetchPoints = async () => {
        try {
          const res = await fetch(`/api/users/points?email=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}&name=${encodeURIComponent(user.fullName || 'Pet Parent')}`);
          const data = await res.json();
          if (data.success && data.data) {
            setUserPoints(data.data.points);
          }
        } catch (error) {
          console.error("Error fetching points:", error);
        }
      };
      fetchPoints();
    }
  }, [user]);

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
    {
      id: 4,
      name: "Take Appointment",
      icon: <FaUserDoctor />,
      path: "/dashboard/petAppointment",
    },

    ,
    {
      id: 5,
      name: "Shopping",
      icon: <MdOutlineShoppingCart />,
      path: "/dashboard/shopping",
    },
    {
      id: 6,
      name: "Contact Us",
      icon: <RiContactsLine />,
      path: "/dashboard/contactus",
    },

  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images] = useState([
    '/pup.png', '/cat5.png', '/blackdog.png', '/parrot1.png', '/rab.png', '/mac.png',
  ]);
  const [shuffledImages, setShuffledImages] = useState([]);

  useEffect(() => {
    const shuffled = [...images].sort(() => Math.random() - 0.1);
    setShuffledImages(shuffled);

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % shuffled.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images]);

  const path = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="fixed h-full w-72 md:w-72 p-4 bg-white z-40 shadow-xl" />;
  }

  return (
    <div className="fixed top-0 left-0 h-full w-72 md:w-72 p-4 shadow-xl border-1 flex flex-col justify-between overflow-hidden bg-white z-40 transform transition-transform">
      <div className="flex flex-col">
        <Link href={'/dashboard/aboutus'}>
          <div className="flex items-center gap-1 justify-center sm:justify-start">
            <Image src={"/logo1.png"} alt="logo" width={200} height={200} className="w-56 sm:w-56 md:w-60" />
          </div>
        </Link>

        <hr className="bg-black shadow-2xl mt-1 " />
        <ul className="mt-2 space-y-0.5">
          {menu.map((item, index) => (
            <Link href={item.path} key={item.id} onClick={() => closeMenu && closeMenu()}>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 mt-0.5 cursor-pointer rounded-lg transition-all ${item.path == path ? "bg-[#1b3a34] text-[#fcf8ef]" : "text-gray-500 hover:bg-[#1b3a34] hover:text-[#fcf8ef]"}`}
              >
                <div className="text-xl">{item.icon}</div>
                <h2 className="font-semibold text-sm">{item.name}</h2>
              </div>
            </Link>
          ))}
        </ul>
        <Link href={"/dashboard/emergencysos"} onClick={() => closeMenu && closeMenu()}>
          <div
            className={`flex items-center gap-2 text-red-500 px-3 py-1.5 mt-0.5
            cursor-pointer hover:bg-red-50 rounded-lg hover:text-red-700
            ${path == "/dashboard/emergencysos" && "bg-red-100 text-red-700"}
            transition-all`}
          >
            <h2 className="text-lg"><AiOutlineAlert /></h2>
            <h2 className="font-bold text-sm">Emergency</h2>
          </div>
        </Link>
        <div className="relative h-[250px]  rounded-2xl overflow-hidden ">
          {shuffledImages.length > 0 ? shuffledImages.map((img, index) => (
            <Image
              key={img}
              src={img}
              alt="pet"
              fill
              className={`object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          )) : (
            <div className="w-full h-full bg-gray-100 animate-pulse" />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-auto">
        <div
          className="group relative flex items-center justify-between p-3 rounded-xl border border-pink-100 bg-pink-50/20 shadow-sm transition-all hover:shadow-md h-[56px] w-full cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center gap-2">
            <FaHandHoldingHeart className="text-pink-500 text-xl shrink-0" />
            <div className="flex flex-col">
              <h2 className="font-bold bg-gradient-to-r bg-clip-text text-transparent from-pink-500 via-purple-500 to-indigo-500 animate-text text-[13px] uppercase tracking-widest leading-none mb-0.5">Kind Soul</h2>
            </div>
          </div>
          <span className="flex justify-center items-center gap-1 font-bold bg-gradient-to-r bg-clip-text text-transparent from-indigo-500 via-purple-500 to-indigo-500 animate-text text-[13px]">{userPoints}<FaCoins className="text-yellow-600 text-sm " /></span>
          <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-pink-100 shadow-xl rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 text-left hidden md:block">
            <p className="text-[12px] leading-snug text-gray-600 mb-1">Earn points by caring for, adopting, and helping animals in need.</p>
            <p className="text-[12px] font-bold text-pink-500 flex items-center gap-1 hover:text-pink-600 transition-colors">Click to read more...</p>
            <div className="absolute top-full left-6 -translate-y-1 w-3 h-3 bg-white border-r border-b border-pink-100 rotate-45"></div>
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
            <div
              className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <FaTimes size={16} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-pink-100 rounded-full">
                  <FaHandHoldingHeart className="text-pink-500 text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-pink-500 via-purple-500 to-indigo-500">Kind Soul Points</h2>
                  <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Your compassion currency</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                    What are they?
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-1 leading-relaxed">
                    Kind Soul points are special rewards you earn by showing love, care, and compassion to animals.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                    How to earn points?
                  </h3>
                  <ul className="text-gray-600 text-xs md:text-sm mt-1.5 space-y-2">
                    <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> Rescue, adopt, or foster pets</li>
                    <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> Donate to animal shelters & campaigns</li>
                    <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> Report animal emergencies</li>
                    <li className="flex items-start gap-2"><span className="text-pink-500 font-bold">•</span> Book regular checkups for your pets</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm md:text-base">
                    Benefits & Uses
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-1 leading-relaxed">
                    Accumulate points to unlock special discounts on vet appointments, access premium pet care guides, and redeem them for pet supplies! It's our way of thanking you.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all w-full md:w-auto"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        )}

        
        <div className="w-full  flex items-center justify-center p-2 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center  w-full ml-5">
            <Image src={"/logo.png"} alt="logo" width={200} height={200} className="w-13 sm:w-13 md:w-13" />

            <UserButton
              showName={true}
              appearance={{
                elements: {
                  userButtonTrigger: 'w-full flex items-center justify-start gap-3',
                  userButtonBox: 'flex flex-row items-center justify-start w-full gap-3',
                  userButtonOuterIdentifier: 'font-bold text-[#1b3a34] text-sm',
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
