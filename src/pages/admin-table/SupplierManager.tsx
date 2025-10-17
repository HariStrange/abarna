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
import { Pencil, Trash2, PlusCircle } from "lucide-react";
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
  contactPerson: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gstNumber: string;
  rfidTagPrefix: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt: string;
}

interface SupplierFormData {
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  gstNumber: string;
  rfidTagPrefix: string;
  status: "Active" | "Inactive";
}

const DialogContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixDialogContent>
>(({ children, ...props }, ref) => (
  <RadixDialogContent
    ref={ref}
    {...props}
    aria-describedby="dialog-description"
  >
    {children}
    <div id="dialog-description" className="sr-only">
      Dialog for managing supplier details
    </div>
  </RadixDialogContent>
));
DialogContent.displayName = "DialogContent";

export function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<SupplierFormData>({
    supplierCode: "",
    supplierName: "",
    contactPerson: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    gstNumber: "",
    rfidTagPrefix: "",
    status: "Active",
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get("authToken"));
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);

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
          `Bad request: ${
            error.response?.data?.message ||
            "Invalid request. Check data or authentication."
          }`
        );
      } else if (error.response?.status === 404) {
        setError("Resource not found. Verify data availability.");
      } else if (error.response?.status === 500) {
        setError(
          `Server error: ${
            error.response?.data?.message ||
            "An unexpected error occurred on the server."
          }`
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

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn) return;
      try {
        setLoading(true);
        setError(null);
        const supplierRes = await api
          .get("/suppliers")
          .catch(() => ({ data: [] }));
        setSuppliers(supplierRes.data);
        if (supplierRes.data.length === 0) {
          setError("No suppliers found. Please add suppliers.");
        }
      } catch (err: any) {
        console.error("Error fetching suppliers:", err);
        setError(
          `Error loading suppliers: ${
            err.response?.data?.message || err.message
          }`
        );
        setSuppliers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.supplierCode.trim()) {
      setError("Supplier Code is required.");
      return;
    }
    if (!formData.supplierName.trim()) {
      setError("Supplier Name is required.");
      return;
    }
    if (!formData.rfidTagPrefix.trim()) {
      setError("RFID Tag Prefix is required.");
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format.");
      return;
    }
    if (formData.phone && !/^\+?[0-9]{1,20}$/.test(formData.phone)) {
      setError("Invalid phone number format.");
      return;
    }
    if (
      formData.gstNumber &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.gstNumber
      )
    ) {
      setError("Invalid GST number format.");
      return;
    }
    try {
      setError(null);
      if (editingSupplier) {
        console.log("Updating supplier:", editingSupplier.supplierId, formData);
        const response = await api.put(
          `/suppliers/${editingSupplier.supplierId}`,
          formData
        );
        console.log("Update response:", response.data);
        setSuppliers((prev) =>
          prev.map((sup) =>
            sup.supplierId === editingSupplier.supplierId
              ? { ...sup, ...formData, updatedAt: new Date().toISOString() }
              : sup
          )
        );
      } else {
        console.log("Creating new supplier:", formData);
        const response = await api.post("/suppliers", formData);
        console.log("Create response:", response.data);
        setSuppliers((prev) => [...prev, response.data]);
      }
      resetForm();
    } catch (err: any) {
      console.error("Error saving supplier:", err);
      setError(
        `Error saving supplier: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      setError("Invalid supplier ID. Please try again.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this supplier?"))
      return;
    try {
      setError(null);
      console.log("Sending DELETE request for supplier ID:", id);
      const response = await api.delete(`/suppliers/${id}`);
      console.log("Delete response:", response.status, response.data);
      setSuppliers(suppliers.filter((sup) => sup.supplierId !== id));
      console.log("Supplier deleted successfully:", id);
    } catch (err: any) {
      console.error("Error deleting supplier:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(
        `Error deleting supplier: ${
          err.response?.data?.message || "An unexpected server error occurred."
        }`
      );
    }
  };

  const openEditDialog = (supplier: Supplier | undefined) => {
    if (!supplier) {
      setError("Invalid supplier selected. Please try again.");
      return;
    }
    setEditingSupplier(supplier);
    setFormData({
      supplierCode: supplier.supplierCode,
      supplierName: supplier.supplierName,
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      addressLine1: supplier.addressLine1 || "",
      addressLine2: supplier.addressLine2 || "",
      city: supplier.city || "",
      state: supplier.state || "",
      country: supplier.country || "",
      postalCode: supplier.postalCode || "",
      gstNumber: supplier.gstNumber || "",
      rfidTagPrefix: supplier.rfidTagPrefix,
      status: supplier.status,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      supplierCode: "",
      supplierName: "",
      contactPerson: "",
      phone: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      gstNumber: "",
      rfidTagPrefix: "",
      status: "Active",
    });
    setEditingSupplier(null);
    setIsDialogOpen(false);
    setError(null);
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
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
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
            Supplier Management
          </h1>
          <p className="text-muted-foreground">Create and manage suppliers</p>
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
          <CardTitle>Existing Suppliers</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? "Edit Supplier" : "Add Supplier"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Supplier Code *
                  </label>
                  <Input
                    name="supplierCode"
                    value={formData.supplierCode}
                    onChange={handleChange}
                    placeholder="Enter supplier code"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Supplier Name *
                  </label>
                  <Input
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact Person
                  </label>
                  <Input
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Enter contact person"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address Line 1
                  </label>
                  <Input
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Enter address line 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address Line 2
                  </label>
                  <Input
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Enter address line 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Postal Code
                  </label>
                  <Input
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Enter postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    GST Number
                  </label>
                  <Input
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    RFID Tag Prefix *
                  </label>
                  <Input
                    name="rfidTagPrefix"
                    value={formData.rfidTagPrefix}
                    onChange={handleChange}
                    placeholder="Enter RFID tag prefix"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: val as SupplierFormData["status"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <Button onClick={handleSubmit}>
                    {editingSupplier ? "Update" : "Add"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No suppliers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2 text-left">Supplier Code</th>
                    <th className="border p-2 text-left">Supplier Name</th>
                    <th className="border p-2 text-left">Contact Person</th>
                    <th className="border p-2 text-left">Phone</th>
                    <th className="border p-2 text-left">Email</th>
                    <th className="border p-2 text-left">Address</th>
                    <th className="border p-2 text-left">GST Number</th>
                    <th className="border p-2 text-left">RFID Tag Prefix</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Created At</th>
                    <th className="border p-2 text-left">Updated At</th>
                    <th className="border p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier, index) => (
                    <motion.tr
                      key={supplier.supplierId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border p-2">{supplier.supplierCode}</td>
                      <td className="border p-2">{supplier.supplierName}</td>
                      <td className="border p-2">
                        {supplier.contactPerson || "-"}
                      </td>
                      <td className="border p-2">{supplier.phone || "-"}</td>
                      <td className="border p-2">{supplier.email || "-"}</td>
                      <td className="border p-2">
                        {[
                          supplier.addressLine1,
                          supplier.addressLine2,
                          supplier.city,
                          supplier.state,
                          supplier.country,
                          supplier.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </td>
                      <td className="border p-2">
                        {supplier.gstNumber || "-"}
                      </td>
                      <td className="border p-2">{supplier.rfidTagPrefix}</td>
                      <td className="border p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            supplier.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </td>
                      <td className="border p-2">
                        {supplier.createdAt || "-"}
                      </td>
                      <td className="border p-2">
                        {supplier.updatedAt || "-"}
                      </td>
                      <td className="border p-2 text-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(supplier.supplierId)}
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
