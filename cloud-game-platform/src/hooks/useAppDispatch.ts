import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

// 自定义dispatch钩子，自动推断类型
export const useAppDispatch = () => useDispatch<AppDispatch>();
