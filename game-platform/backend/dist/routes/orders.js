"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const stripe_1 = require("../services/stripe");
const router = express_1.default.Router();
// Mock orders database
let orders = [];
let nextOrderId = 1;
// Mock downloads database
let downloads = [];
let nextDownloadId = 1;
// Mock games database
const games = [
    { id: 1, title: 'Cyberpunk 2077', price: 29.99 },
    { id: 2, title: 'The Witcher 3: Wild Hunt', price: 19.99 },
    { id: 3, title: 'Red Dead Redemption 2', price: 39.99 },
    { id: 4, title: 'Grand Theft Auto V', price: 29.99 },
    { id: 5, title: 'Elden Ring', price: 59.99 },
    { id: 6, title: 'God of War Ragnarök', price: 59.99 }
];
// Create order
router.post('/', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { items } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
    }
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item) => {
        const game = games.find(g => g.id === item.game_id);
        if (!game) {
            return res.status(404).json({ error: `Game with ID ${item.game_id} not found` });
        }
        const itemTotal = game.price * (item.quantity || 1);
        totalAmount += itemTotal;
        return {
            game_id: game.id,
            title: game.title,
            price: game.price,
            quantity: item.quantity || 1,
            total: itemTotal
        };
    });
    // Create new order
    const newOrder = {
        id: nextOrderId++,
        user_id: userId,
        total_amount: totalAmount,
        payment_status: 'pending',
        payment_method: null,
        transaction_id: null,
        items: orderItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    orders.push(newOrder);
    // Create payment intent with Stripe
    try {
        const paymentIntent = yield (0, stripe_1.createPaymentIntent)(totalAmount, 'usd', newOrder.id.toString());
        res.status(201).json(Object.assign(Object.assign({}, newOrder), { payment_intent_id: paymentIntent.id, client_secret: paymentIntent.client_secret }));
    }
    catch (error) {
        console.error('Error creating payment intent:', error);
        // Return order without payment intent if Stripe fails
        res.status(201).json(newOrder);
    }
}));
// Get user orders
router.get('/', auth_1.authMiddleware, (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userOrders = orders.filter(order => order.user_id === userId);
    res.status(200).json(userOrders);
});
// Get order by ID
router.get('/:id', auth_1.authMiddleware, (req, res) => {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const order = orders.find(order => order.id === parseInt(Array.isArray(id) ? id[0] : id) && order.user_id === userId);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
});
// Pay for order
router.put('/:id/pay', auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { payment_method_id, payment_intent_id } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const orderIndex = orders.findIndex(order => order.id === parseInt(Array.isArray(id) ? id[0] : id) && order.user_id === userId);
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }
    if (orders[orderIndex].payment_status === 'completed') {
        return res.status(400).json({ error: 'Order is already paid' });
    }
    try {
        // Confirm payment with Stripe
        const paymentIntent = yield (0, stripe_1.confirmPaymentIntent)(payment_intent_id, payment_method_id);
        // Update order only if payment was successful
        if (paymentIntent.status === 'succeeded') {
            orders[orderIndex] = Object.assign(Object.assign({}, orders[orderIndex]), { payment_status: 'completed', payment_method: 'card', transaction_id: paymentIntent.id, updated_at: new Date().toISOString() });
            res.status(200).json(orders[orderIndex]);
        }
        else {
            res.status(400).json({ error: 'Payment failed', payment_status: paymentIntent.status });
        }
    }
    catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Payment processing failed' });
    }
}));
// Get user downloads
router.get('/downloads', auth_1.authMiddleware, (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const userDownloads = downloads.filter(download => download.user_id === userId);
    res.status(200).json(userDownloads);
});
// Download game (create download record)
router.post('/downloads/:gameId', auth_1.authMiddleware, (req, res) => {
    var _a;
    const { gameId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const parsedGameId = parseInt(Array.isArray(gameId) ? gameId[0] : gameId);
    const game = games.find(g => g.id === parsedGameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    // Check if user has purchased the game (simplified check - in real app, check orders)
    const hasPurchased = orders.some(order => order.user_id === userId &&
        order.payment_status === 'completed' &&
        order.items.some((item) => item.game_id === parsedGameId));
    if (!hasPurchased) {
        return res.status(403).json({ error: 'You must purchase this game before downloading' });
    }
    // Create download record
    const newDownload = {
        id: nextDownloadId++,
        user_id: userId,
        game_id: parsedGameId,
        game_title: game.title,
        download_date: new Date().toISOString(),
        ip_address: req.ip || 'unknown'
    };
    downloads.push(newDownload);
    // Generate download URL (simplified - in real app, generate signed URL)
    const downloadUrl = `http://localhost:3001/api/games/${gameId}/download`;
    res.status(201).json({
        download_id: newDownload.id,
        game_id: newDownload.game_id,
        game_title: newDownload.game_title,
        download_url: downloadUrl,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours expiry
    });
});
exports.default = router;
