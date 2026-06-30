import React from "react";
import { motion } from "motion/react";
import { Cpu, Map as MapIcon, Users, Clock, LineChart, BrainCircuit, Award, Camera } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      title: "AI Categorization",
      description: "Instantly analyzes images to identify issues, determine severity, and route to the correct department.",
      icon: <Cpu className="w-6 h-6" />
    },
    {
      title: "Geo-Mapping",
      description: "Pinpoints exactly where the problem is using precise GPS coordinates, reducing search times for crews.",
      icon: <MapIcon className="w-6 h-6" />
    },
    {
      title: "Community Verification",
      description: "Neighbors can vote and confirm reports, preventing duplicates and validating urgent needs.",
      icon: <Users className="w-6 h-6" />
    },
    {
      title: "Real-Time Tracking",
      description: "Track the status of your reported issue from pending to resolved with live updates.",
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: "Impact Dashboards",
      description: "City-wide analytics that show response times, resolution rates, and infrastructure health.",
      icon: <LineChart className="w-6 h-6" />
    },
    {
      title: "Predictive Insights",
      description: "Identifies recurring problem areas to help cities proactively maintain their infrastructure.",
      icon: <BrainCircuit className="w-6 h-6" />
    },
    {
      title: "Gamification",
      description: "Earn points, climb the leaderboard, and unlock badges for being an active community member.",
      icon: <Award className="w-6 h-6" />
    },
    {
      title: "Image Reporting",
      description: "Easily upload media right from your phone so responders know exactly what they're dealing with.",
      icon: <Camera className="w-6 h-6" />
    }
  ];

  return (
    <section id="features" className="py-24 px-6 md:px-12 bg-[#0A0D04] relative border-t border-[#FAFFF3]/5">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-[#C0F53D] tracking-[0.2em] uppercase block font-bold mb-4">PLATFORM FEATURES</span>
          <h2 className="font-serif text-3xl md:text-5xl text-[#FAFFF3] mb-6">
            Everything you need to improve your city.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="p-6 bg-[#1A2209]/40 border border-[#FAFFF3]/10 hover:border-[#C0F53D]/40 rounded-2xl transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0A0D04] border border-[#FAFFF3]/10 flex items-center justify-center mb-6 text-[#FAFFF3] group-hover:text-[#C0F53D] transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="font-sans font-bold text-lg text-[#FAFFF3] mb-3">{feature.title}</h3>
              <p className="font-light text-sm text-[#FAFFF3]/60 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
