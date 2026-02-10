// 游戏类型定义
export interface Game {
  id: number;
  name: string;
  type: string;
  rating: number;
  price: number;
  developer: string;
  publisher: string;
  releaseDate: string;
  description: string;
  images: string[];
  videos: string[];
  tags: string[];
  requirements: {
    minimum: {
      os: string;
      cpu: string;
      memory: string;
      graphics: string;
      storage: string;
    };
    recommended: {
      os: string;
      cpu: string;
      memory: string;
      graphics: string;
      storage: string;
    };
  };
  comments?: {
    id: number;
    user: string;
    avatar: string;
    content: string;
    rating: number;
    time: string;
  }[];
}

// 模拟游戏数据
export const mockGames: Game[] = [
  {
    id: 1,
    name: '荒野大镖客：救赎2',
    type: 'Action',
    rating: 4.8,
    price: 249,
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    releaseDate: '2018-10-26',
    description: '《荒野大镖客：救赎2》是一款由Rockstar Games开发的开放世界动作冒险游戏，讲述了亚瑟·摩根和范德林德帮众的故事。',
    images: ['https://picsum.photos/seed/game1/400/250'],
    videos: [],
    tags: ['开放世界', '动作', '冒险', '西部'],
    requirements: {
      minimum: {
        os: 'Windows 10',
        cpu: 'Intel Core i5-2500K / AMD FX-6300',
        memory: '8 GB',
        graphics: 'NVIDIA GeForce GTX 770 2GB / AMD Radeon R9 280 3GB',
        storage: '150 GB'
      },
      recommended: {
        os: 'Windows 10',
        cpu: 'Intel Core i7-4770K / AMD Ryzen 5 1500X',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB',
        storage: '150 GB'
      }
    },
    comments: [
      {
        id: 1,
        user: '游戏爱好者',
        avatar: 'https://picsum.photos/seed/user1/50/50',
        content: '这是我玩过的最棒的开放世界游戏！',
        rating: 5,
        time: '2025-12-30'
      }
    ]
  },
  {
    id: 2,
    name: '赛博朋克2077',
    type: 'RPG',
    rating: 4.5,
    price: 199,
    developer: 'CD Projekt RED',
    publisher: 'CD Projekt',
    releaseDate: '2020-12-10',
    description: '《赛博朋克2077》是一款由CD Projekt RED开发的开放世界RPG游戏，背景设定在2077年的夜之城。',
    images: ['https://picsum.photos/seed/game2/400/250'],
    videos: [],
    tags: ['开放世界', 'RPG', '科幻', '动作'],
    requirements: {
      minimum: {
        os: 'Windows 10',
        cpu: 'Intel Core i5-3570K / AMD FX-8310',
        memory: '8 GB',
        graphics: 'NVIDIA GeForce GTX 780 3GB / AMD Radeon RX 470',
        storage: '70 GB'
      },
      recommended: {
        os: 'Windows 10',
        cpu: 'Intel Core i7-4790 / AMD Ryzen 5 3600',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 590',
        storage: '70 GB'
      }
    }
  },
  {
    id: 3,
    name: '艾尔登法环',
    type: 'Action',
    rating: 4.9,
    price: 299,
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    releaseDate: '2022-02-25',
    description: '《艾尔登法环》是一款由FromSoftware开发的动作角色扮演游戏，由乔治·R·R·马丁参与世界观设定。',
    images: ['https://picsum.photos/seed/game3/400/250'],
    videos: [],
    tags: ['开放世界', '动作', 'RPG', '奇幻'],
    requirements: {
      minimum: {
        os: 'Windows 10',
        cpu: 'Intel Core i5-8400 / AMD Ryzen 3 3300X',
        memory: '12 GB',
        graphics: 'NVIDIA GeForce GTX 1060 3GB / AMD Radeon RX 580 4GB',
        storage: '60 GB'
      },
      recommended: {
        os: 'Windows 10',
        cpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600X',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce RTX 2070 8GB / AMD Radeon RX 5700 XT 8GB',
        storage: '60 GB'
      }
    }
  },
  {
    id: 4,
    name: '原神',
    type: 'RPG',
    rating: 4.7,
    price: 0,
    developer: 'miHoYo',
    publisher: 'miHoYo',
    releaseDate: '2020-09-28',
    description: '《原神》是一款由miHoYo开发的开放世界冒险游戏，玩家将在提瓦特大陆上探索各种神奇的区域。',
    images: ['https://picsum.photos/seed/game4/400/250'],
    videos: [],
    tags: ['开放世界', 'RPG', '奇幻', '免费'],
    requirements: {
      minimum: {
        os: 'Windows 7 SP1 64-bit',
        cpu: 'Intel Core i5-4460 / AMD Ryzen 5 1400',
        memory: '8 GB',
        graphics: 'NVIDIA GeForce GT 1030 / AMD Radeon R7 260',
        storage: '30 GB'
      },
      recommended: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i7-8700K / AMD Ryzen 7 2700X',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 8GB',
        storage: '30 GB'
      }
    }
  },
  {
    id: 5,
    name: '暗黑破坏神4',
    type: 'Action',
    rating: 4.6,
    price: 249,
    developer: 'Blizzard Entertainment',
    publisher: 'Blizzard Entertainment',
    releaseDate: '2023-06-06',
    description: '《暗黑破坏神4》是一款由Blizzard Entertainment开发的动作角色扮演游戏，玩家将在庇护之地与恶魔战斗。',
    images: ['https://picsum.photos/seed/game5/400/250'],
    videos: [],
    tags: ['动作', 'RPG', '暗黑风格', '在线'],
    requirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i5-2500K / AMD FX-8100',
        memory: '8 GB',
        graphics: 'NVIDIA GeForce GTX 660 2GB / AMD Radeon R9 280',
        storage: '90 GB'
      },
      recommended: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i7-4770K / AMD Ryzen 5 1600',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce RTX 3060 8GB / AMD Radeon RX 6600 XT 8GB',
        storage: '90 GB'
      }
    }
  },
  {
    id: 6,
    name: '绝地求生',
    type: 'Battle Royale',
    rating: 4.3,
    price: 98,
    developer: 'PUBG Corporation',
    publisher: 'KRAFTON, Inc.',
    releaseDate: '2017-12-20',
    description: '《绝地求生》是一款由PUBG Corporation开发的战术竞技型射击类沙盒游戏。',
    images: ['https://picsum.photos/seed/game6/400/250'],
    videos: [],
    tags: ['射击', '大逃杀', '在线', '竞技'],
    requirements: {
      minimum: {
        os: 'Windows 7 SP1 64-bit',
        cpu: 'Intel Core i5-4430 / AMD FX-6300',
        memory: '8 GB',
        graphics: 'NVIDIA GeForce GTX 960 2GB / AMD Radeon R7 370 2GB',
        storage: '40 GB'
      },
      recommended: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i5-6600K / AMD Ryzen 5 1600',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 4GB',
        storage: '40 GB'
      }
    }
  },
  {
    id: 7,
    name: '星穹铁道',
    type: 'RPG',
    rating: 4.8,
    price: 0,
    developer: 'miHoYo',
    publisher: 'miHoYo',
    releaseDate: '2023-04-26',
    description: '《星穹铁道》是一款由miHoYo开发的回合制策略RPG游戏，玩家将乘坐星穹列车穿越各种星系。',
    images: ['https://picsum.photos/seed/game7/400/250'],
    videos: [],
    tags: ['RPG', '回合制', '科幻', '免费'],
    requirements: {
      minimum: {
        os: 'Windows 7 SP1 64-bit',
        cpu: 'Intel Core i5-4460 / AMD Ryzen 3 1200',
        memory: '8 GB',
        graphics: 'NVIDIA GeForce GT 1030 / AMD Radeon R7 260X',
        storage: '20 GB'
      },
      recommended: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i7-6700K / AMD Ryzen 5 3600',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580 8GB',
        storage: '20 GB'
      }
    }
  },
  {
    id: 8,
    name: '霍格沃茨之遗',
    type: 'Action',
    rating: 4.5,
    price: 299,
    developer: 'Avalanche Software',
    publisher: 'Warner Bros. Games',
    releaseDate: '2023-02-10',
    description: '《霍格沃茨之遗》是一款由Avalanche Software开发的开放世界动作RPG游戏，背景设定在19世纪的霍格沃茨魔法学校。',
    images: ['https://picsum.photos/seed/game8/400/250'],
    videos: [],
    tags: ['开放世界', 'RPG', '奇幻', '魔法'],
    requirements: {
      minimum: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
        memory: '16 GB',
        graphics: 'NVIDIA GeForce GTX 1070 8GB / AMD Radeon RX 580 8GB',
        storage: '85 GB'
      },
      recommended: {
        os: 'Windows 10 64-bit',
        cpu: 'Intel Core i7-8700K / AMD Ryzen 7 3700X',
        memory: '32 GB',
        graphics: 'NVIDIA GeForce RTX 2080 Ti 11GB / AMD Radeon RX 6800 XT 16GB',
        storage: '85 GB'
      }
    }
  }
];

