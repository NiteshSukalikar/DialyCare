export type PwaRegistrationStatus =
  | "unsupported"
  | "registered"
  | "failed"
  | "skipped";

export async function registerServiceWorker(): Promise<PwaRegistrationStatus> {
  if (typeof window === "undefined") {
    return "skipped";
  }

  if (!("serviceWorker" in navigator)) {
    return "unsupported";
  }

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return "registered";
  } catch {
    return "failed";
  }
}
