"use client";

import { TrendingUp } from "lucide-react";
import ComingSoon from "@/components/common/ComingSoon";

export default function TrendingPage() {
  return (
    <ComingSoon
      title="Trending Posts"
      description="Discover what's trending on LinkedIn. Analyze viral posts and get inspired by top-performing content in your industry."
      icon={<TrendingUp className="w-10 h-10 text-primary" />}
    />
  );
}
