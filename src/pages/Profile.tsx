import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Avatar, Upload, message, Tabs, Space, Checkbox } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, CameraOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from '@/store/slices/authSlice'
import api from '@/utils/api'

const { TabPane } = Tabs
const { TextArea } = Input

const Profile = () => {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: any) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [settingsForm] = Form.useForm()

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
      })
    }
  }, [user, profileForm])

  const handleProfileSubmit = async (values: any) => {
    try {
      await api.put('/auth/me', values)
      message.success('个人资料更新成功')
      dispatch(fetchCurrentUser())
    } catch (error) {
      message.error('更新失败，请稍后重试')
    }
  }

  const handlePasswordSubmit = async (values: any) => {
    try {
      await api.put('/auth/me/password', values)
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      message.error('修改失败，请检查原密码是否正确')
    }
  }

  const handleSettingsSubmit = async (values: any) => {
    try {
      await api.put('/auth/me/settings', values)
      message.success('设置更新成功')
    } catch (error) {
      message.error('更新失败，请稍后重试')
    }
  }

  const handleAvatarUpload = async (file: any) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await api.post('/auth/me/avatar', formData)
      message.success('头像上传成功')
      dispatch(fetchCurrentUser())
    } catch (error) {
      message.error('上传失败，请稍后重试')
    }
  }

  if (loading || !user) {
    return <div className="loading-container">加载中...</div>
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 style={{ marginBottom: '40px' }}>个人资料</h1>
        
        <Card className="profile-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <Upload
              name="avatar"
              showUploadList={false}
              customRequest={handleAvatarUpload}
              maxCount={1}
            >
              <Avatar
                size={128}
                src={user.avatar || undefined}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer', border: '2px solid #667eea' }}
              />
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#667eea', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <CameraOutlined />
              </div>
            </Upload>
            <div style={{ marginLeft: '30px' }}>
              <h2>{user.displayName || user.username}</h2>
              <p style={{ color: '#666' }}>@{user.username}</p>
              <p style={{ color: '#999' }}>{user.email}</p>
            </div>
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="个人资料" key="profile">
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileSubmit}
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                
                <Form.Item
                  name="displayName"
                  label="显示名称"
                  rules={[{ required: true, message: '请输入显示名称' }]}
                >
                  <Input />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>
                
                <Form.Item
                  name="bio"
                  label="个人简介"
                >
                  <TextArea rows={4} placeholder="介绍一下自己..." />
                </Form.Item>
                
                <Form.Item
                  name="location"
                  label="所在地"
                >
                  <Input placeholder="城市，国家" />
                </Form.Item>
                
                <Form.Item
                  name="website"
                  label="个人网站"
                >
                  <Input placeholder="https://" />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存更改
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            <TabPane tab="修改密码" key="password">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordSubmit}
              >
                <Form.Item
                  name="oldPassword"
                  label="原密码"
                  rules={[{ required: true, message: '请输入原密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                
                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码长度至少为6位' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                
                <Form.Item
                  name="confirmPassword"
                  label="确认新密码"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'))
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    修改密码
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
            
            <TabPane tab="账户设置" key="settings">
              <Form
                form={settingsForm}
                layout="vertical"
                onFinish={handleSettingsSubmit}
              >
                <Form.Item
                  name="emailNotifications"
                  label="邮箱通知"
                  valuePropName="checked"
                >
                  <Checkbox>接收游戏更新和促销邮件</Checkbox>
                </Form.Item>
                
                <Form.Item
                  name="pushNotifications"
                  label="推送通知"
                  valuePropName="checked"
                >
                  <Checkbox>接收应用推送通知</Checkbox>
                </Form.Item>
                
                <Form.Item
                  name="publicProfile"
                  label="公开资料"
                  valuePropName="checked"
                >
                  <Checkbox>允许其他用户查看我的个人资料</Checkbox>
                </Form.Item>
                
                <Form.Item
                  name="twoFactorAuth"
                  label="两步验证"
                  valuePropName="checked"
                >
                  <Checkbox>启用两步验证（推荐）</Checkbox>
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    保存设置
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default Profile
