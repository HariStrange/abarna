
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

interface Branch {
  id: string;
  name: string;
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

interface Warehouse {
  id: string;
  name: string;
  warehouseType: string; // References MasterItem.itemID
  warehouseTypeName?: string; // Optional: Display name from MasterItem
  warehouseCode: string;
  address?: string;
  location?: string;
  branch?: Branch;
}

export function WarehouseManager() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [masters, setMasters] = useState<Master[]>([]);
  const [warehouseTypes, setWarehouseTypes] = useState<MasterItem[]>([]); // Items under "WH" category
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedWarehouseType, setSelectedWarehouseType] = useState<string>(""); // itemID
  const [formData, setFormData] = useState({
    name: "",
    warehouseType: "",
    warehouseCode: "",
    address: "",
    location: "",
  });
  const [errors, setErrors] = useState({
    branch: "",
    name: "",
    warehouseCode: "",
    warehouseType: "",
    address: "",
    location: "",
  });
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API_BASE = "http://localhost:8080/api";
  const token = Cookies.get("authToken");

  // Axios instance with auth token
  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch branches, warehouses, and masters
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, warehouseRes, mastersRes] = await Promise.all([
          api.get("/branches"),
          api.get("/warehouses"),
          api.get("/masters"), // Fetch all Master categories
        ]);
        setBranches(branchRes.data);
        setWarehouses(warehouseRes.data);

        // Filter for "WH" category and load its items
        const whCategory = mastersRes.data.find(
          (m: Master) =>
            m.code === "WH" ||
            m.categoryName.toLowerCase().includes("warehouse type")
        );
        if (whCategory && whCategory.items) {
          // Filter active items only
          const activeTypes = whCategory.items.filter(
            (item: MasterItem) => item.active
          );
          setWarehouseTypes(activeTypes);
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
      branch: "",
      name: "",
      warehouseCode: "",
      warehouseType: "",
      address: "",
      location: "",
    };

    if (!selectedBranch) {
      newErrors.branch = "Branch is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Warehouse name is required";
    }
    if (!selectedWarehouseType) {
      newErrors.warehouseType = "Warehouse type is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => !error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBranchChange = (value: string) => {
    setSelectedBranch(value);
    if (errors.branch) {
      setErrors((prev) => ({ ...prev, branch: "" }));
    }
  };

  const handleWarehouseTypeChange = (value: string) => {
    setSelectedWarehouseType(value);
    setFormData((prev) => ({ ...prev, warehouseType: value })); // Set itemID
    if (errors.warehouseType) {
      setErrors((prev) => ({ ...prev, warehouseType: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Prevent submission if validation fails
    }

    try {
      if (editingWarehouse) {
        // Exclude warehouseCode during update as it's auto-generated
        const { warehouseCode, ...updateData } = formData;
        await api.put(`/warehouses/${editingWarehouse.id}`, updateData);
      } else {
        // Exclude warehouseCode during creation as it's generated by the backend
        const { warehouseCode, ...createData } = formData;
        await api.post(`/warehouses/branch/${selectedBranch}`, createData);
      }

      const updated = await api.get("/warehouses");
      setWarehouses(updated.data);

      setFormData({
        name: "",
        warehouseType: "",
        warehouseCode: "",
        address: "",
        location: "",
      });
      setErrors({
        branch: "",
        name: "",
        warehouseCode: "",
        warehouseType: "",
        address: "",
        location: "",
      });
      setSelectedWarehouseType("");
      setEditingWarehouse(null);
      setSelectedBranch("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving warehouse", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?"))
      return;

    try {
      await api.delete(`/warehouses/${id}`);
      setWarehouses(warehouses.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Error deleting warehouse", err);
    }
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      warehouseType: warehouse.warehouseType || "",
      warehouseCode: warehouse.warehouseCode || "",
      address: warehouse.address || "",
      location: warehouse.location || "",
    });
    setSelectedWarehouseType(warehouse.warehouseType || "");
    setSelectedBranch(warehouse.branch?.id || "");
    setErrors({
      branch: "",
      name: "",
      warehouseCode: "",
      warehouseType: "",
      address: "",
      location: "",
    });
    setIsDialogOpen(true);
  };

  // Find type name for display
  const getTypeName = (itemId: string) => {
    const item = warehouseTypes.find((t) => t.itemID === itemId);
    return item ? item.typeName : "—";
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
          <h1 className="text-3xl font-bold tracking-tight">
            Warehouse Management
          </h1>
          <p className="text-muted-foreground">
            Manage your organization’s warehouses under each branch
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Branch *
                </label>
                <Select
                  value={selectedBranch}
                  onValueChange={handleBranchChange}
                >
                  <SelectTrigger
                    className={errors.branch ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.branch && (
                  <p className="text-red-500 text-xs mt-1">{errors.branch}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Warehouse Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Warehouse Code *
                </label>
                <Input
                  name="warehouseCode"
                  value={formData.warehouseCode}
                  onChange={handleChange}
                  placeholder="Warehouse code (auto-generated)"
                  disabled={true}
                  className={errors.warehouseCode ? "border-red-500" : ""}
                />
                {errors.warehouseCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.warehouseCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Warehouse Type *
                </label>
                <Select
                  value={selectedWarehouseType}
                  onValueChange={handleWarehouseTypeChange}
                >
                  <SelectTrigger
                    className={errors.warehouseType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select Type (from Master)" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseTypes.map((type) => (
                      <SelectItem key={type.itemID} value={type.itemID}>
                        {type.typeName} ({type.typeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.warehouseType && (
                  <p className="text-red-500 text-xs mt-1">{errors.warehouseType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location *
                </label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Map / location URL"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingWarehouse ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Warehouses</CardTitle>
        </CardHeader>
        <CardContent>
          {warehouses.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No warehouses found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Code</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Name</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Type</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Branch</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Address</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Location</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.map((w, index) => (
                    <motion.tr
                      key={w.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-200 px-4 py-3">{w.warehouseCode || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3">{w.name}</td>
                      <td className="border border-gray-200 px-4 py-3">
                        {w.warehouseTypeName ||
                          getTypeName(w.warehouseType) ||
                          "—"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">{w.branch?.name || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3">{w.address || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3">{w.location || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3 text-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(w)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(w.id)}
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