# Plan de Refactorización — Admin en páginas separadas

## Objetivo

Dividir el panel de administración de `coaches.html` (SPA con `switchTab()`) en páginas HTML independientes, una por sección, para mejorar organización, mantenibilidad y permitir trabajo en paralelo.

---

## Estructura final

```
QU4SAR WEB/
├── html/
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── content.html
│   │   ├── sections.html
│   │   ├── team.html
│   │   ├── members.html
│   │   ├── scrims.html
│   │   ├── stats.html
│   │   ├── groups.html
│   │   ├── coaches-mgmt.html
│   │   ├── academy.html
│   │   ├── news.html
│   │   ├── announcements.html
│   │   ├── schedule.html
│   │   ├── substitutions.html
│   │   ├── applications.html
│   │   └── achievements.html
│   └── coaches.html → redirige a admin/dashboard.html
├── js/
│   ├── admin-shared.js        ← Compartido por TODAS las páginas admin
│   ├── admin-dashboard.js
│   ├── admin-content.js        (renderContentEdit ya en shared)
│   ├── admin-sections.js       (renderSections ya en shared)
│   ├── admin-team.js
│   ├── admin-members.js
│   ├── admin-scrims.js
│   ├── admin-stats.js
│   ├── admin-groups.js
│   ├── admin-coaches-mgmt.js
│   ├── admin-academy.js
│   ├── admin-news.js
│   ├── admin-announcements.js
│   ├── admin-schedule.js
│   ├── admin-substitutions.js
│   ├── admin-applications.js
│   └── admin-achievements.js
├── css/
│   └── coaches.css             ← Sin cambios (ya contiene todos los estilos)
```

---

## admin-shared.js — Contenido

Extraído de `coaches-core.js`. Compartido por todas las páginas admin.

| Grupo | Funciones | Origen |
|-------|-----------|--------|
| **Auth** | `doLogin()`, `checkSession()`, `logout()`, `loadAdminData()` | coaches-core.js |
| **Sync** | `syncToDB()`, `syncToDB_()`, `saveData(d)`, `defData()`, `getData()` | coaches-core.js |
| **Shell** | `renderAdminShell(titulo, seccionActiva)` — genera sidebar + header + login | NUEVA |
| **Helpers** | `filterByCurrentCoach()`, `dc()`, `isCurrentUserAdmin()`, `hasRole()`, `requireRole()`, `rankValue()`, `mediaPreview()` | coaches-core.js |
| **UI** | `adminTable()`, `openModal()`, `closeModal()`, `confirmDel()`, `uploadFile()`, `fileUploadHTML()`, `uploadStatusHTML()` | coaches-core.js |
| **Form helpers** | `coachOptions()`, `reloadCoachDropdown()`, `setGroupFromCoach()`, `adminGroupFilterHTML()` | coaches-core.js |
| **Global state** | `adminGF`, `_syncPromise`, `_lastFocused` | coaches-core.js |
| **Counts** | `updateCounts()` — actualiza badges del sidebar | coaches-core.js |
| **Secciones** | `renderSections()`, `toggleSection()`, `getSections()`, `saveSections()` | coaches-core.js |
| **Contenido Web** | `renderContentEdit()`, `saveContent()` | coaches-core.js |

---

## Esquema de cada página admin

### HTML (`html/admin/[seccion].html`)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>QU4SAR Admin – [Sección]</title>
  <link rel="icon" href="../../QU4SAR.ico">
  <link rel="stylesheet" href="../../css/base.css">
  <link rel="stylesheet" href="../../css/coaches.css">
</head>
<body>
  <div class="toast" id="toast"></div>
  <!-- Login → generado por JS si no hay sesión -->
  <div class="login-screen" id="loginScreen"></div>
  <!-- Admin panel -->
  <div class="admin active" id="adminPanel">
    <div class="admin-header" id="adminHeader"></div>
    <div class="admin-body">
      <div class="admin-sidebar" id="adminSidebar"></div>
      <div class="admin-main" id="adminContent"></div>
    </div>
  </div>
  <div class="modal-overlay" id="modalOverlay">
    <div class="glass-card modal-box" id="modalBox"></div>
  </div>
  <script src="../../js/shared.js"></script>
  <script src="../../js/admin-shared.js"></script>
  <script src="../../js/admin-[seccion].js"></script>
