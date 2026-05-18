import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('id')
  if (!placeId) return NextResponse.json({ error: 'missing id' }, { status: 400 })

  const fields = [
    'name', 'formatted_address', 'geometry',
    'opening_hours', 'price_level', 'rating',
    'formatted_phone_number', 'url', 'types',
  ].join(',')

  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=${fields}&language=zh-TW` +
    `&key=${process.env.GOOGLE_PLACES_API_KEY}`

  const res = await fetch(url)
  const data = await res.json()
  const r = data.result

  return NextResponse.json({
    placeId,
    name:       r.name ?? '',
    address:    r.formatted_address ?? '',
    lat:        r.geometry?.location?.lat ?? 0,
    lng:        r.geometry?.location?.lng ?? 0,
    phone:      r.formatted_phone_number ?? '',
    hours:      r.opening_hours?.weekday_text ?? [],
    priceLevel: r.price_level ?? 0,
    rating:     r.rating ?? 0,
    mapsUrl:    r.url ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    types:      r.types ?? [],
  })
}
