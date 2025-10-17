export interface DataItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  value: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  joinedDate: string;
  isActive: boolean;
}

export interface Admin {
  id: string;
  name: string;
  permissions: string[];
  lastLogin: string;
}

export const dummyData: DataItem[] = [
  { id: '1', name: 'Project Alpha', status: 'active', value: 12500, createdAt: '2025-01-15' },
  { id: '2', name: 'Project Beta', status: 'active', value: 8900, createdAt: '2025-02-10' },
  { id: '3', name: 'Project Gamma', status: 'pending', value: 15200, createdAt: '2025-03-05' },
  { id: '4', name: 'Project Delta', status: 'inactive', value: 6700, createdAt: '2024-12-20' },
  { id: '5', name: 'Project Epsilon', status: 'active', value: 19800, createdAt: '2025-01-25' },
  { id: '6', name: 'Project Zeta', status: 'active', value: 11300, createdAt: '2025-02-14' },
  { id: '7', name: 'Project Eta', status: 'pending', value: 9500, createdAt: '2025-03-08' },
  { id: '8', name: 'Project Theta', status: 'active', value: 17600, createdAt: '2025-01-30' },
  { id: '9', name: 'Project Iota', status: 'inactive', value: 5400, createdAt: '2024-11-15' },
  { id: '10', name: 'Project Kappa', status: 'active', value: 22100, createdAt: '2025-02-20' },
  { id: '11', name: 'Project Lambda', status: 'pending', value: 13700, createdAt: '2025-03-12' },
  { id: '12', name: 'Project Mu', status: 'active', value: 16200, createdAt: '2025-02-05' },
];

export const dummyUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    joinedDate: '2024-01-15',
    isActive: true,
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    joinedDate: '2024-02-20',
    isActive: true,
  },
  {
    id: '3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    role: 'moderator',
    joinedDate: '2024-03-10',
    isActive: false,
  },
  {
    id: '4',
    name: 'David Brown',
    email: 'david@example.com',
    role: 'user',
    joinedDate: '2024-04-05',
    isActive: true,
  },
  {
    id: '5',
    name: 'Emma Davis',
    email: 'emma@example.com',
    role: 'user',
    joinedDate: '2024-05-12',
    isActive: true,
  },
  {
    id: '6',
    name: 'Frank Miller',
    email: 'frank@example.com',
    role: 'moderator',
    joinedDate: '2024-06-18',
    isActive: false,
  },
  {
    id: '7',
    name: 'Grace Wilson',
    email: 'grace@example.com',
    role: 'user',
    joinedDate: '2024-07-22',
    isActive: true,
  },
  {
    id: '8',
    name: 'Henry Moore',
    email: 'henry@example.com',
    role: 'user',
    joinedDate: '2024-08-30',
    isActive: true,
  },
  {
    id: '9',
    name: 'Ivy Taylor',
    email: 'ivy@example.com',
    role: 'user',
    joinedDate: '2024-09-14',
    isActive: false,
  },
  {
    id: '10',
    name: 'Jack Anderson',
    email: 'jack@example.com',
    role: 'admin',
    joinedDate: '2024-10-01',
    isActive: true,
  },
];

export const dummyAdmins: Admin[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    permissions: ['Read', 'Write', 'Delete', 'Admin'],
    lastLogin: '2025-03-15 14:30',
  },
  {
    id: '2',
    name: 'Jack Anderson',
    permissions: ['Read', 'Write', 'Delete'],
    lastLogin: '2025-03-14 09:15',
  },
  {
    id: '3',
    name: 'Sarah Connor',
    permissions: ['Read', 'Write'],
    lastLogin: '2025-03-13 16:45',
  },
  {
    id: '4',
    name: 'Michael Scott',
    permissions: ['Read', 'Write', 'Delete', 'Admin'],
    lastLogin: '2025-03-12 11:20',
  },
  {
    id: '5',
    name: 'Pam Beesly',
    permissions: ['Read', 'Write'],
    lastLogin: '2025-03-11 08:30',
  },
];
