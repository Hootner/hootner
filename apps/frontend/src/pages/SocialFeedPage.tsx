import { Suspense, lazy } from "react";

const SocialFeed = lazy(
  () => import("@/modules/video-intelligence/SocialFeed")
);

export function SocialFeedPage() {
  const demoUser = {
    id: "demo-1",
    username: "platform-user",
    email: "user@hootner.io",
    role: "admin" as const,
    loginTime: new Date().toISOString(),
  };

  return (
    <div className="p-6 lg:p-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">
              Loading Social Feed...
            </div>
          </div>
        }
      >
        <SocialFeed currentUser={demoUser} />
      </Suspense>
    </div>
  );
}
