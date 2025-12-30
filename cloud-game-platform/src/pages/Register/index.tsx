import { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (_values: any) => {
    setLoading(true);
    // 模拟注册请求
    setTimeout(() => {
      setLoading(false);
      message.success('注册成功');
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <Card title="云朵游戏平台" className="register-card">
          <Form
            name="register"
            className="register-form"
            initialValues={{ agree: false }}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名！' },
                { min: 3, max: 20, message: '用户名长度必须在3到20个字符之间！' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱！' },
                { type: 'email', message: '请输入有效的邮箱地址！' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="邮箱" />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号！' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号！' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="手机号" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码！' },
                { min: 6, max: 20, message: '密码长度必须在6到20个字符之间！' },
                { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,20}$/, message: '密码必须包含大小写字母和数字！' }
              ]}
            >
              <Input
                prefix={<LockOutlined />}
                type="password"
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码！' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致！'));
                  },
                }),
              ]}
            >
              <Input
                prefix={<LockOutlined />}
                type="password"
                placeholder="确认密码"
              />
            </Form.Item>

            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意用户协议和隐私政策！')) },
              ]}
            >
              <Checkbox>
                我已阅读并同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="register-form-button"
                loading={loading}
                block
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="register-login">
            <span>已有账号？</span>
            <Link to="/login" className="register-login-link">立即登录</Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
