"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
    collectCoverageFrom: [
        '<rootDir>/src/**/*.{ts,tsx}',
        '!<rootDir>/src/**/*.d.ts',
    ],
    coverageDirectory: '<rootDir>/coverage',
};
exports.default = config;
