import express from 'express';

const router = express.Router();

// Mock game data
const games = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    description: 'Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
    price: 29.99,
    release_date: '2020-12-10',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%202077%20game%20cover%20dark%20futuristic%20city&image_size=square',
    trailer_url: 'https://www.youtube.com/watch?v=8X2kIfS6fb8',
    system_requirements: {
      minimum: 'Windows 7/10, Intel Core i5-3570K, 8GB RAM, NVIDIA GTX 780',
      recommended: 'Windows 10, Intel Core i7-4790, 16GB RAM, NVIDIA GTX 1060'
    },
    average_rating: 4.5,
    review_count: 1245,
    download_count: 56789,
    categories: [1, 3]
  },
  {
    id: 2,
    title: 'The Witcher 3: Wild Hunt',
    description: 'The Witcher 3: Wild Hunt is a story-driven, open world adventure set in a dark fantasy universe.',
    price: 19.99,
    release_date: '2015-05-19',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt',
    cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=the%20witcher%203%20game%20cover%20fantasy%20medieval%20warrior&image_size=square',
    trailer_url: 'https://www.youtube.com/watch?v=c0i88t0Kacs',
    system_requirements: {
      minimum: 'Windows 7, Intel Core i5-2500K, 6GB RAM, NVIDIA GTX 660',
      recommended: 'Windows 10, Intel Core i7-3770, 8GB RAM, NVIDIA GTX 770'
    },
    average_rating: 4.8,
    review_count: 2345,
    download_count: 89765,
    categories: [1, 2]
  },
  {
    id: 3,
    title: 'Red Dead Redemption 2',
    description: 'Red Dead Redemption 2 is a epic tale of life in America\'s unforgiving heartland.',
    price: 39.99,
    release_date: '2018-10-26',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20dead%20redemption%202%20game%20cover%20wild%20west%20cowboy&image_size=square',
    trailer_url: 'https://www.youtube.com/watch?v=eaW0tYpxyp0',
    system_requirements: {
      minimum: 'Windows 10, Intel Core i5-2500K, 8GB RAM, NVIDIA GTX 770',
      recommended: 'Windows 10, Intel Core i7-4770K, 12GB RAM, NVIDIA GTX 1060'
    },
    average_rating: 4.7,
    review_count: 1890,
    download_count: 76543,
    categories: [1, 4]
  },
  {
    id: 4,
    title: 'Grand Theft Auto V',
    description: 'Grand Theft Auto V is a sprawling open world action-adventure game set in the fictional state of San Andreas.',
    price: 29.99,
    release_date: '2013-09-17',
    developer: 'Rockstar North',
    publisher: 'Rockstar Games',
    cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=grand%20theft%20auto%20v%20game%20cover%20modern%20city%20crime&image_size=square',
    trailer_url: 'https://www.youtube.com/watch?v=QkkoHAzjnUs',
    system_requirements: {
      minimum: 'Windows 7, Intel Core 2 Quad Q6600, 4GB RAM, NVIDIA 9800 GT',
      recommended: 'Windows 10, Intel Core i5-3470, 8GB RAM, NVIDIA GTX 660'
    },
    average_rating: 4.6,
    review_count: 3456,
    download_count: 98765,
    categories: [1, 4]
  },
  {
    id: 5,
    title: 'Elden Ring',
    description: 'Elden Ring is a dark fantasy action role-playing game developed by FromSoftware and published by Bandai Namco Entertainment.',
    price: 59.99,
    release_date: '2022-02-25',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elden%20ring%20game%20cover%20fantasy%20dark%20souls&image_size=square',
    trailer_url: 'https://www.youtube.com/watch?v=E3Huy2cdih0',
    system_requirements: {
      minimum: 'Windows 10, Intel Core i5-8400, 12GB RAM, NVIDIA GTX 1060',
      recommended: 'Windows 10, Intel Core i7-8700K, 16GB RAM, NVIDIA GTX 1080'
    },
    average_rating: 4.9,
    review_count: 1234,
    download_count: 54321,
    categories: [1, 2]
  },
  {
    id: 6,
    title: 'God of War Ragnarök',
    description: 'God of War Ragnarök is an action-adventure game developed by Santa Monica Studio and published by Sony Interactive Entertainment.',
    price: 59.99,
    release_date: '2022-11-09',
    developer: 'Santa Monica Studio',
    publisher: 'Sony Interactive Entertainment',
    cover_image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=god%20of%20war%20ragnarok%20game%20cover%20norse%20mythology&image_size=square',
    trailer_url: 'https://www.youtube.com/watch?v=FyzQDQX7l1s',
    system_requirements: {
      minimum: 'Windows 10, Intel Core i5-6600K, 16GB RAM, NVIDIA GTX 1060',
      recommended: 'Windows 10, Intel Core i7-7700K, 16GB RAM, NVIDIA GTX 1080'
    },
    average_rating: 4.8,
    review_count: 987,
    download_count: 32109,
    categories: [1, 2]
  }
];

