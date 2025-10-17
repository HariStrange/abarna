// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "sonner";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   Pencil,
//   Trash2,
//   PlusCircle,
//   RefreshCw,
//   Folder,
//   FileText
// } from "lucide-react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Switch } from "@/components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// interface Master {
//   masterID: string;
//   code: string;
//   categoryName: string;
//   description: string;
//   active: boolean;
//   sortOrder: number;
//   tenantId: string;
//   items?: MasterItem[];
// }

// interface MasterItem {
//   itemID: string;
//   categoryId: string;
//   typeCode: string;
//   typeName: string;
//   active: boolean;
//   sortOrder: number;
//   tenantId: string;
// }

// export function MasterManager() {
//   const [categories, setCategories] = useState<Master[]>([]);
//   const [items, setItems] = useState<MasterItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState<string>("");

//   const [categoryForm, setCategoryForm] = useState({
//     code: "",
//     categoryName: "",
//     description: "",
//     active: true,
//     sortOrder: 0
//   });
//   const [editingCategory, setEditingCategory] = useState<Master | null>(null);
//   const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

//   const [itemForm, setItemForm] = useState({
//     typeCode: "",
//     typeName: "",
//     active: true,
//     sortOrder: 0
//   });
//   const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
//   const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

//   const API_BASE = "http://localhost:8080";
//   const token = Cookies.get("authToken");

//   const api = axios.create({
//     baseURL: API_BASE,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json"
//     },
//   });

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const categoriesRes = await api.get("/api/masters");
//       setCategories(categoriesRes.data);
//       toast.success("✅ Categories loaded!");
//     } catch (err: any) {
//       toast.error("❌ Error loading categories: " + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCategorySubmit = async () => {
//     if (!categoryForm.code || !categoryForm.categoryName) {
//       toast.error("Code & Category Name required!");
//       return;
//     }

//     try {
//       if (editingCategory) {
//         await api.put(`/api/masters/${editingCategory.masterID}`, {
//           ...categoryForm,
//           tenantId: editingCategory.tenantId
//         });
//         toast.success("✅ Category updated!");
//       } else {
//         await api.post("/api/masters", categoryForm);
//         toast.success("✅ Category created!");
//       }

//       await fetchData();
//       resetCategoryForm();
//       setIsCategoryDialogOpen(false);
//     } catch (err: any) {
//       const message = err.response?.data?.message || "Please try again";
//       toast.error(`❌ ${message}`);
//     }
//   };

//   const handleItemSubmit = async () => {
//     if (!selectedCategory) {
//       toast.error("Please select a category first!");
//       return;
//     }
//     if (!itemForm.typeCode || !itemForm.typeName) {
//       toast.error("Type Code & Type Name required!");
//       return;
//     }

//     try {
//       if (editingItem) {
//         await api.put(`/api/masters/items/${editingItem.itemID}`, {
//           ...itemForm,
//           categoryId: selectedCategory,
//           tenantId: editingItem.tenantId
//         });
//         toast.success("✅ Item updated!");
//       } else {
//         await api.post(`/api/masters/${selectedCategory}/items`, {
//           ...itemForm,
//           categoryId: selectedCategory
//         });
//         toast.success("✅ Item created!");
//       }

//       await loadItemsForCategory(selectedCategory);
//       resetItemForm();
//       setIsItemDialogOpen(false);
//     } catch (err: any) {
//       const message = err.response?.data?.message || "Please try again";
//       toast.error(`❌ ${message}`);
//     }
//   };

//   const resetCategoryForm = () => {
//     setCategoryForm({ code: "", categoryName: "", description: "", active: true, sortOrder: 0 });
//     setEditingCategory(null);
//   };

//   const resetItemForm = () => {
//     setItemForm({ typeCode: "", typeName: "", active: true, sortOrder: 0 });
//     setEditingItem(null);
//   };

//   const loadItemsForCategory = async (categoryId: string) => {
//     try {
//       const response = await api.get(`/api/masters/${categoryId}/items`);
//       setItems(response.data);
//     } catch (err: any) {
//       toast.error("❌ Error loading items");
//     }
//   };

//   const toggleCategoryStatus = async (category: Master) => {
//     try {
//       await api.put(`/api/masters/${category.masterID}`, {
//         ...category,
//         active: !category.active
//       });
//       setCategories(prev => prev.map(c =>
//         c.masterID === category.masterID ? { ...c, active: !c.active } : c
//       ));
//       toast.success(`✅ ${!category.active ? 'Activated' : 'Deactivated'}!`);
//     } catch (err: any) {
//       toast.error("❌ Error updating status");
//     }
//   };

