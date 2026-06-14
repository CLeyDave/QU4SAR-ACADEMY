import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const group = await supabase.from('groups').select('*').eq('id', id).single()
  if (!group.data) {
    return NextResponse.json({ success: false, error: 'Cohorte no encontrada' }, { status: 404 })
  }

  const [membersRes, evalsRes, tasksRes, attendanceRes, acadRes] = await Promise.all([
    supabase.from('members').select('*').eq('group_id', id),
    supabase.from('evaluations').select('*'),
    supabase.from('tasks').select('*').eq('group_id', id),
    supabase.from('attendance').select('*'),
    supabase.from('academy').select('*').eq('group_id', id),
  ])

  const members = membersRes.data || []
  const evaluations = evalsRes.data || []
  const tasks = tasksRes.data || []
  const attendance = attendanceRes.data || []
  const academy = acadRes.data || []

  const cohort = group.data as Record<string, unknown>
  const cohortMonth = Number(cohort.month_current) || 1

  const memberProgress = members.map((m: Record<string, unknown>) => {
    const memberEvals = evaluations.filter((e: Record<string, unknown>) => (e as Record<string, unknown>).member_name === m.name)
    const memberAttendance = attendance.filter((a: Record<string, unknown>) => (a as Record<string, unknown>).member_name === m.name)
    const presentCount = memberAttendance.filter((a: Record<string, unknown>) => a.status === 'present').length
    const totalSessions = academy.length || 1

    const avgScore =
      memberEvals.length > 0
        ? Math.round(
            ((memberEvals.reduce((s: number, e: Record<string, unknown>) => s + (Number(e.aim) || 0) + (Number(e.game_sense) || 0), 0)) /
              (memberEvals.length * 2)) * 10
          ) / 10
        : 0

    return {
      id: m.id,
      name: m.name,
      currentMonth: Number(m.current_month) || 1,
      academyStatus: m.academy_status || 'active',
      evaluations: memberEvals.length,
      avgScore,
      attendance: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
      isOnTrack: Number(m.current_month) >= cohortMonth,
      isBehind: Number(m.current_month) < cohortMonth,
    }
  })

  const onTrack = memberProgress.filter((m: Record<string, unknown>) => m.isOnTrack).length
  const behind = memberProgress.filter((m: Record<string, unknown>) => m.isBehind).length

  const monthDistribution: Record<string, number> = {}
  memberProgress.forEach((m: Record<string, unknown>) => {
    const key = String(m.currentMonth)
    monthDistribution[key] = (monthDistribution[key] || 0) + 1
  })

  const statusDistribution: Record<string, number> = {}
  memberProgress.forEach((m: Record<string, unknown>) => {
    const key = String(m.academyStatus || 'active')
    statusDistribution[key] = (statusDistribution[key] || 0) + 1
  })

  return NextResponse.json({
    success: true,
    data: {
      cohort: {
        id: cohort.id,
        name: cohort.name,
        monthCurrent: cohortMonth,
        startDate: cohort.start_date,
        endDate: cohort.end_date,
      },
      totals: {
        members: members.length,
        onTrack,
        behind,
        completionRate: members.length > 0 ? Math.round((onTrack / members.length) * 100) : 0,
      },
      members: memberProgress,
      monthDistribution,
      statusDistribution,
      tasks: tasks.length,
      academySessions: academy.length,
    },
  })
}
