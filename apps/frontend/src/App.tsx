import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/ui/sonner";
import { AppShell } from "@/shell/AppShell";
import { apolloClient } from "@/shared/lib/apollo-client";
import { AuthProvider } from "@/shell/AuthProvider";

import { DashboardPage } from "@/pages/DashboardPage";
import { VisualizationPage } from "@/pages/VisualizationPage";
import { AdminPage } from "@/pages/AdminPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { CrossModulePage } from "@/pages/CrossModulePage";
import { SocialFeedPage } from "@/pages/SocialFeedPage";
import { AIGeneratorPage } from "@/pages/AIGeneratorPage";
import { SceneBuilderPage } from "@/pages/SceneBuilderPage";
import { ShaderPlaygroundPage } from "@/pages/ShaderPlaygroundPage";
import { MarketplacePage } from "@/pages/MarketplacePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2 },
  },
});

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard/*" element={<DashboardPage />} />
                <Route path="/social" element={<SocialFeedPage />} />
                <Route path="/generate" element={<AIGeneratorPage />} />
                <Route path="/3d/*" element={<VisualizationPage />} />
                <Route path="/scene-builder" element={<SceneBuilderPage />} />
                <Route path="/shaders" element={<ShaderPlaygroundPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/analytics/*" element={<AnalyticsPage />} />
                <Route path="/heatmap-3d" element={<CrossModulePage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
