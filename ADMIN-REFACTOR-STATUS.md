# Estado del Refactor — Admin en páginas separadas

## Fase actual: 🟢 0 — Preliminar (Completada)

_Última actualización: 11 de junio 2026_

---

## Barras de progreso por fase

| Fase | Estado | Progreso |
|------|--------|----------|
| **0 — Preliminar** | ✅ Completada | ██████████ 100% |
| **1 — Shared + Dashboard** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **2 — Schedule** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **3 — Members** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **4 — Academy** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **5 — Content + News + Announcements** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **6 — Team + Scrims + Stats + Subs** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **7 — Groups + Coaches + Apps + Achs** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **8 — Cleanup** | ⬜ Pendiente | ░░░░░░░░░░ 0% |
| **9 — Optimizaciones** | ⬜ Pendiente | ░░░░░░░░░░ 0% |

---

## FASE 0 — Preliminar (detalle)

| # | Archivo | Cambio | Estado |
|---|---------|--------|--------|
| 0.1 | `index.html` | Mover Inscripción a `.nav-actions` | ✅ |
| 0.2 | `css/public.css` | Agregar `.nav-actions{}` | ✅ |
| 0.3 | `css/students.css` | `1fr` → `repeat(2,1fr)` en dash-cards | ✅ |
| 0.4 | `html/coaches.html` | Envolver password en `<form>` | ✅ |
| 0.5 | `js/coaches-core.js:328` | Match coach por email (`coachMatch.name`) | ✅ |
| 0.6 | `js/admin-core.js:328` | Match coach por email (`coachMatch.name`) | ✅ |
| 0.7 | `js/admin.js:295` | Match coach por email (`coachMatch.name`) | ✅ |
| 0.8 | `js/admin-shared.js` | Crear shared desde coaches-core.js | ✅ |

---

## Últimos cambios completados

- **Fase 0 completa**: 8/8 items terminados
- `index.html`: Inscripción movida fuera de `#navLinks` a nuevo `.nav-actions`
- `public.css`: Nueva clase `.nav-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}`
- `students.css:199`: `.dash-cards` en móvil usa `repeat(2,1fr)` en vez de `1fr`
- `coaches.html`: Inputs de login envueltos en `<form id="loginForm" onsubmit="...">`
- 3 archivos JS arreglados: match coach por `c.email` en vez de `c.name`, y `coachMatch.name` asignado para filtros
- `admin-shared.js` creado: auth, data, sync, helpers, modals, file upload, content editor, sections, admin shell generator

---

## Notas

- Trabajando en localhost, sin commits a git hasta nueva orden
- Todas las páginas admin se conectan a la misma Supabase
- La sesión persiste via `persistSession: true`
- **Siguiente fase: FASE 1 — admin/dashboard.html + admin-dashboard.js**
