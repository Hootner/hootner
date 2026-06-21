import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ChartLine, Eye, Broadcast } from "@phosphor-icons/react";
import Analytics from "@/modules/video-intelligence/Analytics";

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide metrics, engagement, and AI insights
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-sm p-2">
          <TabsTrigger value="overview" className="gap-2">
            <ChartLine className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Engagement</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="gap-2">
            <Broadcast className="w-4 h-4" />
            <span className="hidden sm:inline">Real-time</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Analytics />
        </TabsContent>
        <TabsContent value="engagement">
          <div className="text-center py-12 text-muted-foreground">
            Engagement analytics dashboard
          </div>
        </TabsContent>
        <TabsContent value="realtime">
          <div className="text-center py-12 text-muted-foreground">
            Real-time metrics stream
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
