"use client";

import { Calendar } from "lucide-react";
import ComingSoon from "@/components/common/ComingSoon";

export default function CalendarPage() {
  return (
    <ComingSoon
      title="Content Calendar"
      description="Schedule and manage your LinkedIn content publishing timeline. Plan weeks ahead with our intelligent scheduling system."
      icon={<Calendar className="w-10 h-10 text-primary" />}
    />
  );
}
