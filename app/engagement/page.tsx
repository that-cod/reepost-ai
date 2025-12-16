"use client";

import { BarChart3 } from "lucide-react";
import ComingSoon from "@/components/common/ComingSoon";

export default function EngagementPage() {
  return (
    <ComingSoon
      title="Engagement Analytics"
      description="Track your LinkedIn performance with detailed analytics. Monitor engagement, growth, and optimize your content strategy."
      icon={<BarChart3 className="w-10 h-10 text-primary" />}
    />
  );
}
