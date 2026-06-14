import { NextRequest, NextResponse } from 'next/server'

const HENRIK_BASE = 'https://api.henrikdev.xyz/valorant'
const HENRIK_KEY = process.env.HENRIKDEV_KEY || 'HDEV-ddaa320a-26ce-4a96-bbdb-0d148ba20b44'

async function fetchFromHenrik(path: string) {
  const res = await fetch(`${HENRIK_BASE}${path}`, {
    headers: { Authorization: HENRIK_KEY },
    next: { revalidate: 300 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ region: string; name: string; tag: string }> }
) {
  const { region, name, tag } = await params
  const regionMap: Record<string, string> = {
    eu: 'eu', na: 'na', ap: 'ap', kr: 'kr', latam: 'latam', br: 'br',
  }
  const r = regionMap[region.toLowerCase()] || 'na'
  const encoded = `${encodeURIComponent(name)}/${encodeURIComponent(tag)}`

  const [mmr, account, matches] = await Promise.all([
    fetchFromHenrik(`/v1/mmr/${r}/${encoded}`),
    fetchFromHenrik(`/v1/account/${encoded}`),
    fetchFromHenrik(`/v3/matches/${r}/${encoded}?filter=competitive`),
  ])

  const data: Record<string, unknown> = {}
  if (mmr?.data) {
    data.rank = mmr.data.currenttierpatched || '—'
    data.elo = mmr.data.elo || 0
    data.rr = mmr.data.ranking_in_tier ?? '—'
  }
  if (account?.data) {
    data.puuid = account.data.puuid
    data.account_level = account.data.account_level
    data.card = account.data.card?.large || ''
  }
  if (matches?.data && Array.isArray(matches.data)) {
    const recent = matches.data.slice(0, 10)
    data.matches = recent.map((m: Record<string, unknown>) => ({
      map: m.map?.name || m.map || '',
      result: m.teams?.[0]?.has_won ? 'Victoria' : m.teams?.[1]?.has_won ? 'Derrota' : 'Empate',
      score: `${m.teams?.[0]?.rounds_won ?? 0}-${m.teams?.[1]?.rounds_won ?? 0}`,
      kills: m.stats?.kills ?? '—',
      deaths: m.stats?.deaths ?? '—',
      assists: m.stats?.assists ?? '—',
      hs_percent: m.stats?.headshots_percent ?? '—',
      kd_ratio: m.stats?.kd_ratio ?? '—',
      agent: m.agent?.name || m.agent || '',
      date: m.metadata?.started_at || m.date || '',
    }))
    const stats = recent.reduce(
      (acc: Record<string, number>, m: Record<string, unknown>) => {
        const won = m.teams?.[0]?.has_won ? 1 : 0
        return {
          wins: acc.wins + won,
          kills: acc.kills + (m.stats?.kills ?? 0),
          deaths: acc.deaths + (m.stats?.deaths ?? 0),
          assists: acc.assists + (m.stats?.assists ?? 0),
        }
      },
      { wins: 0, kills: 0, deaths: 0, assists: 0 }
    )
    data.stats = {
      wins: stats.wins,
      total: recent.length,
      kd: stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : '—',
      avg_hs: recent.length > 0
        ? Math.round(
            recent.reduce((s: number, m: Record<string, unknown>) => s + (parseFloat(m.stats?.headshots_percent) || 0), 0) /
              recent.length
          )
        : 0,
    }
  }

  return NextResponse.json({ success: true, data })
}
