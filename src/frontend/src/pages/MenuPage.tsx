import { Input } from "@/components/ui/input";
import { ChevronRight, Loader2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import type { MenuItem } from "../backend";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";
import { useAvailableMenuItems, useMenuCategories } from "../hooks/useQueries";

const SAMPLE_ITEMS: MenuItem[] = [
  {
    id: BigInt(1),
    name: "Classic Smash Burger",
    description:
      "Double smash patty with American cheese, pickles, caramelized onions and special sauce on a brioche bun.",
    price: 12.99,
    category: "Burgers",
    imageUrl: "/assets/generated/burger-classic.dim_400x300.jpg",
    available: true,
  },
  {
    id: BigInt(2),
    name: "BBQ Bacon Burger",
    description:
      "Smoky BBQ beef patty topped with crispy bacon, cheddar, jalapeños and tangy coleslaw.",
    price: 14.99,
    category: "Burgers",
    imageUrl: "/assets/generated/burger-bbq.dim_400x300.jpg",
    available: true,
  },
  {
    id: BigInt(3),
    name: "Pepperoni Feast Pizza",
    description:
      "Hand-stretched dough loaded with mozzarella, San Marzano tomato sauce and 24 pepperoni slices.",
    price: 16.99,
    category: "Pizza",
    imageUrl: "/assets/generated/pizza-pepperoni.dim_400x300.jpg",
    available: true,
  },
  {
    id: BigInt(4),
    name: "Margherita Classica",
    description:
      "Fresh buffalo mozzarella, cherry tomatoes, fragrant basil and extra virgin olive oil on a thin crispy base.",
    price: 14.99,
    category: "Pizza",
    imageUrl: "/assets/generated/pizza-margherita.dim_400x300.jpg",
    available: true,
  },
  {
    id: BigInt(5),
    name: "Fresh Lemonade",
    description:
      "Freshly squeezed lemonade with mint, served over crushed ice. Sweet, tangy, and refreshing.",
    price: 4.99,
    category: "Drinks",
    imageUrl: "/assets/generated/drink-lemonade.dim_400x300.jpg",
    available: true,
  },
  {
    id: BigInt(6),
    name: "Chocolate Milkshake",
    description:
      "Thick and creamy chocolate milkshake topped with whipped cream and a drizzle of chocolate sauce.",
    price: 6.99,
    category: "Drinks",
    imageUrl: "/assets/generated/drink-milkshake.dim_400x300.jpg",
    available: true,
  },
  {
    id: BigInt(7),
    name: "Crispy Golden Fries",
    description:
      "Double-fried russet potato fries seasoned with sea salt, served with house dipping sauce.",
    price: 4.99,
    category: "Sides",
    imageUrl: "/assets/generated/sides-fries.dim_400x300.jpg",
    available: true,
  },
  {
    id: BigInt(8),
    name: "Onion Ring Tower",
    description:
      "Beer-battered jumbo onion rings with a golden crispy coating, served with ranch dip.",
    price: 5.99,
    category: "Sides",
    imageUrl: "/assets/generated/sides-onionrings.dim_400x300.jpg",
    available: true,
  },
];

const SAMPLE_CATEGORIES = ["Burgers", "Pizza", "Drinks", "Sides"];

const CATEGORY_ICONS: Record<string, string> = {
  Burgers: "🍔",
  Pizza: "🍕",
  Drinks: "🥤",
  Sides: "🍟",
  Desserts: "🍰",
  Salads: "🥗",
  Sandwiches: "🥪",
  Breakfast: "🍳",
};

export default function MenuPage() {
  const { openCart } = useCart();
  const { actor } = useActor();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MenuItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: fetchedItems, isLoading: itemsLoading } =
    useAvailableMenuItems();
  const { data: fetchedCategories, isLoading: catsLoading } =
    useMenuCategories();

  const menuItems =
    fetchedItems && fetchedItems.length > 0 ? fetchedItems : SAMPLE_ITEMS;
  const rawCategories =
    fetchedCategories && fetchedCategories.length > 0
      ? fetchedCategories
      : SAMPLE_CATEGORIES;
  const categories = ["All", ...rawCategories];

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      if (!term.trim()) {
        setSearchResults(null);
        return;
      }
      searchTimeout.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          if (actor) {
            const results = await actor.searchMenuItems(term);
            setSearchResults(results);
          } else {
            const lower = term.toLowerCase();
            setSearchResults(
              menuItems.filter(
                (item) =>
                  item.name.toLowerCase().includes(lower) ||
                  item.description.toLowerCase().includes(lower),
              ),
            );
          }
        } catch {
          const lower = term.toLowerCase();
          setSearchResults(
            menuItems.filter(
              (item) =>
                item.name.toLowerCase().includes(lower) ||
                item.description.toLowerCase().includes(lower),
            ),
          );
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [actor, menuItems],
  );

  const displayItems =
    searchResults !== null
      ? searchResults
      : selectedCategory === "All"
        ? menuItems
        : menuItems.filter((item) => item.category === selectedCategory);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.88 0.07 65) 0%, oklch(0.96 0.03 75) 60%, oklch(0.97 0.018 85) 100%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5"
          >
            <span className="inline-block bg-primary/10 text-primary font-semibold text-sm px-4 py-1.5 rounded-full">
              🔥 Fresh & Fast Delivery
            </span>
            <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-foreground leading-tight">
              Order <span className="text-primary">Delicious</span>
              <br />
              Food
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              From juicy burgers to crispy pizza — fresh ingredients, bold
              flavors, delivered straight to your door.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                data-ocid="hero.primary_button"
                onClick={scrollToMenu}
                className="bg-primary text-primary-foreground px-7 py-3 rounded-full font-heading font-semibold text-base hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                View Menu <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                data-ocid="hero.secondary_button"
                onClick={openCart}
                className="border-2 border-primary text-primary px-7 py-3 rounded-full font-heading font-semibold text-base hover:bg-accent transition-colors"
              >
                View Cart
              </button>
            </div>
            {/* Stats */}
            <div className="flex gap-6 pt-2">
              {[
                { val: "500+", label: "Items" },
                { val: "4.9★", label: "Rating" },
                { val: "30min", label: "Delivery" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading font-bold text-xl text-foreground">
                    {stat.val}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block"
          >
            <img
              src="/assets/generated/hero-food.dim_1200x600.jpg"
              alt="Delicious food selection"
              className="w-full h-[360px] object-cover rounded-3xl shadow-card-hover"
            />
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section
        id="menu"
        ref={menuRef}
        className="max-w-[1200px] mx-auto px-6 py-12"
      >
        <div className="mb-8">
          <h2 className="font-heading font-bold text-3xl text-foreground mb-1">
            Our Menu
          </h2>
          <p className="text-muted-foreground">
            Explore our freshly prepared dishes
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="menu.search_input"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 rounded-full border-border bg-card"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Mobile category tabs */}
        <div
          className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              data-ocid="menu.tab"
              onClick={() => {
                setSelectedCategory(cat);
                setSearchResults(null);
                setSearchTerm("");
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat && !searchTerm
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:bg-accent"
              }`}
            >
              <span>{cat === "All" ? "🍽️" : CATEGORY_ICONS[cat] || "🍴"}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="bg-card rounded-2xl p-3 shadow-card sticky top-20 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Categories
              </p>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  data-ocid="menu.tab"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchResults(null);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                    selectedCategory === cat && !searchTerm
                      ? "bg-accent text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <span className="text-base">
                    {cat === "All" ? "🍽️" : CATEGORY_ICONS[cat] || "🍴"}
                  </span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Content area */}
          <div className="flex-1">
            <ContentGrid
              items={displayItems}
              isLoading={itemsLoading || catsLoading}
              categoryLabel={
                searchTerm ? `Results for "${searchTerm}"` : selectedCategory
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ContentGrid({
  items,
  isLoading,
  categoryLabel,
}: {
  items: MenuItem[];
  isLoading: boolean;
  categoryLabel: string;
}) {
  if (isLoading) {
    return (
      <div
        data-ocid="menu.loading_state"
        className="flex items-center justify-center py-16"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-heading font-bold text-xl text-foreground mb-5 flex items-center gap-2">
        {categoryLabel}
        <span className="text-sm font-normal text-muted-foreground">
          ({items.length} items)
        </span>
      </h3>
      {items.length === 0 ? (
        <div
          data-ocid="menu.empty_state"
          className="text-center py-16 text-muted-foreground"
        >
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-heading font-semibold text-lg">No items found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <ProductCard key={item.id.toString()} item={item} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
