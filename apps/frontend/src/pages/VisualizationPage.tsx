import { Suspense, lazy } from "react";

const Visualization3DModule = lazy(
  () => import("@/modules/3d-visualization/Visualization3DModule")
);

export function VisualizationPage() {
  return (
    <div className="h-screen">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">
              Loading 3D Visualization...
            </div>
          </div>
        }
      >
        <Visualization3DModule />
      </Suspense>
    </div>
  );
}
