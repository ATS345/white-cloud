import React, { useEffect } from 'react';
import { Table, Card, Tag, Button, Spin, Empty, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import api from '@/utils/api';

interface OrderItem {
  id: number;
  price: number;
  quantity: number;
  game: { title: string; coverImage: string; developer?: string };
}

interface Payment {
  id: number;
  transactionId?: string;
  paymentMethod: string;
  amount: number;
  status: string;
  completedAt?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod?: string;
  items: OrderItem[];
  payments?: Payment[];
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.list);
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Empty description="请先登录" />
        <Button type="primary" onClick={() => navigate('/login')}>
          去登录
        </Button>
      </div>
    );
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'paid':
        return 'blue';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'refunded':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待支付';
      case 'paid':
        return '已支付';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      case 'refunded':
        return '已退款';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '游戏',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderItem[]) => (
        <div>
          {items.map((item, index) => (
            <div key={item.id}>
              {item.game.title}
              {index < items.length - 1 && ', '}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
          ¥{amount}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card title="我的订单">
        {orders.length === 0 ? (
          <Empty description="暂无订单" />
        ) : (
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
          />
        )}
      </Card>

      <Modal
        title="订单详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>订单号：</strong>
              {selectedOrder.orderNumber}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>状态：</strong>
              <Tag color={getStatusColor(selectedOrder.status)}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>总金额：</strong>
              <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '18px' }}>
                ¥{selectedOrder.totalAmount}
              </span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>创建时间：</strong>
              {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>支付方式：</strong>
              {selectedOrder.paymentMethod || '未支付'}
            </div>
            <div style={{ marginBottom: '24px' }}>
              <strong>游戏列表：</strong>
              <div style={{ marginTop: '12px' }}>
                {selectedOrder.items.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    <img
                      src={item.game.coverImage}
                      alt={item.game.title}
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.game.title}</div>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        {item.game.developer}
                      </div>
                      <div style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                        ¥{item.price} × {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedOrder.payments && selectedOrder.payments.length > 0 && (
              <div>
                <strong>支付记录：</strong>
                <div style={{ marginTop: '12px' }}>
                  {selectedOrder.payments.map((payment: Payment) => (
                    <div
                      key={payment.id}
                      style={{
                        padding: '12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <strong>交易号：</strong>
                        {payment.transactionId || 'N/A'}
                      </div>
                      <div>
                        <strong>支付方式：</strong>
                        {payment.paymentMethod}
                      </div>
                      <div>
                        <strong>金额：</strong>
                        ¥{payment.amount}
                      </div>
                      <div>
                        <strong>状态：</strong>
                        <Tag color={payment.status === 'success' ? 'green' : 'orange'}>
                          {payment.status === 'success' ? '成功' : '待处理'}
                        </Tag>
                      </div>
                      <div>
                        <strong>支付时间：</strong>
                        {payment.completedAt
                          ? new Date(payment.completedAt).toLocaleString('zh-CN')
                          : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;