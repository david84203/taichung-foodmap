import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

export async function GET(req: NextRequest) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })

  const placeId = req.nextUrl.searchParams.get('id')
  if (!placeId) return NextResponse.json({ error: 'missing id' }, { status: 400 })

  const fieldMask = [
    'id', 'displayName', 'formattedAddress', 'location',
    'regularOpeningHours', 'priceLevel', 'rating',
    'nationalPhoneNumber', 'googleMapsUri', 'types',
  ].join(',')

  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=zh-TW`, {
    headers: {
      'X-Goog-Api-Key': (process.env.GOOGLE_PLACES_API_KEY ?? '').replace(/^﻿/, ''),
      'X-Goog-FieldMask': fieldMask,
    },
  })
  const r = await res.json()

  const PRICE: Record<string, number> = {
    PRICE_LEVEL_FREE: 0, PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }

  return NextResponse.json({
    placeId,
    name:       r.displayName?.text ?? '',
    address:    r.formattedAddress ?? '',
    lat:        r.location?.latitude ?? 0,
    lng:        r.location?.longitude ?? 0,
    phone:      r.nationalPhoneNumber ?? '',
    hours:      r.regularOpeningHours?.weekdayDescriptions ?? [],
    priceLevel: PRICE[r.priceLevel] ?? 0,
    rating:     r.rating ?? 0,
    mapsUrl:    r.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    types:      r.types ?? [],
  })
}
