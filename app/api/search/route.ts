import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ error: 'missing query' }, { status: 400 })

  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(query + ' 台中')}` +
    `&language=zh-TW&region=tw` +
    `&key=${process.env.GOOGLE_PLACES_API_KEY}`

  const res = await fetch(url)
  const data = await res.json()

  const results = (data.results ?? []).slice(0, 3).map((r: {
    place_id: string
    name: string
    formatted_address: string
    geometry: { location: { lat: number; lng: number } }
    types: string[]
  }) => ({
    placeId: r.place_id,
    name: r.name,
    address: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    types: r.types,
  }))

  return NextResponse.json(results)
}
