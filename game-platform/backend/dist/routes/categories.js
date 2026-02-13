"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Mock categories
const categories = [
    { id: 1, name: 'Action', slug: 'action' },
    { id: 2, name: 'Role-playing', slug: 'role-playing' },
    { id: 3, name: 'Open World', slug: 'open-world' },
    { id: 4, name: 'Adventure', slug: 'adventure' },
    { id: 5, name: 'Strategy', slug: 'strategy' },
    { id: 6, name: 'Simulation', slug: 'simulation' },
    { id: 7, name: 'Sports', slug: 'sports' },
    { id: 8, name: 'Racing', slug: 'racing' }
];
// Get all categories
router.get('/', (req, res) => {
    res.status(200).json(categories);
});
// Get category by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const category = categories.find(cat => cat.id === parseInt(id));
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(category);
});
exports.default = router;
