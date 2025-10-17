import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { dummyUsers, User } from '@/lib/dummy-data';
import { MoreHorizontal, Eye, CreditCard as Edit, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function InactiveUsers() {
  const [isLoading, setIsLoading] = useState(true);
  const inactiveUsers = dummyUsers.filter((user) => !user.isActive);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    { header: 'Name', accessorKey: 'name' as keyof User },
    { header: 'Email', accessorKey: 'email' as keyof User },
    {
      header: 'Role',
      accessorKey: 'role' as keyof User,
      cell: (value: User['role']) => {
        const variants = {
          admin: 'destructive',
          moderator: 'default',
          user: 'secondary',
        } as const;
        return <Badge variant={variants[value]}>{value}</Badge>;
      },
    },
    { header: 'Joined Date', accessorKey: 'joinedDate' as keyof User },
    {
      header: 'Actions',
      accessorKey: 'id' as keyof User,
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Reactivate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inactive Users</h1>
        <p className="text-muted-foreground">
          View and manage users who are currently inactive
        </p>
      </div>

      <DataTable
        data={inactiveUsers}
        columns={columns}
        searchPlaceholder="Search inactive users..."
      />
    </motion.div>
  );
}
