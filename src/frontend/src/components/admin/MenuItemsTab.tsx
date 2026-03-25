import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MenuItem } from "../../backend";
import {
  useAddMenuItem,
  useMenuItems,
  useRemoveMenuItem,
  useUpdateMenuItem,
} from "../../hooks/useQueries";

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  available: boolean;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  available: true,
};

export default function MenuItemsTab() {
  const { data: items = [], isLoading } = useMenuItems();
  const addItem = useAddMenuItem();
  const updateItem = useUpdateMenuItem();
  const removeItem = useRemoveMenuItem();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<MenuItem | null>(null);
  const [imgError, setImgError] = useState(false);

  const openAdd = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setImgError(false);
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      imageUrl: item.imageUrl,
      available: item.available,
    });
    setImgError(false);
    setModalOpen(true);
  };

  const handleSave = async () => {
    const price = Number.parseFloat(form.price);
    if (
      !form.name.trim() ||
      !form.category.trim() ||
      Number.isNaN(price) ||
      price <= 0
    ) {
      toast.error("Please fill in all required fields with valid values.");
      return;
    }
    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          category: form.category.trim(),
          imageUrl: form.imageUrl.trim(),
          available: form.available,
        });
        toast.success("Menu item updated!");
      } else {
        await addItem.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          category: form.category.trim(),
          imageUrl: form.imageUrl.trim(),
        });
        toast.success("Menu item added!");
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save item. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await removeItem.mutateAsync(deleteConfirm.id);
      toast.success("Item removed.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  const isSaving = addItem.isPending || updateItem.isPending;

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-16"
        data-ocid="menu_items.loading_state"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {items.length} items total
        </p>
        <Button
          data-ocid="menu_items.open_modal_button"
          onClick={openAdd}
          className="bg-primary text-primary-foreground hover:opacity-90 rounded-full gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </Button>
      </div>

      {items.length === 0 ? (
        <div
          data-ocid="menu_items.empty_state"
          className="text-center py-16 bg-card rounded-2xl"
        >
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-heading font-semibold text-lg text-foreground">
            No menu items yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first item to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item, idx) => (
            <div
              key={item.id.toString()}
              data-ocid={`menu_items.row.${idx + 1}`}
              className="bg-card rounded-xl p-4 flex items-center gap-4 shadow-xs hover:shadow-card transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-accent">
                {item.imageUrl && !imgError ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-semibold text-sm text-foreground">
                    {item.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  <Badge
                    variant={item.available ? "default" : "secondary"}
                    className={`text-xs ${item.available ? "bg-green-100 text-green-700 border-green-200" : ""}`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.description}
                </p>
                <p className="font-bold text-primary text-sm mt-1">
                  ${item.price.toFixed(2)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  data-ocid={`menu_items.edit_button.${idx + 1}`}
                  onClick={() => openEdit(item)}
                  className="w-8 h-8 rounded-lg"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  data-ocid={`menu_items.delete_button.${idx + 1}`}
                  onClick={() => setDeleteConfirm(item)}
                  className="w-8 h-8 rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="menu_items.dialog">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="item-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="item-name"
                data-ocid="menu_items.input"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Classic Burger"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="item-desc">Description</Label>
              <Textarea
                id="item-desc"
                data-ocid="menu_items.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe your dish..."
                className="mt-1 resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="item-price">
                  Price ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-price"
                  data-ocid="menu_items.input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="9.99"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="item-cat">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-cat"
                  data-ocid="menu_items.input"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  placeholder="e.g. Burgers"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item-img">Image URL</Label>
              <Input
                id="item-img"
                data-ocid="menu_items.input"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            {editingItem && (
              <div className="flex items-center gap-3">
                <Switch
                  id="item-available"
                  data-ocid="menu_items.switch"
                  checked={form.available}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, available: v }))
                  }
                />
                <Label htmlFor="item-available">Available for ordering</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="menu_items.cancel_button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="menu_items.save_button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:opacity-90 rounded-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Item"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent data-ocid="menu_items.dialog">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">
              Remove Menu Item?
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to remove{" "}
            <strong>{deleteConfirm?.name}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="menu_items.cancel_button"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="menu_items.confirm_button"
              variant="destructive"
              onClick={handleDelete}
              disabled={removeItem.isPending}
            >
              {removeItem.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
