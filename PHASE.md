# PHASE — QU4SAR Academy

> Archivo de fase activa. Se actualiza con cada avance.
> ✅ = Completado  |  🔄 = En progreso  |  ⬜ = Pendiente

---

## Fase 0 — Fundamentos (COMPLETADO)

- [x] Perfil base de alumno
- [x] CRUDs principales (admin)
- [x] Dashboard Coach básico
- [x] Tracker HenrikDev (HS%, KD, DPR)
- [x] Academia / Clases núcleo
- [x] Realtime Supabase
- [x] UX base (loaders, overlays, toasts, skeletons)
- [x] Comunidad básica
- [x] Partículas, scroll reveal, ripple
- [x] Pantalla de carga en 3 fases

---

## Fase 1 — Perfil PRO (COMPLETADO)

- ✅ 1.1 Historial de rango visual
- ✅ 1.2 Logros en perfil
- ✅ 1.3 Sistema XP + Niveles
- ✅ 1.4 Badges flotantes
- ✅ 1.5 Bio / estado personal
- ✅ 1.6 Color personalizado

---

## Fase 2 — Command Center (Coach PRO) (COMPLETADO)

- ✅ 2.1 Vista semanal del coach con calendario
- ✅ 2.2 Gráficas de rendimiento (asistencia, stats, top alumnos)
- ✅ 2.3 Alertas de tareas vencidas
- ✅ 2.4 Comparativa de alumnos

---

## Fase 3 — Tracker Avanzado (COMPLETADO)

- ✅ 3.1 Más stats: ACS, ADR, KAST, Winrate, Top agentes, Peak rank
- ✅ 3.2 Radar chart SVG (6 ejes: KD, HS%, DPR invertido, ACS, ADR, KAST)
- ✅ 3.3 Auto-refresh periódico (90s)

---

## Fase 4 — Academia Premium (COMPLETADO)

- ✅ 4.1 Barra de progreso del curso (tareas 30% + evals 20% + quizzes 20% + asistencia 30%)
- ✅ 4.2 Certificados QU4SAR con html2canvas (diseño espacial, descargable PNG)
- ✅ 4.3 Recordatorios de próxima clase (toast automático con tiempo restante)
- ✅ 4.4 Entrega de archivos en tareas (subida a Supabase Storage + vista coach)

---

## Fase 5 — Comunidad (COMPLETADO)

- ✅ 5.1 Leaderboard por XP con filtro por grupo (top 3 con 🥇🥈🥉)
- ✅ 5.2 Eventos públicos desde el schedule (vista semanal)
- ✅ 5.3 Clips destacados con subida (embed YouTube/Twitch)
- ✅ 5.4 Sistema de reacciones (like/unlike en clips, persistido)

---

## Fase 6 — Limpieza Técnica (COMPLETADO)

- ✅ 6.1 JS huérfanos eliminados (index.js, index-init.js, index-core.js, index-render.js, index-dashboard.js)
- ✅ 6.2 Constantes unificadas en constants.js (EXTRAS_KEYS con fallback inline)
- ⬜ 6.3 TypeScript (migración gradual — pendiente)
- ⬜ 6.4 Tests (Jest + jsdom — pendiente)
- ⬜ 6.5 CI/CD (GitHub Actions — pendiente)

---

## Fase 7 — Seguridad y Quick Wins (COMPLETADO)

> Prioridad crítica. Se ejecutó antes de cualquier cambio funcional.

- ✅ 7.1 Rotar Service Role Key de Supabase
- ✅ 7.2 Service Role Key actualizada en configuracion.md
- ✅ 7.3 Agregar `.env.local` y `*.env.local` al `.gitignore`
- ✅ 7.4 Verificar que `.env.local` no esté en Git (repo sin commits — seguro)
- ✅ 7.5 Eliminar JWT fallback hardcodeado en backend (`auth.ts:18`, `auth.ts:31`)
- ✅ 7.6 Reemplazar catch vacíos con console.error en students.js (12 ubicaciones)
- ✅ 7.7 Crear `.env.example` con variables necesarias documentadas

---

## Fase 8 — Sincronización y Observabilidad (COMPLETADO)

> Garantizar integridad de datos antes de agregar funcionalidad.

- ✅ 8.1 Reemplazar `syncToDB()` directo por `SyncQueue` (`js/sync.js` con cola + retry + status)
- ✅ 8.2 Indicador visual de estado de sync en UI admin (`.sync-indicator` CSS + elemento DOM)
- ✅ 8.3 Auditoría de `.catch()` (completada en Fase 7 — 12 ubicaciones corregidas)
- ✅ 8.4 Migración SQL: `updated_at TIMESTAMPTZ` agregado a 33 tablas
- ✅ 8.5 Trigger `trigger_set_updated_at()` aplicado a cada tabla
- ✅ 8.6 `DATA._sync` state object (status, lastAttempt, lastSuccess, pendingCount)
- ✅ Reemplazo de `_pendingLocalSave` por `_localSyncId` counter (sin race condition)

---

## Fase 9 — Academia 2.0: Estructura de Datos (COMPLETADO)

> Modelo híbrido: cohorte dominante con progresión individual como excepción.
> Archivo: `supabase/migrations/20260613000002_academy_2_0.sql`

- ✅ Migración SQL completa con:
  - ✅ `groups`: +4 columnas (type, start_date, end_date, month_current) + rename g1/g2 + seed 4 cohortes
  - ✅ `members`: +6 columnas (current_month, enrollment_date, academy_status, primary_role, secondary_role, specialization)
  - ✅ `academy`: +3 columnas (month, module_name, subject)
  - ✅ `evaluations`: +3 columnas (subject, month, weight)
  - ✅ `group_coaches`: +2 columnas (subject, month)
  - ✅ `draft_picks`: tabla nueva con índices + trigger

