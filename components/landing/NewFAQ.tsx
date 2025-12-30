"use client";

import { motion, AnimatePresence } from "framer-motion";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, HelpCircle, Sparkles, Shield, Zap, Users, Check, MessageCircle } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How does Repost Ai work?",
    answer:
      "Repost Ai uses advanced AI trained on 10,000+ viral LinkedIn posts to generate engaging content tailored to your brand voice. Simply input your topic or upload a document, choose your tone and style, and our AI creates polished posts ready to publish. You can then schedule them using our smart calendar or publish immediately.",
    icon: Sparkles,
    color: "from-primary to-accent",
  },
  {
    question: "Do I need to be a good writer to use this?",
    answer:
      "Not at all! That's the whole point. Repost Ai is designed for busy professionals who want great LinkedIn content without spending hours writing. Our AI handles the writing while you focus on your expertise and growing your business.",
    icon: Zap,
    color: "from-amber-500 to-orange-500",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! We offer a free plan that lets you generate up to 5 posts per month. It's perfect for trying out the platform and seeing the quality of AI-generated content. You can upgrade anytime to unlock unlimited posts, advanced features, and priority support.",
    icon: Check,
    color: "from-primary to-accent",
  },
  {
    question: "How is this different from ChatGPT?",
    answer:
      "While ChatGPT is a general-purpose AI, Repost Ai is specifically trained on viral LinkedIn content and optimized for professional networking. We provide pre-built templates, tone customization, scheduling, analytics, trending feed, and direct LinkedIn integration - everything you need in one platform designed specifically for LinkedIn success.",
    icon: MessageCircle,
    color: "from-blue-500 to-cyan-500",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We take security seriously. All data is encrypted in transit and at rest. We never share your content with third parties, and you retain full ownership of everything you create. We're GDPR compliant and follow industry-standard security practices.",
    icon: Shield,
    color: "from-emerald-500 to-teal-500",
  },
  {
    question: "Will my posts sound authentic?",
    answer:
      "Yes! Our AI learns your unique voice and writing style. You can customize tone (professional, casual, bold, etc.) and intensity levels to match your brand perfectly. Most users find that their audience can't tell the difference - and engagement actually increases because the posts are optimized for LinkedIn's algorithm.",
    icon: Sparkles,
    color: "from-violet-500 to-purple-500",
  },
  {
    question: "Can I use this for my agency or team?",
    answer:
      "Definitely! Our Pro and Enterprise plans support multiple team members with role-based permissions. Each team member can have their own voice settings, and you can manage all accounts from one dashboard. Perfect for agencies managing multiple clients or marketing teams.",
    icon: Users,
    color: "from-indigo-500 to-blue-500",
  },
  {
    question: "What if I'm not satisfied?",
    answer:
      "We offer a 30-day money-back guarantee, no questions asked. If Repost Ai doesn't transform your LinkedIn presence within the first month, we'll refund your purchase in full. We're confident you'll love it, but we want you to feel completely comfortable trying it out.",
    icon: Check,
    color: "from-primary to-accent",
  },
];

export default function NewFAQ() {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <section id="faq" className="relative py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div {...fadeInUp} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-2.5 rounded-full mb-6 border border-primary/20"
          >
            <HelpCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FAQ
            </span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            Got Questions?{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              We've Got Answers
            </span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Everything you need to know about Repost Ai and how it works
          </p>
        </motion.div>

        {/* FAQ Grid - 2 Columns */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            const isOpen = openItem === `item-${index}`;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Accordion.Root
                  type="single"
                  collapsible
                  value={openItem}
                  onValueChange={setOpenItem}
                >
                  <Accordion.Item value={`item-${index}`} className="border-none">
                    <motion.div
                      className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isOpen
                          ? "border-primary shadow-xl shadow-primary/10"
                          : "border-border hover:border-primary/30 hover:shadow-lg"
                        }`}
                      whileHover={{ y: -4 }}
                    >
                      {/* Gradient Background on Hover/Open */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${faq.color} opacity-0 transition-opacity duration-300 ${isOpen ? "opacity-5" : ""
                          }`}
                      />

                      <Accordion.Header>
                        <Accordion.Trigger className="w-full flex items-start justify-between p-6 text-left group relative z-10">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Icon with Gradient */}
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${faq.color} flex items-center justify-center transform transition-transform duration-300 ${isOpen ? "scale-110 rotate-6" : "group-hover:scale-105"
                                }`}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1 pt-1">
                              <h3 className="text-lg font-bold text-text-primary pr-4 group-hover:text-primary transition-colors">
                                {faq.question}
                              </h3>
                            </div>
                          </div>

                          {/* Chevron with Circle Background */}
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-primary rotate-180" : "group-hover:bg-primary/20"
                              }`}
                          >
                            <ChevronDown
                              className={`w-5 h-5 transition-colors duration-300 ${isOpen ? "text-white" : "text-primary"
                                }`}
                            />
                          </div>
                        </Accordion.Trigger>
                      </Accordion.Header>

                      <Accordion.Content className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="px-6 pb-6 pl-[88px] relative z-10"
                        >
                          <div className="border-l-2 border-primary/20 pl-4">
                            <p className="text-text-secondary leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      </Accordion.Content>
                    </motion.div>
                  </Accordion.Item>
                </Accordion.Root>
              </motion.div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative overflow-hidden"
        >
          <div className="relative bg-gradient-to-br from-primary via-primary to-accent rounded-3xl p-8 lg:p-12 text-center shadow-2xl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </motion.div>

              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                Still have questions?
              </h3>
              <p className="text-white/90 mb-6 text-lg max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our friendly team is here to help you succeed.
              </p>

              <a
                href="mailto:support@reepost.ai"
                className="inline-flex items-center space-x-2 bg-white hover:bg-gray-100 text-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <span>Contact Support</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
