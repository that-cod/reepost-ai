"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { X, Check, Clock, Zap, Target, BarChart, ArrowRight } from "lucide-react";

const beforeItems = [
  "Spending hours crafting the perfect post",
  "Struggling with writer's block and inconsistent posting",
  "Low engagement and minimal reach on your content",
  "Missing out on leads and opportunities",
];

const afterItems = [
  "Generate viral-worthy posts in under 2 minutes",
  "Consistent content calendar with AI-powered scheduling",
  "3x higher engagement rates with data-driven insights",
  "Turn your LinkedIn into a lead generation machine",
];

const benefits = [
  {
    icon: Clock,
    title: "Save 10+ Hours/Week",
    description: "Automate your content creation and focus on what matters",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "AI-Powered Intelligence",
    description: "Learn from 10,000+ viral posts to create winning content",
    gradient: "from-primary to-accent",
  },
  {
    icon: Target,
    title: "Laser-Focused Targeting",
    description: "Reach your ideal audience with optimized post timing",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: BarChart,
    title: "Track & Optimize",
    description: "Real-time analytics to improve your content strategy",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function NewWhySection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden" ref={ref}>
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            Why{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Repost Ai?
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Stop struggling with LinkedIn content. Start dominating your feed.
          </p>
        </motion.div>

        {/* Before/After Comparison - Enhanced */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl transform group-hover:scale-105 transition-transform duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm border-2 border-red-200 rounded-3xl p-8 lg:p-10 shadow-xl">
              {/* Icon Badge */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <X className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-text-primary">
                    Before Repost Ai
                  </h3>
                  <p className="text-sm text-red-600 font-medium">The struggle is real</p>
                </div>
              </div>

              {/* Problems List */}
              <div className="space-y-4">
                {beforeItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-start space-x-3 group/item"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                      <X className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-text-secondary leading-relaxed group-hover/item:text-text-primary transition-colors">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform group-hover:scale-105 transition-transform duration-300 blur-xl" />
            <div className="relative bg-gradient-to-br from-light-green to-pastel-green/50 border-2 border-primary/40 rounded-3xl p-8 lg:p-10 shadow-2xl">
              {/* Icon Badge */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-text-primary">
                    After Repost Ai
                  </h3>
                  <p className="text-sm text-primary font-medium">LinkedIn domination</p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                {afterItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-start space-x-3 group/item"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-text-primary font-medium leading-relaxed group-hover/item:text-primary-dark transition-colors">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Highlight Badge */}
              <div className="mt-6 inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 shadow-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-primary">
                  Join 1,000+ satisfied users
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Benefits Grid - Enhanced */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-10 rounded-2xl blur-xl transition-opacity duration-300`} />

                {/* Card */}
                <div className="relative bg-white border-2 border-border group-hover:border-primary/30 rounded-2xl p-6 shadow-soft hover:shadow-hover transition-all duration-300">
                  {/* Icon */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-5 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h4 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center space-x-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-semibold">Learn more</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
