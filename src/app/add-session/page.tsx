import { Suspense } from "react";

import { AddSessionScreen } from "@/features/sessions/screens/add-session-screen";
import { LoadingState } from "@/components/common/loading-state";

export default function AddSessionPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading session form..." />}>
      <AddSessionScreen />
    </Suspense>
  );
}
