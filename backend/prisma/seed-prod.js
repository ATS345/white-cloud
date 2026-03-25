/**
 * 生产环境种子脚本（纯 JavaScript，不需要 ts-node）
 * 在 Docker 容器中由 docker-entrypoint.sh 调用
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('开始导入种子数据...');

  // 1. 创建游戏分类
  const genreData = [
    { name: '动作', slug: 'action' },
    { name: '冒险', slug: 'adventure' },
    { name: '角色扮演', slug: 'rpg' },
    { name: '策略', slug: 'strategy' },
    { name: '模拟', slug: 'simulation' },
    { name: '体育', slug: 'sports' },
    { name: '竞速', slug: 'racing' },
    { name: '射击', slug: 'shooter' },
  ];

  const genres = [];
  for (const g of genreData) {
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    genres.push(genre);
  }
  console.log('✅ 游戏分类创建完成');

  // 2. 创建游戏平台
  const platformData = [
    { name: 'Windows', slug: 'windows' },
    { name: 'Mac', slug: 'mac' },
    { name: 'Linux', slug: 'linux' },
    { name: 'PlayStation', slug: 'playstation' },
    { name: 'Xbox', slug: 'xbox' },
    { name: 'Nintendo', slug: 'nintendo' },
  ];

  const platforms = [];
  for (const p of platformData) {
    const platform = await prisma.platform.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
    platforms.push(platform);
  }
  console.log('✅ 游戏平台创建完成');

  // 3. 创建游戏标签
  const tagData = [
    { name: '开放世界', slug: 'open-world' },
    { name: '多人游戏', slug: 'multiplayer' },
    { name: '单人游戏', slug: 'singleplayer' },
    { name: '沙盒', slug: 'sandbox' },
    { name: '生存', slug: 'survival' },
    { name: '恐怖', slug: 'horror' },
    { name: '科幻', slug: 'sci-fi' },
    { name: '奇幻', slug: 'fantasy' },
  ];

  const tags = [];
  for (const t of tagData) {
    const tag = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
    tags.push(tag);
  }
  console.log('✅ 游戏标签创建完成');

  // 4. 创建测试用户（admin123 的 bcrypt hash）
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
      displayName: '管理员',
      role: 'admin',
      emailVerified: true,
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'user',
      email: 'user@example.com',
      passwordHash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
      displayName: '测试用户',
      emailVerified: true,
    },
  });
  console.log('✅ 测试用户创建完成');

  // 5. 创建测试游戏
  const findGenre = (name) => genres.find(g => g.name === name);
  const findPlatform = (name) => platforms.find(p => p.name === name);
  const findTag = (name) => tags.find(t => t.name === name);

  const gamesData = [
    {
      title: '赛博朋克 2077',
      slug: 'cyberpunk-2077',
      description: '《赛博朋克 2077》是一款开放世界角色扮演游戏，故事发生在夜之城，一个五光十色的大都会，权力更迭和身体改造是不变的主题。',
      shortDescription: '开放世界角色扮演游戏，故事发生在夜之城。',
      price: 299.00,
      developer: 'CD Projekt Red',
      publisher: 'CD Projekt',
      releaseDate: new Date('2020-12-10'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4hna.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
      genreIds: ['角色扮演', '动作', '冒险'],
      platformIds: ['Windows', 'PlayStation', 'Xbox'],
      tagIds: ['开放世界', '科幻', '单人游戏'],
    },
    {
      title: '艾尔登法环',
      slug: 'elden-ring',
      description: '《艾尔登法环》是一款由FromSoftware开发的动作角色扮演游戏。游戏背景设定在一个名为"交界地"的奇幻世界中，玩家将扮演"褪色者"踏上寻找艾尔登法环碎片的旅程。',
      shortDescription: '由FromSoftware开发的开放世界动作角色扮演游戏。',
      price: 299.00,
      developer: 'FromSoftware',
      publisher: 'Bandai Namco Entertainment',
      releaseDate: new Date('2022-02-25'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
      genreIds: ['角色扮演', '动作', '冒险'],
      platformIds: ['Windows', 'PlayStation', 'Xbox'],
      tagIds: ['开放世界', '奇幻', '单人游戏'],
    },
    {
      title: '星露谷物语',
      slug: 'stardew-valley',
      description: '《星露谷物语》是一款由ConcernedApe开发的农场模拟游戏。玩家可以种植作物、饲养动物、钓鱼、挖矿、社交，体验悠闲的乡村生活。',
      shortDescription: '温馨的农场模拟游戏，体验乡村生活。',
      price: 48.00,
      developer: 'ConcernedApe',
      publisher: 'ConcernedApe',
      releaseDate: new Date('2016-02-26'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/xrpmydnu9rpxvxfjkiu7.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg',
      genreIds: ['模拟', '角色扮演', '冒险'],
      platformIds: ['Windows', 'Mac', 'Linux'],
      tagIds: ['沙盒', '单人游戏', '多人游戏'],
    },
    {
      title: 'Minecraft',
      slug: 'minecraft',
      description: '《Minecraft》是一款沙盒游戏，玩家可以在一个完全由方块构成的三维世界中探索、采集资源、制作物品、建造建筑，并与各种生物战斗。',
      shortDescription: '经典沙盒游戏，在方块世界中自由创造。',
      price: 165.00,
      developer: 'Mojang Studios',
      publisher: 'Mojang Studios',
      releaseDate: new Date('2011-11-18'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co498x.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1672970/header.jpg',
      genreIds: ['沙盒', '冒险', '模拟'],
      platformIds: ['Windows', 'Mac', 'Linux'],
      tagIds: ['沙盒', '多人游戏', '单人游戏'],
    },
    {
      title: '黑神话：悟空',
      slug: 'black-myth-wukong',
      description: '《黑神话：悟空》是一款以中国神话为背景的动作角色扮演游戏，玩家将扮演一位"天命人"，踏上西游之路，感受那段充满神话与传奇的历史。',
      shortDescription: '国产神话动作大作，感受东方神话的震撼。',
      price: 268.00,
      developer: 'Game Science',
      publisher: 'Game Science',
      releaseDate: new Date('2024-08-20'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7i97.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg',
      genreIds: ['动作', '角色扮演', '冒险'],
      platformIds: ['Windows', 'PlayStation'],
      tagIds: ['单人游戏', '奇幻', '开放世界'],
    },
    {
      title: '只狼：影逝二度',
      slug: 'sekiro-shadows-die-twice',
      description: '《只狼：影逝二度》是FromSoftware制作的动作冒险游戏，背景设定在战国时代的日本，玩家扮演忍者"狼"，踏上复仇之路。',
      shortDescription: '战国时代忍者动作游戏，极具挑战性。',
      price: 199.00,
      developer: 'FromSoftware',
      publisher: 'Activision',
      releaseDate: new Date('2019-03-22'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xkx.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg',
      genreIds: ['动作', '冒险', '角色扮演'],
      platformIds: ['Windows', 'PlayStation', 'Xbox'],
      tagIds: ['单人游戏', '奇幻'],
    },
    {
      title: '荒野大镖客：救赎2',
      slug: 'red-dead-redemption-2',
      description: '《荒野大镖客：救赎2》是Rockstar Games的开放世界动作冒险游戏，故事发生在1899年美国西部，玩家扮演亡命之徒亚瑟·摩根，经历一段史诗般的冒险。',
      shortDescription: '宏大的西部史诗，沉浸式开放世界体验。',
      price: 199.00,
      developer: 'Rockstar Games',
      publisher: 'Rockstar Games',
      releaseDate: new Date('2019-12-05'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
      genreIds: ['动作', '冒险', '角色扮演'],
      platformIds: ['Windows', 'PlayStation', 'Xbox'],
      tagIds: ['开放世界', '单人游戏', '多人游戏'],
    },
    {
      title: '控制',
      slug: 'control',
      description: '《控制》是一款第三人称动作冒险游戏，玩家扮演朱莉·费斯，进入神秘的联邦控制局，揭开超自然力量的秘密。',
      shortDescription: '超自然神秘动作游戏，独特的叙事风格。',
      price: 168.00,
      developer: 'Remedy Entertainment',
      publisher: '505 Games',
      releaseDate: new Date('2019-08-27'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rgi.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/870780/header.jpg',
      genreIds: ['动作', '冒险', '射击'],
      platformIds: ['Windows', 'PlayStation', 'Xbox'],
      tagIds: ['单人游戏', '科幻'],
    },
    {
      title: 'DOOM Eternal',
      slug: 'doom-eternal',
      description: '《DOOM Eternal》是一款第一人称射击游戏，玩家扮演末日战士，对抗来自地狱的恶魔入侵。极速战斗，超燃音乐，地狱猎手的终极冒险。',
      shortDescription: '极速暴力的第一人称射击，末日战士的传奇。',
      price: 128.00,
      developer: 'id Software',
      publisher: 'Bethesda Softworks',
      releaseDate: new Date('2020-03-20'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nc5.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg',
      genreIds: ['射击', '动作', '冒险'],
      platformIds: ['Windows', 'PlayStation', 'Xbox'],
      tagIds: ['单人游戏', '多人游戏', '科幻'],
    },
    {
      title: '文明VI',
      slug: 'civilization-vi',
      description: '《文明VI》是Firaxis Games开发的回合制策略游戏，玩家带领一个文明从石器时代发展到太空时代，与其他文明竞争，争夺世界霸权。',
      shortDescription: '经典回合制策略游戏，带领文明走向辉煌。',
      price: 198.00,
      developer: 'Firaxis Games',
      publisher: '2K Games',
      releaseDate: new Date('2016-10-21'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tml.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/289070/header.jpg',
      genreIds: ['策略', '模拟'],
      platformIds: ['Windows', 'Mac', 'Linux'],
      tagIds: ['多人游戏', '单人游戏', '沙盒'],
    },
    {
      title: '死亡细胞',
      slug: 'dead-cells',
      description: '《死亡细胞》是一款动作类Roguevania游戏，结合了随机生成地图与永久死亡机制，玩家在充满危机的城堡中不断死亡、学习、变强。',
      shortDescription: '极具挑战性的Roguevania动作游戏。',
      price: 68.00,
      developer: 'Motion Twin',
      publisher: 'Motion Twin',
      releaseDate: new Date('2018-08-07'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tbr.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/588650/header.jpg',
      genreIds: ['动作', '冒险', '角色扮演'],
      platformIds: ['Windows', 'Mac', 'Linux'],
      tagIds: ['单人游戏', '奇幻'],
    },
    {
      title: '空洞骑士',
      slug: 'hollow-knight',
      description: '《空洞骑士》是一款2D动作冒险游戏，发生在充满奇异昆虫和英雄的王国霍洛奈斯特。玩家探索幽深黑暗的地下王国，揭开其中的秘密。',
      shortDescription: '精美的2D地下探索冒险游戏。',
      price: 45.00,
      developer: 'Team Cherry',
      publisher: 'Team Cherry',
      releaseDate: new Date('2017-02-24'),
      status: 'published',
      coverImage: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8mmt.webp',
      headerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/367520/header.jpg',
      genreIds: ['动作', '冒险', '角色扮演'],
      platformIds: ['Windows', 'Mac', 'Linux'],
      tagIds: ['单人游戏', '奇幻'],
    },
  ];

  const games = [];
  for (const gameData of gamesData) {
    const { genreIds, platformIds, tagIds, ...data } = gameData;

    const existing = await prisma.game.findUnique({ where: { slug: data.slug } });
    if (existing) {
      games.push(existing);
      continue;
    }

    const game = await prisma.game.create({
      data: {
        ...data,
        genres: {
          create: genreIds.map(name => ({
            genreId: findGenre(name)?.id,
          })).filter(x => x.genreId),
        },
        platforms: {
          create: platformIds.map(name => ({
            platformId: findPlatform(name)?.id,
          })).filter(x => x.platformId),
        },
        tags: {
          create: tagIds.map(name => ({
            tagId: findTag(name)?.id,
          })).filter(x => x.tagId),
        },
        screenshots: {
          create: [
            { url: `https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_1.jpg`, sortOrder: 0 },
            { url: `https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/ss_2.jpg`, sortOrder: 1 },
          ],
        },
        features: {
          create: [
            { name: '单人游戏' },
            { name: '成就系统' },
            { name: '控制器支持' },
          ],
        },
        languages: {
          create: [
            { name: '简体中文', interface: true, audio: false, subtitles: true },
            { name: '英文', interface: true, audio: true, subtitles: true },
          ],
        },
      },
    });
    games.push(game);
  }
  console.log('✅ 测试游戏创建完成');

  // 6. 创建测试购物车和订单
  const existingCart = await prisma.cart.findUnique({ where: { userId: testUser.id } });
  if (!existingCart && games.length >= 2) {
    await prisma.cart.create({
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
  }

  const existingOrder = await prisma.order.findFirst({ where: { userId: testUser.id } });
  if (!existingOrder && games.length >= 2) {
    await prisma.order.create({
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
          create: [{
            transactionId: `TRX-${Date.now()}`,
            paymentMethod: 'alipay',
            amount: 598.00,
            status: 'success',
            completedAt: new Date(),
          }],
        },
      },
    });
  }
  console.log('✅ 测试订单和购物车创建完成');

  // 7. 创建测试评价
  if (games.length > 0) {
    const existingReview = await prisma.review.findFirst({ where: { userId: testUser.id } });
    if (!existingReview) {
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
    }
  }
  console.log('✅ 测试评价和评论创建完成');

  console.log('\n🎉 所有种子数据导入完成！');
  console.log('\n测试账号：');
  console.log('  管理员: admin@example.com / admin123');
  console.log('  用户:   user@example.com / admin123');
  console.log(`\n已创建 ${games.length} 款游戏`);
}

main()
  .catch((e) => {
    console.error('种子数据导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
