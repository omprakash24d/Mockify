export interface Student {
  id: string;
  name: string;
  email: string;
  testsCompleted: number;
  avgScore: number;
  lastActive: string;
}

export const mockStudents: Student[] = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    testsCompleted: 15,
    avgScore: 88,
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Rahul Kumar",
    email: "rahul.kumar@email.com",
    testsCompleted: 12,
    avgScore: 82,
    lastActive: "5 hours ago",
  },
  {
    id: "3",
    name: "Sneha Patel",
    email: "sneha.patel@email.com",
    testsCompleted: 18,
    avgScore: 91,
    lastActive: "1 day ago",
  },
  {
    id: "4",
    name: "Arjun Singh",
    email: "arjun.singh@email.com",
    testsCompleted: 9,
    avgScore: 76,
    lastActive: "3 hours ago",
  },
  {
    id: "5",
    name: "Anitha Reddy",
    email: "anitha.reddy@email.com",
    testsCompleted: 21,
    avgScore: 95,
    lastActive: "30 minutes ago",
  },
];
