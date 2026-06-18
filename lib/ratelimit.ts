// 極簡 in-memory 限流：同一 IP 在 WINDOW_MS 內最多 MAX 次請求
// 目的：擋惡意連續刷 /api/search、/api/place-details，保護 Google Places 額度
// 註：serverless 各執行個體記憶體獨立，這是輕量防護而非嚴格全域限流；
//     真要鎖死全域得改用 Upstash/Redis，目前對個人專案夠用。

const WINDOW_MS = 10_000 // 10 秒
const MAX = 15 // 每 IP 每 10 秒上限

const hits = new Map<string, number[]>()

export function rateLimit(req: Request): boolean {
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)

  if (recent.length >= MAX) {
    hits.set(ip, recent)
    return false
  }

  recent.push(now)
  hits.set(ip, recent)
  return true
}
