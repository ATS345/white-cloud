import { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined, WechatOutlined, QqOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const { TabPane } = Tabs;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (_values: any) => {
    setLoading(true);
    // 模拟登录请求
    setTimeout(() => {
      setLoading(false);
      message.success('登录成功');
      navigate('/');
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card title="云朵游戏平台" className="login-card">
          <Tabs defaultActiveKey="1">
            <TabPane tab="账号密码登录" key="1">
              <Form
                name="login"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: '请输入用户名或邮箱！' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="用户名或邮箱" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码！' }]}
                >
                  <Input
                    prefix={<LockOutlined />}
                    type="password"
                    placeholder="密码"
                  />
                </Form.Item>
                <Form.Item>
                  <div className="login-form-actions">
                    <Checkbox name="remember">记住我</Checkbox>
                    <a className="login-form-forgot" href="#">
                      忘记密码
                    </a>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    loading={loading}
                    block
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="手机验证码登录" key="2">
              <Form
                name="login-phone"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
              >
                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: '请输入手机号！' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="手机号" />
                </Form.Item>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: '请输入验证码！' }]}
                >
                  <Input
                    prefix={<LockOutlined />}
                    placeholder="验证码"
                    addonAfter={<Button>获取验证码</Button>}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    loading={loading}
                    block
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div className="login-other">
            <span className="login-other-title">其他登录方式</span>
            <div className="login-other-icons">
              <Button type="text" icon={<WechatOutlined />} className="login-other-icon" />
              <Button type="text" icon={<QqOutlined />} className="login-other-icon" />
              <Button type="text" icon={<GoogleOutlined />} className="login-other-icon" />
              <Button type="text" icon={<FacebookOutlined />} className="login-other-icon" />
            </div>
          </div>

          <div className="login-register">
            <span>还没有账号？</span>
            <Link to="/register" className="login-register-link">立即注册</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
