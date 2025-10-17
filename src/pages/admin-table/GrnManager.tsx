import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Trash2, PlusCircle, Eye, EyeOff, Save, X, ChevronDown, ChevronRight } from "lucide-react";

interface PurchaseOrderLine {
  id: string;
  itemId: string;
  itemName: string;
  qtyOrdered: number;
  qtyReceived: number;
  pricePerQuantity: string;
}

interface PurchaseOrder {
  id: string;
  poCode: string;
  supplierName: string;
  lines: PurchaseOrderLine[];
}

interface GrnLine {
  id?: string;
  itemId: string;
  itemName: string;
  qtyReceived: number;
  qtybalance: number;
  qtyOrdered: number;
}

interface Grn {
  id: string;
  grnCode: string;
  status: string;
  purchaseOrderNumber: string;
  supplierName: string;
  receivedAt: string;
  lines: GrnLine[];
}

interface ItemDetail {
  id: string;
  name: string;
  displayname: string;
  itemTypeName: string;
  brandName: string;
  attributes: { attributeName: string; attributeValue: string }[];
  itemCode: string;
}

interface NewGrnRow {
  purchaseOrderId: string;
  receivedQuantities: Record<string, number>;
}

export function GrnManager() {
  const [grns, setGrns] = useState<Grn[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGrn, setExpandedGrn] = useState<string | null>(null);
  const [itemDetails, setItemDetails] = useState<Record<string, ItemDetail[]>>({});
  const [newGrnRow, setNewGrnRow] = useState<NewGrnRow | null>(null);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const API_BASE = "http://localhost:8080";
  const token = Cookies.get("authToken");

  const api = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poRes, grnRes] = await Promise.all([
          api.get("/api/purchase-orders"),
          api.get("/api/grn"),
        ]);
        setPurchaseOrders(poRes.data);
        setGrns(grnRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddNewRow = () => {
    setNewGrnRow({ purchaseOrderId: "", receivedQuantities: {} });
  };

  const handlePOChange = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    setSelectedPO(po || null);
    if (newGrnRow) {
      setNewGrnRow({ ...newGrnRow, purchaseOrderId: poId, receivedQuantities: {} });
    }
  };

  const handleQtyChange = (itemId: string, value: string) => {
    if (!newGrnRow) return;
    setNewGrnRow({
      ...newGrnRow,
      receivedQuantities: {
        ...newGrnRow.receivedQuantities,
        [itemId]: parseInt(value) || 0,
      },
    });
  };

  const handleSaveNewGrn = async () => {
    if (!newGrnRow || !newGrnRow.purchaseOrderId) {
      toast.error("Please select a Purchase Order");
      return;
    }

    if (!selectedPO) return;

    try {
      const lines = selectedPO.lines.map((line) => ({
        item: { id: line.itemId },
        qtyReceived: newGrnRow.receivedQuantities[line.itemId] || 0,
        qtyOrdered: line.qtyOrdered,
        qtybalance: line.qtyReceived,
      }));

      await api.post(`/api/grn/create?purchaseOrderId=${newGrnRow.purchaseOrderId}`, lines);

      const updatedGrn = await api.get("/api/grn");
      setGrns(updatedGrn.data);
      setNewGrnRow(null);
      setSelectedPO(null);
      toast.success("GRN created successfully!");
    } catch (err: any) {
      console.error("Error creating GRN:", err);
      if (err.response?.status === 500) {
        toast.error("The entered data exceeds the ordered quantity");
      } else {
        toast.error("Error creating GRN");
      }
    }
  };

  const handleCancelNewGrn = () => {
    setNewGrnRow(null);
    setSelectedPO(null);
  };

  const handleDelete = async (id: string) => {
    toast(
      <div className="flex flex-col gap-2">
        <p>Are you sure you want to delete this GRN?</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              confirmDelete(id);
              toast.dismiss();
            }}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </Button>
        </div>
      </div>,
      { duration: 5000 }
    );
  };

  const confirmDelete = async (id: string) => {
    try {
      await api.delete(`/api/grn/${id}`);
      setGrns(grns.filter((g) => g.id !== id));
      toast.success("GRN deleted successfully!");
    } catch (err) {
      console.error("Error deleting GRN:", err);
      toast.error("Failed to delete GRN");
    }
  };

  const handleViewItems = async (grn: Grn) => {
    if (expandedGrn === grn.id) {
      setExpandedGrn(null);
      return;
    }

    if (itemDetails[grn.id]) {
      setExpandedGrn(grn.id);
      return;
    }

    try {
      const details = await Promise.all(
        grn.lines.map(async (line) => {
          const res = await api.get(`/api/items/${line.itemId}`);
          return res.data as ItemDetail;
        })
      );
      setItemDetails((prev) => ({ ...prev, [grn.id]: details }));
      setExpandedGrn(grn.id);
    } catch (err) {
      console.error("Error fetching item details:", err);
      toast.error("Failed to load item details");
    }
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">GRN Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage Goods Receipt Notes
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            className="flex items-center gap-2"
            onClick={handleAddNewRow}
            disabled={newGrnRow !== null}
          >
            <PlusCircle className="h-4 w-4" />
            Create GRN
          </Button>
        </motion.div>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>GRN List ({grns.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {grns.length === 0 && !newGrnRow ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No GRNs found. Click "Create GRN" to create one!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left w-12"></th>
                    <th className="p-3 text-left">GRN Code</th>
                    <th className="p-3 text-left">Purchase Order</th>
                    <th className="p-3 text-left">Supplier</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Received At</th>
                    <th className="p-3 text-left">Lines</th>
                    <th className="p-3 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {newGrnRow && (
                      <>
                        <motion.tr
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="border-b bg-blue-50"
                        >
                          <td className="p-3"></td>
                          <td className="p-3 text-muted-foreground">Auto-generated</td>
                          <td className="p-3" colSpan={4}>
                            <Select
                              value={newGrnRow.purchaseOrderId}
                              onValueChange={handlePOChange}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select Purchase Order *" />
                              </SelectTrigger>
                              <SelectContent>
                                {purchaseOrders.map((po) => (
                                  <SelectItem key={po.id} value={po.id}>
                                    {po.poCode} — {po.supplierName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3"></td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={handleSaveNewGrn}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelNewGrn}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                        {selectedPO && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-blue-50">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3 text-sm">Purchase Order Items</h4>
                                <ScrollArea className="h-[200px]">
                                  <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                      <tr>
                                        <th className="p-2 text-left">Item Name</th>
                                        <th className="p-2 text-left">Ordered Qty</th>
                                        <th className="p-2 text-left">Received Qty</th>
                                        <th className="p-2 text-left">Pending Qty</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedPO.lines.map((line) => (
                                        <tr key={line.id} className="border-b">
                                          <td className="p-2">{line.itemName}</td>
                                          <td className="p-2">{line.qtyOrdered}</td>
                                          <td className="p-2">
                                            <Input
                                              type="number"
                                              className="w-24 h-8"
                                              value={newGrnRow.receivedQuantities[line.itemId] || ""}
                                              onChange={(e) =>
                                                handleQtyChange(line.itemId, e.target.value)
                                              }
                                              min="0"
                                              required
                                            />
                                          </td>
                                          <td className="p-2">{line.qtyOrdered - (line.qtyReceived || 0)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </ScrollArea>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )}

                    {grns.map((g, index) => (
                      <>
                        <motion.tr
                          key={g.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewItems(g)}
                              className="h-6 w-6 p-0"
                            >
                              {expandedGrn === g.id ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </td>
                          <td className="p-3 font-mono font-semibold">{g.grnCode}</td>
                          <td className="p-3">{g.purchaseOrderNumber}</td>
                          <td className="p-3">{g.supplierName}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                              {g.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {new Date(g.receivedAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">{g.lines.length} items</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewItems(g)}
                                className="h-8 w-8 p-0"
                              >
                                {expandedGrn === g.id ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(g.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>

                        {expandedGrn === g.id && itemDetails[g.id] && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={8} className="p-0 bg-muted/30">
                              <div className="p-4">
                                <h4 className="font-semibold mb-3 text-sm">Item Details</h4>
                                <ScrollArea className="h-[300px]">
                                  <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                      <tr>
                                        <th className="p-2 text-left">Item Code</th>
                                        <th className="p-2 text-left">Name</th>
                                        <th className="p-2 text-left">Display Name</th>
                                        <th className="p-2 text-left">Item Type</th>
                                        <th className="p-2 text-left">Brand</th>
                                        <th className="p-2 text-left">Attributes</th>
                                        <th className="p-2 text-left">Ordered</th>
                                        <th className="p-2 text-left">Received</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {itemDetails[g.id].map((item) => {
                                        const line = g.lines.find((l) => l.itemId === item.id);
                                        return (
                                          <tr key={item.id} className="border-b">
                                            <td className="p-2 font-mono text-xs">{item.itemCode}</td>
                                            <td className="p-2">{item.name}</td>
                                            <td className="p-2">{item.displayname}</td>
                                            <td className="p-2">{item.itemTypeName}</td>
                                            <td className="p-2">{item.brandName}</td>
                                            <td className="p-2 text-xs">
                                              {item.attributes
                                                .map((a) => `${a.attributeName}: ${a.attributeValue}`)
                                                .join(", ")}
                                            </td>
                                            <td className="p-2 text-center">{line?.qtyOrdered ?? "—"}</td>
                                            <td className="p-2 text-center">{line?.qtyReceived ?? "—"}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </ScrollArea>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
