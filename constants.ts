
import { FoodType, FoodInfo } from './types';

export const FOOD_DATA: Record<FoodType, FoodInfo> = {
  [FoodType.TTEOKBOKKI]: { id: FoodType.TTEOKBOKKI, name: '떡볶이', emoji: '🥘', price: 3500, cookTime: 3 },
  [FoodType.KIMBAP]: { id: FoodType.KIMBAP, name: '김밥', emoji: '🍱', price: 3000, cookTime: 4 },
  [FoodType.RAMEN]: { id: FoodType.RAMEN, name: '라면', emoji: '🍜', price: 4000, cookTime: 5 },
  [FoodType.TWIGIM]: { id: FoodType.TWIGIM, name: '튀김', emoji: '🍤', price: 2500, cookTime: 2 },
  [FoodType.SODA]: { id: FoodType.SODA, name: '콜라', emoji: '🥤', price: 1500, cookTime: 1 },
};

export const INITIAL_TABLES = [
  { id: 1, isOccupied: false, customerId: null, needsCleaning: false },
  { id: 2, isOccupied: false, customerId: null, needsCleaning: false },
  { id: 3, isOccupied: false, customerId: null, needsCleaning: false },
  { id: 4, isOccupied: false, customerId: null, needsCleaning: false },
  { id: 5, isOccupied: false, customerId: null, needsCleaning: false },
  { id: 6, isOccupied: false, customerId: null, needsCleaning: false },
];

export const GAME_DURATION = 120; // 2 minutes
export const MAX_PATIENCE = 100;
export const PATIENCE_DECAY_RATE = 2.5; // per second
