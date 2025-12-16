"use client";

import { Bookmark } from "lucide-react";
import ComingSoon from "@/components/common/ComingSoon";

export default function SavedPage() {
  return (
    <ComingSoon
      title="Saved Posts"
      description="Access your saved posts anytime. Keep your favorite generated content organized and ready to publish when the time is right."
      icon={<Bookmark className="w-10 h-10 text-primary" />}
    />
  );
}
