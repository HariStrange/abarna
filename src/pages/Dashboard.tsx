import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
}

const stats: StatCard[] = [
  {
    title: 'Total Users',
    value: '1,234',
    icon: Users,
    trend: '+12% from last month',
  },
  {
    title: 'Revenue',
    value: '$12,345',
    icon: DollarSign,
    trend: '+8% from last month',
  },
  {
    title: 'Active Sessions',
    value: '892',
    icon: Activity,
    trend: '+15% from last month',
  },
  {
    title: 'Growth Rate',
    value: '24.5%',
    icon: TrendingUp,
    trend: '+3% from last month',
  },
];

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your metrics.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'New user registered', time: '2 minutes ago' },
                  { action: 'Payment received', time: '15 minutes ago' },
                  { action: 'System update completed', time: '1 hour ago' },
                  { action: 'New feature deployed', time: '3 hours ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="text-sm">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Conversion Rate', value: '3.2%', color: 'bg-green-500' },
                  { label: 'Avg. Session Duration', value: '4m 32s', color: 'bg-blue-500' },
                  { label: 'Bounce Rate', value: '42%', color: 'bg-yellow-500' },
                  { label: 'Customer Satisfaction', value: '94%', color: 'bg-primary' },
                ].map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.label}</span>
                      <span className="text-sm font-bold">{stat.value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color} transition-all`}
                        style={{ width: stat.value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