// Mock categories
const categories = [
  { id: 1, name: 'Action', slug: 'action' },
  { id: 2, name: 'Role-playing', slug: 'role-playing' },
  { id: 3, name: 'Open World', slug: 'open-world' },
  { id: 4, name: 'Adventure', slug: 'adventure' }
];

// 请求缓存
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟缓存

// 生成缓存键
const generateCacheKey = (req: express.Request): string => {
  const { method, url, params, query } = req;
  return `${method}:${url}:${JSON.stringify(params)}:${JSON.stringify(query)}`;
};

// 缓存中间件
const cacheMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // 只缓存GET请求
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = generateCacheKey(req);
  const cachedData = requestCache.get(cacheKey);

  if (cachedData) {
    const now = Date.now();
    if (now - cachedData.timestamp < CACHE_EXPIRY) {
      // 使用缓存数据
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cachedData.data);
    } else {
      // 缓存已过期，删除缓存
      requestCache.delete(cacheKey);
    }
  }

  res.setHeader('X-Cache', 'MISS');
  
  // 重写res.json方法以缓存响应
  const originalJson = res.json.bind(res);
  res.json = (data: any) => {
    requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return originalJson(data);
  };

  next();
};

// 应用缓存中间件
router.use(cacheMiddleware);

// Get all games with pagination
router.get('/', (req, res) => {
  const { page = 1, limit = 10, sort = 'id', order = 'asc' } = req.query;
  
  // 解析参数
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const sortField = sort as string;
  const sortOrder = order as string;

  // 验证参数
  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  // 排序游戏
  let sortedGames = [...games];
  if (sortField in games[0]) {
    sortedGames.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }

  // 分页
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedGames = sortedGames.slice(startIndex, endIndex);

  // 计算总页数
  const totalPages = Math.ceil(sortedGames.length / limitNum);

  // 生成响应
  const response = {
    games: paginatedGames,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems: sortedGames.length,
      totalPages,
      hasNextPage: endIndex < sortedGames.length,
      hasPrevPage: startIndex > 0
    }
  };

  res.status(200).json(response);
});

// Get game by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // 使用Map或对象快速查找，避免遍历整个数组
  const game = games.find(game => game.id === parseInt(id));
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  res.status(200).json(game);
});

// Get games by category with pagination
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  // 解析参数
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  // 验证参数
  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  // 查找分类
  const categoryObj = categories.find(cat => cat.slug === category);
  
  if (!categoryObj) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  // 过滤游戏
  const categoryGames = games.filter(game => game.categories.includes(categoryObj.id));
  
  // 分页
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedGames = categoryGames.slice(startIndex, endIndex);

  // 计算总页数
  const totalPages = Math.ceil(categoryGames.length / limitNum);

  // 生成响应
  const response = {
    games: paginatedGames,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems: categoryGames.length,
      totalPages,
      hasNextPage: endIndex < categoryGames.length,
      hasPrevPage: startIndex > 0
    }
  };

  res.status(200).json(response);
});

// Search games with pagination
router.get('/search', (req, res) => {
  const { q } = req.query;
  const { page = 1, limit = 10 } = req.query;
  
  // 解析参数
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  // 验证参数
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
    return res.status(400).json({ error: 'Invalid pagination parameters' });
  }

  // 搜索游戏
  const searchTerm = q.toString().toLowerCase();
  const searchResults = games.filter(game => 
    game.title.toLowerCase().includes(searchTerm) ||
    game.description.toLowerCase().includes(searchTerm) ||
    game.developer.toLowerCase().includes(searchTerm)
  );

  // 分页
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedResults = searchResults.slice(startIndex, endIndex);

  // 计算总页数
  const totalPages = Math.ceil(searchResults.length / limitNum);

  // 生成响应
  const response = {
    games: paginatedResults,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalItems: searchResults.length,
      totalPages,
      hasNextPage: endIndex < searchResults.length,
      hasPrevPage: startIndex > 0
    }
  };

  res.status(200).json(response);
});

export default router;