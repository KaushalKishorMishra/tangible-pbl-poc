import React, { useState } from 'react';
import { Users, BookOpen, BarChart3, Settings, Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGraphStore } from '../../store/graphStore';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, trend }) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm ${trendColor[trend]}`}>{change}</p>
        </div>
        <div className="p-3 bg-gray-100 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
};

interface UserRowProps {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  onEdit?: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ name, email, role, status, lastActive, onEdit }) => {
  const statusColor = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">{email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{role}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${statusColor[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {lastActive}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button 
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-900"
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export const AdminInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'courses' | 'analytics' | 'settings'>('overview');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const { setUserRole } = useGraphStore();

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    // TODO: Open user edit modal
  };

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12% from last month',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      trend: 'up' as const,
    },
    {
      title: 'Active Courses',
      value: '89',
      change: '+5 new this week',
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      trend: 'up' as const,
    },
    {
      title: 'Platform Usage',
      value: '94.2%',
      change: '+2.1% uptime',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      trend: 'up' as const,
    },
    {
      title: 'System Health',
      value: 'Good',
      change: 'All systems operational',
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      trend: 'neutral' as const,
    },
  ];

  const users = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Educator',
      status: 'active' as const,
      lastActive: '2 hours ago',
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      role: 'Educator',
      status: 'active' as const,
      lastActive: '1 day ago',
    },
    {
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@example.com',
      role: 'Learner',
      status: 'active' as const,
      lastActive: '30 min ago',
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'Learner',
      status: 'inactive' as const,
      lastActive: '2 weeks ago',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage the Tangible PBL platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <AlertTriangle className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-500 mb-2">Switch Role</p>
                      <button
                        onClick={() => {
                          setUserRole('educator');
                          setShowRoleMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                      >
                        Switch to Educator
                      </button>
                      <button
                        onClick={() => {
                          setUserRole('learner');
                          setShowRoleMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
                      >
                        Switch to Learner
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'users' | 'courses' | 'analytics' | 'settings')}
                  className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">New course published</p>
                      <p className="text-sm text-gray-500">"Advanced JavaScript" by Sarah Johnson</p>
                    </div>
                    <span className="text-sm text-gray-400">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">User registered</p>
                      <p className="text-sm text-gray-500">Alex Rodriguez joined as a learner</p>
                    </div>
                    <span className="text-sm text-gray-400">4h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">System maintenance</p>
                      <p className="text-sm text-gray-500">Scheduled for tonight 2:00 AM</p>
                    </div>
                    <span className="text-sm text-gray-400">6h ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500">Add, edit, or remove users</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <BookOpen className="w-6 h-6 text-green-600 mb-2" />
                    <p className="font-medium text-gray-900">Review Courses</p>
                    <p className="text-sm text-gray-500">Approve pending courses</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-500">Platform analytics</p>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                    <Settings className="w-6 h-6 text-gray-600 mb-2" />
                    <p className="font-medium text-gray-900">System Settings</p>
                    <p className="text-sm text-gray-500">Configure platform</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Add User
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <UserRow 
                      key={index} 
                      {...user} 
                      onEdit={() => handleEditUser(user.email)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Course Management</h3>
            <p className="text-gray-500">Course management interface coming soon</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">Advanced analytics interface coming soon</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-500">Platform configuration interface coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};