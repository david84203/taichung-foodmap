import { FoodCategory } from './types'

const TYPE_MAP: Record<string, FoodCategory> = {
  japanese_restaurant:  '日式',
  ramen_restaurant:     '拉麵',
  sushi_restaurant:     '日式',
  chinese_restaurant:   '台式',
  taiwanese_restaurant: '台式',
  noodle_restaurant:    '台式',
  dumpling_restaurant:  '台式',
  korean_restaurant:    '韓式',
  cafe:                 '咖啡甜點',
  coffee_shop:          '咖啡甜點',
  bakery:               '咖啡甜點',
  dessert_shop:         '咖啡甜點',
  ice_cream_shop:       '咖啡甜點',
  hot_pot_restaurant:   '火鍋',
  breakfast_restaurant: '早餐',
  sandwich_shop:        '西式',
  pizza_restaurant:     '西式',
  american_restaurant:  '西式',
  italian_restaurant:   '西式',
  french_restaurant:    '西式',
  juice_shop:           '飲料',
  bubble_tea_store:     '飲料',
  bar:                  '其他',
  meal_takeaway:        '其他',
}

export function categorizePlace(types: string[], name: string): FoodCategory {
  for (const t of types) {
    if (TYPE_MAP[t]) return TYPE_MAP[t]
  }

  // 名稱關鍵字補充判斷
  if (/拉麵|らーめん|ramen/i.test(name)) return '拉麵'
  if (/火鍋|鍋物|涮涮鍋/.test(name))      return '火鍋'
  if (/咖啡|coffee|café/i.test(name))     return '咖啡甜點'
  if (/甜點|蛋糕|點心|dessert/i.test(name)) return '咖啡甜點'
  if (/早餐|吐司|蛋餅|燒餅/.test(name))   return '早餐'
  if (/韓式|韓國|korea/i.test(name))      return '韓式'
  if (/日式|壽司|丼|居酒屋|燒肉/.test(name)) return '日式'
  if (/飲料|手搖|珍奶|茶飲/.test(name))   return '飲料'
  if (/pizza|漢堡|burger|義式|牛排/i.test(name)) return '西式'
  if (/小吃|滷味|鹽酥雞|臭豆腐/.test(name)) return '小吃'

  return '其他'
}
