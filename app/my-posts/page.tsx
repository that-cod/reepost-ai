"use client";

import { FileText } from "lucide-react";
import ComingSoon from "@/components/common/ComingSoon";

export default function MyPostsPage() {
  return (
    <ComingSoon
      title="My Posts"
      description="View and manage all your generated posts. Edit, schedule, or publish directly to LinkedIn from one central dashboard."
      icon={<FileText className="w-10 h-10 text-primary" />}
    />
  );
}
