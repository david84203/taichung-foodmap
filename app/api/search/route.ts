import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json({ error: 'missing query' }, { status: 400 })

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types',
    },
    body: JSON.stringify({
      textQuery: query + ' 台中',
      languageCode: 'zh-TW',
      regionCode: 'TW',
      maxResultCount: 3,
    }),
  })
  const rawText = await res.text()
  console.log('[search] status:', res.status, 'body:', rawText.slice(0, 300))
  if (!res.ok) return NextResponse.json({ error: `Places API ${res.status}`, detail: rawText.slice(0, 200) }, { status: 502 })
  const data = JSON.parse(rawText)

  const results = (data.places ?? []).map((r: {
    id: string
    displayName: { text: string }
    formattedAddress: string
    location: { latitude: number; longitude: number }
    types: string[]
  }) => ({
    placeId: r.id,
    name: r.displayName?.text ?? '',
    address: r.formattedAddress ?? '',
    lat: r.location?.latitude ?? 0,
    lng: r.location?.longitude ?? 0,
    types: r.types ?? [],
  }))

  return NextResponse.json(results)
}
