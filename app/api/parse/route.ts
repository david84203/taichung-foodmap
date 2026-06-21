import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

// 從 IG/Threads 貼文文字（或連結）判讀出店名、地區、推薦菜色
// 用 Google Gemini 免費 API；連結會盡力抓 og 描述，抓不到就請使用者改貼文字

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

// 盡力從一個網址抓取 og:description / og:title（IG、Threads 常會擋，抓不到就算了）
async function fetchUrlText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      },
      cache: 'no-store',
    })
    const html = await res.text()
    const pick = (prop: string) =>
      html.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1] ?? ''
    return [pick('og:title'), pick('og:description')].filter(Boolean).join('\n')
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })

  const apiKey = (process.env.GEMINI_API_KEY ?? '').replace(/^﻿/, '')
  if (!apiKey) return NextResponse.json({ error: 'missing GEMINI_API_KEY' }, { status: 500 })

  const { text } = (await req.json()) as { text?: string }
  let content = (text ?? '').trim()
  if (!content) return NextResponse.json({ error: 'missing text' }, { status: 400 })

  // 若內容只是一條（或幾乎只是）網址，先盡力抓取貼文描述
  const urlMatch = content.match(/https?:\/\/\S+/i)
  if (urlMatch && content.replace(urlMatch[0], '').trim().length < 10) {
    const fetched = await fetchUrlText(urlMatch[0])
    if (!fetched) {
      return NextResponse.json({ stores: [], needsText: true })
    }
    content = fetched
  }

  const prompt =
    '你是美食地圖小幫手。下面這段 IG / Threads 貼文可能介紹一間或多間餐廳。' +
    '請列出文中提到的「每一間」餐廳，只回傳 JSON 物件 { "stores": [...] }，每間含：\n' +
    '- storeName：餐廳店名（純店名，不要含分店地點描述；判斷不出店名就略過該間）\n' +
    '- area：該店的地區或地址線索，例「台中西區」「公益路」（沒有就留空）\n' +
    '- dishes：該店被提到的推薦菜色或重點評價，濃縮成一兩句口語，當作「網友說」（沒有就留空）\n\n' +
    '貼文文字：\n' + content

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            stores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  storeName: { type: 'string' },
                  area: { type: 'string' },
                  dishes: { type: 'string' },
                },
                required: ['storeName', 'area', 'dishes'],
              },
            },
          },
          required: ['stores'],
        },
      },
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'AI 判讀失敗，請稍後再試' }, { status: 502 })
  }

  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

  try {
    const parsed = JSON.parse(raw) as { stores?: { storeName?: string; area?: string; dishes?: string }[] }
    const stores = (parsed.stores ?? [])
      .map(s => ({
        storeName: s.storeName?.trim() ?? '',
        area: s.area?.trim() ?? '',
        dishes: s.dishes?.trim() ?? '',
      }))
      .filter(s => s.storeName)
    return NextResponse.json({ stores, needsText: false })
  } catch {
    return NextResponse.json({ error: 'AI 回傳格式異常' }, { status: 502 })
  }
}
