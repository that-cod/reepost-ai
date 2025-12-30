"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Sparkles,
  Calendar,
  TrendingUp,
  Zap,
  Target,
  BarChart3,
  FileText,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  {
    icon: Sparkles,
    badge: "AI-Powered",
    badgeColor: "from-primary to-accent",
    title: "Generate Viral Posts in Seconds",
    description:
      "Our AI analyzes 10,000+ viral LinkedIn posts to create engaging content tailored to your brand voice. Choose from 8+ tones and customize intensity to match your style perfectly.",
    image: "https://picsum.photos/800/600?random=1",
    highlights: [
      "8+ voice tones to match your brand",
      "Learning from 10,000+ viral posts",
      "Customizable intensity levels",
    ],
    stats: { value: "10K+", label: "Viral Posts Analyzed" },
  },
  {
    icon: Calendar,
    badge: "Scheduling",
    badgeColor: "from-blue-500 to-cyan-500",
    title: "Smart Content Calendar",
    description:
      "Plan your entire month in minutes. Our intelligent scheduler suggests optimal posting times based on your audience engagement patterns, ensuring maximum reach.",
    image: "https://picsum.photos/800/600?random=2",
    highlights: [
      "Visual calendar interface",
      "AI-suggested optimal timing",
      "Bulk scheduling capabilities",
    ],
    stats: { value: "3x", label: "Higher Reach" },
  },
  {
    icon: TrendingUp,
    badge: "Discovery",
    badgeColor: "from-emerald-500 to-teal-500",
    title: "Trending Content Feed",
    description:
      "Stay ahead of the curve with real-time trending topics. Browse viral posts, analyze what works, and repurpose winning content with one click.",
    image: "https://picsum.photos/800/600?random=3",
    highlights: [
      "Real-time trending analysis",
      "One-click content repurposing",
      "Filter by industry & topic",
    ],
    stats: { value: "Real-time", label: "Trend Updates" },
  },
  {
    icon: BarChart3,
    badge: "Analytics",
    badgeColor: "from-amber-500 to-orange-500",
    title: "Deep Engagement Insights",
    description:
      "Track every metric that matters. Understand what resonates with your audience and optimize your strategy with actionable data-driven insights.",
    image: "https://picsum.photos/800/600?random=4",
    highlights: [
      "Real-time engagement tracking",
      "Audience growth analytics",
      "Content performance reports",
    ],
    stats: { value: "100+", label: "Metrics Tracked" },
  },
  {
    icon: Target,
    badge: "Optimization",
    badgeColor: "from-orange-500 to-red-500",
    title: "Audience Targeting & Growth",
    description:
      "Identify and connect with your ideal audience. Our platform helps you understand who engages with your content and how to attract more of them.",
    image: "https://picsum.photos/800/600?random=5",
    highlights: [
      "Audience demographic insights",
      "Follower growth tracking",
      "Engagement pattern analysis",
    ],
    stats: { value: "5x", label: "Audience Growth" },
  },
  {
    icon: FileText,
    badge: "New 🔥",
    badgeColor: "from-primary to-accent",
    title: "Document Intelligence",
    description:
      "Turn PDFs, Word docs, and presentations into engaging LinkedIn posts. Our AI extracts key insights and transforms them into shareable content.",
    image: "https://picsum.photos/800/600?random=6",
    highlights: [
      "PDF & Word doc parsing",
      "Automatic insight extraction",
      "Multi-format support",
    ],
    stats: { value: "Instant", label: "Content Transform" },
  },
];

export default function NewFeatures() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section id="features" className="relative py-20 lg:py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden" ref={ref}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 -left-48 w-96 h-96 bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-accent rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeInUp} className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-2.5 rounded-full mb-6 border border-primary/20"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Powerful Features
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-shift bg-clip-text text-transparent">
              Dominate LinkedIn
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Powerful features designed to transform your LinkedIn presence from ordinary to extraordinary
          </p>
        </motion.div>

        {/* Features Grid - Modern Card Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="group relative"
              >
                <div className="relative h-full bg-white rounded-3xl border-2 border-border hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-soft hover:shadow-2xl">
                  {/* Gradient Overlay on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.badgeColor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  />

                  {/* Image Container with Overlay */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay with Stats Badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Floating Icon Badge */}
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`absolute top-4 left-4 w-14 h-14 bg-gradient-to-br ${feature.badgeColor} rounded-2xl flex items-center justify-center shadow-xl`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>

                    {/* Stats Badge */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                      <div className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {feature.stats.value}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {feature.stats.label}
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${feature.badgeColor} text-white shadow-lg`}>
                        {feature.badge}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-6 space-y-4">
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-text-secondary leading-relaxed text-sm">
                      {feature.description}
                    </p>

                    {/* Highlights */}
                    <ul className="space-y-2">
                      {feature.highlights.map((highlight, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                          className="flex items-start space-x-2 text-sm"
                        >
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${feature.badgeColor} flex items-center justify-center mt-0.5`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-text-secondary">{highlight}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="pt-4">
                      <Link
                        href="/auth/signin"
                        className={`inline-flex items-center space-x-2 text-sm font-semibold transition-all group-hover:gap-3 ${
                          isHovered ? 'text-primary' : 'text-text-secondary'
                        }`}
                      >
                        <span>Try this feature</span>
                        <ArrowRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                      </Link>
                    </div>
                  </div>

                  {/* Decorative Corner Element */}
                  <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${feature.badgeColor} opacity-5 rounded-tl-[80px]`} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="inline-flex flex-col items-center space-y-6 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 lg:p-12 border-2 border-primary/20">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg"
                  >
                    {i}K+
                  </div>
                ))}
              </div>
              <p className="text-text-secondary font-medium">
                Users already transforming their LinkedIn presence
              </p>
            </div>

            <Link
              href="/auth/signin"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-primary text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-2xl hover:scale-105 shadow-xl"
            >
              <span>Start Using All Features Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-sm text-text-secondary">
              No credit card required • 5 free posts per month • Upgrade anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
