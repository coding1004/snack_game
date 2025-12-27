
export enum FoodType {
  TTEOKBOKKI = 'TTEOKBOKKI',
  KIMBAP = 'KIMBAP',
  RAMEN = 'RAMEN',
  TWIGIM = 'TWIGIM',
  SODA = 'SODA'
}

export interface FoodInfo {
  id: FoodType;
  name: string;
  emoji: string;
  price: number;
  cookTime: number; // in seconds
}

export enum CustomerState {
  WAITING_TABLE = 'WAITING_TABLE',
  ORDERING = 'ORDERING',
  WAITING_FOOD = 'WAITING_FOOD',
  EATING = 'EATING',
  FINISHED = 'FINISHED',
  LEAVING = 'LEAVING'
}

export interface Customer {
  id: string;
  tableId: number | null;
  state: CustomerState;
  order: FoodType[];
  initialOrder: FoodType[]; // 가격 계산을 위해 원본 주문 저장
  patience: number; // 0 to 100
  spawnTime: number;
  eatingStartTime?: number;
}

export interface Table {
  id: number;
  isOccupied: boolean;
  customerId: string | null;
  needsCleaning: boolean;
}
