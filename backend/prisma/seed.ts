import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始导入种子数据...');

  // 1. 创建游戏分类
  const genres = await Promise.all([
    prisma.genre.create({ data: { name: '动作', slug: 'action' } }),
    prisma.genre.create({ data: { name: '冒险', slug: 'adventure' } }),
    prisma.genre.create({ data: { name: '角色扮演', slug: 'rpg' } }),
    prisma.genre.create({ data: { name: '策略', slug: 'strategy' } }),
    prisma.genre.create({ data: { name: '模拟', slug: 'simulation' } }),
    prisma.genre.create({ data: { name: '体育', slug: 'sports' } }),
    prisma.genre.create({ data: { name: '竞速', slug: 'racing' } }),
    prisma.genre.create({ data: { name: '射击', slug: 'shooter' } }),
  ]);

  console.log('✅ 游戏分类创建完成');

  // 2. 创建游戏平台
  const platforms = await Promise.all([
    prisma.platform.create({ data: { name: 'Windows', slug: 'windows' } }),
    prisma.platform.create({ data: { name: 'Mac', slug: 'mac' } }),
    prisma.platform.create({ data: { name: 'Linux', slug: 'linux' } }),
    prisma.platform.create({ data: { name: 'PlayStation', slug: 'playstation' } }),
    prisma.platform.create({ data: { name: 'Xbox', slug: 'xbox' } }),
    prisma.platform.create({ data: { name: 'Nintendo', slug: 'nintendo' } }),
  ]);

  console.log('✅ 游戏平台创建完成');

  // 3. 创建游戏标签
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: '开放世界', slug: 'open-world' } }),
    prisma.tag.create({ data: { name: '多人游戏', slug: 'multiplayer' } }),
    prisma.tag.create({ data: { name: '单人游戏', slug: 'singleplayer' } }),
    prisma.tag.create({ data: { name: '沙盒', slug: 'sandbox' } }),
    prisma.tag.create({ data: { name: '生存', slug: 'survival' } }),
    prisma.tag.create({ data: { name: '恐怖', slug: 'horror' } }),
    prisma.tag.create({ data: { name: '科幻', slug: 'sci-fi' } }),
    prisma.tag.create({ data: { name: '奇幻', slug: 'fantasy' } }),
  ]);

  console.log('✅ 游戏标签创建完成');

  // 4. 创建测试用户
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // 密码: admin123
      displayName: '管理员',
      role: 'admin',
      emailVerified: true,
    },
  });

  const testUser = await prisma.user.create({
    data: {
      username: 'user',
      email: 'user@example.com',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // 密码: admin123
      displayName: '测试用户',
      emailVerified: true,
    },
  });

  console.log('✅ 测试用户创建完成');

  // 5. 创建测试游戏
  const games = await Promise.all([
    prisma.game.create({
      data: {
        title: '赛博朋克 2077',
        slug: 'cyberpunk-2077',
        description: '《赛博朋克 2077》是一款开放世界角色扮演游戏，故事发生在夜之城，一个五光十色的大都会，权力更迭和身体改造是不变的主题。扮演一名野心勃勃的雇佣兵：V，追寻一种独一无二的植入体——获得永生的关键。自定义角色的义体、技能和玩法，探索包罗万象的城市。玩家做出的选择也将会对剧情和周围的世界产生影响。',
        shortDescription: '开放世界角色扮演游戏，故事发生在夜之城。',
        price: 299.00,
        developer: 'CD Projekt Red',
        publisher: 'CD Projekt',
        releaseDate: new Date('2020-12-10'),
        status: 'published',
        coverImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Cyberpunk%202077%20game%20cover%20art&size=square_hd',
        headerImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Cyberpunk%202077%20game%20header%20banner&size=landscape_16_9',
        genres: {
          create: [
            { genreId: genres.find(g => g.name === '角色扮演')!.id },
            { genreId: genres.find(g => g.name === '动作')!.id },
            { genreId: genres.find(g => g.name === '冒险')!.id },
          ],
        },
        platforms: {
          create: [
            { platformId: platforms.find(p => p.name === 'Windows')!.id },
            { platformId: platforms.find(p => p.name === 'PlayStation')!.id },
            { platformId: platforms.find(p => p.name === 'Xbox')!.id },
          ],
        },
        tags: {
          create: [
            { tagId: tags.find(t => t.name === '开放世界')!.id },
            { tagId: tags.find(t => t.name === '科幻')!.id },
            { tagId: tags.find(t => t.name === '单人游戏')!.id },
          ],
        },
        screenshots: {
          create: [
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Cyberpunk%202077%20game%20screenshot%201&size=landscape_16_9' },
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Cyberpunk%202077%20game%20screenshot%202&size=landscape_16_9' },
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Cyberpunk%202077%20game%20screenshot%203&size=landscape_16_9' },
          ],
        },
        features: {
          create: [
            { name: '开放世界探索' },
            { name: '角色自定义' },
            { name: '多结局剧情' },
            { name: '载具系统' },
          ],
        },
        languages: {
          create: [
            { name: '简体中文', interface: true, audio: true, subtitles: true },
            { name: '英文', interface: true, audio: true, subtitles: true },
            { name: '日文', interface: true, audio: false, subtitles: true },
          ],
        },
      },
    }),
    prisma.game.create({
      data: {
        title: '艾尔登法环',
        slug: 'elden-ring',
        description: '《艾尔登法环》是一款由FromSoftware开发、万代南梦宫发行的动作角色扮演游戏。游戏由宫崎英高与乔治·R·R·马丁共同创作，背景设定在一个名为"交界地"的奇幻世界中。玩家将扮演"褪色者"，踏上寻找艾尔登法环碎片的旅程，成为艾尔登之王。游戏以其挑战性的战斗、开放的世界设计和深邃的剧情而闻名。',
        shortDescription: '由FromSoftware开发的开放世界动作角色扮演游戏。',
        price: 299.00,
        developer: 'FromSoftware',
        publisher: 'Bandai Namco Entertainment',
        releaseDate: new Date('2022-02-25'),
        status: 'published',
        coverImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Elden%20Ring%20game%20cover%20art&size=square_hd',
        headerImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Elden%20Ring%20game%20header%20banner&size=landscape_16_9',
        genres: {
          create: [
            { genreId: genres.find(g => g.name === '角色扮演')!.id },
            { genreId: genres.find(g => g.name === '动作')!.id },
            { genreId: genres.find(g => g.name === '冒险')!.id },
          ],
        },
        platforms: {
          create: [
            { platformId: platforms.find(p => p.name === 'Windows')!.id },
            { platformId: platforms.find(p => p.name === 'PlayStation')!.id },
            { platformId: platforms.find(p => p.name === 'Xbox')!.id },
          ],
        },
        tags: {
          create: [
            { tagId: tags.find(t => t.name === '开放世界')!.id },
            { tagId: tags.find(t => t.name === '奇幻')!.id },
            { tagId: tags.find(t => t.name === '单人游戏')!.id },
          ],
        },
        screenshots: {
          create: [
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Elden%20Ring%20game%20screenshot%201&size=landscape_16_9' },
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Elden%20Ring%20game%20screenshot%202&size=landscape_16_9' },
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Elden%20Ring%20game%20screenshot%203&size=landscape_16_9' },
          ],
        },
        features: {
          create: [
            { name: '开放世界探索' },
            { name: '挑战性战斗' },
            { name: '多种职业选择' },
            { name: '在线多人游戏' },
          ],
        },
        languages: {
          create: [
            { name: '简体中文', interface: true, audio: false, subtitles: true },
            { name: '英文', interface: true, audio: true, subtitles: true },
            { name: '日文', interface: true, audio: true, subtitles: true },
          ],
        },
      },
    }),
    prisma.game.create({
      data: {
        title: '星露谷物语',
        slug: 'stardew-valley',
        description: '《星露谷物语》是一款由ConcernedApe开发的农场模拟游戏。玩家扮演一个从城市搬到乡村的年轻人，继承了祖父的农场。游戏中，玩家可以种植作物、饲养动物、钓鱼、挖矿、社交、结婚等。游戏以其温馨的氛围、丰富的内容和自由的玩法而受到玩家喜爱。',
        shortDescription: '温馨的农场模拟游戏，体验乡村生活。',
        price: 48.00,
        developer: 'ConcernedApe',
        publisher: 'ConcernedApe',
        releaseDate: new Date('2016-02-26'),
        status: 'published',
        coverImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Stardew%20Valley%20game%20cover%20art&size=square_hd',
        headerImage: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Stardew%20Valley%20game%20header%20banner&size=landscape_16_9',
        genres: {
          create: [
            { genreId: genres.find(g => g.name === '模拟')!.id },
            { genreId: genres.find(g => g.name === '角色扮演')!.id },
            { genreId: genres.find(g => g.name === '冒险')!.id },
          ],
        },
        platforms: {
          create: [
            { platformId: platforms.find(p => p.name === 'Windows')!.id },
            { platformId: platforms.find(p => p.name === 'Mac')!.id },
            { platformId: platforms.find(p => p.name === 'Linux')!.id },
            { platformId: platforms.find(p => p.name === 'PlayStation')!.id },
            { platformId: platforms.find(p => p.name === 'Xbox')!.id },
            { platformId: platforms.find(p => p.name === 'Nintendo')!.id },
          ],
        },
        tags: {
          create: [
            { tagId: tags.find(t => t.name === '沙盒')!.id },
            { tagId: tags.find(t => t.name === '单人游戏')!.id },
            { tagId: tags.find(t => t.name === '多人游戏')!.id },
          ],
        },
        screenshots: {
          create: [
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Stardew%20Valley%20game%20screenshot%201&size=landscape_16_9' },
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Stardew%20Valley%20game%20screenshot%202&size=landscape_16_9' },
            { url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=Stardew%20Valley%20game%20screenshot%203&size=landscape_16_9' },
          ],
        },
        features: {
          create: [
            { name: '农场管理' },
            { name: '社交系统' },
            { name: '季节性变化' },
            { name: '探索洞穴' },
          ],
        },
        languages: {
          create: [
            { name: '简体中文', interface: true, audio: false, subtitles: true },
            { name: '英文', interface: true, audio: false, subtitles: true },
            { name: '日文', interface: true, audio: false, subtitles: true },
          ],
        },
      },
    }),
  ]);

  console.log('✅ 测试游戏创建完成');

  // 6. 创建测试订单和购物车
  const cart = await prisma.cart.create({
    data: {
      userId: testUser.id,
      items: {
        create: [
          { gameId: games[0].id, quantity: 1 },
          { gameId: games[1].id, quantity: 1 },
        ],
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      userId: testUser.id,
      totalAmount: 598.00,
      status: 'completed',
      paymentMethod: 'alipay',
      items: {
        create: [
          { gameId: games[0].id, title: games[0].title, price: games[0].price, quantity: 1 },
          { gameId: games[1].id, title: games[1].title, price: games[1].price, quantity: 1 },
        ],
      },
      payments: {
        create: [
          {
            transactionId: `TRX-${Date.now()}`,
            paymentMethod: 'alipay',
            amount: 598.00,
            status: 'success',
            completedAt: new Date(),
          },
        ],
      },
    },
  });

  console.log('✅ 测试订单和购物车创建完成');

  // 7. 创建测试评价和评论
  await prisma.review.create({
    data: {
      gameId: games[0].id,
      userId: testUser.id,
      content: '非常棒的游戏，画面精美，剧情丰富，推荐给所有喜欢开放世界游戏的玩家！',
      rating: 5,
      likes: 10,
    },
  });

  await prisma.comment.create({
    data: {
      gameId: games[0].id,
      userId: testUser.id,
      content: '游戏体验非常好，就是优化有点问题，希望后续更新能改善。',
      likes: 5,
    },
  });

  console.log('✅ 测试评价和评论创建完成');

  console.log('🎉 所有种子数据导入完成！');
  console.log('\n测试账号：');
  console.log('  管理员账号: admin@example.com / admin123');
  console.log('  测试用户账号: user@example.com / admin123');
  console.log('\n测试游戏：');
  games.forEach(game => {
    console.log(`  - ${game.title} (${game.price}元)`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
