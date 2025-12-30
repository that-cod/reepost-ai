"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Star, TrendingUp, Users, Heart } from "lucide-react";
import { useState } from "react";

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Marketing Director",
    company: "TechFlow Inc",
    avatar: "https://i.pravatar.cc/150?img=1",
    quote:
      "Repost Ai transformed my LinkedIn strategy. I went from posting once a week to daily, and my engagement increased 5x in just 2 months!",
    stats: { metric: "5x", label: "Engagement" },
    featured: true,
  },
  {
    name: "Marcus Johnson",
    title: "B2B Sales Coach",
    company: "Growth Academy",
    avatar: "https://i.pravatar.cc/150?img=2",
    quote:
      "As someone who hated writing, this tool is a lifesaver. The AI understands my voice perfectly, and scheduling is effortless.",
    stats: { metric: "10hrs", label: "Saved/Week" },
  },
  {
    name: "Priya Sharma",
    title: "SaaS Founder",
    company: "CloudMetrics",
    avatar: "https://i.pravatar.cc/150?img=3",
    quote:
      "Best investment for my personal brand. The trending feed alone is worth it - I'm always ahead of the curve with relevant content.",
    stats: { metric: "300%", label: "Reach Growth" },
    featured: true,
  },
  {
    name: "David Kim",
    title: "Content Strategist",
    company: "Digital Minds",
    avatar: "https://i.pravatar.cc/150?img=4",
    quote:
      "The analytics dashboard gives me insights I never had before. Now I know exactly what content performs and can double down on what works.",
    stats: { metric: "12k", label: "New Followers" },
  },
  {
    name: "Emily Rodriguez",
    title: "Leadership Coach",
    company: "Executive Edge",
    avatar: "https://i.pravatar.cc/150?img=5",
    quote:
      "I was skeptical about AI-generated content, but Repost Ai nailed my authentic voice. My clients can't tell the difference!",
  },
  {
    name: "James Patterson",
    title: "Growth Marketer",
    company: "ScaleUp Co",
    avatar: "https://i.pravatar.cc/150?img=6",
    quote:
      "Went from 500 to 5,000 followers in 3 months using Repost Ai. The ROI is incredible - already generated 15+ qualified leads.",
    stats: { metric: "15+", label: "Leads Generated" },
    featured: true,
  },
  {
    name: "Aisha Khan",
    title: "HR Consultant",
    company: "TalentHub",
    avatar: "https://i.pravatar.cc/150?img=7",
    quote:
      "The document intelligence feature is brilliant. I turn my blog posts into LinkedIn content in seconds. Total game-changer!",
  },
  {
    name: "Michael Zhang",
    title: "Tech Entrepreneur",
    company: "InnovateTech",
    avatar: "https://i.pravatar.cc/150?img=8",
    quote:
      "Finally, a tool that actually saves time instead of adding more work. The auto-publish feature means I set it once and forget it.",
    stats: { metric: "8x", label: "Time Saved" },
  },
  {
    name: "Sophie Laurent",
    title: "Personal Branding Expert",
    company: "Brand Builders",
    avatar: "https://i.pravatar.cc/150?img=9",
    quote:
      "I recommend Repost Ai to all my clients. It's the fastest way to build authority and credibility on LinkedIn.",
  },
  {
    name: "Raj Patel",
    title: "Finance Consultant",
    company: "Wealth Advisors",
    avatar: "https://i.pravatar.cc/150?img=10",
    quote:
      "Increased my engagement by 400% and closed 3 new clients directly from LinkedIn. This tool pays for itself 10x over.",
    stats: { metric: "400%", label: "Engagement" },
    featured: true,
  },
  {
    name: "Lisa Thompson",
    title: "Career Coach",
    company: "Next Level",
    avatar: "https://i.pravatar.cc/150?img=11",
    quote:
      "The trending content feed keeps me relevant. I'm always the first to comment on hot topics, which boosts my visibility.",
  },
  {
    name: "Omar Hassan",
    title: "Business Development",
    company: "Global Partners",
    avatar: "https://i.pravatar.cc/150?img=12",
    quote:
      "Repost Ai turned LinkedIn into my #1 lead source. The AI knows exactly what my audience wants to read.",
    stats: { metric: "#1", label: "Lead Source" },
  },
];

export default function NewTestimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-32 bg-gradient-to-b from-white to-light-green/30"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeInUp} className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">
              Wall of Love
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              1,000+ Creators
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Join successful professionals who transformed their LinkedIn presence
          </p>
        </motion.div>

        {/* Testimonials Masonry Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className={`break-inside-avoid bg-white rounded-xl p-6 shadow-card hover:shadow-hover transition-all cursor-pointer border ${testimonial.featured ? "border-primary/30" : "border-border"
                }`}
              onClick={() =>
                setExpandedCard(expandedCard === index ? null : index)
              }
            >
              {/* Stats Badge */}
              {testimonial.stats && (
                <div className="inline-flex items-center space-x-2 bg-primary/10 px-3 py-1 rounded-full mb-4">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    {testimonial.stats.metric}
                  </span>
                  <span className="text-xs text-primary/70">
                    {testimonial.stats.label}
                  </span>
                </div>
              )}

              {/* Stars */}
              <div className="flex space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p
                className={`text-text-secondary mb-4 leading-relaxed ${expandedCard === index ? "" : "line-clamp-4"
                  }`}
              >
                "{testimonial.quote}"
              </p>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border-2 border-primary/20"
                />
                <div>
                  <div className="font-semibold text-text-primary">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {testimonial.title}
                  </div>
                  <div className="text-xs text-primary">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-text-secondary mb-6">
            Join these successful professionals today
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <span>Start Your Free Trial</span>
            <Users className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
