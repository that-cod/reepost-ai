"use client";

import { Users } from "lucide-react";
import ComingSoon from "@/components/common/ComingSoon";

export default function CreatorsPage() {
  return (
    <ComingSoon
      title="Top Creators"
      description="Browse the most influential LinkedIn creators. Learn from their strategies and get insights into what makes content go viral."
      icon={<Users className="w-10 h-10 text-primary" />}
    />
  );
}
