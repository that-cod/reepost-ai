'use client';

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const plans = [
    {
        name: "Starter",
        price: "0",
        description: "Perfect for trying out RepostAI.",
        features: ["5 AI Posts / month", "Basic Formatting", "1 LinkedIn Account", "Standard Support"],
        cta: "Start for Free",
        variant: "glass"
    },
    {
        name: "Pro",
        price: "29",
        description: "For serious creators growing their brand.",
        features: ["Unlimited AI Posts", "Viral Hooks Database", "3 LinkedIn Accounts", "Analytics Dashboard", "Priority Support"],
        cta: "Get Started",
        popular: true,
        variant: "glow"
    },
    {
        name: "Agency",
        price: "99",
        description: "Manage multiple clients with ease.",
        features: ["Everything in Pro", "Unlimited Accounts", "Team Collaboration", "White Label Reports", "API Access"],
        cta: "Contact Sales",
        variant: "glass"
    }
];

export function Pricing() {
    return (
        <section className="py-24 relative" id="pricing">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-gray-400">Start for free, upgrade when you're ready.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative glass-card rounded-2xl p-8 flex flex-col ${plan.popular ? 'border-primary/50 ring-1 ring-primary/20 scale-105 z-10' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 left-0 flex justify-center -translate-y-1/2">
                                    <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">Most Popular</span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    <span className="text-gray-500">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check className="size-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/auth/signin" className="w-full">
                                <Button variant={plan.variant as any} className="w-full">
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