</body>
</html>
```

### JS (`js/admin-[seccion].js`)

```js
if(typeof adminSharedLoaded==='undefined'){
  document.write('<script src="../js/admin-shared.js"><\/script>');
}else{
  document.addEventListener('DOMContentLoaded',function(){
    renderAdminShell('Título Sección', 'sectionId');
    render[Seccion]();
  });
}
```

---

## Fases

---

### FASE 0 — Preliminar

Antes de tocar la estructura admin, arreglamos bugs pendientes.

| # | Archivo | Cambio |
|---|---------|--------|
| 0.1 | `index.html` | Mover "Inscripción" fuera de `#navLinks`, crear `.nav-actions` |
| 0.2 | `css/public.css` | Agregar `.nav-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}` |
| 0.3 | `css/students.css` | Línea 199: `grid-template-columns:1fr` → `repeat(2,1fr)` |
| 0.4 | `html/coaches.html` | Envolver `<input type="password">` en `<form>` |
| 0.5 | `js/coaches-core.js:328` | `c.name` → `c.email` match contra `currentUser.email` |
| 0.6 | `js/admin-core.js:328` | Ídem |
| 0.7 | `js/admin.js:295` | Ídem |
| 0.8 | `js/admin-shared.js` | **CREAR**: shared de coaches-core.js |

**Estado:** ⬜ Pendiente

---

### FASE 1 — Admin Shared + Dashboard

| # | Archivo | Acción | Detalle |
|---|---------|--------|---------|
| 1.1 | `js/admin-shared.js` | **CREAR** | auth + data + sync + helpers + UI + shell + sections + content |
| 1.2 | `html/admin/dashboard.html` | **CREAR** | Shell HTML mínimo |
| 1.3 | `js/admin-dashboard.js` | **CREAR** | `renderDash()` con links en vez de switchTab |

**Prueba:** Navegar a `admin/dashboard.html` → login → dashboard funcional.

**Estado:** ⬜ Pendiente

---

### FASE 2 — Schedule

| # | Archivo | Acción | Desde |
|---|---------|--------|-------|
| 2.1 | `html/admin/schedule.html` | **CREAR** | — |
| 2.2 | `js/admin-schedule.js` | **CREAR** | `coaches-crud-content.js:463-551` |

**Funciones:** `renderSchedule()`, `schedForm()`, `saveSched()`, `delSched()`, `copyLastWeek()`

**Prueba:** Login → Schedule → crear/editar/eliminar horarios, semana, historial.

**Estado:** ⬜ Pendiente

---

### FASE 3 — Members

| # | Archivo | Acción | Desde |
|---|---------|--------|-------|
| 3.1 | `html/admin/members.html` | **CREAR** | — |
| 3.2 | `js/admin-members.js` | **CREAR** | `coaches-crud-academy.js:2-142` |

**Funciones:** `renderMembers()`, `memberForm()`, `saveMember()`, `delMember()`, `deleteSelectedMembers()`, `deleteDuplicateMembers()`, `showCoachNotes()`, `showRankHistory()`, `addCoachNote()`, `addRankRecord()`, `autoAssignCoachToMember()`

**Estado:** ⬜ Pendiente

---

### FASE 4 — Academy (sub-tabs)

| # | Archivo | Acción | Desde |
|---|---------|--------|-------|
| 4.1 | `html/admin/academy.html` | **CREAR** | — |
| 4.2 | `js/admin-academy.js` | **CREAR** | academy.js + partes de content.js |

**Funciones:** `renderAcademy()`, `switchAcademyTab()`, `renderAcademyClasses()`, `renderCoachNotes()`, `renderAttendance()`, `renderEvals()`, `renderCurriculum()` (simplificado, sin `_inAcademyTab`), `renderMaterials()` (ídem), `renderTasks()` (ídem), `renderQuizzes()` (ídem)

**Estado:** ⬜ Pendiente

---

### FASE 5 — Content + Sections + News + Announcements

