import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MenuItem {
    id: bigint;
    name: string;
    description: string;
    available: boolean;
    imageUrl: string;
    category: string;
    price: number;
}
export interface OrderItem {
    name: string;
    specialInstructions: string;
    quantity: bigint;
    price: number;
    menuItemId: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    customerNote: string;
    status: OrderStatus;
    createdAt: bigint;
    items: Array<OrderItem>;
    totalPrice: number;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    preparing = "preparing",
    pending = "pending",
    delivered = "delivered",
    ready = "ready"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(name: string, description: string, price: number, category: string, imageUrl: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrder(customerName: string, customerNote: string, items: Array<OrderItem>): Promise<bigint>;
    getAvailableMenuItems(): Promise<Array<MenuItem>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerOrders(customerName: string): Promise<Array<Order>>;
    getMenuItem(id: bigint): Promise<MenuItem | null>;
    getMenuItemCategories(): Promise<Array<string>>;
    getMenuItems(): Promise<Array<MenuItem>>;
    getMenuItemsByCategory(category: string): Promise<Array<MenuItem>>;
    getOrder(id: bigint): Promise<Order | null>;
    getOrderItems(id: bigint): Promise<Array<OrderItem> | null>;
    getOrderStatus(id: bigint): Promise<OrderStatus | null>;
    getOrderTotal(id: bigint): Promise<number | null>;
    getOrders(): Promise<Array<Order>>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeMenuItem(id: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchMenuItems(searchTerm: string): Promise<Array<MenuItem>>;
    updateMenuItem(id: bigint, name: string, description: string, price: number, category: string, imageUrl: string, available: boolean): Promise<boolean>;
    updateOrderStatus(id: bigint, status: OrderStatus): Promise<boolean>;
}
