# Food Ordering System

## Current State
New project with empty Motoko backend and React frontend scaffold.

## Requested Changes (Diff)

### Add
- Menu browsing page: category tabs, item cards with image/name/description/price, add-to-cart
- Cart sidebar/drawer: item list, quantity controls, special instructions per item, order total, place order button
- Order confirmation page
- Admin panel (no auth required for MVP): manage menu items (add/edit/remove with name, description, price, category, image URL), view all orders, update order status (pending → preparing → ready → delivered)
- Backend: MenuItem and Order data models stored on ICP via Motoko

### Modify
- Nothing (new project)

### Remove
- Nothing

## Implementation Plan
1. Motoko backend:
   - MenuItem type: id, name, description, price (Float), category, imageUrl, available
   - Order type: id, items (array of {menuItemId, name, price, quantity, specialInstructions}), totalPrice, status, createdAt, customerName, customerNote
   - CRUD for menu items
   - Create order, list orders, update order status
   - Seed sample menu items
2. Frontend:
   - Customer view: category filter tabs, menu grid, add-to-cart, cart drawer, place order form
   - Admin view: menu item management table, order list with status updates
   - React Router for /menu and /admin routes
   - Mobile-first Tailwind layout
