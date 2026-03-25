import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ChefHat, Clock, Loader2, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../../backend";
import { OrderStatus } from "../../backend";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useQueries";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [OrderStatus.pending]: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  [OrderStatus.preparing]: {
    label: "Preparing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <ChefHat className="w-3.5 h-3.5" />,
  },
  [OrderStatus.ready]: {
    label: "Ready",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  [OrderStatus.delivered]: {
    label: "Delivered",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
};

function formatTime(createdAt: bigint): string {
  const ms = Number(createdAt) / 1_000_000;
  return new Date(ms).toLocaleString();
}

export default function OrdersTab() {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");

  const sorted = [...orders].sort((a, b) => Number(b.createdAt - a.createdAt));
  const filtered =
    filterStatus === "all"
      ? sorted
      : sorted.filter((o) => o.status === filterStatus);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        id: order.id,
        status: newStatus as OrderStatus,
      });
      toast.success(`Order #${order.id} updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-16"
        data-ocid="orders.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap" data-ocid="orders.tab">
        {(["all", ...Object.values(OrderStatus)] as const).map((status) => (
          <button
            type="button"
            key={status}
            data-ocid="orders.tab"
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:bg-accent"
            }`}
          >
            {status === "all"
              ? "All Orders"
              : STATUS_CONFIG[status as OrderStatus]?.label}
            <span className="ml-1.5 text-xs">
              (
              {status === "all"
                ? orders.length
                : orders.filter((o) => o.status === status).length}
              )
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div
          data-ocid="orders.empty_state"
          className="text-center py-16 bg-card rounded-2xl"
        >
          <p className="text-4xl mb-3">📋</p>
          <p className="font-heading font-semibold text-lg text-foreground">
            No orders yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Orders will appear here once customers place them
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((order, idx) => {
            const config = STATUS_CONFIG[order.status];
            return (
              <div
                key={order.id.toString()}
                data-ocid={`orders.row.${idx + 1}`}
                className="bg-card rounded-2xl p-5 shadow-xs hover:shadow-card transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-foreground">
                        Order #{Number(order.id)}
                      </span>
                      <Badge
                        className={`flex items-center gap-1 text-xs font-semibold border ${config?.color || ""}`}
                        variant="outline"
                      >
                        {config?.icon}
                        {config?.label || order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {order.customerName}
                      </span>
                      {" · "}
                      {formatTime(order.createdAt)}
                    </p>
                    {order.customerNote && (
                      <p className="text-xs text-muted-foreground italic">
                        Note: {order.customerNote}
                      </p>
                    )}
                  </div>

                  {/* Status selector */}
                  <Select
                    value={order.status}
                    onValueChange={(v) => handleStatusChange(order, v)}
                  >
                    <SelectTrigger
                      data-ocid={`orders.select.${idx + 1}`}
                      className="w-36 h-8 text-xs rounded-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(OrderStatus).map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {STATUS_CONFIG[s]?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    {order.items.map((item, iIdx) => (
                      <div
                        key={`${order.id}-${item.name}-${iIdx}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          <span className="font-semibold text-primary">
                            {Number(item.quantity)}×
                          </span>{" "}
                          {item.name}
                          {item.specialInstructions && (
                            <span className="text-xs text-muted-foreground italic ml-1">
                              ({item.specialInstructions})
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          ${(item.price * Number(item.quantity)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                    <span className="text-sm font-semibold text-foreground">
                      Total
                    </span>
                    <span className="font-heading font-bold text-primary text-base">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
