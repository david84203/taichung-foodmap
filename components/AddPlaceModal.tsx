'use client'
import { useState } from 'react'
import { Place, PlaceStatus } from '@/lib/types'
import { categorizePlace } from '@/lib/categorize'

interface SearchResult {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
}

interface Props {
  onAdd: (place: Omit<Place, 'id' | 'addedAt'>) => void
  onClose: () => void
}

export default function AddPlaceModal({ onAdd, onClose }: Props) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [note, setNote]       = useState('')
  const [status, setStatus]   = useState<PlaceStatus>('want')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError('')
    setResults([])
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!data.length) setError('找不到結果，試試加上更多關鍵字')
      setResults(data)
    } catch {
      setError('搜尋失敗，請稍後再試')
    }
    setLoading(false)
  }

  async function handleConfirm(result: SearchResult) {
    setLoading(true)
    try {
      const res    = await fetch(`/api/place-details?id=${result.placeId}`)
      const detail = await res.json()
      const category = categorizePlace(detail.types, detail.name)
      onAdd({
        placeId:    detail.placeId,
        name:       detail.name,
        address:    detail.address,
        category,
        lat:        detail.lat,
        lng:        detail.lng,
        phone:      detail.phone,
        hours:      detail.hours,
        priceLevel: detail.priceLevel,
        rating:     detail.rating,
        mapsUrl:    detail.mapsUrl,
        status,
        note,
      })
    } catch {
      setError('加入失敗，請稍後再試')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">新增餐廳</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="p-5">
          {!selected ? (
            <>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="輸入店名，例：春水堂、阿水麵線台中"
                  className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? '...' : '搜尋'}
                </button>
              </div>

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              {results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-1">請選擇正確地點：</p>
                  {results.map(r => (
                    <button
                      key={r.placeId}
                      onClick={() => setSelected(r)}
                      className="w-full text-left border rounded-xl p-3 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.address}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="border border-orange-200 bg-orange-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-sm">{selected.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selected.address}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-600 mb-2">狀態</p>
                <div className="flex gap-2">
                  {(['want', 'visited'] as PlaceStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        status === s
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {s === 'want' ? '想去 🤤' : '已去過 ✓'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs font-medium text-gray-600 mb-2">備註（選填）</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Han 說湯很棒、停車很難找..."
                  className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  rows={3}
                />
              </div>

              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => { setSelected(null); setError('') }}
                  className="flex-1 border rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  ← 重新搜尋
                </button>
                <button
                  onClick={() => handleConfirm(selected)}
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? '加入中...' : '加入地圖 🗺️'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
