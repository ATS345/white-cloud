import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tag, Progress, List, Badge } from 'antd';
import { 
  UserOutlined, AppstoreOutlined, ShoppingCartOutlined, RiseOutlined,
  FireOutlined, ArrowUpOutlined, ArrowDownOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import api from '@/utils/api';
import { mockStats, mockOrders } from '@/utils/mockData';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState(mockStats);
  const [recentOrders, setRecentOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/admin/statistics'),
        api.get('/admin/orders?limit=8'),
      ]);
      setStats(statsRes);
      setRecentOrders(ordersRes.orders || []);
    } catch {
      setStats(mockStats);
      setRecentOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '注册用户',
      value: stats.totalUsers,
      icon: <UserOutlined style={{ fontSize: '24px' }} />,
      suffix: '人',
      color: '#667eea',
      change: '+2.3%',
      up: true,
      daily: stats.newUsersToday,
      dailyLabel: '今日新增',
    },
    {
      title: '上架游戏',
      value: stats.totalGames,
      icon: <AppstoreOutlined style={{ fontSize: '24px' }} />,
      suffix: '款',
      color: '#52c41a',
      change: '+1.2%',
      up: true,
      daily: 12,
      dailyLabel: '本周上架',
    },
    {
      title: '订单总数',
      value: stats.totalOrders,
      icon: <ShoppingCartOutlined style={{ fontSize: '24px' }} />,
      suffix: '单',
      color: '#ff7a45',
      change: '+5.8%',
      up: true,
      daily: stats.ordersToday,
      dailyLabel: '今日订单',
    },
    {
      title: '总营收',
      value: stats.totalRevenue,
      icon: <RiseOutlined style={{ fontSize: '24px' }} />,
      prefix: '¥',
      color: '#faad14',
      change: '+8.1%',
      up: true,
      daily: stats.revenueToday,
      dailyLabel: '今日营收(¥)',
    },
  ];

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#667eea' }}>{v}</span>,
    },
    {
      title: '游戏',
      dataIndex: 'items',
      key: 'game',
      render: (items: { game?: { title?: string } }[]) => items?.[0]?.game?.title || '—',
    },
    {
      title: '金额',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => <span style={{ color: '#52c41a', fontWeight: 600 }}>¥{(amount || 0).toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const map: Record<string, { color: string; label: string }> = {
          COMPLETED: { color: 'success', label: '已完成' },
          PENDING: { color: 'processing', label: '待支付' },
          CANCELLED: { color: 'error', label: '已取消' },
        };
        const info = map[status] || { color: 'default', label: status };
        return <Badge status={info.color as 'success' | 'processing' | 'error' | 'default' | 'warning'} text={info.label} />;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          {new Date(date).toLocaleString('zh-CN')}
        </span>
      ),
    },
  ];

  const topGames = [
    { title: '黑神话：悟空', sales: 8934, revenue: 2394312, change: 15 },
    { title: '艾尔登法环', sales: 6821, revenue: 2715558, change: 8 },
    { title: '博德之门3', sales: 5463, revenue: 2010204, change: 12 },
    { title: '只狼：影逝二度', sales: 4231, revenue: 1260838, change: -3 },
    { title: '怪物猎人：世界', sales: 3892, revenue: 966916, change: 6 },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0 }}>运营数据总览</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontSize: '14px' }}>
          更新时间：{new Date().toLocaleString('zh-CN')}
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} xl={6} key={i}>
            <Card
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '8px' }}>{card.title}</div>
                  <div style={{ color: 'white', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
                    {card.prefix}{card.value?.toLocaleString()}{card.suffix}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {card.up ? (
                      <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
                    )}
                    <span style={{ color: card.up ? '#52c41a' : '#ff4d4f', fontSize: '12px' }}>{card.change}</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>较上月</span>
                  </div>
                </div>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: `${card.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: card.color,
                }}>
                  {card.icon}
                </div>
              </div>
              <div style={{
                marginTop: '12px', paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{card.dailyLabel}</span>
                <span style={{ color: card.color, fontWeight: 600, fontSize: '13px' }}>
                  +{card.daily?.toLocaleString()}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* 销售趋势 */}
        <Col xs={24} lg={14}>
          <Card
            title={<span style={{ color: 'white', fontWeight: 600 }}>月度销售趋势</span>}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}
          >
            {['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map((month, i) => {
              const values = [45, 52, 61, 58, 72, 85, 91, 88, 76, 82, 89, 95];
              return (
                <div key={month} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', width: '30px' }}>{month}</span>
                  <Progress
                    percent={values[i]}
                    size="small"
                    strokeColor={{ from: '#667eea', to: '#764ba2' }}
                    trailColor="rgba(255,255,255,0.08)"
                    format={(p) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{p}%</span>}
                  />
                </div>
              );
            })}
          </Card>
        </Col>

        {/* 热销游戏 */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FireOutlined style={{ color: '#ff4d4f' }} />
                热销游戏 TOP5
              </span>
            }
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}
          >
            <List
              dataSource={topGames}
              renderItem={(item, index) => (
                <List.Item style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                      background: index < 3 ? ['linear-gradient(135deg,#faad14,#ff7a45)', 'linear-gradient(135deg,#bfbfbf,#8c8c8c)', 'linear-gradient(135deg,#d46b08,#873800)'][index] : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: index < 3 ? 'white' : 'rgba(255,255,255,0.5)',
                      fontSize: '12px', fontWeight: 700,
                    }}>
                      {index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: 500 }}>{item.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                        销量 {item.sales.toLocaleString()} · ¥{item.revenue.toLocaleString()}
                      </div>
                    </div>
                    <Tag
                      color={item.change >= 0 ? 'success' : 'error'}
                      style={{ fontSize: '11px' }}
                    >
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 最近订单 */}
      <Card
        title={
          <span style={{ color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClockCircleOutlined style={{ color: '#667eea' }} />
            最近订单
          </span>
        }
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}
      >
        <Table
          columns={orderColumns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          loading={loading}
          style={{ color: 'white' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
