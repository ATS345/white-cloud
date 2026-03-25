import { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Checkbox, Divider } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import { login, clearError } from '@/store/slices/authSlice'

const { Title, Text } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated, error, user } = useSelector((state: RootState) => state.auth)

  // 从URL中获取重定向路径
  const from = (location.state as { from: { pathname: string } })?.from?.pathname || '/'

  // 登录成功后重定向
  useEffect(() => {
    if (isAuthenticated && user) {
      message.success('登录成功！')
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, navigate, from])

  // 处理错误
  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true)
    dispatch(login({
      email: values.username, // 支持使用邮箱登录
      password: values.password
    })).finally(() => {
      setLoading(false)
    })
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 64px - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{ 
          width: '100%',
          maxWidth: '400px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ marginBottom: '10px' }}>
            欢迎回来
          </Title>
          <Text type="secondary">登录您的云幕账号</Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名或邮箱' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名或邮箱" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" style={{ color: '#667eea' }}>
                忘记密码？
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: '45px'
              }}
            >
              登录
            </Button>
          </Form.Item>

          <Divider>或</Divider>

          <Form.Item>
            <Button 
              block
              icon={<MailOutlined />}
              style={{ height: '45px' }}
            >
              使用邮箱登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text type="secondary">
            还没有账号？{' '}
            <Link to="/register" style={{ color: '#667eea', fontWeight: 'bold' }}>
              立即注册
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login