---

## Fase 10 — Academia 2.0: Migración y Adaptación (EN PROGRESO)

> Reemplazar conceptos antiguos sin romper funcionalidad existente.

### 10.1 Código deprecado eliminado
- ✅ `getGroupFromRank()` eliminado de `shared.js:88-93` y su duplicado `admin/groups.js:76`
- ✅ Derivación automática de `group_id` desde rank eliminada en `getUserGroup()` (shared.js:114)
- ✅ Reemplazo de `(m.group_id||getGroupFromRank(m.rank))` por `m.group_id` en 6 archivos
- ✅ `rankDivision()` mantenida como badge decorativo (cosmético)

### 10.2 Formularios admin actualizados
- ✅ `groups.js`: form con type, start_date, end_date, month_current
- ✅ `members.js`: form con cohorte, mes actual, enrollment_date, academy_status, primary_role, secondary_role, specialization
- ✅ `classes.js`: form con subject, module_name, month
- ✅ `evals.js`: form con subject, month, weight
- ✅ `coaches.js`: asignación con subject + month por grupo
- ✅ Grupos por defecto en `defData()` actualizados a cohortes

### 10.3 Datos
- ✅ Migraciones SQL ejecutadas en Supabase (producción)
- ✅ `20260613000003_academy_2_0_fixed.sql` aplicada con esquema real
- ✅ Grupos `g1/g2` renombrados a Alfa 2026 / Beta 2026
- ✅ 4 cohortes nuevas creadas (Alfa, Beta, Gamma, Delta)
- ✅ 29 triggers `updated_at` creados en tablas existentes

---

## Fase 11 — Academia 2.0: Nuevas Vistas UI (COMPLETADO)

> Funcionalidades visibles para el alumno y coach.

- ✅ 11.1 Timeline de 12 meses en perfil del alumno (`renderCohortTimeline()`)
- ✅ 11.2 Progreso por módulo (basado en `evaluations.subject` — datos listos)
- ✅ 11.3 Vista de "Recuperación Académica" (badge en timeline cuando `current_month < cohort_month`)
- ✅ 11.4 Badge de cohorte en perfil (reemplaza badge de grupo numérico)
- ✅ 11.5 Dashboard coach: filtros por cohorte (vía `adminGroupFilterHTML` — funciona con cohorts)
- ✅ 11.6 Estado de graduación en perfil (active → graduated → recovery → draft)
- ✅ 11.7 Panel de draft competitivo (`html/admin/draft.html` + `js/admin/draft.js`)
- ✅ Requisito de rango: desde mes 5 (Amateur) mínimo Ascendente+ para avanzar
- ✅ `parseRankTier()`, `getRankRequirement()`, `meetsRankRequirement()` en `students.js`

---

## Fase 12 — Next.js Backend Inteligente (Completado)

> API Routes en Next.js App Router. Frontend público migrado.

- ✅ 12.1 API Route: proxy HenrikDev (`/api/tracker/[region]/[name]/[tag]`) — MMR, cuenta, últimas 10 partidas
- ✅ 12.2 API Route: reportes agregados (`/api/admin/reports`) — totales, cohortes, asistencia, evaluaciones
- ✅ 12.3 API Route: progreso de cohorte (`/api/cohorts/[id]/progress`) — cada miembro, distribución, on-track/behind
- ✅ `api.ts` actualizado con `tracker.get()`, `reports.get()`, `cohorts.progress()`
- ✅ `.env.local` con `SUPABASE_SERVICE_ROLE_KEY`, `HENRIKDEV_KEY`, `NEXT_PUBLIC_NEXT_API_URL`
- ✅ Páginas públicas Next.js existentes (academy, news, team, schedule, members, media, recruitment)
- ✅ API routes protegidas con Service Role Key (server-side only)

---

## Resumen de Fases

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Fundamentos | ✅ Completado |
| 1 | Perfil PRO | ✅ Completado |
| 2 | Command Center | ✅ Completado |
| 3 | Tracker Avanzado | ✅ Completado |
| 4 | Academia Premium | ✅ Completado |
| 5 | Comunidad | ✅ Completado |
| 6 | Limpieza Técnica | ✅ Completado |
| **7** | **Seguridad y Quick Wins** | **✅ Completado** |
| **8** | **Sincronización y Observabilidad** | **✅ Completado** |
| **9** | **Academia 2.0: Estructura de Datos** | **✅ Completado** |
| **10** | **Academia 2.0: Migración y Adaptación** | **✅ Completado** |
| **11** | **Academia 2.0: Nuevas Vistas UI** | **✅ Completado** |
| **12** | **Next.js Backend Inteligente** | **✅ Completado** |

---

## Progreso Actual

```
Fases 0-6  → ✅ Completado (legado existente)
Fase 7     → ✅ Seguridad (rotación, gitignore, JWT, catch handlers, .env.example)
Fase 8     → ✅ Sync (SyncQueue, indicador, DATA._sync, updated_at SQL)
Fase 9     → ✅ Data (migración cohortes + members + academy + draft_picks SQL)
Fase 10    → ✅ Migración código + forms (getGroupFromRank eliminado, forms actualizados)
Fase 11    → ✅ Vistas UI (timeline + nombres curso, badge cohorte, status, recuperación, filtros, rank req, draft panel)
Fase 12    → ✅ Next.js (API routes: tracker, reports, cohort-progress)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ ✅ Optimización: ic() con SVG directo, lucide.createIcons() una vez, saveLocal() debounced, content-visibility CSS
```

---

> **Regla:** Al terminar una tarea, cambiar `⬜` por `✅`. Al empezar una, cambiar `⬜` por `🔄`.
