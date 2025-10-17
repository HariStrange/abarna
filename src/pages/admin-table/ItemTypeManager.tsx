import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ItemType {
  id: string;
  name: string;
  itemTypeCode: string;
  attributes: string[];
  tenantId?: string;
  tenantName?: string;
}

interface MasterItem {
  itemID: string;
  typeCode: string;
  typeName: string;
  active: boolean;
}

interface Master {
  masterID: string;
  code: string;
  categoryName: string;
  items?: MasterItem[];
}

interface ItemTypeForm {
  name: string;
  attributes: string[];
}

export function ItemTypeManager() {
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [attributes, setAttributes] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ItemTypeForm>({
    name: "",
    attributes: [],
  });
  const [selectedAttribute, setSelectedAttribute] = useState<string>("");
  const [errors, setErrors] = useState({
    name: "",
    attributes: "",
  });
  const [editingItemType, setEditingItemType] = useState<ItemType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API_BASE = "http://localhost:8080/api";
  const token = Cookies.get("authToken");

  const api = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch item types and attributes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemTypesRes, mastersRes] = await Promise.all([
          api.get("/item-types"),
          api.get("/masters"),
        ]);
        setItemTypes(itemTypesRes.data);

        // Filter for "ATTR" category or similar for attributes
        const attrCategory = mastersRes.data.find(
          (m: Master) =>
            m.code === "ATTR" ||
            m.categoryName.toLowerCase().includes("attribute")
        );
        if (attrCategory && attrCategory.items) {
          const activeAttributes = attrCategory.items.filter(
            (item: MasterItem) => item.active
          );
          setAttributes(activeAttributes);
        }
      } catch (err) {
        console.error("Error loading data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: "",
      attributes: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Item type name is required";
    }
    if (formData.attributes.length === 0) {
      newErrors.attributes = "At least one attribute is required";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => !error);
  };

  // Handle form input change for name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
    // Clear error on change
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  // Handle attribute selection
  const handleAttributeChange = (value: string) => {
    const selectedAttr = attributes.find((a) => a.itemID === value);
    if (selectedAttr && !formData.attributes.includes(selectedAttr.typeName)) {
      setFormData({
        ...formData,
        attributes: [...formData.attributes, selectedAttr.typeName],
      });
      // Clear error on change
      if (errors.attributes) {
        setErrors((prev) => ({ ...prev, attributes: "" }));
      }
    }
    setSelectedAttribute("");
  };

  // Remove attribute from the list
  const removeAttribute = (index: number) => {
    const updatedAttrs = [...formData.attributes];
    updatedAttrs.splice(index, 1);
    setFormData({ ...formData, attributes: updatedAttrs });
    // Re-check validation if needed
    if (errors.attributes && updatedAttrs.length > 0) {
      setErrors((prev) => ({ ...prev, attributes: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Prevent submission if validation fails
    }

    try {
      const payload = { name: formData.name, attributes: formData.attributes };

      if (editingItemType) {
        await api.put(`/item-types/${editingItemType.id}`, payload);
      } else {
        await api.post("/item-types", payload);
      }

      const updated = await api.get("/item-types");
      setItemTypes(updated.data);

      setFormData({ name: "", attributes: [] });
      setErrors({ name: "", attributes: "" });
      setEditingItemType(null);
      setSelectedAttribute("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving item type", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item type?")) return;

    try {
      await api.delete(`/item-types/${id}`);
      setItemTypes(itemTypes.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting item type", err);
    }
  };

  const openEditDialog = (itemType: ItemType) => {
    setEditingItemType(itemType);
    setFormData({
      name: itemType.name,
      attributes: itemType.attributes.length ? itemType.attributes : [],
    });
    setErrors({ name: "", attributes: "" });
    setIsDialogOpen(true);
  };

  // Find attribute name for display (assuming attributes are stored as typeName)
  const getAttributeName = (attr: string) => {
    const masterAttr = attributes.find((a) => a.typeName === attr);
    return masterAttr ? masterAttr.typeName : attr;
  };

  if (loading) {
    return (
      <div className="space-y-4 p-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Item Type Management</h1>
          <p className="text-muted-foreground">Create and manage item types and their attributes</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Item Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItemType ? "Edit Item Type" : "Add Item Type"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Item Type Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter item type name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Attributes *
                </label>
                <Select
                  value={selectedAttribute}
                  onValueChange={handleAttributeChange}
                >
                  <SelectTrigger
                    className={
                      errors.attributes ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select Attribute (from Master)" />
                  </SelectTrigger>
                  <SelectContent>
                    {attributes.map((attr) => (
                      <SelectItem key={attr.itemID} value={attr.itemID}>
                        {attr.typeName} ({attr.typeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.attributes && (
                  <p className="text-red-500 text-xs mt-1">{errors.attributes}</p>
                )}
                {formData.attributes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.attributes.map((attr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span>{getAttributeName(attr)}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingItemType ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Item Types</CardTitle>
        </CardHeader>
        <CardContent>
          {itemTypes.length === 0 ? (
            <p className="text-muted-foreground text-sm">No item types found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Code</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Name</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Attributes</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {itemTypes.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-200 px-4 py-3">{item.itemTypeCode || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3">{item.name}</td>
                      <td className="border border-gray-200 px-4 py-3">
                        {item.attributes.map((attr) => getAttributeName(attr)).join(", ")}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}