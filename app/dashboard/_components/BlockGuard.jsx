"use client";
import React, { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { FaSkullCrossbones, FaExclamationTriangle } from 'react-icons/fa';


const BlockGuard = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockInfo, setBlockInfo] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isLoaded || !user) {
        setChecking(false);
        return;
      }

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const response = await fetch(`/api/users/status?email=${email}`);
        const data = await response.json();

        if (data.success && data.data.isBlocked) {
          setIsBlocked(true);
          setBlockInfo(data.data);

          
          setTimeout(() => {
            signOut();
          }, 6000); 
        }
      } catch (error) {
        console.error('Error checking user block status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkUserStatus();
  }, [user, isLoaded, signOut]);

  if (isBlocked) {
    const daysRemaining = blockInfo.blockedUntil === '9999-12-31T23:59:59.999Z'
      ? '∞'
      : Math.ceil((new Date(blockInfo.blockedUntil) - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/angrymob.gif"
            alt="Restricted Access Mobile"
            className="w-full h-full object-cover grayscale block md:hidden"
          />
          <img
            src="/angry.gif"
            alt="Restricted Access Desktop"
            className="w-full h-full object-cover grayscale hidden md:block"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]"></div>
        </div>
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8 sm:gap-12 animate-contentFadeIn">
          <div className="transition-transform duration-700 hover:scale-110">
            <img
              src="/logo2.png"
              alt="Vet Meds Logo"
              className="w-32 sm:w-48 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl font-black text-red-600 tracking-tighter uppercase leading-none drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              Access <br className="sm:hidden" /> Restricted
            </h1>
            <div className="h-1.5 w-32 bg-red-600 mx-auto rounded-full shadow-[0_0_15px_rgba(220,38,38,1)]"></div>
          </div>
          <div className="max-w-xl px-4">
            <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mb-4">Security Violation</p>
            <p className="text-xl sm:text-2xl text-[#fcf8ef] font-bold italic leading-relaxed opacity-90">
              "{blockInfo.blockReason || 'False emergency reporting or intentional system manipulation detected.'}"
            </p>
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Time Remaining</p>
                <p className="text-2xl sm:text-4xl font-black text-red-600 leading-none">
                  {daysRemaining === '∞' ? 'Permanent' : `${daysRemaining} Days`}
                </p>
              </div>
              <div className="hidden sm:block w-[1px] h-14 bg-white/20"></div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Unblock Date</p>
                <p className="text-xl sm:text-3xl font-black text-[#fcf8ef] leading-none">
                  {blockInfo.blockedUntil === '9999-12-31T23:59:59.999Z'
                    ? 'N/A'
                    : new Date(blockInfo.blockedUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest animate-pulse">
                Automatically logging out...
              </p>
              <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 animate-timer-progress w-full"></div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes timer-progress {
            0% { transform: scaleX(1); }
            100% { transform: scaleX(0); }
          }
          .animate-timer-progress {
            animation: timer-progress 6s linear forwards;
          }
          .animate-contentFadeIn {
            animation: contentFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes contentFadeIn {
            from { opacity: 0; transform: scale(0.9) translateY(30px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  
  return <>{children}</>;
};

export default BlockGuard;
