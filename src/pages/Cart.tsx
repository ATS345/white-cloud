import React, { useEffect } from 'react';
import { Table, Button, Card, Empty, Spin, message } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '@/store/slices/cartSlice';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, itemCount, loading } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

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

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ id, quantity: newQuantity }));
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id));
    message.success('商品已移除');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    message.success('购物车已清空');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const columns = [
    {
      title: '游戏',
      dataIndex: 'game',
      key: 'game',
      render: (game: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={game.coverImage}
            alt={game.title}
            style={{ width: 60, height: 60, objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{game.title}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {game.developer}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'game',
      key: 'price',
      render: (game: any) => (
        <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
          ¥{game.price}
        </span>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(record.id, quantity - 1)}
            disabled={quantity <= 1}
          />
          <span style={{ minWidth: '30px', textAlign: 'center' }}>
            {quantity}
          </span>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleQuantityChange(record.id, quantity + 1)}
          />
        </div>
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      render: (_: any, record: any) => (
        <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
          ¥{(record.game.price * record.quantity).toFixed(2)}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        >
          移除
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
      <Card title="购物车" extra={
        itemCount > 0 && (
          <Button danger onClick={handleClearCart}>
            清空购物车
          </Button>
        )
      }>
        {itemCount === 0 ? (
          <Empty description="购物车是空的" />
        ) : (
          <>
            <Table
              dataSource={items}
              columns={columns}
              rowKey="id"
              pagination={false}
            />
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <div style={{ fontSize: '18px', marginBottom: '16px' }}>
                共 {itemCount} 件商品
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
                总计: ¥{total.toFixed(2)}
              </div>
              <Button
                type="primary"
                size="large"
                style={{ marginTop: '16px' }}
                onClick={handleCheckout}
              >
                去结算
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Cart;