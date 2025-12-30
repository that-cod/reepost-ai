"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Sparkles, TrendingUp, Users } from "lucide-react";

const avatars = [
  { name: "Sarah Chen", image: "https://i.pravatar.cc/150?img=1" },
  { name: "Marcus Johnson", image: "https://i.pravatar.cc/150?img=2" },
  { name: "Priya Sharma", image: "https://i.pravatar.cc/150?img=3" },
  { name: "Alex Kim", image: "https://i.pravatar.cc/150?img=4" },
  { name: "Jordan Taylor", image: "https://i.pravatar.cc/150?img=5" },
];

export default function NewHero() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-light-green/30 via-white to-white pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center space-y-8"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="flex justify-center">
            <div className="inline-flex items-center space-x-2 bg-pastel-green/50 px-4 py-2 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary-dark">
                AI-Powered LinkedIn Content Generation
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary leading-tight"
          >
            Turn LinkedIn Into Your{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
                Lead Engine
              </span>
            </span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl italic text-text-secondary">
              in 30 Minutes a Day
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl lg:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            Generate viral-worthy LinkedIn posts with AI, schedule your content
            calendar, and watch your engagement soar. No writing skills
            required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started — It's Free</span>
              <TrendingUp className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-primary border-2 border-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* Subtext */}
          <motion.p
            variants={fadeInUp}
            className="text-sm text-text-secondary pt-2"
          >
            No credit card required • Free plan available • Cancel anytime
          </motion.p>

          {/* Social Proof Avatars */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center space-y-4 pt-8"
          >
            <div className="flex -space-x-3">
              {avatars.map((avatar, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="relative"
                >
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                  />
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 }}
                className="w-12 h-12 rounded-full border-4 border-white bg-primary flex items-center justify-center shadow-lg"
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-primary">1,000+</span>{" "}
              creators are already growing their LinkedIn presence
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all"
            >
              <Play className="w-6 h-6 rotate-90" />
            </button>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </div>
      )}
    </section>
  );
}
