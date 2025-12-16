"use client";

import { Settings } from "lucide-react";
import ComingSoon from "@/components/common/ComingSoon";

export default function SettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      description="Customize your Reepost.ai experience. Manage your profile, preferences, AI settings, and notifications all in one place."
      icon={<Settings className="w-10 h-10 text-primary" />}
    />
  );
}
