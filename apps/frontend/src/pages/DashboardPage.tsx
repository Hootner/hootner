import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  MonitorPlay,
  Waveform,
  SunHorizon,
  SquaresFour,
} from "@phosphor-icons/react";
import Dashboard from "@/modules/video-intelligence/Dashboard";
import HDRShowcase from "@/modules/video-intelligence/HDRShowcase";
import DolbyAtmosExperience from "@/modules/video-intelligence/DolbyAtmosExperience";
import { useAuthContext } from "@/shared/hooks/useAuth";

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState("library");
  const { user } = useAuthContext();

  const currentUser = user || {
    id: "demo",
    username: "demo",
    email: "demo@hootner.com",
    role: "admin" as const,
    loginTime: new Date().toISOString(),
  };

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Video Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered video management, HDR showcase, and spatial audio
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm p-2">
          <TabsTrigger value="library" className="gap-2">
            <MonitorPlay className="w-4 h-4" />
            <span className="hidden sm:inline">Library</span>
          </TabsTrigger>
          <TabsTrigger value="hdr" className="gap-2">
            <SunHorizon className="w-4 h-4" />
            <span className="hidden sm:inline">HDR10</span>
          </TabsTrigger>
          <TabsTrigger value="dolby" className="gap-2">
            <Waveform className="w-4 h-4" />
            <span className="hidden sm:inline">Dolby Atmos</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <SquaresFour className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <Dashboard currentUser={currentUser} />
        </TabsContent>
        <TabsContent value="hdr">
          <HDRShowcase />
        </TabsContent>
        <TabsContent value="dolby">
          <DolbyAtmosExperience />
        </TabsContent>
        <TabsContent value="compare">
          <div className="text-center py-12 text-muted-foreground">
            HDR vs SDR comparison view
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
