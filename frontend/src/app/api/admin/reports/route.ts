import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const [membersRes, evalsRes, tasksRes, attendanceRes, groupsRes, academyRes] = await Promise.all([
    supabase.from('members').select('id, group_id, current_month, academy_status, created_at'),
    supabase.from('evaluations').select('id, member_name, group_id, aim, game_sense, date'),
    supabase.from('tasks').select('id, title, group_id, due_date'),
    supabase.from('attendance').select('id, member_name, status, date'),
    supabase.from('groups').select('id, name, month_current, type'),
    supabase.from('academy').select('id, group_id, month, module_name, day'),
  ])

  const members = membersRes.data || []
  const evaluations = evalsRes.data || []
  const tasks = tasksRes.data || []
  const attendance = attendanceRes.data || []
  const groups = groupsRes.data || []
  const academy = academyRes.data || []

  const cohorts = groups.filter((g: Record<string, unknown>) => g.type === 'cohort')

  const totalMembers = members.length
  const activeMembers = members.filter((m: Record<string, unknown>) => m.academy_status === 'active').length
  const recoveryMembers = members.filter((m: Record<string, unknown>) => m.academy_status === 'recovery').length
  const graduated = members.filter((m: Record<string, unknown>) => m.academy_status === 'graduated').length

  const avgEvalScore =
    evaluations.length > 0
      ? Math.round(
          (evaluations.reduce((s: number, e: Record<string, unknown>) => s + (Number(e.aim) || 0) + (Number(e.game_sense) || 0), 0) /
            (evaluations.length * 2)) *
            10
        ) / 10
      : 0

  const presentCount = attendance.filter((a: Record<string, unknown>) => a.status === 'present').length
  const attendancePct =
    attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

  const pendingTasks = tasks.filter((t: Record<string, unknown>) => {
    if (!t.due_date) return false
    return new Date(String(t.due_date)) > new Date()
  }).length

  const cohortProgress = cohorts.map((c: Record<string, unknown>) => {
    const cohMembers = members.filter((m: Record<string, unknown>) => m.group_id === c.id)
    const avgMonth =
      cohMembers.length > 0
        ? cohMembers.reduce((s: number, m: Record<string, unknown>) => s + (Number(m.current_month) || 1), 0) /
          cohMembers.length
        : 0
    return {
      id: c.id,
      name: c.name,
      totalMembers: cohMembers.length,
      avgMonth: Math.round(avgMonth * 10) / 10,
      onTrack: cohMembers.filter((m: Record<string, unknown>) => Number(m.current_month) >= (Number(c.month_current) || 1)).length,
    }
  })

  const academyByMonth: Record<string, number> = {}
  academy.forEach((a: Record<string, unknown>) => {
    const key = String(a.month || 0)
    academyByMonth[key] = (academyByMonth[key] || 0) + 1
  })

  return NextResponse.json({
    success: true,
    data: {
      totals: { members: totalMembers, active: activeMembers, recovery: recoveryMembers, graduated },
      evaluations: { total: evaluations.length, avgScore: avgEvalScore },
      attendance: { total: attendance.length, rate: attendancePct },
      tasks: { total: tasks.length, pending: pendingTasks },
      cohortProgress,
      academyByMonth,
    },
  })
}
