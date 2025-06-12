'use client';

import { useState, useEffect } from 'react';
import { Store, Tag, Image, MessageSquare, Users, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import axiosInstance from '@/lib/axios';

interface Stats {
  markets: number;
  categories: number;
  banners: number;
  userMessages: number;
  marketMessages: number;
  users: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    markets: 0,
    categories: 0,
    banners: 0,
    userMessages: 0,
    marketMessages: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [marketsRes, categoriesRes, bannersRes, userMessagesRes, marketMessagesRes, usersRes] = await Promise.all([
        axiosInstance.get('/markets?page=1&limit=1'),
        axiosInstance.get('/categories?page=1&limit=1'),
        axiosInstance.get('/banners'),
        axiosInstance.get('/api/superadmin/user-messages'),
        axiosInstance.get('/api/superadmin/market-messages'),
        axiosInstance.get('/api/superadmin/users?page=1&limit=1'),
      ]);

      setStats({
        markets: marketsRes.data.total || marketsRes.data.length || 0,
        categories: categoriesRes.data.total || categoriesRes.data.length || 0,
        banners: bannersRes.data.length || 0,
        userMessages: userMessagesRes.data.length || 0,
        marketMessages: marketMessagesRes.data.length || 0,
        users: usersRes.data.total || usersRes.data.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Markets', value: stats.markets, icon: Store, color: 'bg-blue-500' },
    { title: 'Categories', value: stats.categories, icon: Tag, color: 'bg-green-500' },
    { title: 'Banners', value: stats.banners, icon: Image, color: 'bg-purple-500' },
    { title: 'User Messages', value: stats.userMessages, icon: MessageSquare, color: 'bg-yellow-500' },
    { title: 'Market Messages', value: stats.marketMessages, icon: MessageSquare, color: 'bg-red-500' },
    { title: 'Users', value: stats.users, icon: Users, color: 'bg-indigo-500' },
  ];

   if (!hasMounted) return null;
   
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your admin panel</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="card hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/dashboard/markets"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <Store className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Markets</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove markets</p>
            </a>
            <a
              href="/dashboard/categories"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <Tag className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Categories</h3>
              <p className="text-sm text-gray-600">Organize product categories</p>
            </a>
            <a
              href="/dashboard/banners"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <Image className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Banners</h3>
              <p className="text-sm text-gray-600">Update promotional banners</p>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}