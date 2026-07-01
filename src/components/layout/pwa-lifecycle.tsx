"use client";

import { useEffect, useState } from "react";

import { registerServiceWorker } from "@/services/pwa/pwa-status";

export function PwaLifecycle() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    void registerServiceWorker();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-primary shadow-lg"
      role="status"
    >
      Offline mode. Saved patient records and cached screens remain available on
      this device.
    </div>
  );
}
