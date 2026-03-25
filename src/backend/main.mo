import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Persistent state storage
  // Type definitions
  type MenuItem = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
    available : Bool;
  };

  module MenuItem {
    public func compare(a : MenuItem, b : MenuItem) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  type OrderItem = {
    menuItemId : Nat;
    name : Text;
    price : Float;
    quantity : Nat;
    specialInstructions : Text;
  };

  type OrderStatus = {
    #pending;
    #preparing;
    #ready;
    #delivered;
  };

  type Order = {
    id : Nat;
    items : [OrderItem];
    totalPrice : Float;
    status : OrderStatus;
    createdAt : Int;
    customerName : Text;
    customerNote : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Persistent storage
  let menuItems = Map.empty<Nat, MenuItem>();
  let orders = Map.empty<Nat, Order>();
  let orderOwners = Map.empty<Nat, Principal>(); // Track which Principal created each order
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextMenuItemId = 1;
  var nextOrderId = 1;

  // Seed initial menu items on deployment
  system func preupgrade() { nextMenuItemId := 1; nextOrderId := 1 };
  system func postupgrade() {
    // Seed burgers
    addMenuItemInternal("Classic Burger", "Juicy beef patty with lettuce, tomato, and special sauce", 8.99, "Burgers", "https://images.unsplash.com/photo-1550317138-10000687a72b", true);
    addMenuItemInternal("Cheese Burger", "Classic burger with cheddar cheese", 9.49, "Burgers", "https://images.unsplash.com/photo-1562967916-eb82221dfb32", true);
    addMenuItemInternal("Chicken Burger", "Grilled chicken breast with mayo and pickles", 8.79, "Burgers", "https://images.unsplash.com/photo-1625949277882-92e87e2d97c9", true);

    // Seed pizza
    addMenuItemInternal("Margherita Pizza", "Fresh mozzarella, tomatoes, and basil", 12.99, "Pizza", "https://images.unsplash.com/photo-1504674900247-0877df9cc836", true);
    addMenuItemInternal("Pepperoni Pizza", "Classic pizza with pepperoni slices", 13.99, "Pizza", "https://images.unsplash.com/photo-1513104890138-7c749659a591", true);
    addMenuItemInternal("Veggie Pizza", "Loaded with fresh veggies and cheese", 11.99, "Pizza", "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0", true);

    // Seed drinks
    addMenuItemInternal("Coke", "Refreshing cola drink", 1.99, "Drinks", "https://images.unsplash.com/photo-1519864600265-abb23847ef9b", true);
    addMenuItemInternal("Lemonade", "Freshly squeezed lemonade", 2.49, "Drinks", "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a", true);
    addMenuItemInternal("Milkshake", "Creamy vanilla milkshake", 3.99, "Drinks", "https://images.unsplash.com/photo-1523987355523-c7b5b0723caa", true);

    // Seed sides
    addMenuItemInternal("Fries", "Crispy golden fries with ketchup", 3.49, "Sides", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0", true);
    addMenuItemInternal("Onion Rings", "Battered and fried onion rings", 4.29, "Sides", "https://images.unsplash.com/photo-1502741338009-cac2772e18bc", true);
    addMenuItemInternal("Mozzarella Sticks", "Fried cheese sticks with marinara", 5.79, "Sides", "https://images.unsplash.com/photo-1519864600265-abb23847ef9b", true);
  };

  // Internal helper function to add menu item
  func addMenuItemInternal(name : Text, description : Text, price : Float, category : Text, imageUrl : Text, available : Bool) {
    let id = nextMenuItemId;
    let menuItem : MenuItem = {
      id;
      name;
      description;
      price;
      category;
      imageUrl;
      available;
    };
    menuItems.add(id, menuItem);
    nextMenuItemId += 1;
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Menu Management (Admin Only)
  public shared ({ caller }) func addMenuItem(name : Text, description : Text, price : Float, category : Text, imageUrl : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };
    let id = nextMenuItemId;
    let menuItem : MenuItem = {
      id;
      name;
      description;
      price;
      category;
      imageUrl;
      available = true;
    };
    menuItems.add(id, menuItem);
    nextMenuItemId += 1;
    id;
  };

  public shared ({ caller }) func updateMenuItem(id : Nat, name : Text, description : Text, price : Float, category : Text, imageUrl : Text, available : Bool) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    switch (menuItems.get(id)) {
      case (null) { false };
      case (?existingItem) {
        let updatedItem : MenuItem = {
          id;
          name;
          description;
          price;
          category;
          imageUrl;
          available;
        };
        menuItems.add(id, updatedItem);
        true;
      };
    };
  };

  public shared ({ caller }) func removeMenuItem(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove menu items");
    };
    if (not menuItems.containsKey(id)) { return false };
    menuItems.remove(id);
    true;
  };

  // Menu Browsing (Public - no auth required)
  public query ({ caller }) func getMenuItems() : async [MenuItem] {
    menuItems.values().toArray().sort();
  };

  public query ({ caller }) func getMenuItem(id : Nat) : async ?MenuItem {
    menuItems.get(id);
  };

  // Order Management
  public shared ({ caller }) func createOrder(customerName : Text, customerNote : Text, items : [OrderItem]) : async Nat {
    // Any caller (including guests) can create orders
    // Calculate total price
    let totalPrice = items.foldLeft(0.0, func(acc, item) { acc + (item.price * item.quantity.toFloat()) });

    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      items;
      totalPrice;
      status = #pending;
      createdAt = 0;
      customerName;
      customerNote;
    };
    orders.add(orderId, order);
    orderOwners.add(orderId, caller); // Track who created this order
    nextOrderId += 1;
    orderId;
  };

  // Get all orders (Admin Only)
  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getOrder(id : Nat) : async ?Order {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        // Check if caller is admin or the order owner
        let isOwner = switch (orderOwners.get(id)) {
          case (null) { false };
          case (?owner) { owner == caller };
        };
        if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order statuses");
    };
    switch (orders.get(id)) {
      case (null) { false };
      case (?existingOrder) {
        let updatedOrder : Order = {
          id = existingOrder.id;
          items = existingOrder.items;
          totalPrice = existingOrder.totalPrice;
          status;
          createdAt = existingOrder.createdAt;
          customerName = existingOrder.customerName;
          customerNote = existingOrder.customerNote;
        };
        orders.add(id, updatedOrder);
        true;
      };
    };
  };

  // Retrieval functions
  public query ({ caller }) func getMenuItemsByCategory(category : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.category == category });
  };

  public query ({ caller }) func searchMenuItems(searchTerm : Text) : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.name.contains(#text searchTerm) or item.description.contains(#text searchTerm) });
  };

  public query ({ caller }) func getAvailableMenuItems() : async [MenuItem] {
    menuItems.values().toArray().filter(func(item) { item.available });
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders by status");
    };
    orders.values().toArray().filter(func(order) { order.status == status });
  };

  public query ({ caller }) func getCustomerOrders(customerName : Text) : async [Order] {
    // Only admins can query orders by customer name (privacy protection)
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view orders by customer name");
    };
    orders.values().toArray().filter(func(order) { order.customerName == customerName });
  };

  public query ({ caller }) func getOrderTotal(id : Nat) : async ?Float {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        // Check if caller is admin or the order owner
        let isOwner = switch (orderOwners.get(id)) {
          case (null) { false };
          case (?owner) { owner == caller };
        };
        if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order.totalPrice;
      };
    };
  };

  public query ({ caller }) func getOrderStatus(id : Nat) : async ?OrderStatus {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        // Check if caller is admin or the order owner
        let isOwner = switch (orderOwners.get(id)) {
          case (null) { false };
          case (?owner) { owner == caller };
        };
        if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order.status;
      };
    };
  };

  public query ({ caller }) func getOrderItems(id : Nat) : async ?[OrderItem] {
    switch (orders.get(id)) {
      case (null) { null };
      case (?order) {
        // Check if caller is admin or the order owner
        let isOwner = switch (orderOwners.get(id)) {
          case (null) { false };
          case (?owner) { owner == caller };
        };
        if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order.items;
      };
    };
  };

  public query ({ caller }) func getMenuItemCategories() : async [Text] {
    menuItems.values().toArray().map(func(item) { item.category });
  };
};
