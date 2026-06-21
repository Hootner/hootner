import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ShieldCheck, CreditCard, Users } from "@phosphor-icons/react";
import AdminPanel from "@/modules/video-intelligence/AdminPanel";
import Billing from "@/modules/video-intelligence/Billing";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground mt-1">
          Platform management, billing, and team controls
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/50 backdrop-blur-sm p-2">
          <TabsTrigger value="admin" className="gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Panel</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Moderation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <AdminPanel />
        </TabsContent>
        <TabsContent value="billing">
          <Billing />
        </TabsContent>
        <TabsContent value="moderation">
          <div className="text-center py-12 text-muted-foreground">
            Content moderation dashboard
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
