import { Suspense, lazy } from "react";

const Marketplace = lazy(
  () => import("@/modules/video-intelligence/Marketplace")
);

export function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">
            Loading Marketplace...
          </div>
        </div>
      }
    >
      <Marketplace />
    </Suspense>
  );
}
