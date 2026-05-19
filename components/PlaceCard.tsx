'use client'
import { useState } from 'react'
import { Place, PlaceStatus, FoodCategory, ALL_CATEGORIES, CATEGORY_BADGE } from '@/lib/types'

interface Props {
  place: Place
  selected: boolean
  onClick: () => void
  onDelete: () => void
  onToggleStatus: () => void
  onUpdateNotes: (notePublic: string, notePrivate: string) => void
  onUpdateCategory: (category: FoodCategory) => void
}


export default function PlaceCard({ place, selected, onClick, onDelete, onToggleStatus, onUpdateNotes, onUpdateCategory }: Props) {
  const [editingCategory, setEditingCategory] = useState(false)

  return (
    <div
      className={`border rounded-xl p-3 cursor-pointer transition-colors ${
        selected ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <button
              onClick={e => { e.stopPropagation(); setEditingCategory(v => !v) }}
              className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-70 transition-opacity ${CATEGORY_BADGE[place.category]}`}
              title="點擊更改分類"
            >
              {place.category} ✎
            </button>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              place.status === 'want'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {place.status === 'want' ? '想去' : '已去過'}
            </span>
          </div>

          {/* 分類選擇器 */}
          {editingCategory && (
            <div
              className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 rounded-xl border border-gray-200"
              onClick={e => e.stopPropagation()}
            >
              {ALL_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    onUpdateCategory(c)
                    setEditingCategory(false)
                  }}
                  className={`text-xs px-2 py-0.5 rounded-full transition-opacity ${
                    c === place.category
                      ? CATEGORY_BADGE[c] + ' ring-2 ring-offset-1 ring-current'
                      : CATEGORY_BADGE[c] + ' opacity-50 hover:opacity-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          <p className="font-semibold text-sm text-gray-900 truncate">{place.name}</p>
          <p className="text-xs text-gray-600 truncate">{place.address}</p>
          {place.rating > 0 && (
            <span className="text-xs text-gray-600 mt-0.5 block">⭐ {place.rating.toFixed(1)}</span>
          )}
        </div>
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-orange-200 space-y-2">
          {place.hours.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">營業時間</p>
              {place.hours.map((h, i) => (
                <p key={i} className="text-xs text-gray-600">{h}</p>
              ))}
            </div>
          )}
          {place.phone && (
            <p className="text-xs text-gray-600">📞 {place.phone}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">🌐 網友說</p>
              <textarea
                value={place.notePublic ?? ''}
                onChange={e => { e.stopPropagation(); onUpdateNotes(e.target.value, place.notePrivate ?? '') }}
                onClick={e => e.stopPropagation()}
                placeholder="網路評價、推薦菜色..."
                className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                rows={3}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">📝 我們紀錄</p>
              <textarea
                value={place.notePrivate ?? place.note ?? ''}
                onChange={e => { e.stopPropagation(); onUpdateNotes(place.notePublic ?? '', e.target.value) }}
                onClick={e => e.stopPropagation()}
                placeholder="自己的心得、停車資訊..."
                className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-1.5">
            <a
              href={place.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-1 text-center text-xs bg-blue-500 text-white rounded-lg py-1.5 hover:bg-blue-600"
            >
              Google Maps
            </a>
            <button
              onClick={e => { e.stopPropagation(); onToggleStatus() }}
              className="flex-1 text-xs bg-green-500 text-white rounded-lg py-1.5 hover:bg-green-600"
            >
              {place.status === 'want' ? '✓ 已去過' : '↩ 改想去'}
            </button>
            <button
              onClick={e => { e.stopPropagation(); if (confirm(`刪除「${place.name}」？`)) onDelete() }}
              className="text-xs bg-red-100 text-red-500 rounded-lg px-3 py-1.5 hover:bg-red-200"
            >
              刪
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
