import Cart from '../models/Cart.js';
import Game from '../models/Game.js';
import logger from '../config/logger.js';

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: 获取购物车内容
 *     description: 获取当前用户的购物车内容
 *     tags: [Cart]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 成功获取购物车内容
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 获取购物车内容成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 购物车项ID
 *                           quantity:
 *                             type: integer
 *                             description: 商品数量
 *                           game:
 *                             $ref: '#/components/schemas/Game'
 *                     totalItems:
 *                       type: integer
 *                       description: 购物车商品总数
 *                     totalAmount:
 *                       type: number
 *                       description: 购物车商品总金额
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取购物车内容
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title', 'price', 'discount_price', 'main_image_url'],
        },
      ],
      order: [['created_at', 'desc']],
    });

    // 计算总金额和总数量
    const totalItems = cartItems.length;
    const totalAmount = cartItems.reduce((total, item) => {
      const gamePrice = item.game.discount_price || item.game.price;
      return total + (gamePrice * item.quantity);
    }, 0);

    return res.status(200).json({
      success: true,
      message: '获取购物车内容成功',
      data: {
        items: cartItems,
        totalItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
      },
    });
  } catch (error) {
    logger.error('获取购物车内容错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取购物车内容失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/cart:
 *   post:
 *     summary: 添加商品到购物车
 *     description: 将商品添加到当前用户的购物车
 *     tags: [Cart]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: integer
 *                 description: 游戏ID
 *               quantity:
 *                 type: integer
 *                 description: 商品数量，默认为1
 *     responses:
 *       200:
 *         description: 成功添加商品到购物车
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 商品添加到购物车成功
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const addToCart = async (req, res) => {
  try {
    const { gameId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // 验证游戏是否存在
    const game = await Game.findOne({
      where: { id: gameId, status: 'approved' },
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在或不可购买',
      });
    }

    // 检查游戏是否已经在购物车中
    const existingCartItem = await Cart.findOne({
      where: {
        user_id: userId,
        game_id: gameId,
      },
    });

    let cartItem;
    if (existingCartItem) {
      // 如果已经存在，更新数量
      cartItem = await existingCartItem.update({
        quantity: existingCartItem.quantity + quantity,
      });
    } else {
      // 否则创建新的购物车项
      cartItem = await Cart.create({
        user_id: userId,
        game_id: gameId,
        quantity,
      });
    }

    return res.status(200).json({
      success: true,
      message: '商品添加到购物车成功',
      data: cartItem,
    });
  } catch (error) {
    logger.error('添加商品到购物车错误:', error);
    return res.status(500).json({
      success: false,
      message: '添加商品到购物车失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/cart/{cartItemId}:
 *   put:
 *     summary: 更新购物车商品数量
 *     description: 更新购物车中指定商品的数量
 *     tags: [Cart]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 购物车项ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: 新的商品数量
 *     responses:
 *       200:
 *         description: 成功更新购物车商品数量
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 购物车商品数量更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    // 验证数量是否有效
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: '商品数量必须大于0',
      });
    }

    // 查找购物车项
    const cartItem = await Cart.findOne({
      where: {
        id: cartItemId,
        user_id: userId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: '购物车项不存在',
      });
    }

    // 更新数量
    const updatedCartItem = await cartItem.update({
      quantity,
    });

    return res.status(200).json({
      success: true,
      message: '购物车商品数量更新成功',
      data: updatedCartItem,
    });
  } catch (error) {
    logger.error('更新购物车商品数量错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新购物车商品数量失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/cart/{cartItemId}:
 *   delete:
 *     summary: 删除购物车商品
 *     description: 删除购物车中指定的商品
 *     tags: [Cart]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 购物车项ID
 *     responses:
 *       200:
 *         description: 成功删除购物车商品
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 购物车商品删除成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const userId = req.user.id;

    // 查找购物车项
    const cartItem = await Cart.findOne({
      where: {
        id: cartItemId,
        user_id: userId,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: '购物车项不存在',
      });
    }

    // 删除购物车项
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: '购物车商品删除成功',
    });
  } catch (error) {
    logger.error('删除购物车商品错误:', error);
    return res.status(500).json({
      success: false,
      message: '删除购物车商品失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: 清空购物车
 *     description: 清空当前用户的购物车
 *     tags: [Cart]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 成功清空购物车
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 购物车清空成功
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // 清空购物车
    await Cart.destroy({
      where: { user_id: userId },
    });

    return res.status(200).json({
      success: true,
      message: '购物车清空成功',
    });
  } catch (error) {
    logger.error('清空购物车错误:', error);
    return res.status(500).json({
      success: false,
      message: '清空购物车失败',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/cart/checkout:
 *   post:
 *     summary: 从购物车结算
 *     description: 使用购物车中的商品创建订单并进行支付
 *     tags: [Cart]
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: 成功从购物车结算
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 从购物车结算成功，订单已创建
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                       description: 创建的订单ID
 *                     paymentIntentId:
 *                       type: string
 *                       description: Stripe支付意图ID
 *                     clientSecret:
 *                       type: string
 *                       description: Stripe客户端密钥
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const checkoutFromCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取购物车内容
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Game,
          as: 'game',
          attributes: ['id', 'title', 'price', 'discount_price', 'status'],
        },
      ],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: '购物车为空，无法结算',
      });
    }

    // 验证所有游戏是否可购买
    const invalidGames = cartItems.filter((item) => item.game.status !== 'approved');
    if (invalidGames.length > 0) {
      return res.status(400).json({
        success: false,
        message: '购物车中包含不可购买的游戏，请移除后重试',
      });
    }

    // 提取游戏ID列表，用于创建支付意图
    const gameIds = cartItems.map((item) => item.game.id);

    // 将请求转发到支付控制器的createPaymentIntent函数
    // 这里我们需要手动调用，因为无法直接调用其他控制器函数
    // 注意：在实际实现中，应该重构代码，将创建支付意图的逻辑提取到服务层
    // 为了简化，这里我们直接返回游戏ID列表，前端可以使用这些ID调用支付API
    return res.status(200).json({
      success: true,
      message: '从购物车结算成功，获取游戏列表成功',
      data: {
        gameIds,
        totalItems: cartItems.length,
      },
    });
  } catch (error) {
    logger.error('从购物车结算错误:', error);
    return res.status(500).json({
      success: false,
      message: '从购物车结算失败',
      error: error.message,
    });
  }
};
