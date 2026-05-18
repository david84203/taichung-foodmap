'use client'
import { Place, PlaceStatus, CATEGORY_BADGE } from '@/lib/types'

interface Props {
  place: Place
  selected: boolean
  onClick: () => void
  onDelete: () => void
  onToggleStatus: () => void
  onUpdateNote: (note: string) => void
}

const PRICE = ['', '$', '$$', '$$$', '$$$$']

export default function PlaceCard({ place, selected, onClick, onDelete, onToggleStatus, onUpdateNote }: Props) {
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
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BADGE[place.category]}`}>
              {place.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              place.status === 'want'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {place.status === 'want' ? '想去' : '已去過'}
            </span>
          </div>
          <p className="font-medium text-sm truncate">{place.name}</p>
          <p className="text-xs text-gray-400 truncate">{place.address}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {place.rating > 0 && <span className="text-xs text-gray-500">⭐ {place.rating.toFixed(1)}</span>}
            {place.priceLevel > 0 && <span className="text-xs text-gray-400">{PRICE[place.priceLevel]}</span>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-orange-200 space-y-2">
          {place.hours.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">營業時間</p>
              {place.hours.map((h, i) => (
                <p key={i} className="text-xs text-gray-600">{h}</p>
              ))}
            </div>
          )}
          {place.phone && (
            <p className="text-xs text-gray-600">📞 {place.phone}</p>
          )}
          <textarea
            value={place.note}
            onChange={e => { e.stopPropagation(); onUpdateNote(e.target.value) }}
            onClick={e => e.stopPropagation()}
            placeholder="寫下備註..."
            className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
            rows={2}
          />
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
