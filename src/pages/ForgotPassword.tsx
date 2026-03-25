import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Steps, Result } from 'antd'
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/utils/api'

const { Title, Text } = Typography

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleRequestCode = async (values: { email: string }) => {
    try {
      setLoading(true)
      setEmail(values.email)
      await api.post('/auth/forgot-password', { email: values.email })
      message.success('验证码已发送到您的邮箱')
      setCurrentStep(1)
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      message.error(msg || '发送验证码失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (values: { code: string }) => {
    try {
      setLoading(true)
      await api.post('/auth/verify-reset-code', { email, code: values.code })
      setCode(values.code)
      message.success('验证码验证成功')
      setCurrentStep(2)
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      message.error(msg || '验证码错误，请重新输入')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }

    try {
      setLoading(true)
      await api.post('/auth/reset-password', {
        email,
        code,
        newPassword: values.newPassword
      })
      message.success('密码重置成功，请使用新密码登录')
      setCurrentStep(3)
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      message.error(msg || '密码重置失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: '输入邮箱',
      description: '验证您的账户邮箱',
    },
    {
      title: '验证身份',
      description: '输入收到的验证码',
    },
    {
      title: '重置密码',
      description: '设置新密码',
    },
    {
      title: '完成',
      description: '密码重置成功',
    },
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 450, padding: '24px', borderRadius: '12px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <LockOutlined style={{ fontSize: '48px', color: '#667eea' }} />
          <Title level={2} style={{ marginTop: '16px' }}>忘记密码</Title>
          <Text type="secondary">重置您的账户密码</Text>
        </div>

        <Steps current={currentStep} items={steps} style={{ marginBottom: '24px' }} />

        {currentStep === 0 && (
          <Form onFinish={handleRequestCode} layout="vertical">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="请输入注册时的邮箱" 
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                发送验证码
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <Form onFinish={handleVerifyCode} layout="vertical">
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Input 
                placeholder="请输入6位验证码" 
                size="large"
                maxLength={6}
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                验证
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link" 
                onClick={() => setCurrentStep(0)}
              >
                重新发送验证码
              </Button>
            </div>
          </Form>
        )}

        {currentStep === 2 && (
          <Form onFinish={handleResetPassword} layout="vertical">
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入新密码" 
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请再次输入新密码" 
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                size="large"
              >
                重置密码
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 3 && (
          <Result
            status="success"
            title="密码重置成功"
            subTitle="您的新密码已生效，请使用新密码登录"
            extra={[
              <Button type="primary" key="login" onClick={() => navigate('/login')}>
                前往登录
              </Button>,
            ]}
          />
        )}

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to="/login">
            <ArrowLeftOutlined /> 返回登录
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default ForgotPassword
