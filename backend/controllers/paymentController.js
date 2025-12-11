import stripe from 'stripe';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Game from '../models/Game.js';
import GameLibrary from '../models/GameLibrary.js';
import logger from '../config/logger.js';

// 初始化Stripe客户端
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// 创建支付意图
export const createPaymentIntent = async (req, res) => {
  try {
    const { gameIds } = req.body;
    const userId = req.user.id;

    // 验证游戏ID
    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的游戏ID列表',
      });
    }

    // 查找游戏信息
    const games = await Game.findAll({
      where: {
        id: gameIds,
        status: 'approved', // 只允许购买已通过审核的游戏
      },
      attributes: ['id', 'title', 'price', 'discount_price'],
    });

    if (games.length !== gameIds.length) {
      return res.status(400).json({
        success: false,
        message: '部分游戏不存在或不可购买',
      });
    }

    // 计算订单总金额
    let totalAmount = 0;
    const orderItems = [];

    games.forEach((game) => {
      // 使用折扣价格（如果有）
      const price = game.discount_price || game.price;
      totalAmount += parseFloat(price);

      orderItems.push({
        game_id: game.id,
        price,
        quantity: 1,
      });
    });

    // 创建订单
    const order = await Order.create({
      user_id: userId,
      total_amount: totalAmount,
      status: 'pending',
      payment_method: 'stripe',
    });

    // 创建订单商品
    await OrderItem.bulkCreate(
      orderItems.map((item) => ({
        order_id: order.id,
        ...item,
      })),
    );

    // 创建Stripe支付意图
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // 转换为分
      currency: 'cny',
      metadata: {
        order_id: order.id,
        user_id: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: '支付意图创建成功',
      order_id: order.id,
      clientSecret: paymentIntent.client_secret,
      total_amount: totalAmount,
      games,
    });
  } catch (error) {
    logger.error('创建支付意图错误:', error);

    return res.status(500).json({
      success: false,
      message: '创建支付意图失败',
      error: error.message,
    });
  }
};

// 确认支付
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const userId = req.user.id;

    // 验证参数
    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的支付意图ID和订单ID',
      });
    }

    // 查找订单
    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: 'pending', // 只处理待支付状态的订单
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Game,
              as: 'game',
              attributes: ['id', 'title'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或已处理',
      });
    }

    // 验证Stripe支付意图
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: '支付未成功，请重试',
      });
    }

    // 更新订单状态
    await order.update({
      status: 'paid',
      payment_method: 'stripe',
      transaction_id: paymentIntent.id,
    });

    // 将游戏添加到用户游戏库
    const gameLibraryItems = order.items.map((item) => ({
      user_id: userId,
      game_id: item.game_id,
      purchase_date: new Date(),
      playtime: 0,
    }));

    await GameLibrary.bulkCreate(gameLibraryItems);

    return res.status(200).json({
      success: true,
      message: '支付成功，游戏已添加到您的游戏库',
      order: {
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        items: order.items,
      },
    });
  } catch (error) {
    logger.error('确认支付错误:', error);

    return res.status(500).json({
      success: false,
      message: '确认支付失败',
      error: error.message,
    });
  }
};

// 获取订单历史
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 获取订单历史
    const orders = await Order.findAndCountAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Game,
              as: 'game',
              attributes: ['id', 'title', 'main_image_url'],
            },
          ],
        },
      ],
      order: [['created_at', 'desc']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true,
    });

    return res.status(200).json({
      success: true,
      message: '获取订单历史成功',
      data: {
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page, 10),
          pageSize: parseInt(limit, 10),
          totalItems: orders.count,
          totalPages: Math.ceil(orders.count / limit),
        },
      },
    });
  } catch (error) {
    logger.error('获取订单历史错误:', error);

    return res.status(500).json({
      success: false,
      message: '获取订单历史失败',
      error: error.message,
    });
  }
};

// 获取订单详情
export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // 查找订单
    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Game,
              as: 'game',
              attributes: ['id', 'title', 'main_image_url', 'price', 'discount_price'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在',
      });
    }

    return res.status(200).json({
      success: true,
      message: '获取订单详情成功',
      data: order,
    });
  } catch (error) {
    logger.error('获取订单详情错误:', error);

    return res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message,
    });
  }
};

// 处理Stripe Webhook
export const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    // 验证Webhook签名
    try {
      event = stripeClient.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      logger.error('Webhook签名验证失败:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 处理支付成功事件
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.order_id;
      const userId = paymentIntent.metadata.user_id;

      if (orderId && userId) {
        // 更新订单状态
        await Order.update(
          {
            status: 'paid',
            transaction_id: paymentIntent.id,
          },
          {
            where: {
              id: orderId,
              user_id: userId,
              status: 'pending',
            },
          },
        );

        // 将游戏添加到用户游戏库
        const orderItems = await OrderItem.findAll({
          where: { order_id: orderId },
          attributes: ['game_id'],
        });

        const gameLibraryItems = orderItems.map((item) => ({
          user_id: userId,
          game_id: item.game_id,
          purchase_date: new Date(),
          playtime: 0,
        }));

        await GameLibrary.bulkCreate(gameLibraryItems);
      }
    }

    // 处理支付失败事件
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.order_id;

      if (orderId) {
        // 更新订单状态为失败
        await Order.update(
          {
            status: 'failed',
            transaction_id: paymentIntent.id,
          },
          {
            where: {
              id: orderId,
              status: 'pending',
            },
          },
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error('处理Stripe Webhook错误:', error);
    return res.status(500).json({
      success: false,
      message: '处理Webhook失败',
    });
  }
};
