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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  PlusCircle,
  Printer,
  QrCode,
  Save,
  X,
  Check,
} from "lucide-react";

interface Rack {
  id: string;
  name: string;
}

interface Bin {
  id: string;
  binCode: string;
  rfidAddress: string;
  generatedCode: string;
  rack?: Rack;
}

interface SelectedBinQR {
  id: string;
  binCode: string;
  generatedCode: string;
  qrImageUrl: string;
  qrScansTo: string;
}

interface NewBinRow {
  rackId: string;
  rfidAddress: string;
}

export function BinManager() {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [bins, setBins] = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBin, setEditingBin] = useState<Bin | null>(null);
  const [editFormData, setEditFormData] = useState({
    rfidAddress: "",
    rackId: "",
  });
  const [selectedBins, setSelectedBins] = useState<string[]>([]);
  const [selectedBinQrs, setSelectedBinQrs] = useState<SelectedBinQR[]>([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [newBinRow, setNewBinRow] = useState<NewBinRow | null>(null);

  const API_BASE = "http://localhost:8080";
  const token = Cookies.get("authToken");

  const api = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rackRes, binRes] = await Promise.all([
          api.get("/api/racks"),
          api.get("/api/bins"),
        ]);
        setRacks(rackRes.data);
        setBins(binRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCheckboxChange = (binId: string) => {
    setSelectedBins((prev) =>
      prev.includes(binId)
        ? prev.filter((id) => id !== binId)
        : [...prev, binId]
    );
  };

  const selectAll = () => {
    if (selectedBins.length === bins.length) {
      setSelectedBins([]);
    } else {
      setSelectedBins(bins.map((b) => b.id));
    }
  };

  const handleAddNewRow = () => {
    setNewBinRow({ rackId: "", rfidAddress: "" });
  };

  const handleSaveNewBin = async () => {
    if (!newBinRow) return;

    if (!newBinRow.rackId || !newBinRow.rfidAddress.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { rfidAddress } = newBinRow;
      await api.post(`/api/bins/${newBinRow.rackId}`, { rfidAddress });

      const updated = await api.get("/api/bins");
      setBins(updated.data);
      setNewBinRow(null);
      toast.success("Bin created successfully with QR code!");
    } catch (err: any) {
      console.error("Error saving bin:", err);
      if (err.response?.status === 400) {
        toast.error("RFID Address must be unique!");
      } else {
        toast.error("Error saving bin");
      }
    }
  };

  const handleCancelNewBin = () => {
    setNewBinRow(null);
  };

  const handleEdit = (bin: Bin) => {
    setEditingBin(bin);
    setEditFormData({
      rfidAddress: bin.rfidAddress,
      rackId: bin.rack?.id || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBin) return;

    if (!editFormData.rfidAddress.trim()) {
      toast.error("RFID Address is required");
      return;
    }

    try {
      const { rfidAddress } = editFormData;
      await api.put(`/api/bins/${editingBin.id}`, { rfidAddress });

      const updated = await api.get("/api/bins");
      setBins(updated.data);
      setEditingBin(null);
      toast.success("Bin updated successfully!");
    } catch (err: any) {
      console.error("Error updating bin:", err);
      if (err.response?.status === 400) {
        toast.error("RFID Address must be unique!");
      } else {
        toast.error("Error updating bin");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBin(null);
  };

  const handleDelete = async (id: string) => {
    toast(
      <div className="flex flex-col gap-2">
        <p>Are you sure you want to delete this bin?</p>
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
      await api.delete(`/api/bins/${id}`);
      setBins(bins.filter((b) => b.id !== id));
      setSelectedBins(selectedBins.filter((bid) => bid !== id));
      toast.success("Bin deleted successfully!");
    } catch (err) {
      console.error("Error deleting bin:", err);
      toast.error("Failed to delete bin");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBins.length === 0) {
      toast.error("Please select bins to delete");
      return;
    }

    toast(
      <div className="flex flex-col gap-2">
        <p>Delete {selectedBins.length} bin(s)?</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              confirmDeleteSelected();
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

  const confirmDeleteSelected = async () => {
    try {
      await Promise.all(selectedBins.map((id) => api.delete(`/api/bins/${id}`)));
      setBins(bins.filter((b) => !selectedBins.includes(b.id)));
      setSelectedBins([]);
      setSelectedBinQrs([]);
      toast.success(`${selectedBins.length} bin(s) deleted!`);
    } catch (err) {
      console.error("Error deleting bins:", err);
      toast.error("Failed to delete bins");
    }
  };

  const viewSingleQr = async (binId: string) => {
    const bin = bins.find((b) => b.id === binId);
    if (!bin) return;

    try {
      const response = await api.get(`/api/bins/${binId}/qrcode`, {
        responseType: "blob",
      });
      const qrImageUrl = URL.createObjectURL(response.data);

      const qrWindow = window.open("", "_blank");
      if (qrWindow) {
        qrWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR: ${bin.binCode}</title>
            <style>
              body {
                text-align: center;
                padding: 40px;
                font-family: Arial, sans-serif;
                background: #f8fafc;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }
              h2 { color: #1e40af; margin-bottom: 10px; }
              .info {
                background: #f1f5f9;
                padding: 12px;
                border-radius: 8px;
                margin: 15px 0;
                font-family: 'Courier New', monospace;
                text-align: left;
              }
              .scan-code { font-size: 12px; color: #64748b; }
              img {
                width: 300px !important;
                height: 300px !important;
                border: 3px solid #1e40af;
                border-radius: 12px;
                margin: 20px 0;
              }
              .print-btn {
                background: #3b82f6;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${bin.binCode}</h2>
              <div class="info">
                <strong>Name:</strong> ${bin.generatedCode}
              </div>
              <div class="info scan-code">
                <strong>Scans To:</strong><br>ID:${binId}<br>Name:${bin.generatedCode}
              </div>
              <img src="${qrImageUrl}" alt="QR ${bin.binCode}" />
              <br>
              <button class="print-btn" onclick="window.print()">Print This QR</button>
            </div>
          </body>
          </html>
        `);
        qrWindow.document.close();
      }
    } catch (err) {
      console.error("Failed to load QR:", err);
      toast.error("Failed to load QR code");
    }
  };

  const loadSelectedBinQrs = async () => {
    if (selectedBins.length === 0) return;

    setQrLoading(true);
    const qrPromises = selectedBins.map(async (binId) => {
      try {
        const response = await api.get(`/api/bins/${binId}/qrcode`, {
          responseType: "blob",
        });
        const imageUrl = URL.createObjectURL(response.data);
        const bin = bins.find((b) => b.id === binId);
        const qrScansTo = `ID:${binId}|Name:${bin?.generatedCode}`;
        return {
          id: binId,
          binCode: bin?.binCode || "",
          generatedCode: bin?.generatedCode || "",
          qrImageUrl: imageUrl,
          qrScansTo: qrScansTo,
        };
      } catch (err) {
        return null;
      }
    });

    const results = (await Promise.all(qrPromises)).filter(
      Boolean
    ) as SelectedBinQR[];
    setSelectedBinQrs(results);
    setQrLoading(false);
    toast.success(`${results.length} QR code(s) loaded!`);
  };

  const printAllQrs = async () => {
    if (selectedBins.length === 0) {
      toast.error("Please select bins first!");
      return;
    }

    if (selectedBinQrs.length === 0) {
      await loadSelectedBinQrs();
    }

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print ${selectedBinQrs.length} QR Codes</title>
          <style>
            @page { margin: 0.5in; }
            body { margin: 0; font-family: 'Arial', sans-serif; padding: 20px; background: white; }
            .header { text-align: center; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
            .page { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
            .qr-card { text-align: center; padding: 20px; border: 2px solid #333; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .bin-code { font-weight: bold; margin-bottom: 8px; font-size: 16px; color: #1e40af; }
            .generated-code { font-family: 'Courier New', monospace; font-size: 11px; margin-bottom: 6px; word-break: break-all; background: #f8fafc; padding: 4px 8px; border-radius: 4px; }
            .scan-code { font-family: 'Courier New', monospace; font-size: 9px; color: #64748b; margin-bottom: 12px; background: #f1f5f9; padding: 2px 6px; border-radius: 3px; }
            img { max-width: 200px !important; height: auto; border: 2px solid #333; border-radius: 8px; margin: 0 auto; display: block; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="header">QR CODES - ${selectedBinQrs.length} BINS</div>
          <div class="page">
            ${selectedBinQrs
              .map(
                (qr) => `
              <div class="qr-card">
                <div class="bin-code">Bin: ${qr.binCode}</div>
                <div class="generated-code">Name: ${qr.generatedCode}</div>
                <div class="scan-code">Scans: ${qr.qrScansTo}</div>
                <img src="${qr.qrImageUrl}" alt="QR ${qr.binCode}" />
              </div>
            `
              )
              .join("")}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
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
          <h1 className="text-3xl font-bold tracking-tight">Bin Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage bins and generate QR codes
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
            disabled={newBinRow !== null}
          >
            <PlusCircle className="h-4 w-4" />
            Add Bin
          </Button>
        </motion.div>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/50">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              Bin Inventory ({bins.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={selectAll}
              >
                <Check className="h-4 w-4 mr-2" />
                {selectedBins.length === bins.length ? "Deselect All" : "Select All"}
              </Button>

              {selectedBins.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={loadSelectedBinQrs}
                    disabled={qrLoading}
                  >
                    {qrLoading ? "Loading..." : `Load QRs (${selectedBins.length})`}
                  </Button>

                  <Button
                    size="sm"
                    onClick={printAllQrs}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print ({selectedBins.length})
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedBins.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {bins.length === 0 && !newBinRow ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bins found. Click "Add Bin" to create one!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left w-12">
                      <Checkbox
                        checked={selectedBins.length === bins.length && bins.length > 0}
                        onCheckedChange={selectAll}
                      />
                    </th>
                    <th className="p-3 text-left">Bin Code</th>
                    <th className="p-3 text-left">RFID Address</th>
                    <th className="p-3 text-left">Generated Code</th>
                    <th className="p-3 text-left">Rack</th>
                    <th className="p-3 text-center w-24">QR</th>
                    <th className="p-3 text-center w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {newBinRow && (
                      <motion.tr
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-b bg-blue-50"
                      >
                        <td className="p-3"></td>
                        <td className="p-3 text-muted-foreground">Auto-generated</td>
                        <td className="p-3">
                          <Input
                            placeholder="Enter RFID Address *"
                            value={newBinRow.rfidAddress}
                            onChange={(e) =>
                              setNewBinRow({ ...newBinRow, rfidAddress: e.target.value })
                            }
                            className="h-8"
                            required
                          />
                        </td>
                        <td className="p-3 text-muted-foreground">Auto-generated</td>
                        <td className="p-3">
                          <Select
                            value={newBinRow.rackId}
                            onValueChange={(value) =>
                              setNewBinRow({ ...newBinRow, rackId: value })
                            }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select Rack *" />
                            </SelectTrigger>
                            <SelectContent>
                              {racks.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
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
                              onClick={handleSaveNewBin}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelNewBin}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )}

                    {bins.map((b, index) => (
                      <motion.tr
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`border-b hover:bg-muted/50 transition-colors ${
                          selectedBins.includes(b.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="p-3">
                          <Checkbox
                            checked={selectedBins.includes(b.id)}
                            onCheckedChange={() => handleCheckboxChange(b.id)}
                          />
                        </td>
                        <td className="p-3 font-mono font-semibold text-blue-600">
                          {b.binCode}
                        </td>
                        <td className="p-3">
                          {editingBin?.id === b.id ? (
                            <Input
                              value={editFormData.rfidAddress}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, rfidAddress: e.target.value })
                              }
                              className="h-8 font-mono text-sm"
                              required
                            />
                          ) : (
                            <span className="font-mono text-sm">{b.rfidAddress || "—"}</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                          {b.generatedCode}
                        </td>
                        <td className="p-3">
                          {editingBin?.id === b.id ? (
                            <Select
                              value={editFormData.rackId}
                              onValueChange={(value) =>
                                setEditFormData({ ...editFormData, rackId: value })
                              }
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {racks.map((r) => (
                                  <SelectItem key={r.id} value={r.id}>
                                    {r.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            b.rack?.name || "—"
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewSingleQr(b.id)}
                            className="h-8 w-8 p-0"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </td>
                        <td className="p-3 text-center">
                          {editingBin?.id === b.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={handleSaveEdit}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(b)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(b.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
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
