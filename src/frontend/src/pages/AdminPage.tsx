import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import MenuItemsTab from "../components/admin/MenuItemsTab";
import OrdersTab from "../components/admin/OrdersTab";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: isAdmin, isLoading, refetch } = useIsAdmin();
  const [enabling, setEnabling] = useState(false);

  const handleEnableAdmin = async () => {
    if (!identity || !actor) {
      toast.error("Please connect your wallet first.");
      return;
    }
    setEnabling(true);
    try {
      await actor.assignCallerUserRole(identity.getPrincipal(), UserRole.admin);
      toast.success("Admin access granted!");
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to enable admin. You may not have permission.");
    } finally {
      setEnabling(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="max-w-[500px] mx-auto px-6 py-20 text-center"
        data-ocid="admin.panel"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-10 shadow-card space-y-5"
        >
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground">
            Admin Access Required
          </h2>
          <p className="text-muted-foreground">
            You need admin privileges to access the management panel.
          </p>
          <Button
            data-ocid="admin.primary_button"
            onClick={handleEnableAdmin}
            disabled={enabling}
            className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8"
          >
            {enabling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enabling...
              </>
            ) : (
              "Enable Admin Access"
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10" data-ocid="admin.panel">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-heading font-bold text-3xl text-foreground">
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your menu and orders
        </p>
      </motion.div>

      <Tabs defaultValue="menu" className="space-y-6">
        <TabsList
          className="bg-card border border-border p-1 rounded-xl"
          data-ocid="admin.tab"
        >
          <TabsTrigger
            value="menu"
            data-ocid="admin.tab"
            className="rounded-lg font-semibold"
          >
            Menu Items
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            data-ocid="admin.tab"
            className="rounded-lg font-semibold"
          >
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <MenuItemsTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