// 获取热门游戏
export const getHotGames = () => {
  return mockGames.slice(0, 8);
};

// 获取新游戏
export const getNewGames = () => {
  return mockGames.slice(4, 8);
};

// 获取折扣游戏
export const getDiscountGames = () => {
  return mockGames.slice(0, 4);
};

// 获取游戏列表
export const getGames = (params: { page?: number; pageSize?: number; search?: string; type?: string; sortBy?: string }) => {
  const { page = 1, pageSize = 12, search = '', type = 'all', sortBy = 'rating' } = params;
  let filteredGames = [...mockGames];

  // 搜索过滤
  if (search) {
    filteredGames = filteredGames.filter(game => 
      game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.developer.toLowerCase().includes(search.toLowerCase()) ||
      game.publisher.toLowerCase().includes(search.toLowerCase()) ||
      game.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );
  }

  // 类型过滤
  if (type !== 'all') {
    filteredGames = filteredGames.filter(game => game.type === type);
  }

  // 排序
  switch (sortBy) {
    case 'rating':
      filteredGames.sort((a, b) => b.rating - a.rating);
      break;
    case 'price':
      filteredGames.sort((a, b) => a.price - b.price);
      break;
    case 'releaseDate':
      filteredGames.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
      break;
    default:
      filteredGames.sort((a, b) => b.rating - a.rating);
  }

  // 分页
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedGames = filteredGames.slice(startIndex, endIndex);

  return {
    data: paginatedGames,
    total: filteredGames.length,
    page,
    pageSize
  };
};

// 获取游戏详情
export const getGameDetail = (id: number) => {
  return mockGames.find(game => game.id === id);
};

// 获取游戏库
export const getGameLibrary = () => {
  return mockGames.slice(0, 4);
};