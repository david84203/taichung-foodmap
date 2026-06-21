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

interface ParsedStore {
  storeName: string
  area: string
  dishes: string
}

interface Props {
  onAdd: (place: Omit<Place, 'id' | 'addedAt'>) => Promise<void>
  onClose: () => void
}

export default function AddPlaceModal({ onAdd, onClose }: Props) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [notePublic, setNotePublic]   = useState('')
  const [notePrivate, setNotePrivate] = useState('')
  const [status, setStatus]   = useState<PlaceStatus>('want')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [pasteText, setPasteText] = useState('')
  const [parsing, setParsing]     = useState(false)
  const [parseHint, setParseHint] = useState('')
  const [parsedStores, setParsedStores] = useState<ParsedStore[]>([])
  const [doneNames, setDoneNames] = useState<string[]>([])
  const [currentStore, setCurrentStore] = useState<ParsedStore | null>(null)

  async function handleSearch(searchQuery?: string) {
    const q = (searchQuery ?? query).trim()
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

  async function handleParse() {
    const t = pasteText.trim()
    if (!t) return
    setParsing(true)
    setError('')
    setParseHint('')
    setResults([])
    setParsedStores([])
    setDoneNames([])
    try {
      const res  = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t }),
      })
      const data = await res.json()
      if (data.needsText) {
        setError('這個連結抓不到內容（IG/Threads 常擋）。請改成在 App 裡複製貼文文字再貼進來。')
        setParsing(false)
        return
      }
      const stores: ParsedStore[] = data.stores ?? []
      if (stores.length === 0) {
        setError('讀不到店名，可手動在下面搜尋，或補貼更多文字。')
        setParsing(false)
        return
      }
      setParsedStores(stores)
      setParsing(false)
      // 只有一間就直接帶去搜尋；多間則列清單讓使用者逐一處理
      if (stores.length === 1) {
        await pickStore(stores[0])
      } else {
        setParseHint(`判讀到 ${stores.length} 間，請逐一點選加入`)
      }
    } catch {
      setError('判讀失敗，請稍後再試')
      setParsing(false)
    }
  }

  async function pickStore(store: ParsedStore) {
    setCurrentStore(store)
    setNotePublic(store.dishes)
    setNotePrivate('')
    const q = [store.storeName, store.area].filter(Boolean).join(' ')
    setQuery(q)
    setParseHint(`搜尋中：${store.storeName}${store.area ? `（${store.area}）` : ''}`)
    await handleSearch(q)
  }

  async function handleConfirm(result: SearchResult) {
    setLoading(true)
    try {
      const res    = await fetch(`/api/place-details?id=${result.placeId}`)
      const detail = await res.json()
      const category = categorizePlace(detail.types, detail.name)
      await onAdd({
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
        note: '',
        notePublic,
        notePrivate,
      })
      // 多間模式：標記完成、回到清單繼續下一間；否則關閉視窗
      if (parsedStores.length > 1) {
        if (currentStore) setDoneNames(prev => [...prev, currentStore.storeName])
        setSelected(null)
        setResults([])
        setQuery('')
        setNotePublic('')
        setNotePrivate('')
        setStatus('want')
        setCurrentStore(null)
        setLoading(false)
      } else {
        onClose()
      }
    } catch {
      setError('加入失敗，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-800">新增餐廳</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="p-5 overflow-y-auto">
          {!selected ? (
            <>
              {/* 模式一：找候選地點（手動搜尋或從判讀清單點進來後） */}
              {results.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">請選擇正確地點：</p>
                    {parsedStores.length > 1 && (
                      <button
                        onClick={() => { setResults([]); setError('') }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ← 回清單
                      </button>
                    )}
                  </div>
                  {results.map(r => (
                    <button
                      key={r.placeId}
                      onClick={() => setSelected(r)}
                      className="w-full text-left border rounded-xl p-3 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{r.address}</p>
                    </button>
                  ))}
                </div>
              ) : parsedStores.length > 1 ? (
                /* 模式二：判讀到多間，逐一點選加入 */
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    文章裡的店家（已加入 {doneNames.length}/{parsedStores.length}）
                  </p>
                  <div className="space-y-2">
                    {parsedStores.map((s, i) => {
                      const done = doneNames.includes(s.storeName)
                      return (
                        <button
                          key={i}
                          onClick={() => !done && pickStore(s)}
                          disabled={done || loading}
                          className={`w-full text-left border rounded-xl p-3 transition-colors ${
                            done
                              ? 'bg-gray-50 border-gray-200 text-gray-400'
                              : 'hover:bg-orange-50 hover:border-orange-300'
                          }`}
                        >
                          <p className="font-medium text-sm">
                            {done ? '✓ ' : ''}{s.storeName}
                            {s.area && <span className="text-xs text-gray-400 font-normal">　{s.area}</span>}
                          </p>
                          {s.dishes && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{s.dishes}</p>}
                        </button>
                      )
                    })}
                  </div>
                  {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
                  <button
                    onClick={onClose}
                    className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium ${
                      doneNames.length === parsedStores.length
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'border text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {doneNames.length === parsedStores.length ? '全部加完，完成 ✓' : '先這樣，關閉'}
                  </button>
                </div>
              ) : (
                /* 模式三：貼文匯入 + 手動搜尋 */
                <>
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">📋 貼文匯入（IG / Threads）</p>
                    <textarea
                      value={pasteText}
                      onChange={e => setPasteText(e.target.value)}
                      placeholder="把 IG / Threads 的貼文文字（或連結）貼進來，按判讀就會自動找店家。一篇介紹好幾間也可以。"
                      className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <button
                      onClick={handleParse}
                      disabled={parsing || !pasteText.trim()}
                      className="mt-2 w-full bg-orange-500 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
                    >
                      {parsing ? '判讀中...' : '🪄 判讀並搜尋'}
                    </button>
                    {parseHint && <p className="text-xs text-green-600 mt-2">{parseHint}</p>}
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                    <span className="flex-1 border-t border-gray-100" />
                    或手動搜尋
                    <span className="flex-1 border-t border-gray-100" />
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="輸入店名，例：春水堂、阿水麵線台中"
                      className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading}
                      className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50 whitespace-nowrap"
                    >
                      {loading ? '...' : '搜尋'}
                    </button>
                  </div>

                  {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
                </>
              )}
            </>
          ) : (
            <>
              <div className="border border-orange-200 bg-orange-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-sm">{selected.name}</p>
                <p className="text-xs text-gray-600 mt-0.5">{selected.address}</p>
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

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">🌐 網友說（選填）</p>
                  <textarea
                    value={notePublic}
                    onChange={e => setNotePublic(e.target.value)}
                    placeholder="網路評價、推薦菜色..."
                    className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">📝 我們紀錄（選填）</p>
                  <textarea
                    value={notePrivate}
                    onChange={e => setNotePrivate(e.target.value)}
                    placeholder="自己的心得、停車資訊..."
                    className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    rows={3}
                  />
                </div>
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
