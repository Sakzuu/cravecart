import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MenuItem, OrderStatus } from "../backend";
import type { OrderItem } from "../backend";
import { useActor } from "./useActor";

export function useMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAvailableMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["availableMenuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMenuCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["menuCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuItemCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addMenuItem(
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menuItems"] });
      qc.invalidateQueries({ queryKey: ["availableMenuItems"] });
      qc.invalidateQueries({ queryKey: ["menuCategories"] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: bigint;
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
      available: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateMenuItem(
        data.id,
        data.name,
        data.description,
        data.price,
        data.category,
        data.imageUrl,
        data.available,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menuItems"] });
      qc.invalidateQueries({ queryKey: ["availableMenuItems"] });
    },
  });
}

export function useRemoveMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeMenuItem(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menuItems"] });
      qc.invalidateQueries({ queryKey: ["availableMenuItems"] });
    },
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      customerName: string;
      customerNote: string;
      items: OrderItem[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(
        data.customerName,
        data.customerNote,
        data.items,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(data.id, data.status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