//   const toggleItemStatus = async (item: MasterItem) => {
//     try {
//       await api.put(`/api/masters/items/${item.itemID}`, {
//         ...item,
//         active: !item.active
//       });
//       setItems(prev => prev.map(i =>
//         i.itemID === item.itemID ? { ...i, active: !i.active } : i
//       ));
//       toast.success(`✅ ${!item.active ? 'Activated' : 'Deactivated'}!`);
//     } catch (err: any) {
//       toast.error("❌ Error updating status");
//     }
//   };

//   const openEditCategoryDialog = (category: Master) => {
//     setEditingCategory(category);
//     setCategoryForm({
//       code: category.code,
//       categoryName: category.categoryName,
//       description: category.description,
//       active: category.active,
//       sortOrder: category.sortOrder
//     });
//     setIsCategoryDialogOpen(true);
//   };

//   const openEditItemDialog = (item: MasterItem) => {
//     setEditingItem(item);
//     setItemForm({
//       typeCode: item.typeCode,
//       typeName: item.typeName,
//       active: item.active,
//       sortOrder: item.sortOrder
//     });
//     setIsItemDialogOpen(true);
//   };

//   const deleteCategory = async (id: string) => {
//     if (!window.confirm("Delete this category and all items?")) return;
//     try {
//       await api.delete(`/api/masters/${id}`);
//       await fetchData();
//       toast.success("✅ Category deleted!");
//     } catch (err: any) {
//       toast.error("❌ Error deleting category");
//     }
//   };

//   const deleteItem = async (id: string) => {
//     if (!window.confirm("Delete this item?")) return;
//     try {
//       await api.delete(`/api/masters/items/${id}`);
//       await loadItemsForCategory(selectedCategory!);
//       toast.success("✅ Item deleted!");
//     } catch (err: any) {
//       toast.error("❌ Error deleting item");
//     }
//   };

