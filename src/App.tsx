import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { BranchManager } from "./pages/admin-table/BranchManager";
import { WarehouseManager } from "./pages/admin-table/WarehouseManager";
import { ZoneManager } from "./pages/admin-table/ZoneManager";
import { RackManager } from "./pages/admin-table/RackManager";
import { BinManager } from "./pages/admin-table/BinManager";
import { ItemTypeManager } from "./pages/admin-table/ItemTypeManager";
import { ItemManager } from "./pages/admin-table/ItemManager";
import { SupplierManager } from "./pages/admin-table/SupplierManager";
import { PurchaseOrderManager } from "@/pages/admin-table/PurchaseOrderManager";
import { GrnManager } from "@/pages/admin-table/GrnManager";
import { MasterManager } from "./pages/admin-table/MasterManager";
function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="admin-table/branch-manager"
              element={<BranchManager />}
            />
            <Route
              path="admin-table/warehouse-manager"
              element={<WarehouseManager />}
            />
            <Route path="admin-table/zone-manager" element={<ZoneManager />} />
            <Route path="admin-table/rack-manager" element={<RackManager />} />
            <Route path="admin-table/bin-manager" element={<BinManager />} />
            <Route
              path="admin-table/item-type-manager"
              element={<ItemTypeManager />}
            />
            <Route path="admin-table/item-manager" element={<ItemManager />} />
            <Route path="admin-table/grn-manager" element={<GrnManager />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="admin-table/supplier-manager"
              element={<SupplierManager />}
            />
            <Route
              path="admin-table/purchase-order"
              element={<PurchaseOrderManager />}
            />
            <Route
              path="admin-table/master-manager"
              element={<MasterManager />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
