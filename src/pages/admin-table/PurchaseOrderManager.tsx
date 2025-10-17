import { useEffect, useState, forwardRef } from "react";
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
import { Pencil, Trash2, PlusCircle, Save } from "lucide-react";
import {
  Dialog,
  DialogContent as RadixDialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Supplier {
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  status: string;
}

interface ItemType {
  id: string;
  name: string;
}

interface Item {
  id: string;
  itemName: string;
  itemCode: string;
  itemTypeId: string;
}

interface PurchaseOrderLine {
  id?: string;
  itemId: string;
  itemName?: string;
  itemCode?: string;
  qtyOrdered: number;
  pricePerQuantity: string;
  totalPriceOfItems?: string;
  createdAt?: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  poCode: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  totalQuantity: number;
  totalPrice: string;
  expectedDate: string;
  status: "DRAFT" | "APPROVED" | "SHIPPED" | "RECEIVED" | "CLOSED" | "CANCELLED";
  createdAt: string;
  lines: PurchaseOrderLine[];
}

interface PurchaseOrderFormData {
  poNumber: string;
  poCode: string;
  supplierId: string;
  expectedDate: string;
  status: "DRAFT" | "APPROVED" | "SHIPPED" | "RECEIVED" | "CLOSED" | "CANCELLED";
  lines: PurchaseOrderLine[];
}

const DialogContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialogContent>
>(({ children, ...props }, ref) => (
  <RadixDialogContent ref={ref} {...props} aria-describedby="dialog-description">
    {children}
    <div id="dialog-description" className="sr-only">
      Dialog for managing purchase order details
    </div>
  </RadixDialogContent>
));
DialogContent.displayName = "DialogContent";

export function PurchaseOrderManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<string>("all");
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<PurchaseOrderFormData>({
    poNumber: "",
    poCode: "",
    supplierId: "",
    expectedDate: "",
    status: "DRAFT",
    lines: [],
  });
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get("authToken"));
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [lineForm, setLineForm] = useState<PurchaseOrderLine>({
    itemId: "",
    qtyOrdered: 0,
    pricePerQuantity: "",
  });
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null); // New state for editing line items

  const API_BASE = "http://localhost:8080/api";
  const token = Cookies.get("authToken");

  const api = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        Cookies.remove("authToken");
        setIsLoggedIn(false);
        setError("Session expired. Please log in again.");
      } else if (error.response?.status === 400) {
        setError(
          `Bad request: ${error.response?.data?.errorMessage || "Invalid request. Check data or authentication."}`
        );
      } else if (error.response?.status === 404) {
        setError("Resource not found. Verify data availability.");
      } else if (error.response?.status === 500) {
        setError(
          `Server error: ${error.response?.data?.errorMessage || "An unexpected error occurred on the server."}`
        );
      }
      return Promise.reject(error);
    }
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, loginData);
      Cookies.set("authToken", response.data.token, { expires: 1 });
      setIsLoggedIn(true);
      setError(null);
    } catch (err: any) {
      setError(`Login failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchData = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      setError(null);
      const [poRes, supplierRes, itemRes, itemTypeRes] = await Promise.all([
        api.get("/purchase-orders").catch(() => ({ data: [] })),
        api.get("/suppliers").catch(() => ({ data: [] })),
        api.get("/items").catch(() => ({ data: [] })),
        api.get("/item-types").catch(() => ({ data: [] })),
      ]);
      setPurchaseOrders(poRes.data);
      setSuppliers(supplierRes.data);
      setItems(itemRes.data);
      setItemTypes(itemTypeRes.data);
      if (poRes.data.length === 0) {
        setError("No purchase orders found. Please add a purchase order.");
      }
      if (supplierRes.data.length === 0) {
        setError("No suppliers found. Please add suppliers.");
      }
      if (itemRes.data.length === 0) {
        setError("No items found. Please add items to create purchase orders.");
      }
      if (itemTypeRes.data.length === 0) {
        setError("No item types found. Please add item types.");
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(`Error loading data: ${err.response?.data?.errorMessage || err.message}`);
      setPurchaseOrders([]);
      setSuppliers([]);
      setItems([]);
      setItemTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof PurchaseOrderLine
  ) => {
    const value = field === "itemId" ? e.target.value : e.target.value;
    setLineForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "itemId") {
        const selectedItem = items.find((i) => i.id === value);
        updated.itemName = selectedItem?.itemName || "";
        updated.itemCode = selectedItem?.itemCode || "";
      }
      if (field === "qtyOrdered" || field === "pricePerQuantity") {
        const qty = parseInt(updated.qtyOrdered as any) || 0;
        const price = parseFloat(updated.pricePerQuantity) || 0;
        updated.totalPriceOfItems = (qty * price).toFixed(2);
      }
      return updated;
    });
  };

  const addLine = () => {
    if (!lineForm.itemId || lineForm.qtyOrdered <= 0 || parseFloat(lineForm.pricePerQuantity) <= 0) {
      setError("Please select an item, enter a positive quantity, and a positive price.");
      return;
    }
    if (editingLineIndex !== null) {
      // Update existing line
      setFormData((prev) => ({
        ...prev,
        lines: prev.lines.map((line, i) =>
          i === editingLineIndex ? { ...lineForm } : line
        ),
      }));
      setEditingLineIndex(null);
    } else {
      // Add new line
      setFormData((prev) => ({
        ...prev,
        lines: [...prev.lines, { ...lineForm }],
      }));
    }
    setLineForm({ itemId: "", qtyOrdered: 0, pricePerQuantity: "" });
  };

  const editLine = (index: number) => {
    const line = formData.lines[index];
    setLineForm({ ...line });
    setEditingLineIndex(index);
  };

  const removeLine = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleItemTypeChange = (value: string) => {
    setSelectedItemType(value);
  };

  const handleSubmit = async () => {
    if (!formData.poNumber.trim()) {
      setError("PO Number is required.");
      return;
    }
    if (!formData.poCode.trim()) {
      setError("PO Code is required.");
      return;
    }
    if (!formData.supplierId) {
      setError("Please select a supplier.");
      return;
    }
    if (!formData.expectedDate) {
      setError("Expected date is required.");
      return;
    }
    if (formData.lines.length === 0) {
      setError("At least one line item is required.");
      return;
    }

    try {
      setError(null);
      const payload = {
        poNumber: formData.poNumber,
        poCode: formData.poCode,
        supplierId: formData.supplierId,
        expectedDate: formData.expectedDate,
        status: formData.status,
        lines: formData.lines.map((line) => ({
          itemId: line.itemId,
          qtyOrdered: line.qtyOrdered,
          pricePerQuantity: line.pricePerQuantity,
        })),
      };
      if (editingPurchaseOrder) {
        await api.put(`/purchase-orders/${editingPurchaseOrder.id}`, payload);
      } else {
        await api.post("/purchase-orders", payload);
      }
      resetForm();
      fetchData(); // Auto-refresh purchase orders
    } catch (err: any) {
      console.error("Error saving purchase order:", err);
      setError(
        `Error saving purchase order: ${err.response?.data?.errorMessage || err.message}`
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      setError("Invalid purchase order ID. Please try again.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this purchase order?")) return;
    try {
      setError(null);
      await api.delete(`/purchase-orders/${id}`);
      setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
      fetchData(); // Auto-refresh purchase orders
    } catch (err: any) {
      console.error("Error deleting purchase order:", err);
      setError(
        `Error deleting purchase order: ${err.response?.data?.errorMessage || "An unexpected server error occurred."}`
      );
    }
  };

  const openEditDialog = (po: PurchaseOrder) => {
    setEditingPurchaseOrder(po);
    setFormData({
      poNumber: po.poNumber,
      poCode: po.poCode,
      supplierId: po.supplierId,
      expectedDate: po.expectedDate.split("T")[0],
      status: po.status,
      lines: po.lines,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      poNumber: "",
      poCode: "",
      supplierId: "",
      expectedDate: "",
      status: "DRAFT",
      lines: [],
    });
    setLineForm({ itemId: "", qtyOrdered: 0, pricePerQuantity: "" });
    setEditingPurchaseOrder(null);
    setEditingLineIndex(null);
    setIsDialogOpen(false);
    setError(null);
    setSelectedItemType("all");
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Login</h1>
        <div className="space-y-4 max-w-sm">
          <Input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleLogin}>Login</Button>
        </div>
      </div>
    );
  }

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

  const filteredItems =
    selectedItemType === "all" ? items : items.filter((item) => item.itemTypeId === selectedItemType);

  return (
    <motion.div
      className="space-y-6 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Order Management</h1>
          <p className="text-muted-foreground">Create and manage purchase orders</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Existing Purchase Orders</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={items.length === 0}>
                <PlusCircle className="h-4 w-4" />
                Add Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>{editingPurchaseOrder ? "Edit Purchase Order" : "Add Purchase Order"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">PO Number</label>
                    <Input
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleChange}
                      placeholder="Enter PO number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">PO Code</label>
                    <Input
                      name="poCode"
                      value={formData.poCode}
                      onChange={handleChange}
                      placeholder="Enter PO code"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Supplier</label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, supplierId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((s) => s.status === "Active")
                        .map((supplier) => (
                          <SelectItem key={supplier.supplierId} value={supplier.supplierId}>
                            {supplier.supplierName} ({supplier.supplierCode})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Expected Date</label>
                    <Input
                      type="date"
                      name="expectedDate"
                      value={formData.expectedDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: val as PurchaseOrderFormData["status"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {["DRAFT", "APPROVED", "SHIPPED", "RECEIVED", "CLOSED", "CANCELLED"].map(
                          (status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {itemTypes.length > 0 && (
                  <div>
                    <label className="block text-sm font-bold mb-1">Item Type</label>
                    <Select value={selectedItemType} onValueChange={handleItemTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Item Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Item Types</SelectItem>
                        {itemTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {filteredItems.length > 0 ? (
                  <div>
                    <label className="block text-sm font-bold mb-1">
                      {editingLineIndex !== null ? "Edit Line Item" : "Add Line Item"}
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                      <Select
                        value={lineForm.itemId}
                        onValueChange={(value) =>
                          handleLineChange({ target: { value } } as any, "itemId")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Item" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.itemName} ({item.itemCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Quantity"
                        value={lineForm.qtyOrdered || ""}
                        onChange={(e) => handleLineChange(e, "qtyOrdered")}
                        min="1"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price per Unit"
                        value={lineForm.pricePerQuantity}
                        onChange={(e) => handleLineChange(e, "pricePerQuantity")}
                        min="0.01"
                      />
                      <Button onClick={addLine}>
                        {editingLineIndex !== null ? <Save className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                        {editingLineIndex !== null ? "Save Line" : "Add Line"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>No Items Available</AlertTitle>
                    <AlertDescription>
                      {selectedItemType === "all"
                        ? "No items found. Please add items to create line items."
                        : "No items found for the selected item type."}
                    </AlertDescription>
                  </Alert>
                )}
                {formData.lines.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Line Items</label>
                    <table className="min-w-full border-collapse border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border p-2 text-left">Item</th>
                          <th className="border p-2 text-left">Quantity</th>
                          <th className="border p-2 text-left">Price per Unit</th>
                          <th className="border p-2 text-left">Total</th>
                          <th className="border p-2 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.lines.map((line, index) => (
                          <tr key={index}>
                            <td className="border p-2">
                              {line.itemName} ({line.itemCode})
                            </td>
                            <td className="border p-2">{line.qtyOrdered}</td>
                            <td className="border p-2">{line.pricePerQuantity}</td>
                            <td className="border p-2">{line.totalPriceOfItems}</td>
                            <td className="border p-2 text-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => editLine(index)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeLine(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={filteredItems.length === 0}>
                    {editingPurchaseOrder ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No purchase orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">PO Number</th>
                    <th className="border p-2 text-left">PO Code</th>
                    <th className="border p-2 text-left">Supplier</th>
                    <th className="border p-2 text-left">Total Quantity</th>
                    <th className="border p-2 text-left">Total Price</th>
                    <th className="border p-2 text-left">Expected Date</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po, index) => (
                    <motion.tr
                      key={po.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border p-2">{po.poNumber}</td>
                      <td className="border p-2">{po.poCode}</td>
                      <td className="border p-2">
                        {po.supplierName} ({po.supplierCode})
                      </td>
                      <td className="border p-2">{po.totalQuantity}</td>
                      <td className="border p-2">{po.totalPrice}</td>
                      <td className="border p-2">{po.expectedDate.split("T")[0]}</td>
                      <td className="border p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            po.status === "DRAFT"
                              ? "bg-blue-100 text-blue-800"
                              : po.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : po.status === "SHIPPED"
                              ? "bg-yellow-100 text-yellow-800"
                              : po.status === "RECEIVED"
                              ? "bg-purple-100 text-purple-800"
                              : po.status === "CLOSED"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="border p-2 text-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(po)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(po.id)}>
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