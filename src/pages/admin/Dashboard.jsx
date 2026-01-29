import AdminLayout from "../../components/AppLayout";
import { Users, BookOpen, FolderOpen, Clock } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      icon: Users,
      color: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Total Books",
      value: "5,678",
      icon: BookOpen,
      color: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Categories",
      value: "42",
      icon: FolderOpen,
      color: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      title: "Borrowed",
      value: "234",
      icon: Clock,
      color: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Admin</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <IconComponent size={24} className={stat.iconColor} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <ActivityItem
              user="John Doe"
              action="borrowed"
              item="The Great Gatsby"
              time="2 hours ago"
            />
            <ActivityItem
              user="Jane Smith"
              action="returned"
              item="1984"
              time="5 hours ago"
            />
            <ActivityItem
              user="Bob Wilson"
              action="borrowed"
              item="To Kill a Mockingbird"
              time="1 day ago"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <QuickActionButton label="Add New Book" />
              <QuickActionButton label="Add New User" />
              <QuickActionButton label="Add Category" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-3">
              <StatRow label="Books Borrowed Today" value="12" />
              <StatRow label="Books Returned Today" value="8" />
              <StatRow label="Overdue Books" value="3" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function ActivityItem({ user, action, item, time }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm text-gray-900">
          <span className="font-medium">{user}</span> {action}{" "}
          <span className="font-medium">{item}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ label }) {
  return (
    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors">
      {label}
    </button>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}