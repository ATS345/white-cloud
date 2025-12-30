import { useState } from 'react';
import { Card, Tabs, Button, Row, Col, Image, Descriptions, Tag, Rate, List, Divider, Avatar, Form, Input, Progress, Statistic } from 'antd';
import { DownloadOutlined, ShareAltOutlined, HeartOutlined, HeartFilled, StarOutlined, ShoppingCartOutlined, StarFilled } from '@ant-design/icons';
import './index.css';

const { TabPane } = Tabs;

interface CommentValues {
  rating: number;
  title: string;
  content: string;
}

const GameDetail: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [form] = Form.useForm();

  const game = {
    id: 1,
    name: '原神',
    type: '开放世界',
    rating: 4.8,
    ratingCount: 12345,
    ratingDistribution: [
      { star: 5, count: 8500 },
      { star: 4, count: 2500 },
      { star: 3, count: 1000 },
      { star: 2, count: 200 },
      { star: 1, count: 145 },
    ],
    price: 0,
    developer: '米哈游',
    publisher: '米哈游',
    releaseDate: '2020-09-28',
    description: '《原神》是由米哈游自研的一款开放世界冒险RPG。你将在游戏中探索一个被称作「提瓦特」的幻想世界，在这广阔的世界中，你可以踏遍七国，邂逅性格各异、能力独特的同伴，与他们一同对抗强敌，踏上寻回血亲之路；也可以不带目的地漫游，沉浸在充满生机的世界里，让好奇心驱使自己发掘各个角落的奥秘……',
    images: [
      'https://picsum.photos/seed/game1-1/800/450',
      'https://picsum.photos/seed/game1-2/800/450',
      'https://picsum.photos/seed/game1-3/800/450',
    ],
    videos: [
      'https://picsum.photos/seed/game1-vid/800/450',
    ],
    tags: ['开放世界', '冒险', '角色扮演', '二次元', '免费'],
    requirements: {
      minimum: {
        os: 'Windows 7 SP1 64-bit',
        cpu: 'Intel Core i5-4460 / AMD FX-6300',
        memory: '8 GB RAM',
        graphics: 'NVIDIA GeForce GT 1030 / AMD Radeon R7 260X',
        storage: '30 GB available space',
      },
      recommended: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600X',
        memory: '16 GB RAM',
        graphics: 'NVIDIA GeForce RTX 2060 / AMD Radeon RX 5700',
        storage: '30 GB available space',
      },
    },
    comments: [
      {
        id: 1,
        user: '张三',
        avatar: 'https://picsum.photos/seed/user1/40/40',
        content: '游戏画面非常精美，开放世界设计得很出色，值得一玩！',
        rating: 5,
        time: '2024-01-01 12:00:00',
      },
      {
        id: 2,
        user: '李四',
        avatar: 'https://picsum.photos/seed/user2/40/40',
        content: '角色设计很可爱，剧情也很吸引人，就是有点肝。',
        rating: 4,
        time: '2024-01-02 14:30:00',
      },
      {
        id: 3,
        user: '王五',
        avatar: 'https://picsum.photos/seed/user3/40/40',
        content: '音乐和剧情都很棒，就是更新有点慢，期待更多内容。',
        rating: 4,
        time: '2024-01-03 09:15:00',
      },
    ],
  };

  const handleCommentSubmit = (values: CommentValues) => {
    console.log('评论提交:', values);
    form.resetFields();
    setCommentVisible(false);
  };

  return (
    <div className="game-detail-page">
      {/* 游戏基本信息 */}
      <Card className="game-header-card">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={8}>
            <Image.PreviewGroup>
              {game.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`${game.name}截图${index + 1}`}
                  className="game-cover"
                />
              ))}
            </Image.PreviewGroup>
          </Col>
          <Col xs={24} md={16}>
            <div className="game-info">
              <h1 className="game-title">{game.name}</h1>
              <div className="game-meta">
                <Tag color="blue">{game.type}</Tag>
                <span className="game-rating">
                  <StarOutlined /> {game.rating}
                </span>
                <span className="game-price">
                  {game.price === 0 ? '免费' : `¥${game.price}`}
                </span>
              </div>
              <div className="game-actions">
                <Button type="primary" size="large" icon={<DownloadOutlined />} className="download-btn">
                  下载游戏
                </Button>
                <Button size="large" icon={<ShoppingCartOutlined />} className="buy-btn">
                  {game.price === 0 ? '添加到库' : `购买 ¥${game.price}`}
                </Button>
                <Button 
                  size="large" 
                  icon={liked ? <HeartFilled /> : <HeartOutlined />} 
                  className="like-btn"
                  onClick={() => setLiked(!liked)}
                  type={liked ? 'primary' : 'default'}
                >
                  {liked ? '已收藏' : '收藏'}
                </Button>
                <Button size="large" icon={<ShareAltOutlined />} className="share-btn">
                  分享
                </Button>
              </div>
              <Descriptions column={2} className="game-descriptions">
                <Descriptions.Item label="开发者">{game.developer}</Descriptions.Item>
                <Descriptions.Item label="发行商">{game.publisher}</Descriptions.Item>
                <Descriptions.Item label="发行日期">{game.releaseDate}</Descriptions.Item>
                <Descriptions.Item label="游戏类型">
                  {game.tags.map((tag, index) => (
                    <Tag key={index} color="gray">{tag}</Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 游戏详情标签页 */}
      <Tabs defaultActiveKey="1" className="game-detail-tabs">
        <TabPane tab="游戏简介" key="1">
          <div className="game-description">
            <h2>游戏简介</h2>
            <p>{game.description}</p>
          </div>
        </TabPane>
        <TabPane tab="游戏截图" key="2">
          <Row gutter={[16, 16]}>
            {game.images.map((image, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card hoverable cover={<Image src={image} alt={`${game.name}截图${index + 1}`} />}>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="游戏视频" key="3">
          <Row gutter={[16, 16]}>
            {game.videos.map((video, index) => (
              <Col xs={24} key={index}>
                <Card cover={<Image src={video} alt={`${game.name}视频${index + 1}`} />}>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
        <TabPane tab="配置要求" key="4">
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12}>
              <Card title="最低配置" className="requirements-card">
                <Descriptions column={1}>
                  <Descriptions.Item label="操作系统">{game.requirements.minimum.os}</Descriptions.Item>
                  <Descriptions.Item label="处理器">{game.requirements.minimum.cpu}</Descriptions.Item>
                  <Descriptions.Item label="内存">{game.requirements.minimum.memory}</Descriptions.Item>
                  <Descriptions.Item label="显卡">{game.requirements.minimum.graphics}</Descriptions.Item>
                  <Descriptions.Item label="存储空间">{game.requirements.minimum.storage}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="推荐配置" className="requirements-card">
                <Descriptions column={1}>
                  <Descriptions.Item label="操作系统">{game.requirements.recommended.os}</Descriptions.Item>
                  <Descriptions.Item label="处理器">{game.requirements.recommended.cpu}</Descriptions.Item>
                  <Descriptions.Item label="内存">{game.requirements.recommended.memory}</Descriptions.Item>
                  <Descriptions.Item label="显卡">{game.requirements.recommended.graphics}</Descriptions.Item>
                  <Descriptions.Item label="存储空间">{game.requirements.recommended.storage}</Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="玩家评论" key="5">
          <div className="comments-section">
            {/* 评分统计 */}
            <Card className="rating-stats-card">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <div className="overall-rating">
                    <Statistic
                      title="综合评分"
                      value={game.rating}
                      suffix={
                        <div className="rating-stars">
                          {Array.from({ length: 5 }).map((_, index) => (
                            index < Math.floor(game.rating) ? (
                              <StarFilled key={index} style={{ color: '#faad14', marginLeft: 4 }} />
                            ) : index < game.rating ? (
                              <StarOutlined key={index} style={{ color: '#faad14', marginLeft: 4 }} />
                            ) : (
                              <StarOutlined key={index} style={{ color: '#d9d9d9', marginLeft: 4 }} />
                            )
                          ))}
                        </div>
                      }
                      precision={1}
                      valueStyle={{ fontSize: '48px', color: '#faad14', fontWeight: 700 }}
                    />
                    <div className="rating-count">共 {game.ratingCount} 条评价</div>
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <div className="rating-distribution">
                    <h3>评分分布</h3>
                    {game.ratingDistribution.map((item) => {
                      const percentage = (item.count / game.ratingCount) * 100;
                      return (
                        <div key={item.star} className="rating-bar">
                          <div className="rating-bar-header">
                            <span className="star-count">{item.star}星</span>
                            <span className="count-number">{item.count}</span>
                          </div>
                          <Progress
                            percent={percentage}
                            strokeColor={{
                              '0%': '#d9d9d9',
                              '100%': '#faad14',
                            }}
                            showInfo={false}
                            className="rating-progress"
                          />
                          <span className="percentage">{percentage.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </Col>
              </Row>
            </Card>
            
            {/* 评论表单 */}
            {commentVisible && (
              <Card className="comment-form-card">
                <h3>写评论</h3>
                <Form
                  form={form}
                  onFinish={handleCommentSubmit}
                  layout="vertical"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="rating"
                        label="评分"
                        rules={[{ required: true, message: '请选择评分' }]}
                      >
                        <Rate />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="title"
                    label="标题"
                    rules={[{ required: true, message: '请输入评论标题' }]}
                  >
                    <Input placeholder="请输入评论标题" />
                  </Form.Item>
                  <Form.Item
                    name="content"
                    label="评论内容"
                    rules={[{ required: true, message: '请输入评论内容' }]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="请输入您的游戏体验和评价"
                    />
                  </Form.Item>
                  <Form.Item>
                    <div className="comment-form-actions">
                      <Button type="primary" htmlType="submit">
                        提交评论
                      </Button>
                      <Button onClick={() => setCommentVisible(false)}>
                        取消
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              </Card>
            )}
            
            {/* 评论列表 */}
            <div className="comments-header">
              <h3>玩家评论</h3>
              <Button type="primary" onClick={() => setCommentVisible(!commentVisible)}>
                {commentVisible ? '取消写评论' : '写评论'}
              </Button>
            </div>
            <Divider />
            <List
              dataSource={game.comments}
              renderItem={(comment) => (
                <List.Item className="comment-item">
                  <List.Item.Meta
                    avatar={<Avatar src={comment.avatar} />}
                    title={
                      <div className="comment-header">
                        <a>{comment.user}</a>
                        <Rate disabled defaultValue={comment.rating} className="comment-rating" />
                        <span className="comment-time">{comment.time}</span>
                      </div>
                    }
                    description={<p>{comment.content}</p>}
                  />
                </List.Item>
              )}
              pagination={{
                pageSize: 5,
                total: game.comments.length,
                showSizeChanger: false,
              }}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default GameDetail;
