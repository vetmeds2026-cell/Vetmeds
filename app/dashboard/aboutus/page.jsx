'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PawPrint,
  Stethoscope,
  UserRound,
  Heart,
  Target,
  History,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

function AboutUs() {
  const values = [
    {
      icon: <PawPrint className="w-8 h-8" />,
      title: "Compassion",
      description: "We care deeply about the well-being of all animals and strive to provide support with empathy and understanding.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Expertise",
      description: "Our platform is built on veterinary knowledge, ensuring you receive accurate and reliable pet health information.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: <UserRound className="w-8 h-8" />,
      title: "Accessibility",
      description: "We believe quality pet healthcare advice should be available to everyone, anytime, anywhere.",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Innovation",
      description: "We continuously improve our AI technology to provide the most helpful and accurate pet health guidance.",
      color: "bg-red-50 text-red-600"
    }
  ];

  const stats = [
    { label: "Pets Helped", value: "500+", icon: <Heart className="w-5 h-5" /> },
    { label: "Expert Vets", value: "10+", icon: <Stethoscope className="w-5 h-5" /> },
    { label: "Availability", value: "24/7", icon: <History className="w-5 h-5" /> },
    { label: "Success Rate", value: "98%", icon: <Award className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fcf8ef] selection:bg-[#1b3a34] selection:text-white">
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#1b3a34] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center mb-6 md:mb-8"
          >
            <Image
              src='/logo2.png'
              alt='VetMeds Logo'
              width={250}
              height={250}
              className='w-32 sm:w-56 md:w-64 drop-shadow-2xl'
              priority
            />
          </motion.div>

          <motion.h1
            {...fadeIn}
            className="text-3xl md:text-6xl font-extrabold text-[#1b3a34] tracking-tight mb-4 md:mb-6"
          >
            Nurturing Every <span className="text-orange-600">Tail</span> with Love
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8 md:mb-10"
          >
            Your trusted digital sanctuary for comprehensive pet health advice. We bridge the gap between AI innovation and professional veterinary care.
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="bg-white/60 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-white/40 flex flex-col items-center justify-center"
              >
                <div className="text-[#1b3a34] mb-1 md:mb-2">{stat.icon}</div>
                <div className="text-xl md:text-2xl font-bold text-[#1b3a34]">{stat.value}</div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-sm font-medium mb-4 md:mb-6">
                <Target className="w-4 h-4" />
                <span>Our Purpose</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-[#1b3a34] mb-4 md:mb-6">Empowering Pet Owners with Knowledge</h2>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                At VetMeds, we believe that high-quality veterinary guidance should be a standard, not a luxury. Our mission is to democratize pet care by providing instant, reliable, and empathetic health insights powered by advanced AI and backed by veterinary science.
              </p>
              <ul className="space-y-3 md:space-y-4">
                {[
                  "24/7 Access to health guidance",
                  "Expert-vetted medical information",
                  "User-friendly health tracking",
                  "Community of passionate pet lovers"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#1b3a34] flex items-center justify-center shrink-0">
                      <PawPrint className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] md:aspect-auto md:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group"
            >
              <Image
                src="/pet.jpeg"
                alt="Happy pets"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b3a34]/40 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>
      <section className="py-12 md:py-24 bg-[#fcf8ef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1b3a34] mb-3 md:mb-4">The Values We Live By</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">Foundational principles that drive every feature and interaction at VetMeds.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {values.map((value, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-100 group"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 ${value.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 transition-transform group-hover:rotate-12`}>
                  {React.cloneElement(value.icon, { className: "w-6 h-6 md:w-8 md:h-8" })}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-[#1b3a34] mb-2 md:mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs md:text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="w-full relative"
      >
        <Image
          src="/bg.jpg"
          alt="Banner"
          width={1920}
          height={600}
          className="w-full h-auto block rounded-4xl"
          priority
        />
        <div className="absolute inset-0  hover:bg-black/10 transition-colors duration-500" />
      </motion.section>
      <section className="py-12 md:py-24 bg-white overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-20 -z-10 group">
          <Image
            src="/pets3.png"
            alt="Decoration"
            width={500}
            height={500}
            className="object-contain transform translate-x-10 translate-y-10 md:translate-x-20 md:translate-y-20 group-hover:translate-x-10 transition-transform duration-1000"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4 md:mb-6">
              <History className="w-4 h-4" />
              <span>Our Journey</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-bold text-[#1b3a34] mb-6 md:mb-8">Crafting a Better Tomorrow for Pets</h2>
          </motion.div>

          <div className="prose prose-sm md:prose-lg mx-auto text-gray-700 px-2 md:px-0">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-8 first-letter:text-4xl md:first-letter:text-5xl first-letter:font-bold first-letter:text-[#1b3a34] first-letter:mr-2 md:first-letter:mr-3 first-letter:float-left shadow-sm p-4 md:p-6 bg-orange-50/30 rounded-xl md:rounded-2xl text-sm md:text-base"
            >
              VetMeds was born from a simple yet profound realization in 2024. Founded by Saeed I. Sande , the spark was ignited during a late-night emergency when immediate veterinary advice was unreachable. This personal struggle highlighted a global gap in pet healthcare accessibility.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="mb-6 md:mb-8 text-sm md:text-base leading-relaxed"
            >
              What started as a response to a personal challenge quickly evolved into a mission. Vetmeds Team brought together a diverse collective of veterinary experts, data scientists, and UI/UX designers—all united by their love for animals. Together, they engineered a platform that doesn't just provide data, but offers genuine care and calculated health guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-[#1b3a34] text-[#fcf8ef] p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute -bottom-20 -right-5 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Image src="/whitelogo.png" alt="Decoration" width={400} height={400} className="object-contain" />
              </div>

              <p className="text-lg md:text-3xl font-light italic leading-relaxed relative z-10 mb-8 md:mb-12">
                "Home is not where you live, it’s where an animal loves you without reason.
                That kind of love is what makes a family whole."
              </p>

              <div className="mt-4 md:mt-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 relative z-10 text-center md:text-left">
                <div className="w-22 h-24 md:w-22 md:h-22 bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20 shadow-inner transition-transform duration-500">
                  <Image src="/whitelogo.png" alt="Founder Logo" width={100} height={100} className="object-contain drop-shadow-xl" />
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <div className="font-bold text-xl md:text-3xl tracking-tight">Saeed I. Sande </div>
                  <div className="text-base md:text-lg opacity-80 font-medium">Founder, VetMeds Pvt ltd. </div>
                  <div className="mt-2 w-12 h-1 bg-orange-400 rounded-full group-hover:w-40 transition-all duration-1000 mx-auto md:mx-0" />
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </section>
      <Link href="/dashboard/chatbot">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-[#1b3a34] text-[#fcf8ef] p-3 md:p-4 rounded-full shadow-2xl group flex items-center space-x-2 md:space-x-3 relative"
          >
            <div className="bg-white/20 p-1.5 md:p-2 rounded-full group-hover:bg-orange-500 transition-colors duration-300">
              <PawPrint className="w-5 md:w-6 h-6 animate-pulse" />
            </div>
            <span className="hidden md:block font-bold pr-2">AI Assistant</span>
            <div className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-gray-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap md:hidden">
              Ask AI Assistant anything!
              <div className="absolute top-full right-5 w-0 h-0 border-8 border-transparent border-t-gray-900" />
            </div>
          </motion.button>
        </motion.div>
      </Link>

    </div>
  );
}

export default AboutUs;