//   const handleCategorySelect = (value: string) => {
//     setSelectedCategory(value);
//     if (value) {
//       loadItemsForCategory(value);
//     } else {
//       setItems([]);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="space-y-4 p-8">
//         <Skeleton className="h-8 w-64" />
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <motion.div className="space-y-6 p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">📂 Master Management</h1>
//           <p className="text-muted-foreground">Categories & Items - Full CRUD + Status Toggle</p>
//         </div>
//         <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
//           <DialogTrigger asChild>
//             <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
//               <Folder className="h-4 w-4" />
//               Add Category
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[425px]">
//             <DialogHeader>
//               <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <Input
//                 placeholder="Code *"
//                 value={categoryForm.code}
//                 onChange={(e) => setCategoryForm({...categoryForm, code: e.target.value})}
//               />
//               <Input
//                 placeholder="Category Name *"
//                 value={categoryForm.categoryName}
//                 onChange={(e) => setCategoryForm({...categoryForm, categoryName: e.target.value})}
//               />
//               <Input
//                 placeholder="Description"
//                 value={categoryForm.description}
//                 onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
//               />
//               <Input
//                 type="number"
//                 placeholder="Sort Order"
//                 value={categoryForm.sortOrder}
//                 onChange={(e) => setCategoryForm({...categoryForm, sortOrder: parseInt(e.target.value) || 0})}
//               />
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium">Active</span>
//                 <Switch
//                   checked={categoryForm.active}
//                   onCheckedChange={(checked) => setCategoryForm({...categoryForm, active: checked})}
//                 />
//               </div>
//               <div className="flex justify-end gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => {setIsCategoryDialogOpen(false); resetCategoryForm();}}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleCategorySubmit}
//                   disabled={!categoryForm.code || !categoryForm.categoryName}
//                   className="bg-blue-600 hover:bg-blue-700"
//                 >
//                   {editingCategory ? "Update" : "✅ Create"}
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Tabs defaultValue="categories" className="w-full">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="categories">
//             <Folder className="h-4 w-4 mr-2" />Categories ({categories.length})
//           </TabsTrigger>
//           <TabsTrigger value="items">
//             <FileText className="h-4 w-4 mr-2" />Items ({items.length})
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="categories" className="mt-4">
//           <Card>
//             <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
//               <div className="flex flex-row items-center justify-between">
//                 <CardTitle className="text-xl">📂 Categories ({categories.length})</CardTitle>
//                 <Button size="sm" variant="outline" onClick={fetchData}>
//                   <RefreshCw className="h-4 w-4 mr-2" /> Reload
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {categories.length === 0 ? (
//                 <p className="text-muted-foreground text-sm text-center py-8">
//                   No categories found. Click "Add Category" above!
//                 </p>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full border-collapse border border-gray-200">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="border p-2 text-left">Code</th>
//                         <th className="border p-2 text-left">Category Name</th>
//                         <th className="border p-2 text-left">Description</th>
//                         <th className="border p-2 text-left">Sort Order</th>
//                         <th className="border p-2 text-center w-24">Status</th>
//                         <th className="border p-2 text-center w-32">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {categories.map((c, index) => (
//                         <motion.tr
//                           key={c.masterID}
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.05 }}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className="border p-2 font-mono font-bold text-blue-600">{c.code}</td>
//                           <td className="border p-2 font-bold">{c.categoryName}</td>
//                           <td className="border p-2 text-xs truncate max-w-[200px]">{c.description}</td>
//                           <td className="border p-2 text-center">{c.sortOrder}</td>
//                           <td className="border p-2 text-center">
//                             <Switch
//                               checked={c.active}
//                               onCheckedChange={() => toggleCategoryStatus(c)}
//                             />
//                           </td>
//                           <td className="border p-2 text-center space-x-1">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => openEditCategoryDialog(c)}
//                               className="h-8 w-8 p-0"
//                             >
//                               <Pencil className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               size="sm"
//                               variant="destructive"
//                               onClick={() => deleteCategory(c.masterID)}
//                               className="h-8 w-8 p-0"
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </td>
//                         </motion.tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="items" className="mt-4">
//           <Card>
//             <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
//               <div className="flex flex-row items-center justify-between">
//                 <CardTitle className="text-xl">
//                   📄 Items - {selectedCategory
//                     ? categories.find(c => c.masterID === selectedCategory)?.categoryName
//                     : 'Select Category'} ({items.length})
//                 </CardTitle>
//                 <div className="flex items-center gap-2">
//                   <Select value={selectedCategory} onValueChange={handleCategorySelect}>
//                     <SelectTrigger className="w-[200px]">
//                       <SelectValue placeholder="Select Category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {categories.map((c) => (
//                         <SelectItem key={c.masterID} value={c.masterID}>
//                           {c.categoryName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   {selectedCategory && (
//                     <>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => loadItemsForCategory(selectedCategory)}
//                       >
//                         <RefreshCw className="h-4 w-4 mr-2" /> Reload
//                       </Button>
//                       <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
//                         <DialogTrigger asChild>
//                           <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
//                             <PlusCircle className="h-4 w-4" />
//                             Add Item
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="sm:max-w-[425px]">
//                           <DialogHeader>
//                             <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
//                           </DialogHeader>
//                           <div className="space-y-4">
//                             <Input
//                               placeholder="Type Code *"
//                               value={itemForm.typeCode}
//                               onChange={(e) => setItemForm({...itemForm, typeCode: e.target.value})}
//                             />
//                             <Input
//                               placeholder="Type Name *"
//                               value={itemForm.typeName}
//                               onChange={(e) => setItemForm({...itemForm, typeName: e.target.value})}
//                             />
//                             <Input
//                               type="number"
//                               placeholder="Sort Order"
//                               value={itemForm.sortOrder}
//                               onChange={(e) => setItemForm({...itemForm, sortOrder: parseInt(e.target.value) || 0})}
//                             />
//                             <div className="flex items-center justify-between">
//                               <span className="text-sm font-medium">Active</span>
//                               <Switch
//                                 checked={itemForm.active}
//                                 onCheckedChange={(checked) => setItemForm({...itemForm, active: checked})}
//                               />
//                             </div>
//                             <div className="flex justify-end gap-3">
//                               <Button
//                                 variant="outline"
//                                 onClick={() => {setIsItemDialogOpen(false); resetItemForm();}}
//                               >
//                                 Cancel
//                               </Button>
//                               <Button
//                                 onClick={handleItemSubmit}
//                                 disabled={!itemForm.typeCode || !itemForm.typeName}
//                                 className="bg-blue-600 hover:bg-blue-700"
//                               >
//                                 {editingItem ? "Update" : "✅ Create"}
//                               </Button>
//                             </div>
//                           </div>
//                         </DialogContent>
//                       </Dialog>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               {selectedCategory ? (
//                 items.length === 0 ? (
//                   <p className="text-muted-foreground text-sm text-center py-8">
//                     No items found. Click "Add Item" above!
//                   </p>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full border-collapse border border-gray-200">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="border p-2 text-left">Type Code</th>
//                           <th className="border p-2 text-left">Type Name</th>
//                           <th className="border p-2 text-left">Sort Order</th>
//                           <th className="border p-2 text-center w-24">Status</th>
//                           <th className="border p-2 text-center w-32">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {items.map((i, index) => (
//                           <motion.tr
//                             key={i.itemID}
//                             initial={{ opacity: 0, y: 10 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: index * 0.05 }}
//                             className="hover:bg-gray-50"
//                           >
//                             <td className="border p-2 font-mono font-bold text-green-600">{i.typeCode}</td>
//                             <td className="border p-2 font-bold">{i.typeName}</td>
//                             <td className="border p-2 text-center">{i.sortOrder}</td>
//                             <td className="border p-2 text-center">
//                               <Switch
//                                 checked={i.active}
//                                 onCheckedChange={() => toggleItemStatus(i)}
//                               />
//                             </td>
//                             <td className="border p-2 text-center space-x-1">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => openEditItemDialog(i)}
//                                 className="h-8 w-8 p-0"
//                               >
//                                 <Pencil className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={() => deleteItem(i.itemID)}
//                                 className="h-8 w-8 p-0"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </td>
//                           </motion.tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )
//               ) : (
//                 <p className="text-muted-foreground text-sm text-center py-8">
//                   Please select a category to view items
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </motion.div>
//   );
// }

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
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
import {
  Pencil,
  Trash2,
  PlusCircle,
  RefreshCw,
  Folder,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Master {
  masterID: string;
  code: string;
  categoryName: string;
  description: string;
  active: boolean;
  sortOrder: number;
  tenantId: string;
  items?: MasterItem[];
}

interface MasterItem {
  itemID: string;
  categoryId: string;
  typeCode: string;
  typeName: string;
  active: boolean;
  sortOrder: number;
  tenantId: string;
}

export function MasterManager() {
  const [categories, setCategories] = useState<Master[]>([]);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [categoryForm, setCategoryForm] = useState({
    code: "",
    categoryName: "",
    description: "",
    active: true,
    sortOrder: 0,
  });
  const [editingCategory, setEditingCategory] = useState<Master | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const [itemForm, setItemForm] = useState({
    typeCode: "",
    typeName: "",
    active: true,
    sortOrder: 0,
  });
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const API_BASE = "http://localhost:8080";
  const token = Cookies.get("authToken");

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const categoriesRes = await api.get("/api/masters");
      setCategories(categoriesRes.data);
      toast.success("✅ Categories loaded!");
    } catch (err: any) {
      toast.error(
        "❌ Error loading categories: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async () => {
    if (!categoryForm.code || !categoryForm.categoryName) {
      toast.error("Code & Category Name required!");
      return;
    }

    try {
      if (editingCategory) {
        await api.put(`/api/masters/${editingCategory.masterID}`, {
          ...categoryForm,
          tenantId: editingCategory.tenantId,
        });
        toast.success("✅ Category updated!");
      } else {
        await api.post("/api/masters", categoryForm);
        toast.success("✅ Category created!");
      }

      await fetchData();
      resetCategoryForm();
      setIsCategoryDialogOpen(false);
    } catch (err: any) {
      const message = err.response?.data?.message || "Please try again";
      toast.error(`❌ ${message}`);
    }
  };

  const handleItemSubmit = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category first!");
      return;
    }
    if (!itemForm.typeCode || !itemForm.typeName) {
      toast.error("Type Code & Type Name required!");
      return;
    }

    try {
      if (editingItem) {
        await api.put(`/api/masters/items/${editingItem.itemID}`, {
          ...itemForm,
          categoryId: selectedCategory,
          tenantId: editingItem.tenantId,
        });
        toast.success("✅ Item updated!");
      } else {
        await api.post(`/api/masters/${selectedCategory}/items`, {
          ...itemForm,
          categoryId: selectedCategory,
        });
        toast.success("✅ Item created!");
      }

      await loadItemsForCategory(selectedCategory);
      resetItemForm();
      setIsItemDialogOpen(false);
    } catch (err: any) {
      const message = err.response?.data?.message || "Please try again";
      toast.error(`❌ ${message}`);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      code: "",
      categoryName: "",
      description: "",
      active: true,
      sortOrder: 0,
    });
    setEditingCategory(null);
  };

  const resetItemForm = () => {
    setItemForm({ typeCode: "", typeName: "", active: true, sortOrder: 0 });
    setEditingItem(null);
  };

  const loadItemsForCategory = async (categoryId: string) => {
    try {
      const response = await api.get(`/api/masters/${categoryId}/items`);
      setItems(response.data);
    } catch (err: any) {
      toast.error("❌ Error loading items");
    }
  };

  const toggleCategoryStatus = async (category: Master) => {
    try {
      await api.put(`/api/masters/${category.masterID}`, {
        ...category,
        active: !category.active,
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.masterID === category.masterID ? { ...c, active: !c.active } : c
        )
      );
      toast.success(`✅ ${!category.active ? "Activated" : "Deactivated"}!`);
    } catch (err: any) {
      toast.error("❌ Error updating status");
    }
  };

  const toggleItemStatus = async (item: MasterItem) => {
    try {
      await api.put(`/api/masters/items/${item.itemID}`, {
        ...item,
        active: !item.active,
      });
      setItems((prev) =>
        prev.map((i) =>
          i.itemID === item.itemID ? { ...i, active: !i.active } : i
        )
      );
      toast.success(`✅ ${!item.active ? "Activated" : "Deactivated"}!`);
    } catch (err: any) {
      toast.error("❌ Error updating status");
    }
  };

  const openEditCategoryDialog = (category: Master) => {
    setEditingCategory(category);
    setCategoryForm({
      code: category.code,
      categoryName: category.categoryName,
      description: category.description,
      active: category.active,
      sortOrder: category.sortOrder,
    });
    setIsCategoryDialogOpen(true);
  };

  const openEditItemDialog = (item: MasterItem) => {
    setEditingItem(item);
    setItemForm({
      typeCode: item.typeCode,
      typeName: item.typeName,
      active: item.active,
      sortOrder: item.sortOrder,
    });
    setIsItemDialogOpen(true);
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category and all items?")) return;
    try {
      await api.delete(`/api/masters/${id}`);
      await fetchData();
      toast.success("✅ Category deleted!");
    } catch (err: any) {
      toast.error("❌ Error deleting category");
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/api/masters/items/${id}`);
      await loadItemsForCategory(selectedCategory!);
      toast.success("✅ Item deleted!");
    } catch (err: any) {
      toast.error("❌ Error deleting item");
    }
  };

  const handleCategorySelect = (value: string) => {
    setSelectedCategory(value);
    if (value) {
      loadItemsForCategory(value);
    } else {
      setItems([]);
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            📂 Master Management
          </h1>
          <p className="text-muted-foreground">
            Categories & Items - Full CRUD + Status Toggle
          </p>
        </div>
        <Dialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Folder className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Code *"
                value={categoryForm.code}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, code: e.target.value })
                }
              />
              <Input
                placeholder="Category Name *"
                value={categoryForm.categoryName}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    categoryName: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Sort Order"
                value={categoryForm.sortOrder}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active</span>
                <Switch
                  checked={categoryForm.active}
                  onCheckedChange={(checked) =>
                    setCategoryForm({ ...categoryForm, active: checked })
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCategoryDialogOpen(false);
                    resetCategoryForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCategorySubmit}
                  disabled={!categoryForm.code || !categoryForm.categoryName}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingCategory ? "Update" : "✅ Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">
            <Folder className="h-4 w-4 mr-2" />
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="items">
            <FileText className="h-4 w-4 mr-2" />
            Items ({items.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">
                  📂 Categories ({categories.length})
                </CardTitle>
                <Button size="sm" variant="outline" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Reload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No categories found. Click "Add Category" above!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-200 p-3 text-left font-semibold text-sm">
                          Code
                        </th>
                        <th className="border border-gray-200 p-3 text-left font-semibold text-sm">
                          Category Name
                        </th>
                        <th className="border border-gray-200 p-3 text-left font-semibold text-sm max-w-[250px]">
                          Description
                        </th>
                        <th className="border border-gray-200 p-3 text-center font-semibold text-sm w-24">
                          Sort Order
                        </th>
                        <th className="border border-gray-200 p-3 text-center font-semibold text-sm w-24">
                          Status
                        </th>
                        <th className="border border-gray-200 p-3 text-center font-semibold text-sm w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c, index) => (
                        <motion.tr
                          key={c.masterID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 even:bg-gray-50/50"
                        >
                          <td className="border border-gray-200 p-3 font-mono font-bold text-blue-600 text-sm">
                            {c.code}
                          </td>
                          <td className="border border-gray-200 p-3 font-bold text-sm">
                            {c.categoryName}
                          </td>
                          <td className="border border-gray-200 p-3 text-sm max-w-[250px] truncate">
                            {c.description}
                          </td>
                          <td className="border border-gray-200 p-3 text-center text-sm">
                            {c.sortOrder}
                          </td>
                          <td className="border border-gray-200 p-3 text-center">
                            <Switch
                              checked={c.active}
                              onCheckedChange={() => toggleCategoryStatus(c)}
                            />
                          </td>
                          <td className="border border-gray-200 p-3 text-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditCategoryDialog(c)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCategory(c.masterID)}
                              className="h-8 w-8 p-0"
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
        </TabsContent>

        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">
                  📄 Items -{" "}
                  {selectedCategory
                    ? categories.find((c) => c.masterID === selectedCategory)
                        ?.categoryName
                    : "Select Category"}{" "}
                  ({items.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={handleCategorySelect}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.masterID} value={c.masterID}>
                          {c.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategory && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadItemsForCategory(selectedCategory)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" /> Reload
                      </Button>
                      <Dialog
                        open={isItemDialogOpen}
                        onOpenChange={setIsItemDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                            <PlusCircle className="h-4 w-4" />
                            Add Item
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>
                              {editingItem ? "Edit Item" : "Add Item"}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Type Code *"
                              value={itemForm.typeCode}
                              onChange={(e) =>
                                setItemForm({
                                  ...itemForm,
                                  typeCode: e.target.value,
                                })
                              }
                            />
                            <Input
                              placeholder="Type Name *"
                              value={itemForm.typeName}
                              onChange={(e) =>
                                setItemForm({
                                  ...itemForm,
                                  typeName: e.target.value,
                                })
                              }
                            />
                            <Input
                              type="number"
                              placeholder="Sort Order"
                              value={itemForm.sortOrder}
                              onChange={(e) =>
                                setItemForm({
                                  ...itemForm,
                                  sortOrder: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Active
                              </span>
                              <Switch
                                checked={itemForm.active}
                                onCheckedChange={(checked) =>
                                  setItemForm({ ...itemForm, active: checked })
                                }
                              />
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsItemDialogOpen(false);
                                  resetItemForm();
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleItemSubmit}
                                disabled={
                                  !itemForm.typeCode || !itemForm.typeName
                                }
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {editingItem ? "Update" : "✅ Create"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedCategory ? (
                items.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No items found. Click "Add Item" above!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-200 p-3 text-left font-semibold text-sm">
                            Type Code
                          </th>
                          <th className="border border-gray-200 p-3 text-left font-semibold text-sm">
                            Type Name
                          </th>
                          <th className="border border-gray-200 p-3 text-center font-semibold text-sm w-24">
                            Sort Order
                          </th>
                          <th className="border border-gray-200 p-3 text-center font-semibold text-sm w-24">
                            Status
                          </th>
                          <th className="border border-gray-200 p-3 text-center font-semibold text-sm w-32">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((i, index) => (
                          <motion.tr
                            key={i.itemID}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 even:bg-gray-50/50"
                          >
                            <td className="border border-gray-200 p-3 font-mono font-bold text-green-600 text-sm">
                              {i.typeCode}
                            </td>
                            <td className="border border-gray-200 p-3 font-bold text-sm">
                              {i.typeName}
                            </td>
                            <td className="border border-gray-200 p-3 text-center text-sm">
                              {i.sortOrder}
                            </td>
                            <td className="border border-gray-200 p-3 text-center">
                              <Switch
                                checked={i.active}
                                onCheckedChange={() => toggleItemStatus(i)}
                              />
                            </td>
                            <td className="border border-gray-200 p-3 text-center space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditItemDialog(i)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteItem(i.itemID)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Please select a category to view items
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
