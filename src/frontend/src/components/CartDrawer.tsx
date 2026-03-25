import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useCreateOrder } from "../hooks/useQueries";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    updateInstructions,
    clearCart,
    totalPrice,
  } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const createOrder = useCreateOrder();

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name to place the order.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    try {
      await createOrder.mutateAsync({
        customerName: customerName.trim(),
        customerNote: customerNote.trim(),
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: BigInt(i.quantity),
          specialInstructions: i.specialInstructions,
        })),
      });
      toast.success("Order placed successfully! 🎉");
      clearCart();
      setCustomerName("");
      setCustomerNote("");
      closeCart();
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            data-ocid="cart.modal"
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-card z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Your Cart
              </h2>
              <button
                type="button"
                data-ocid="cart.close_button"
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {items.length === 0 ? (
              <div
                data-ocid="cart.empty_state"
                className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8"
              >
                <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-30" />
                <p className="font-heading font-semibold text-lg text-foreground">
                  Your cart is empty
                </p>
                <p className="text-sm text-muted-foreground">
                  Add some delicious items from the menu!
                </p>
                <Button
                  variant="outline"
                  onClick={closeCart}
                  data-ocid="cart.cancel_button"
                >
                  Browse Menu
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-5">
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div
                        key={item.menuItem.id.toString()}
                        data-ocid={`cart.item.${idx + 1}`}
                        className="bg-background rounded-xl p-3 space-y-3"
                      >
                        <div className="flex gap-3">
                          {item.menuItem.imageUrl && (
                            <img
                              src={item.menuItem.imageUrl}
                              alt={item.menuItem.name}
                              className="w-14 h-14 rounded-lg object-cover shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-heading font-semibold text-sm text-foreground truncate">
                              {item.menuItem.name}
                            </p>
                            <p className="text-primary font-bold text-sm">
                              $
                              {(item.menuItem.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <button
                            type="button"
                            data-ocid={`cart.delete_button.${idx + 1}`}
                            onClick={() => removeItem(item.menuItem.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Qty controls */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            data-ocid={`cart.toggle.${idx + 1}`}
                            onClick={() =>
                              updateQuantity(
                                item.menuItem.id,
                                item.quantity - 1,
                              )
                            }
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.menuItem.id,
                                item.quantity + 1,
                              )
                            }
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-xs text-muted-foreground ml-auto">
                            ${item.menuItem.price.toFixed(2)} each
                          </span>
                        </div>
                        {/* Special instructions */}
                        <Textarea
                          data-ocid={`cart.textarea.${idx + 1}`}
                          placeholder="Special instructions (optional)"
                          value={item.specialInstructions}
                          onChange={(e) =>
                            updateInstructions(item.menuItem.id, e.target.value)
                          }
                          className="text-xs min-h-[60px] resize-none"
                        />
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Customer info */}
                  <div className="space-y-3">
                    <div>
                      <Label
                        htmlFor="customer-name"
                        className="text-sm font-semibold"
                      >
                        Your Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customer-name"
                        data-ocid="cart.input"
                        placeholder="Enter your name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="order-note"
                        className="text-sm font-semibold"
                      >
                        Order Note
                      </Label>
                      <Textarea
                        id="order-note"
                        data-ocid="cart.textarea"
                        placeholder="Any special requests for your order?"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        className="mt-1 resize-none min-h-[70px]"
                      />
                    </div>
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-5 border-t border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-heading font-semibold text-foreground">
                      Total
                    </span>
                    <span className="font-heading font-bold text-xl text-primary">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    data-ocid="cart.submit_button"
                    className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold py-3 rounded-full"
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? "Placing Order..." : "Place Order"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
