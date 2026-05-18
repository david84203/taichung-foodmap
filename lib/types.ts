export type PlaceStatus = 'want' | 'visited'

export type FoodCategory =
  | '早餐'
  | '咖啡甜點'
  | '台式'
  | '日式'
  | '火鍋'
  | '拉麵'
  | '韓式'
  | '西式'
  | '小吃'
  | '飲料'
  | '其他'

export const ALL_CATEGORIES: FoodCategory[] = [
  '早餐', '咖啡甜點', '台式', '日式', '火鍋', '拉麵', '韓式', '西式', '小吃', '飲料', '其他',
]

export const CATEGORY_COLOR: Record<FoodCategory, string> = {
  '早餐':   '#F59E0B',
  '咖啡甜點': '#8B5CF6',
  '台式':   '#EF4444',
  '日式':   '#3B82F6',
  '火鍋':   '#F97316',
  '拉麵':   '#EC4899',
  '韓式':   '#14B8A6',
  '西式':   '#6366F1',
  '小吃':   '#84CC16',
  '飲料':   '#06B6D4',
  '其他':   '#9CA3AF',
}

export const CATEGORY_BADGE: Record<FoodCategory, string> = {
  '早餐':   'bg-amber-100 text-amber-700',
  '咖啡甜點': 'bg-purple-100 text-purple-700',
  '台式':   'bg-red-100 text-red-700',
  '日式':   'bg-blue-100 text-blue-700',
  '火鍋':   'bg-orange-100 text-orange-700',
  '拉麵':   'bg-pink-100 text-pink-700',
  '韓式':   'bg-teal-100 text-teal-700',
  '西式':   'bg-indigo-100 text-indigo-700',
  '小吃':   'bg-lime-100 text-lime-700',
  '飲料':   'bg-cyan-100 text-cyan-700',
  '其他':   'bg-gray-100 text-gray-600',
}

export interface Place {
  id: string
  placeId: string
  name: string
  address: string
  category: FoodCategory
  lat: number
  lng: number
  phone: string
  hours: string[]
  priceLevel: number   // 0 = unknown, 1–4
  rating: number
  mapsUrl: string
  status: PlaceStatus
  note: string
  addedAt: number
}
