import { useState } from 'react';
import { Card, Tabs, Button, Avatar, Descriptions, Row, Col, Input, Form, Upload } from 'antd';
import { EditOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import './index.css';

const { TabPane } = Tabs;
const { Dragger } = Upload;

const UserCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [isEditing, setIsEditing] = useState(false);

  const userInfo = {
    id: 1,
    username: '玩家123',
    nickname: '游戏达人',
    avatar: 'https://picsum.photos/seed/user/100/100',
    email: 'player123@example.com',
    phone: '13800138000',
    registerDate: '2023-01-01',
    lastLogin: '2024-01-16',
    level: 15,
    exp: 8500,
    nextLevel: 10000,
    gamesCount: 12,
    playTime: '560小时',
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="user-center-page">
      <h1>个人中心</h1>
      <Row gutter={[24, 24]}>
        {/* 左侧信息卡 */}
        <Col xs={24} md={8}>
          <Card className="user-info-card">
            <div className="user-avatar-section">
              <Avatar size={120} src={userInfo.avatar} icon={<UserOutlined />} className="user-avatar" />
              <h2 className="user-nickname">{userInfo.nickname}</h2>
              <p className="user-username">{userInfo.username}</p>
              <div className="user-level">
                <span className="level-label">等级</span>
                <span className="level-value">{userInfo.level}</span>
                <div className="level-progress">
                  <div 
                    className="level-progress-fill" 
                    style={{ width: `${(userInfo.exp / userInfo.nextLevel) * 100}%` }}
                  ></div>
                </div>
                <span className="exp-info">{userInfo.exp} / {userInfo.nextLevel} EXP</span>
              </div>
            </div>
            <Descriptions column={1} className="user-stats">
              <Descriptions.Item label="游戏数量">{userInfo.gamesCount} 款</Descriptions.Item>
              <Descriptions.Item label="总游玩时间">{userInfo.playTime}</Descriptions.Item>
              <Descriptions.Item label="注册时间">{userInfo.registerDate}</Descriptions.Item>
              <Descriptions.Item label="最后登录">{userInfo.lastLogin}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 右侧内容区 */}
        <Col xs={24} md={16}>
          <Tabs activeKey={activeTab} onChange={handleTabChange} className="user-tabs">
            <TabPane tab="基本信息" key="1">
              <Card title="基本信息" className="info-tab-card">
                {isEditing ? (
                  <Form layout="vertical">
                    <Form.Item label="昵称">
                      <Input defaultValue={userInfo.nickname} />
                    </Form.Item>
                    <Form.Item label="邮箱">
                      <Input defaultValue={userInfo.email} disabled />
                    </Form.Item>
                    <Form.Item label="手机号">
                      <Input defaultValue={userInfo.phone} />
                    </Form.Item>
                    <Form.Item label="头像">
                      <Dragger
                        name="avatar"
                        multiple={false}
                        action="#"
                        showUploadList={false}
                      >
                        <p className="ant-upload-drag-icon">
                          <UploadOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
                        <p className="ant-upload-hint">支持 JPG、PNG 格式，不超过 2MB</p>
                      </Dragger>
                    </Form.Item>
                    <div className="form-actions">
                      <Button type="primary" onClick={handleEditToggle}>保存</Button>
                      <Button onClick={handleEditToggle}>取消</Button>
                    </div>
                  </Form>
                ) : (
                  <>
                    <Descriptions column={2} className="user-descriptions">
                      <Descriptions.Item label="用户名">{userInfo.username}</Descriptions.Item>
                      <Descriptions.Item label="昵称">{userInfo.nickname}</Descriptions.Item>
                      <Descriptions.Item label="邮箱">{userInfo.email}</Descriptions.Item>
                      <Descriptions.Item label="手机号">{userInfo.phone}</Descriptions.Item>
                      <Descriptions.Item label="注册时间">{userInfo.registerDate}</Descriptions.Item>
                      <Descriptions.Item label="最后登录">{userInfo.lastLogin}</Descriptions.Item>
                    </Descriptions>
                    <div className="edit-action">
                      <Button type="primary" icon={<EditOutlined />} onClick={handleEditToggle}>
                        编辑信息
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </TabPane>
            <TabPane tab="安全设置" key="2">
              <Card title="安全设置" className="security-tab-card">
                <Descriptions column={1} className="security-descriptions">
                  <Descriptions.Item label="密码">
                    ******** <Button type="link">修改密码</Button>
                  </Descriptions.Item>
                  <Descriptions.Item label="邮箱验证">
                    <span className="verified">已验证</span> <Button type="link">重新验证</Button>
                  </Descriptions.Item>
                  <Descriptions.Item label="手机验证">
                    <span className="verified">已验证</span> <Button type="link">重新验证</Button>
                  </Descriptions.Item>
                  <Descriptions.Item label="两步验证">
                    <span className="unverified">未开启</span> <Button type="link">开启</Button>
                  </Descriptions.Item>
                  <Descriptions.Item label="登录设备">
                    <Button type="link">管理设备</Button>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </TabPane>
            <TabPane tab="游戏数据" key="3">
              <Card title="游戏数据" className="game-data-card">
                <div className="empty-data">游戏数据统计功能即将上线</div>
              </Card>
            </TabPane>
            <TabPane tab="社交设置" key="4">
              <Card title="社交设置" className="social-tab-card">
                <div className="empty-data">社交设置功能即将上线</div>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default UserCenter;
