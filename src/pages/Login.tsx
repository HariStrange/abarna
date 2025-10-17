import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        toast.error(result.error || "Failed to login. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <img
                src="https://res.cloudinary.com/di3jfjzfn/image/upload/v1760596449/Picsart_25-10-16_12-00-08-989_vao1hr.jpg"
                alt="sholasLogo"
                className="w-45 dark:hidden"
              />
              <img
                src="https://res.cloudinary.com/dx5lg8mei/image/upload/v1749030570/logo-1_obgcgx.png"
                alt="sholasLogo"
                className="w-25 hidden dark:block"
              />
            </div>
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  onClick={() => setShowForgotDialog(true)}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Section */}
        <div className="mt-8 text-center text-xs text-muted-foreground flex flex-col items-center space-y-2">
          <p>Powered by Sholas Technologies 2025</p>
          <img
            src="https://res.cloudinary.com/dx5lg8mei/image/upload/v1744960831/WhatsApp_Image_2025-04-17_at_17.20.51_025badf0_gm7rgc.png"
            alt="Sholas Logo Footer"
            className="w-24 opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        </div>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Forgot Password</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Please contact your admin to reset your password.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForgotDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
