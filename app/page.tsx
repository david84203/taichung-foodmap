'use client'
import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Place, FoodCategory, PlaceStatus } from '@/lib/types'
import dynamic from 'next/dynamic'
import PlaceCard from '@/components/PlaceCard'
import FilterBar from '@/components/FilterBar'
import AddPlaceModal from '@/components/AddPlaceModal'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function Home() {
  const [places, setPlaces]               = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [showAdd, setShowAdd]             = useState(false)
  const [filterCategory, setFilterCategory] = useState<FoodCategory | null>(null)
  const [filterStatus, setFilterStatus]   = useState<PlaceStatus | null>(null)
  const [loading, setLoading]             = useState(true)
  const [mobileTab, setMobileTab]         = useState<'map' | 'list'>('map')

  useEffect(() => {
    loadPlaces()
  }, [])

  async function loadPlaces() {
    const snap = await getDocs(collection(db, 'foodmap'))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Place))
    data.sort((a, b) => b.addedAt - a.addedAt)
    setPlaces(data)
    setLoading(false)
  }

  async function handleAdd(placeData: Omit<Place, 'id' | 'addedAt'>) {
    const now    = Date.now()
    const docRef = await addDoc(collection(db, 'foodmap'), { ...placeData, addedAt: now })
    console.log('Firestore write ok, id:', docRef.id)
    setPlaces(prev => [{ ...placeData, id: docRef.id, addedAt: now }, ...prev])
    setShowAdd(false)
  }

  async function handleDelete(place: Place) {
    try {
      await deleteDoc(doc(db, 'foodmap', place.id))
      setPlaces(prev => prev.filter(p => p.id !== place.id))
      if (selectedPlace?.id === place.id) setSelectedPlace(null)
    } catch (e) {
      alert(`刪除失敗：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  async function handleToggleStatus(place: Place) {
    const next: PlaceStatus = place.status === 'want' ? 'visited' : 'want'
    await updateDoc(doc(db, 'foodmap', place.id), { status: next })
    setPlaces(prev => prev.map(p => p.id === place.id ? { ...p, status: next } : p))
    setSelectedPlace(prev => prev?.id === place.id ? { ...prev, status: next } : prev)
  }

  async function handleUpdateCategory(place: Place, category: FoodCategory) {
    await updateDoc(doc(db, 'foodmap', place.id), { category })
    setPlaces(prev => prev.map(p => p.id === place.id ? { ...p, category } : p))
    setSelectedPlace(prev => prev?.id === place.id ? { ...prev, category } : prev)
  }

  async function handleUpdateNotes(place: Place, notePublic: string, notePrivate: string) {
    await updateDoc(doc(db, 'foodmap', place.id), { notePublic, notePrivate })
    setPlaces(prev => prev.map(p => p.id === place.id ? { ...p, notePublic, notePrivate } : p))
    setSelectedPlace(prev => prev?.id === place.id ? { ...prev, notePublic, notePrivate } : prev)
  }

  const filtered = places.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false
    if (filterStatus   && p.status   !== filterStatus)   return false
    return true
  })

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗺️</span>
          <h1 className="font-bold text-gray-800">台中美食地圖</h1>
          <span className="text-sm text-gray-400">Lu &amp; Han</span>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          + 新增
        </button>
      </header>

      {/* 手機版 Tab 切換列 */}
      <div className="md:hidden flex border-b border-gray-100 shrink-0">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'map'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-600'
          }`}
        >
          🗺️ 地圖
        </button>
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === 'list'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-gray-600'
          }`}
        >
          📋 清單 {filtered.length > 0 && `(${filtered.length})`}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 清單側欄：桌面永遠顯示，手機只在 list tab 顯示 */}
        <aside className={`
          flex flex-col border-r border-gray-100 overflow-hidden shrink-0
          md:w-80 md:flex
          ${mobileTab === 'list' ? 'flex w-full' : 'hidden md:flex'}
        `}>
          <FilterBar
            activeCategory={filterCategory}
            activeStatus={filterStatus}
            onCategoryChange={setFilterCategory}
            onStatusChange={setFilterStatus}
            total={filtered.length}
          />
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <p className="text-sm text-gray-600 text-center mt-10">載入中...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-600 text-center mt-10">
                {places.length === 0
                  ? '點右上角「新增」加入第一家 🍜'
                  : '沒有符合條件的餐廳'}
              </p>
            ) : (
              filtered.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  selected={selectedPlace?.id === place.id}
                  onClick={() => {
                    setSelectedPlace(prev => prev?.id === place.id ? null : place)
                    setMobileTab('map')
                  }}
                  onDelete={() => handleDelete(place)}
                  onToggleStatus={() => handleToggleStatus(place)}
                  onUpdateNotes={(pub, priv) => handleUpdateNotes(place, pub, priv)}
                  onUpdateCategory={cat => handleUpdateCategory(place, cat)}
                />
              ))
            )}
          </div>
        </aside>

        {/* 地圖：桌面永遠顯示，手機只在 map tab 顯示 */}
        <main className={`
          flex-1 relative
          ${mobileTab === 'map' ? 'block' : 'hidden md:block'}
        `}>
          <MapView
            places={filtered}
            selectedPlace={selectedPlace}
            onSelectPlace={place => {
              setSelectedPlace(place)
              if (place) setMobileTab('map')
            }}
          />
        </main>
      </div>

      {showAdd && (
        <AddPlaceModal
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
