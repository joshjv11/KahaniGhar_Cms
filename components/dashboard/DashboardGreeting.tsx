"use client";

import { useState, useEffect } from "react";

function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
}

export function DashboardGreeting({ draftCount }: { draftCount: number }) {
  // Use a fixed initial greeting so server and client match (avoids hydration error).
  // Update to the real time-based greeting after mount.
  const [greeting, setGreeting] = useState("Good day");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="mb-10">
      <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
        {greeting}, Editor.
      </h1>
      <p className="text-slate-400 text-base">
        {draftCount > 0
          ? `You have ${draftCount} draft${draftCount === 1 ? "" : "s"} pending.`
          : "Your content is up to date."}
      </p>
    </div>
  );
}
