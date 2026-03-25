import { Plus, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { MenuItem } from "../backend";
import { useCart } from "../context/CartContext";

const FALLBACK_IMAGES: Record<string, string> = {
  Burgers: "/assets/generated/burger-classic.dim_400x300.jpg",
  Pizza: "/assets/generated/pizza-pepperoni.dim_400x300.jpg",
  Drinks: "/assets/generated/drink-lemonade.dim_400x300.jpg",
  Sides: "/assets/generated/sides-fries.dim_400x300.jpg",
};

interface Props {
  item: MenuItem;
  index: number;
}

export default function ProductCard({ item, index }: Props) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const imageSrc =
    imgError || !item.imageUrl
      ? FALLBACK_IMAGES[item.category] ||
        "/assets/generated/burger-classic.dim_400x300.jpg"
      : item.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden group"
      data-ocid={`menu.item.${index + 1}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44">
        <img
          src={imageSrc}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-card text-foreground text-xs font-semibold px-2 py-1 rounded-full shadow-xs">
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-[15px] text-foreground leading-tight mb-1">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {item.description}
        </p>

        {/* Price + Rating + Button */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-heading font-bold text-foreground text-base">
              ${item.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${s <= 4 ? "fill-[oklch(0.78_0.15_72)] text-[oklch(0.78_0.15_72)]" : "text-border fill-border"}`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            data-ocid={`menu.primary_button.${index + 1}`}
            onClick={() => addItem(item)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
