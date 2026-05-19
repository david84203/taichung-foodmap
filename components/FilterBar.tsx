'use client'
import { ALL_CATEGORIES, FoodCategory, PlaceStatus } from '@/lib/types'

interface Props {
  activeCategories: FoodCategory[]
  activeStatus: PlaceStatus | null
  onCategoryToggle: (c: FoodCategory) => void
  onStatusChange: (s: PlaceStatus | null) => void
  total: number
}

export default function FilterBar({ activeCategories, activeStatus, onCategoryToggle, onStatusChange, total }: Props) {
  return (
    <div className="p-3 border-b border-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {([null, 'want', 'visited'] as (PlaceStatus | null)[]).map(s => (
            <button
              key={String(s)}
              onClick={() => onStatusChange(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeStatus === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === null ? '全部' : s === 'want' ? '想去' : '已去過'}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-600">{total} 間</span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {ALL_CATEGORIES.map(c => {
          const active = activeCategories.includes(c)
          return (
            <button
              key={c}
              onClick={() => onCategoryToggle(c)}
              className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
                active
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          )
        })}
        {activeCategories.length > 0 && (
          <button
            onClick={() => activeCategories.forEach(c => onCategoryToggle(c))}
            className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
          >
            清除
          </button>
        )}
      </div>
    </div>
  )
}
