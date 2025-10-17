
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

interface Warehouse {
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

interface Zone {
  id: string;
  name: string;
  zoneType: string; // References MasterItem.itemID
  zoneTypeName?: string; // Optional: Display name from MasterItem
  zoneCode?: string; // Optional to handle potential absence
  ZoneCode?: string; // Fallback for backend serialization issue
  description?: string;
  location?: string;
  warehouse?: Warehouse;
}

export function ZoneManager() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneTypes, setZoneTypes] = useState<MasterItem[]>([]); // Items under "ZN" category
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [selectedZoneType, setSelectedZoneType] = useState<string>(""); // itemID
  const [formData, setFormData] = useState({
    name: "",
    zoneType: "",
    zoneCode: "",
    description: "",
    location: "",
  });
  const [errors, setErrors] = useState({
    warehouse: "",
    name: "",
    zoneCode: "",
    zoneType: "",
    description: "",
    location: "",
  });
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API_BASE = "http://localhost:8080/api";
  const token = Cookies.get("authToken");

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch warehouses, zones, and zone types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehouseRes, zoneRes, mastersRes] = await Promise.all([
          api.get("/warehouses"),
          api.get("/zones"),
          api.get("/masters"), // Fetch all Master categories
        ]);
        setWarehouses(warehouseRes.data);
        // Map zones to handle ZoneCode fallback
        setZones(
          zoneRes.data.map((zone: Zone) => ({
            ...zone,
            zoneCode: zone.zoneCode || zone.ZoneCode || "",
          }))
        );

        // Filter for "ZN" category and load its items
        const znCategory = mastersRes.data.find(
          (m: Master) =>
            m.code === "ZN" ||
            m.categoryName.toLowerCase().includes("zone type")
        );
        if (znCategory && znCategory.items) {
          // Filter active items only
          const activeTypes = znCategory.items.filter(
            (item: MasterItem) => item.active
          );
          setZoneTypes(activeTypes);
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
      warehouse: "",
      name: "",
      zoneCode: "",
      zoneType: "",
      description: "",
      location: "",
    };

    if (!selectedWarehouse) {
      newErrors.warehouse = "Warehouse is required";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Zone name is required";
    }
    if (!selectedZoneType) {
      newErrors.zoneType = "Zone type is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
    if (errors.warehouse) {
      setErrors((prev) => ({ ...prev, warehouse: "" }));
    }
  };

  const handleZoneTypeChange = (value: string) => {
    setSelectedZoneType(value);
    setFormData((prev) => ({ ...prev, zoneType: value })); // Set itemID
    if (errors.zoneType) {
      setErrors((prev) => ({ ...prev, zoneType: "" }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Prevent submission if validation fails
    }

    try {
      if (editingZone) {
        // Exclude zoneCode during update as it's auto-generated
        const { zoneCode, ...updateData } = formData;
        await api.put(`/zones/${editingZone.id}`, updateData);
      } else {
        // Exclude zoneCode during creation as it's generated by the backend
        const { zoneCode, ...createData } = formData;
        await api.post(`/zones/warehouse/${selectedWarehouse}`, createData);
      }

      const updated = await api.get("/zones");
      setZones(
        updated.data.map((zone: Zone) => ({
          ...zone,
          zoneCode: zone.zoneCode || zone.ZoneCode || "",
        }))
      );

      setFormData({
        name: "",
        zoneType: "",
        zoneCode: "",
        description: "",
        location: "",
      });
      setErrors({
        warehouse: "",
        name: "",
        zoneCode: "",
        zoneType: "",
        description: "",
        location: "",
      });
      setSelectedZoneType("");
      setEditingZone(null);
      setSelectedWarehouse("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error saving zone", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;

    try {
      await api.delete(`/zones/${id}`);
      setZones(zones.filter((z) => z.id !== id));
    } catch (err) {
      console.error("Error deleting zone", err);
    }
  };

  const openEditDialog = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      zoneType: zone.zoneType || "",
      zoneCode: zone.zoneCode || zone.ZoneCode || "",
      description: zone.description || "",
      location: zone.location || "",
    });
    setSelectedZoneType(zone.zoneType || "");
    setSelectedWarehouse(zone.warehouse?.id || "");
    setErrors({
      warehouse: "",
      name: "",
      zoneCode: "",
      zoneType: "",
      description: "",
      location: "",
    });
    setIsDialogOpen(true);
  };

  // Find type name for display
  const getTypeName = (itemId: string) => {
    const item = zoneTypes.find((t) => t.itemID === itemId);
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
          <h1 className="text-3xl font-bold tracking-tight">Zone Management</h1>
          <p className="text-muted-foreground">
            Manage zones inside each warehouse
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? "Edit Zone" : "Add Zone"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Warehouse *
                </label>
                <Select
                  value={selectedWarehouse}
                  onValueChange={handleWarehouseChange}
                >
                  <SelectTrigger
                    className={errors.warehouse ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.warehouse && (
                  <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Zone Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter zone name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Zone Code *
                </label>
                <Input
                  name="zoneCode"
                  value={formData.zoneCode}
                  onChange={handleChange}
                  placeholder="Zone code (auto-generated)"
                  disabled={true}
                  className={errors.zoneCode ? "border-red-500" : ""}
                />
                {errors.zoneCode && (
                  <p className="text-red-500 text-xs mt-1">{errors.zoneCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Zone Type *
                </label>
                <Select
                  value={selectedZoneType}
                  onValueChange={handleZoneTypeChange}
                >
                  <SelectTrigger
                    className={errors.zoneType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select Type (from Master)" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneTypes.map((type) => (
                      <SelectItem key={type.itemID} value={type.itemID}>
                        {type.typeName} ({type.typeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zoneType && (
                  <p className="text-red-500 text-xs mt-1">{errors.zoneType}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
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
                  {editingZone ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Zones</CardTitle>
        </CardHeader>
        <CardContent>
          {zones.length === 0 ? (
            <p className="text-muted-foreground text-sm">No zones found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Code</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Name</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Type</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Warehouse</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Description</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-medium">Location</th>
                    <th className="border border-gray-200 px-4 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((z, index) => (
                    <motion.tr
                      key={z.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-200 px-4 py-3">
                        {z.zoneCode || z.ZoneCode || "—"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">{z.name}</td>
                      <td className="border border-gray-200 px-4 py-3">
                        {z.zoneTypeName || getTypeName(z.zoneType) || "—"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">{z.warehouse?.name || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3">{z.description || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3">{z.location || "—"}</td>
                      <td className="border border-gray-200 px-4 py-3 text-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(z)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(z.id)}
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