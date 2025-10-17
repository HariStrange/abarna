import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ItemType {
  id: string;
  name: string;
  attributes: string[];
}

interface ItemAttribute {
  attributeName: string;
  attributeValue: string;
}

interface Item {
  id: string;
  name: string;
  itemCode: string;
  displayname: string;
  itemTypeId: string;
  itemTypeName: string;
  isRfid: boolean;
  brandName: string;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderPoint: number;
  createdAt: string;
  attributes: ItemAttribute[];
}

export function ItemManager() {
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemType, setSelectedItemType] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    itemCode: "",
    displayname: "",
    isRfid: "false",
    brandName: "",
    minimumStockLevel: "",
    maximumStockLevel: "",
    reorderPoint: "",
  });
  const [attributes, setAttributes] = useState<ItemAttribute[]>([]);
  const [errors, setErrors] = useState({
    itemType: "",
    itemCode: "",
    displayname: "",
    name: "",
    brandName: "",
    isRfid: "",
    minimumStockLevel: "",
    maximumStockLevel: "",
    reorderPoint: "",
    attributes: {},
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API_BASE = "http://localhost:8080";
  const token = Cookies.get("authToken");
  const tenantId = "d6cccd07-7ce4-4dbb-a56b-43396f2b7564"; // Replace with dynamic tenant if needed

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, itemsRes] = await Promise.all([
          api.get("/api/item-types"),
          api.get("/api/items"),
        ]);
        setItemTypes(typesRes.data);
        setItems(itemsRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {
      itemType: "",
      itemCode: "",
      displayname: "",
      name: "",
      brandName: "",
      isRfid: "",
      minimumStockLevel: "",
      maximumStockLevel: "",
      reorderPoint: "",
      attributes: {} as Record<string, string>,
    };

    if (!selectedItemType) {
      newErrors.itemType = "Item type is required";
    }
    if (!formData.itemCode.trim()) {
      newErrors.itemCode = "Item code is required";
    }
    if (!formData.displayname.trim()) {
      newErrors.displayname = "Display name is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }
    if (!formData.brandName.trim()) {
      newErrors.brandName = "Brand name is required";
    }
    if (!formData.isRfid) {
      newErrors.isRfid = "RFID selection is required";
    }
    if (!formData.minimumStockLevel || parseInt(formData.minimumStockLevel) < 0) {
      newErrors.minimumStockLevel = "Minimum stock level is required and must be >= 0";
    }
    if (!formData.maximumStockLevel || parseInt(formData.maximumStockLevel) < 0) {
      newErrors.maximumStockLevel = "Maximum stock level is required and must be >= 0";
    }
    if (!formData.reorderPoint || parseInt(formData.reorderPoint) < 0) {
      newErrors.reorderPoint = "Reorder point is required and must be >= 0";
    }
    attributes.forEach((attr, index) => {
      if (!attr.attributeValue.trim()) {
        newErrors.attributes[attr.attributeName] = `${attr.attributeName} value is required`;
      }
    });

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => 
      typeof error === "string" ? !error : Object.values(error).every((e) => !e)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemTypeChange = (val: string) => {
    setSelectedItemType(val);
    if (errors.itemType) {
      setErrors((prev) => ({ ...prev, itemType: "" }));
    }
    const selected = itemTypes.find((it) => it.id === val);
    if (selected) {
      setAttributes(
        selected.attributes.map((a) => ({
          attributeName: a,
          attributeValue:
            editingItem?.attributes.find((attr) => attr.attributeName === a)
              ?.attributeValue || "",
        }))
      );
    }
  };

  const handleAttributeValueChange = (index: number, value: string) => {
    const updated = [...attributes];
    updated[index].attributeValue = value;
    setAttributes(updated);
    // Clear error on change
    const attrName = updated[index].attributeName;
    if (errors.attributes[attrName]) {
      setErrors((prev) => ({
        ...prev,
        attributes: { ...prev.attributes, [attrName]: "" },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Prevent submission if validation fails
    }

    const payload = {
      tenantId,
      itemTypeId: selectedItemType,
      name: formData.name,
      itemCode: formData.itemCode,
      displayname: formData.displayname,
      isRfid: formData.isRfid === "true",
      brandName: formData.brandName,
      minimumStockLevel: parseInt(formData.minimumStockLevel) || 0,
      maximumStockLevel: parseInt(formData.maximumStockLevel) || 0,
      reorderPoint: parseInt(formData.reorderPoint) || 0,
      attributes,
    };

    try {
      if (editingItem) {
        await api.put(`/api/items/${editingItem.id}`, payload);
      } else {
        await api.post(`/api/items`, payload);
      }

      const updated = await api.get("/api/items");
      setItems(updated.data);
      resetForm();
    } catch (err: any) {
      console.error("Error saving item:", err);
      alert(`Server Error: ${err.response?.status || 500}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/api/items/${id}`);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      itemCode: item.itemCode,
      displayname: item.displayname,
      isRfid: item.isRfid ? "true" : "false",
      brandName: item.brandName || "",
      minimumStockLevel: item.minimumStockLevel?.toString() || "",
      maximumStockLevel: item.maximumStockLevel?.toString() || "",
      reorderPoint: item.reorderPoint?.toString() || "",
    });
    setSelectedItemType(item.itemTypeId);
    setAttributes(item.attributes);
    setErrors({
      itemType: "",
      itemCode: "",
      displayname: "",
      name: "",
      brandName: "",
      isRfid: "",
      minimumStockLevel: "",
      maximumStockLevel: "",
      reorderPoint: "",
      attributes: {},
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      itemCode: "",
      displayname: "",
      isRfid: "false",
      brandName: "",
      minimumStockLevel: "",
      maximumStockLevel: "",
      reorderPoint: "",
    });
    setAttributes([]);
    setSelectedItemType("");
    setErrors({
      itemType: "",
      itemCode: "",
      displayname: "",
      name: "",
      brandName: "",
      isRfid: "",
      minimumStockLevel: "",
      maximumStockLevel: "",
      reorderPoint: "",
      attributes: {},
    });
    setEditingItem(null);
    setIsDialogOpen(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Item Management</h1>
          <p className="text-muted-foreground">
            Create and manage items by type and attributes
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Item" : "Add Item"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Left Column: Main Fields */}
              <div className="space-y-4">
                {/* Item Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Type *
                  </label>
                  <Select
                    value={selectedItemType}
                    onValueChange={handleItemTypeChange}
                  >
                    <SelectTrigger
                      className={
                        errors.itemType ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select Item Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.itemType && (
                    <p className="text-red-500 text-xs mt-1">{errors.itemType}</p>
                  )}
                </div>

                {/* Item Code */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Code *
                  </label>
                  <Input
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleChange}
                    placeholder="Enter item code"
                    disabled={editingItem === null} // Disable in create mode
                    className={errors.itemCode ? "border-red-500" : ""}
                  />
                  {errors.itemCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.itemCode}</p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Display Name *
                  </label>
                  <Input
                    name="displayname"
                    value={formData.displayname}
                    onChange={handleChange}
                    placeholder="Enter display name"
                    disabled={editingItem === null} // Disable in create mode
                    className={errors.displayname ? "border-red-500" : ""}
                  />
                  {errors.displayname && (
                    <p className="text-red-500 text-xs mt-1">{errors.displayname}</p>
                  )}
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter item name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Brand Name *
                  </label>
                  <Input
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    placeholder="Enter brand name"
                    className={errors.brandName ? "border-red-500" : ""}
                  />
                  {errors.brandName && (
                    <p className="text-red-500 text-xs mt-1">{errors.brandName}</p>
                  )}
                </div>

                {/* RFID */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    RFID Enabled *
                  </label>
                  <Select
                    value={formData.isRfid}
                    onValueChange={(val) => handleSelectChange("isRfid", val)}
                  >
                    <SelectTrigger
                      className={
                        errors.isRfid ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select RFID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.isRfid && (
                    <p className="text-red-500 text-xs mt-1">{errors.isRfid}</p>
                  )}
                </div>

                {/* Stock Levels */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Min Stock *
                    </label>
                    <Input
                      name="minimumStockLevel"
                      type="number"
                      value={formData.minimumStockLevel}
                      onChange={handleChange}
                      className={errors.minimumStockLevel ? "border-red-500" : ""}
                    />
                    {errors.minimumStockLevel && (
                      <p className="text-red-500 text-xs mt-1">{errors.minimumStockLevel}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Max Stock *
                    </label>
                    <Input
                      name="maximumStockLevel"
                      type="number"
                      value={formData.maximumStockLevel}
                      onChange={handleChange}
                      className={errors.maximumStockLevel ? "border-red-500" : ""}
                    />
                    {errors.maximumStockLevel && (
                      <p className="text-red-500 text-xs mt-1">{errors.maximumStockLevel}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Reorder Point *
                    </label>
                    <Input
                      name="reorderPoint"
                      type="number"
                      value={formData.reorderPoint}
                      onChange={handleChange}
                      className={errors.reorderPoint ? "border-red-500" : ""}
                    />
                    {errors.reorderPoint && (
                      <p className="text-red-500 text-xs mt-1">{errors.reorderPoint}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Attributes */}
              <div className="space-y-4">
                {/* Dynamic Attributes */}
                {attributes.length > 0 ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Attributes *
                    </label>
                    {attributes.map((attr, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          readOnly
                          value={attr.attributeName}
                          className="w-1/2 bg-gray-50"
                        />
                        <Input
                          placeholder={`Enter ${attr.attributeName}`}
                          value={attr.attributeValue}
                          onChange={(e) =>
                            handleAttributeValueChange(i, e.target.value)
                          }
                          className={errors.attributes[attr.attributeName] ? "border-red-500 w-1/2" : "w-1/2"}
                        />
                        {errors.attributes[attr.attributeName] && (
                          <p className="text-red-500 text-xs mt-1 w-full">{errors.attributes[attr.attributeName]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    Select an Item Type to load attributes.
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Update" : "Add"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Items</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">No items found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Code</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Display Name</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Name</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Brand</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">RFID</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Type</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Stock Info</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Created</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Attributes</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-200 px-4 py-3">{item.itemCode}</td>
                      <td className="border border-gray-200 px-4 py-3">{item.displayname}</td>
                      <td className="border border-gray-200 px-4 py-3">{item.name}</td>
                      <td className="border border-gray-200 px-4 py-3">{item.brandName}</td>
                      <td className="border border-gray-200 px-4 py-3">
                        {item.isRfid ? "Yes" : "No"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">{item.itemTypeName}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm">
                        Min: {item.minimumStockLevel} <br />
                        Max: {item.maximumStockLevel} <br />
                        Reorder: {item.reorderPoint}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm">
                        {item.attributes.map((a) => (
                          <div key={a.attributeName}>
                            <strong>{a.attributeName}:</strong>{" "}
                            {a.attributeValue}
                          </div>
                        ))}
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