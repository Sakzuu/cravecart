import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, User, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const { totalItems, openCart } = useCart();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [, setSearchOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[oklch(0.98_0.012_85)] border-b border-border shadow-xs">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            data-ocid="nav.link"
          >
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              CraveCart
            </span>
          </Link>

          {/* Nav */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-ocid="nav.link"
                className={`font-body text-sm font-medium transition-colors hover:text-primary ${
                  currentPath === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Account"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <User className="w-4 h-4" />
            </button>
            <button
              type="button"
              data-ocid="cart.open_modal_button"
              onClick={openCart}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-body text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
