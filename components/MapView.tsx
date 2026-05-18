'use client'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import { useCallback } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Place, CATEGORY_COLOR } from '@/lib/types'

interface Props {
  places: Place[]
  selectedPlace: Place | null
  onSelectPlace: (place: Place | null) => void
}

export default function MapView({ places, selectedPlace, onSelectPlace }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMapLoad = useCallback((e: any) => {
    const mbMap = e.target.getMap ? e.target.getMap() : e.target
    const layers = mbMap.getStyle()?.layers ?? []
    layers.forEach((layer: any) => {
      if (layer.type === 'symbol' && layer.layout?.['text-field']) {
        mbMap.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name_zh-Hant'], ['get', 'name']])
      }
    })
  }, [])

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: 120.6736, latitude: 24.1477, zoom: 12 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onLoad={onMapLoad}
    >
      {places.map(place => (
        <Marker
          key={place.id}
          longitude={place.lng}
          latitude={place.lat}
          onClick={e => {
            e.originalEvent.stopPropagation()
            onSelectPlace(selectedPlace?.id === place.id ? null : place)
          }}
        >
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"
            style={{ backgroundColor: CATEGORY_COLOR[place.category] }}
            title={place.name}
          />
        </Marker>
      ))}

      {selectedPlace && (
        <Popup
          longitude={selectedPlace.lng}
          latitude={selectedPlace.lat}
          onClose={() => onSelectPlace(null)}
          closeOnClick={false}
          anchor="bottom"
          offset={12}
        >
          <div className="p-1 min-w-36">
            <p className="font-semibold text-sm leading-tight">{selectedPlace.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{selectedPlace.category}</p>
            {selectedPlace.rating > 0 && (
              <p className="text-xs text-gray-500">⭐ {selectedPlace.rating.toFixed(1)}</p>
            )}
            <a
              href={selectedPlace.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 block"
            >
              在 Google Maps 開啟 →
            </a>
          </div>
        </Popup>
      )}
    </Map>
  )
}
