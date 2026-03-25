import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, Form, message, Tag, Space, Upload, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from '@/utils/api';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

interface GameRecord {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  status?: string;
  genres?: { id: number; name: string }[];
  platforms?: { id: number; name: string }[];
  coverImage?: string;
}

const GameManagement: React.FC = () => {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<GameRecord | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, genreFilter]);

  const fetchGames = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/games', {
        params: {
          search: searchText,
          genre: genreFilter,
        },
      });
      setGames(response.games || []);
    } catch (error) {
      console.error('获取游戏列表失败:', error);
      message.error('获取游戏列表失败');
    } finally {
      setLoading(false);
    }
  }, [searchText, genreFilter]);

  const handleEdit = (game: GameRecord) => {
    setEditingGame(game);
    form.setFieldsValue({
      title: game.title,
      slug: game.slug,
      description: game.description,
      shortDescription: game.shortDescription,
      price: game.price,
      developer: game.developer,
      publisher: game.publisher,
      releaseDate: game.releaseDate ? [game.releaseDate] : null,
      status: game.status,
      genres: game.genres?.map((g: { id: number }) => g.id) || [],
      platforms: game.platforms?.map((p: { id: number }) => p.id) || [],
    });
    setModalVisible(true);
  };

  const handleDelete = async (gameId: number) => {
    try {
      await api.delete(`/admin/games/${gameId}`);
      message.success('游戏删除成功');
      fetchGames();
    } catch (error) {
      console.error('删除游戏失败:', error);
      message.error('删除游戏失败');
    }
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const gameData = {
        ...values,
        releaseDate: values.releaseDate ? values.releaseDate[0] : null,
      };
      
      if (editingGame) {
        await api.put(`/admin/games/${editingGame.id}`, gameData);
        message.success('游戏更新成功');
      } else {
        await api.post('/admin/games', gameData);
        message.success('游戏创建成功');
      }
      setModalVisible(false);
      fetchGames();
    } catch (error) {
      console.error('保存游戏失败:', error);
      message.error('保存游戏失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '游戏名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '开发商',
      dataIndex: 'developer',
      key: 'developer',
    },
    {
      title: '发行商',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: '发布日期',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '未设置',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'published') color = 'green';
        if (status === 'draft') color = 'grey';
        if (status === 'archived') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: GameRecord) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <h2>游戏管理</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Select
            placeholder="筛选分类"
            style={{ width: 120 }}
            value={genreFilter}
            onChange={setGenreFilter}
          >
            <Option value="">全部分类</Option>
            <Option value="action">动作</Option>
            <Option value="adventure">冒险</Option>
            <Option value="rpg">角色扮演</Option>
            <Option value="strategy">策略</Option>
            <Option value="simulation">模拟</Option>
          </Select>
          <Search
            placeholder="搜索游戏"
            allowClear
            style={{ width: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingGame(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            新增游戏
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={games}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />

      <Modal
        title={editingGame ? '编辑游戏' : '新增游戏'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="游戏名称"
            rules={[{ required: true, message: '请输入游戏名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="slug"
            label="URL 别名"
            rules={[{ required: true, message: '请输入URL别名' }]}
          >
            <Input placeholder="例如：cyberpunk-2077" />
          </Form.Item>
          <Form.Item
            name="description"
            label="游戏描述"
            rules={[{ required: true, message: '请输入游戏描述' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="shortDescription"
            label="简短描述"
            rules={[{ required: true, message: '请输入简短描述' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }, { type: 'number', min: 0, message: '价格必须大于等于0' }]}
          >
            <Input type="number" prefix="¥" />
          </Form.Item>
          <Form.Item
            name="developer"
            label="开发商"
            rules={[{ required: true, message: '请输入开发商' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="publisher"
            label="发行商"
            rules={[{ required: true, message: '请输入发行商' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="releaseDate"
            label="发布日期"
            rules={[{ required: true, message: '请选择发布日期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="published">已发布</Option>
              <Option value="draft">草稿</Option>
              <Option value="archived">已归档</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="coverImage"
            label="封面图片"
          >
            <Upload>
              <Button icon={<UploadOutlined />}>上传封面</Button>
            </Upload>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button onClick={() => setModalVisible(false)} style={{ marginRight: '8px' }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GameManagement;
