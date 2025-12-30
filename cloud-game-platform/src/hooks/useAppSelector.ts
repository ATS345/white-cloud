import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { RootState } from '../store';

// 自定义selector钩子，自动推断类型
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
