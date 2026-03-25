import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Button, Radio, Steps, Result, Spin, message, Divider, Typography, List, Avatar } from 'antd'
import { CreditCardOutlined, AlipayCircleOutlined, WechatOutlined, CheckCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { fetchCart, clearCart } from '@/store/slices/cartSlice'
import api from '@/utils/api'

const { Title, Text, Paragraph } = Typography
const { Step } = Steps

type PaymentMethod = 'alipay' | 'wechat' | 'credit_card'

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { items, total, itemCount, loading: cartLoading } = useSelector((state: RootState) => state.cart)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  const [currentStep, setCurrentStep] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('alipay')
  const [order, setOrder] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    dispatch(fetchCart())
  }, [dispatch, isAuthenticated, navigate])

  useEffect(() => {
    if (itemCount === 0 && !order && currentStep === 0) {
      message.warning('购物车为空')
    }
  }, [itemCount, order, currentStep])

  const handleCreateOrder = async () => {
    if (items.length === 0) {
      message.error('购物车为空')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/orders/from-cart')
      setOrder(response)
      setCurrentStep(1)
      message.success('订单创建成功')
    } catch (error: any) {
      message.error(error.message || '创建订单失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!order) return

    setLoading(true)
    try {
      const response = await api.post(`/payments/orders/${order.id}`, {
        paymentMethod,
        returnUrl: `${window.location.origin}/checkout?step=result`
      })
      setPayment(response)
      setCurrentStep(2)
      
      if (response.paymentUrl) {
        window.open(response.paymentUrl, '_blank')
      }
      
      message.success('支付请求已发起，请在新窗口完成支付')
    } catch (error: any) {
      message.error(error.message || '支付请求失败')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!payment) return

    setLoading(true)
    try {
      const response = await api.get(`/payments/${payment.paymentId}`)
      if (response.status === 'success') {
        setCurrentStep(3)
        dispatch(clearCart())
        message.success('支付成功')
      } else {
        message.info('支付尚未完成，请完成支付后重试')
      }
    } catch (error: any) {
      message.error(error.message || '查询支付状态失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulatePayment = async () => {
    if (!payment) return

    setLoading(true)
    try {
      await api.post(`/payments/${payment.paymentId}/simulate-success`)
      setCurrentStep(3)
      dispatch(clearCart())
      message.success('模拟支付成功')
    } catch (error: any) {
      message.error(error.message || '模拟支付失败')
    } finally {
      setLoading(false)
    }
  }

  const paymentOptions = [
    {
      value: 'alipay',
      label: '支付宝',
      icon: <AlipayCircleOutlined style={{ fontSize: '24px', color: '#1677ff' }} />,
      description: '使用支付宝扫码支付'
    },
    {
      value: 'wechat',
      label: '微信支付',
      icon: <WechatOutlined style={{ fontSize: '24px', color: '#07c160' }} />,
      description: '使用微信扫码支付'
    },
    {
      value: 'credit_card',
      label: '银行卡',
      icon: <CreditCardOutlined style={{ fontSize: '24px', color: '#667eea' }} />,
      description: '使用银行卡在线支付'
    }
  ]

  if (cartLoading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <ShoppingCartOutlined style={{ marginRight: '12px' }} />
        结算中心
      </Title>

      <Steps current={currentStep} style={{ marginBottom: '32px' }}>
        <Step title="确认订单" description="核对商品信息" />
        <Step title="选择支付" description="选择支付方式" />
        <Step title="完成支付" description="等待支付确认" />
        <Step title="支付成功" description="订单完成" />
      </Steps>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {currentStep === 0 && (
            <Card title="订单确认" loading={loading}>
              <List
                itemLayout="horizontal"
                dataSource={items}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          shape="square" 
                          size={64} 
                          src={item.game?.coverImage}
                        />
                      }
                      title={item.game?.title}
                      description={
                        <div>
                          <Text type="secondary">{item.game?.developer}</Text>
                          <br />
                          <Text>数量: {item.quantity}</Text>
                        </div>
                      }
                    />
                    <div style={{ textAlign: 'right' }}>
                      <Text strong style={{ fontSize: '18px', color: '#ff6b6b' }}>
                        ¥{item.game?.price}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
              <Divider />
              <div style={{ textAlign: 'right' }}>
                <Text>共 {itemCount} 件商品</Text>
                <Divider type="vertical" />
                <Text strong style={{ fontSize: '20px', color: '#ff6b6b' }}>
                  合计: ¥{total.toFixed(2)}
                </Text>
              </div>
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <Button onClick={() => navigate('/cart')} style={{ marginRight: '12px' }}>
                  返回购物车
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handleCreateOrder}
                  loading={loading}
                  disabled={items.length === 0}
                >
                  提交订单
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 1 && order && (
            <Card title="选择支付方式" loading={loading}>
              <div style={{ marginBottom: '24px' }}>
                <Text type="secondary">订单号: </Text>
                <Text strong>{order.orderNumber}</Text>
              </div>
              
              <Radio.Group 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 16]}>
                  {paymentOptions.map((option) => (
                    <Col xs={24} sm={8} key={option.value}>
                      <Card
                        hoverable
                        style={{ 
                          border: paymentMethod === option.value ? '2px solid #667eea' : '1px solid #d9d9d9',
                          textAlign: 'center'
                        }}
                        onClick={() => setPaymentMethod(option.value as PaymentMethod)}
                      >
                        <Radio value={option.value} style={{ display: 'none' }}>
                          {option.label}
                        </Radio>
                        <div style={{ marginBottom: '12px' }}>{option.icon}</div>
                        <Title level={5}>{option.label}</Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {option.description}
                        </Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Radio.Group>

              <Divider />

              <div style={{ textAlign: 'right' }}>
                <Text>支付金额: </Text>
                <Text strong style={{ fontSize: '24px', color: '#ff6b6b' }}>
                  ¥{order.totalAmount}
                </Text>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <Button onClick={() => setCurrentStep(0)} style={{ marginRight: '12px' }}>
                  返回修改
                </Button>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handlePayment}
                  loading={loading}
                >
                  立即支付
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 2 && payment && (
            <Card title="等待支付" loading={loading}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" style={{ marginBottom: '24px' }} />
                <Title level={4}>请在弹出的窗口中完成支付</Title>
                <Paragraph type="secondary">
                  支付金额: ¥{payment.amount}
                </Paragraph>
                <Paragraph type="secondary">
                  支付方式: {paymentOptions.find(p => p.value === paymentMethod)?.label}
                </Paragraph>
                
                <Divider />
                
                <div style={{ marginTop: '24px' }}>
                  <Button 
                    type="primary"
                    onClick={handleConfirmPayment}
                    loading={loading}
                    style={{ marginRight: '12px' }}
                  >
                    我已完成支付
                  </Button>
                  <Button onClick={handleSimulatePayment} loading={loading}>
                    模拟支付成功(测试)
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <Result
                status="success"
                title="支付成功"
                subTitle={`订单号: ${order?.orderNumber}`}
                extra={[
                  <Button type="primary" key="library" onClick={() => navigate('/library')}>
                    查看我的游戏库
                  </Button>,
                  <Button key="home" onClick={() => navigate('/')}>
                    返回首页
                  </Button>,
                ]}
              />
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card title="订单摘要">
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">商品数量</Text>
              <br />
              <Text strong>{itemCount} 件</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">商品总价</Text>
              <br />
              <Text strong>¥{total.toFixed(2)}</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Text type="secondary">应付金额</Text>
              <br />
              <Text strong style={{ fontSize: '24px', color: '#ff6b6b' }}>
                ¥{order?.totalAmount || total.toFixed(2)}
              </Text>
            </div>
          </Card>

          <Card style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              <Text>安全支付保障</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              <Text>7天无理由退款</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              <Text>正版授权保障</Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Checkout
