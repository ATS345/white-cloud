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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
describe('Authentication Routes', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('username', 'testuser');
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).toHaveProperty('token');
        }));
        it('should return 400 for missing fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({
                username: 'testuser'
            });
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            // First register a user
            yield (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({
                username: 'loginuser',
                email: 'login@example.com',
                password: 'password123'
            });
            // Then login with the same credentials
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'login@example.com',
                password: 'password123'
            });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('username', 'loginuser');
            expect(response.body).toHaveProperty('email', 'login@example.com');
            expect(response.body).toHaveProperty('token');
        }));
        it('should return 401 for invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'invalid@example.com',
                password: 'wrongpassword'
            });
            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
});
