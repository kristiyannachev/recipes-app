"use client";

import PageFeedback from "@/components/PageFeedback";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <PageFeedback kind="error" onRetry={reset} />;
}
