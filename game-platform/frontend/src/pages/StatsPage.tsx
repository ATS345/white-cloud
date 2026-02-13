import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface GameStats {
  total_games: number;
  total_downloads: number;
  total_reviews: number;
}

interface UserStats {
  total_users: number;
  new_users_today: number;
  active_users_this_week: number;
}

interface TopSellingGame {
  id: number;
  title: string;
  sales: number;
}

interface SalesStats {
  total_sales: number;
  sales_today: number;
  top_selling_games: TopSellingGame[];
}

interface StatsData {
  games: GameStats;
  users: UserStats;
  sales: SalesStats;
}

const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3001/api/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('获取统计数据失败');
        // 使用模拟数据作为后备
        setStats({
          games: {
            total_games: 100,
            total_downloads: 5000,
            total_reviews: 2000
          },
          users: {
            total_users: 1000,
            new_users_today: 10,
            active_users_this_week: 500
          },
          sales: {
            total_sales: 50000,
            sales_today: 500,
            top_selling_games: [
              { id: 1, title: 'Cyberpunk 2077', sales: 1000 },
              { id: 2, title: 'The Witcher 3', sales: 800 },
              { id: 3, title: 'Red Dead Redemption 2', sales: 700 },
              { id: 4, title: 'Grand Theft Auto V', sales: 600 },
              { id: 5, title: 'Elden Ring', sales: 500 }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">平台统计数据</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">游戏统计</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总游戏数</span>
              <span className="font-bold text-blue-600">{stats?.games.total_games}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">总下载量</span>
              <span className="font-bold text-blue-600">{stats?.games.total_downloads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">总评论数</span>
              <span className="font-bold text-blue-600">{stats?.games.total_reviews}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">用户统计</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总用户数</span>
              <span className="font-bold text-green-600">{stats?.users.total_users}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">今日新用户</span>
              <span className="font-bold text-green-600">{stats?.users.new_users_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">本周活跃用户</span>
              <span className="font-bold text-green-600">{stats?.users.active_users_this_week}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">销售统计</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">总销售额</span>
              <span className="font-bold text-purple-600">¥{stats?.sales.total_sales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">今日销售额</span>
              <span className="font-bold text-purple-600">¥{stats?.sales.sales_today.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">热销游戏排行</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">游戏名称</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">销量</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.sales.top_selling_games.map((game, index) => (
                <tr key={game.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;