| # | Archivo | Acción | Desde |
|---|---------|--------|-------|
| 5.1 | `html/admin/content.html` | **CREAR** | — |
| 5.2 | `js/admin-content.js` | **CREAR** | Vacío (usa shared) |
| 5.3 | `html/admin/sections.html` | **CREAR** | — |
| 5.4 | `js/admin-sections.js` | **CREAR** | Vacío (usa shared) |
| 5.5 | `html/admin/news.html` | **CREAR** | — |
| 5.6 | `js/admin-news.js` | **CREAR** | `coaches-crud-content.js:2-35` |
| 5.7 | `html/admin/announcements.html` | **CREAR** | — |
| 5.8 | `js/admin-announcements.js` | **CREAR** | `coaches-crud-content.js:122-153` |

**Estado:** ⬜ Pendiente

---

### FASE 6 — Team + Scrims + Stats + Substitutions

| # | Archivo | Acción | Desde |
|---|---------|--------|-------|
| 6.1 | `html/admin/team.html` | **CREAR** | — |
| 6.2 | `js/admin-team.js` | **CREAR** | `coaches-crud-content.js:37-60` |
| 6.3 | `html/admin/scrims.html` | **CREAR** | — |
| 6.4 | `js/admin-scrims.js` | **CREAR** | `coaches-crud-content.js:61-92` |
| 6.5 | `html/admin/stats.html` | **CREAR** | — |
| 6.6 | `js/admin-stats.js` | **CREAR** | `coaches-crud-content.js:93-121` |
| 6.7 | `html/admin/substitutions.html` | **CREAR** | — |
| 6.8 | `js/admin-substitutions.js` | **CREAR** | `coaches-crud-content.js:299-343` |

**Estado:** ⬜ Pendiente

---

### FASE 7 — Groups + Coaches + Applications + Achievements

| # | Archivo | Acción | Desde |
|---|---------|--------|-------|
| 7.1 | `html/admin/groups.html` | **CREAR** | — |
| 7.2 | `js/admin-groups.js` | **CREAR** | `coaches-crud-academy.js:678-686` |
| 7.3 | `html/admin/coaches-mgmt.html` | **CREAR** | — |
| 7.4 | `js/admin-coaches-mgmt.js` | **CREAR** | `coaches-crud-academy.js:553-676` |
| 7.5 | `html/admin/applications.html` | **CREAR** | — |
| 7.6 | `js/admin-applications.js` | **CREAR** | `coaches-crud-academy.js:257-395` |
| 7.7 | `html/admin/achievements.html` | **CREAR** | — |
| 7.8 | `js/admin-achievements.js` | **CREAR** | `coaches-crud-content.js:344-391` |

**Estado:** ⬜ Pendiente

---

### FASE 8 — Cleanup

| # | Archivo | Acción |
|---|---------|--------|
| 8.1 | `html/coaches.html` | Redirigir a `admin/dashboard.html` |
| 8.2 | `js/coaches-core.js` | Eliminar |
| 8.3 | `js/coaches-crud-content.js` | Eliminar |
| 8.4 | `js/coaches-crud-academy.js` | Eliminar |
| 8.5 | `js/admin-core.js` | Eliminar (duplicado, no usado) |
| 8.6 | `js/admin-crud-content.js` | Eliminar |
| 8.7 | `js/admin-crud-academy.js` | Eliminar |
| 8.8 | `js/admin.js` | Eliminar (monolítico, no usado) |

**Estado:** ⬜ Pendiente

---

### FASE 9 — Optimizaciones post-refactor

| # | Mejora |
|---|--------|
| 9.1 | Lazy-load admin-shared.js solo si hay sesión |
| 9.2 | Cachear DATA entre páginas (evitar re-fetch en cada navegación) |
| 9.3 | Loading skeleton durante loadAdminData() |
| 9.4 | Service worker para caché offline parcial |

**Estado:** ⬜ Pendiente

---

## Resumen

| Concepto | Cantidad |
|----------|----------|
| HTML nuevos | 16 |
| JS nuevos | 17 (shared + 16 secciones) |
| Archivos modificados | 7 |
| Archivos eliminados | 6 |
| **Total neto** | **+31 archivos** |
