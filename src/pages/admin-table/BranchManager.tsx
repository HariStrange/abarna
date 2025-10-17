import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Pencil, Trash2, PlusCircle, Save, X } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";

interface Branch {
  id: string;
  name: string;
  address?: string;
  branchcode?: string;
}

interface NewBranchRow {
  name: string;
  address: string;
}

export function BranchManager() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
  });
  const [newBranchRow, setNewBranchRow] = useState<NewBranchRow | null>(null);

  const API_BASE = "http://localhost:8080";
  const token = Cookies.get("authToken");

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/api/branches");
        setBranches(res.data);
      } catch (error) {
        console.error("Error loading branches:", error);
        toast.error("Failed to load branches");
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const handleAddNewRow = () => {
    setNewBranchRow({ name: "", address: "" });
  };

  const handleSaveNewBranch = async () => {
    if (!newBranchRow) return;

    if (!newBranchRow.name.trim() || !newBranchRow.address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.post(`/api/branches`, newBranchRow);
      const updatedBranches = await api.get("/api/branches");
      setBranches(updatedBranches.data);
      setNewBranchRow(null);
      toast.success("Branch created successfully!");
    } catch (error) {
      console.error("Error saving branch:", error);
      toast.error("Failed to create branch");
    }
  };

  const handleCancelNewBranch = () => {
    setNewBranchRow(null);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setEditFormData({
      name: branch.name,
      address: branch.address || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBranch) return;

    if (!editFormData.name.trim() || !editFormData.address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await api.put(`/api/branches/${editingBranch.id}`, {
        ...editFormData,
        branchcode: editingBranch.branchcode,
      });
      const updatedBranches = await api.get("/api/branches");
      setBranches(updatedBranches.data);
      setEditingBranch(null);
      toast.success("Branch updated successfully!");
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch");
    }
  };

  const handleCancelEdit = () => {
    setEditingBranch(null);
  };

  const handleDelete = async (id: string) => {
    toast(
      <div className="flex flex-col gap-2">
        <p>Are you sure you want to delete this branch?</p>
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
      await api.delete(`/api/branches/${id}`);
      setBranches(branches.filter((b) => b.id !== id));
      toast.success("Branch deleted successfully!");
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast.error("Failed to delete branch");
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Branch Management" description="Loading...">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Branch Management"
      description="Manage your organization's branches"
    >
      <div className="flex items-center justify-end mb-6">
        <Button
          className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          onClick={handleAddNewRow}
          disabled={newBranchRow !== null}
          size="lg"
        >
          <PlusCircle className="h-5 w-5" />
          Add Branch
        </Button>
      </div>

      <Card className="border-2 shadow-md">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-2xl">Branch List ({branches.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {branches.length === 0 && !newBranchRow ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No branches found. Click "Add Branch" to create one!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <table className="w-full">
                <thead className="bg-muted sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 text-left font-semibold">Branch Code</th>
                    <th className="p-4 text-left font-semibold">Branch Name</th>
                    <th className="p-4 text-left font-semibold">Address</th>
                    <th className="p-4 text-center w-32 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {newBranchRow && (
                      <motion.tr
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-b bg-primary/5"
                      >
                        <td className="p-4 text-muted-foreground font-medium">Auto-generated</td>
                        <td className="p-4">
                          <Input
                            placeholder="Enter branch name *"
                            value={newBranchRow.name}
                            onChange={(e) =>
                              setNewBranchRow({ ...newBranchRow, name: e.target.value })
                            }
                            className="h-10"
                            required
                          />
                        </td>
                        <td className="p-4">
                          <Input
                            placeholder="Enter address *"
                            value={newBranchRow.address}
                            onChange={(e) =>
                              setNewBranchRow({ ...newBranchRow, address: e.target.value })
                            }
                            className="h-10"
                            required
                          />
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={handleSaveNewBranch}
                              className="h-9 w-9 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelNewBranch}
                              className="h-9 w-9 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )}

                    {branches.map((branch, index) => (
                      <motion.tr
                        key={branch.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b hover:bg-muted/30 transition-all"
                      >
                        <td className="p-4 font-mono text-sm">
                          {branch.branchcode || "—"}
                        </td>
                        <td className="p-4">
                          {editingBranch?.id === branch.id ? (
                            <Input
                              value={editFormData.name}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, name: e.target.value })
                              }
                              className="h-10"
                              required
                            />
                          ) : (
                            <span className="font-medium">{branch.name}</span>
                          )}
                        </td>
                        <td className="p-4">
                          {editingBranch?.id === branch.id ? (
                            <Input
                              value={editFormData.address}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, address: e.target.value })
                              }
                              className="h-10"
                              required
                            />
                          ) : (
                            branch.address || "—"
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {editingBranch?.id === branch.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={handleSaveEdit}
                                className="h-9 w-9 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                className="h-9 w-9 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(branch)}
                                className="h-9 w-9 p-0 hover:bg-primary/10"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(branch.id)}
                                className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
    </PageWrapper>
  );
}
