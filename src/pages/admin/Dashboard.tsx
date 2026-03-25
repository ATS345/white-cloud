import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress } from 'antd';
import { UserOutlined, AppstoreOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import api from '@/utils/api';

interface Statistics {
  totalUsers: number;
  totalGames: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Order {
  id: number;
  orderNumber: string;
  username: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics>({
    totalUsers: 0,
    totalGames: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        api.get<Statistics>('/admin/statistics'),
        api.get<{ orders: Order[] }>('/admin/orders?limit=5'),
      ]);
      setStatistics(statsResponse as Statistics);
      setRecentOrders((ordersResponse as { orders: Order[] }).orders || []);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'completed') color = 'green';
        if (status === 'cancelled') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ];

  return (
    <div>
      <h2>仪表盘</h2>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={statistics.totalUsers}
              prefix={<UserOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="游戏总数"
              value={statistics.totalGames}
              prefix={<GameOutlined />}
              suffix="款"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={statistics.totalOrders}
              prefix={<ShoppingCartOutlined />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总营收"
              value={statistics.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="销售趋势" style={{ height: '300px' }}>
            <Progress percent={65} status="active" />
            <p style={{ marginTop: '16px' }}>本月销售额：¥12,500</p>
            <p>同比增长：15%</p>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="用户增长" style={{ height: '300px' }}>
            <Progress percent={80} status="success" />
            <p style={{ marginTop: '16px' }}>本月新增用户：250</p>
            <p>同比增长：20%</p>
          </Card>
        </Col>
      </Row>

      <Card title="最近订单">
        <Table 
          columns={orderColumns} 
          dataSource={recentOrders} 
          rowKey="id" 
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
