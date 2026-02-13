"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Mock reviews database
let reviews = [];
let nextReviewId = 1;
// Mock users database
const users = [
    { id: 1, username: 'user1', avatar: '' },
    { id: 2, username: 'user2', avatar: '' },
    { id: 3, username: 'user3', avatar: '' }
];
// Get game reviews
router.get('/games/:gameId/reviews', (req, res) => {
    const { gameId } = req.params;
    const gameReviews = reviews.filter(review => review.game_id === parseInt(Array.isArray(gameId) ? gameId[0] : gameId));
    res.status(200).json(gameReviews);
});
// Create review
router.post('/games/:gameId/reviews', auth_1.authMiddleware, (req, res) => {
    var _a;
    const { gameId } = req.params;
    const { rating, content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!rating || !content) {
        return res.status(400).json({ error: 'Rating and content are required' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    // Create new review
    const newReview = {
        id: nextReviewId++,
        user_id: userId,
        game_id: parseInt(Array.isArray(gameId) ? gameId[0] : gameId),
        rating,
        content,
        user: {
            id: userId,
            username: `User${userId}`,
            avatar: `https://ui-avatars.com/api/?name=User+${userId}&background=random`
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    reviews.push(newReview);
    res.status(201).json(newReview);
});
// Update review
router.put('/reviews/:id', auth_1.authMiddleware, (req, res) => {
    var _a;
    const { id } = req.params;
    const { rating, content } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const reviewIndex = reviews.findIndex(review => review.id === parseInt(Array.isArray(id) ? id[0] : id) && review.user_id === userId);
    if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found' });
    }
    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    // Update review
    reviews[reviewIndex] = Object.assign(Object.assign({}, reviews[reviewIndex]), { rating: rating || reviews[reviewIndex].rating, content: content || reviews[reviewIndex].content, updated_at: new Date().toISOString() });
    res.status(200).json(reviews[reviewIndex]);
});
// Delete review
router.delete('/reviews/:id', auth_1.authMiddleware, (req, res) => {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const reviewIndex = reviews.findIndex(review => review.id === parseInt(Array.isArray(id) ? id[0] : id) && review.user_id === userId);
    if (reviewIndex === -1) {
        return res.status(404).json({ error: 'Review not found' });
    }
    // Delete review
    reviews.splice(reviewIndex, 1);
    res.status(200).json({ message: 'Review deleted successfully' });
});
exports.default = router;
