import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useThemeStore } from "@/store/theme";
import { Sun, Moon, Save, ShieldAlert } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="space-y-1 bg-gradient-to-r from-primary/5 to-transparent border-b">
              <CardTitle className="text-2xl flex items-center gap-2">
                Profile Information
              </CardTitle>
              <CardDescription className="text-base">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  defaultValue={user?.name}
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                  className="h-11 bg-muted"
                />
              </div>
              <Button className="w-full sm:w-auto gap-2" size="lg">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="space-y-1 bg-gradient-to-r from-primary/5 to-transparent border-b">
              <CardTitle className="text-2xl">Appearance</CardTitle>
              <CardDescription className="text-base">
                Customize how the app looks for you
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleTheme}
                  className="gap-2 min-w-[120px]"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="h-5 w-5" />
                      Dark
                    </>
                  ) : (
                    <>
                      <Sun className="h-5 w-5" />
                      Light
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="space-y-1 bg-gradient-to-r from-primary/5 to-transparent border-b">
              <CardTitle className="text-2xl">Security</CardTitle>
              <CardDescription className="text-base">
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label htmlFor="current-password" className="text-base font-medium">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="new-password" className="text-base font-medium">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirm-password" className="text-base font-medium">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="h-11"
                />
              </div>
              <Separator />
              <Button variant="default" className="w-full sm:w-auto gap-2" size="lg">
                <Save className="h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-2 border-destructive/20 hover:border-destructive/40 transition-colors">
            <CardHeader className="space-y-1 bg-gradient-to-r from-destructive/5 to-transparent border-b">
              <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-6 w-6" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-base">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" className="w-full sm:w-auto" size="lg">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
