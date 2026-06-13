# QU4SAR Academy — Inventario de Integración

> Estado actual de features, pendientes y espacio para nuevas integraciones.

---

## 1. Perfil de Alumno

| Feature | Estado | Notas / Mejoras |
|---|---|---|
| Foto / avatar | ✅ Implementado | |
| Nombre + Riot ID | ✅ Implementado | |
| Rango VALORANT | ✅ Implementado | Viene del tracker, no de DB |
| HS% / KD / DPR | ⚠️ Parcial | Muestra `—` si no hay datos del tracker |
| Curso asignado | ✅ Implementado | |
| País / Región | ✅ Implementado | |
| Discord / Redes sociales | ✅ Implementado | youtube, twitter, twitch |
| Periféricos (DPI, Sens, Hz, Raw Input) | ✅ Implementado | dpi, sens, scoped_sens, hz, raw_input |
| Cover / Banner | ✅ Implementado | |
| Editar perfil (overlay) | ✅ Implementado | |
| Sincronizar perfil a Supabase | ✅ Implementado | Backfill a columnas nuevas |
| Compartir perfil (overlay + link) | ✅ Implementado | |
| Descargar perfil como PNG | ✅ Implementado | html2canvas |
| Estadísticas automáticas (HenrikDev) | ⚠️ Parcial | Cache en memoria + localStorage, refresh manual |
| Historial de rango | ⚠️ Parcial | Tabla `rank_history` existe pero no visible en perfil |
| Logros del alumno | ❌ Pendiente | Tabla `member_achievements` existe sin render |
| Nivel / XP del alumno | ❌ Pendiente | |
| Badges personalizados | ❌ Pendiente | |
| Tema personalizable (color acento) | ❌ Pendiente | |
| Texto de estado / bio | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 2. Panel de Administración (CRUD)

| Feature | Estado | Archivo JS |
|---|---|---|
| Dashboard admin general | ✅ | `admin/dashboard.js:3` |
| Dashboard coach (timeline) | ✅ | `admin/dashboard.js:25` |
| CRUD Miembros | ✅ | `admin/members.js` |
| CRUD Coaches | ✅ | `admin/coaches.js` |
| CRUD Grupos | ✅ | `admin/groups.js` |
| CRUD Group Coaches | ✅ | `admin/shared.js` |
| CRUD Horarios | ✅ | `admin/schedule.js` |
| CRUD Scrims (partidos) | ✅ | `admin/scrims.js` |
| CRUD Team (equipo competitivo) | ✅ | `admin/team.js` |
| CRUD Estadísticas | ✅ | `admin/stats.js` |
| CRUD Noticias | ✅ | `admin/news.js` |
| CRUD Anuncios | ✅ | `admin/announcements.js` |
| CRUD Academia / Clases | ✅ | `admin/classes.js` |
| CRUD Currículum | ✅ | `admin/curriculum.js` |
| CRUD Materiales | ✅ | `admin/materials.js` |
| CRUD Tareas | ✅ | `admin/tasks.js` |
| CRUD Evaluaciones | ✅ | `admin/evals.js` |
| CRUD Coach Notes | ✅ | `admin/coachnotes.js` |
| CRUD Quizzes | ✅ | `admin/quizzes.js` |
| CRUD Sustituciones | ✅ | `admin/substitutions.js` |
| CRUD Asistencia | ✅ | `admin/attendance.js` |
| CRUD Logros | ✅ | `admin/logros.js` |
| CRUD Aplicaciones (registros) | ✅ | `admin/applications.js` |
| CRUD Secciones (visibilidad) | ✅ | `admin/shared.js:630` |
| Editor de contenido (textos sitio) | ✅ | `admin/shared.js:520` |
| Sincronización total a Supabase | ✅ | `admin/shared.js:49` |
| **MEJORA:** Filtros avanzados en tablas | ⚠️ Parcial | Solo filtro por grupo |
| **MEJORA:** Búsqueda rápida en miembros | ⚠️ Parcial | |
| **MEJORA:** Exportar datos a CSV | ❌ Pendiente | |
| **MEJORA:** Exportar a PDF | ❌ Pendiente | |
| **MEJORA:** Vista de caché / datos locales | ❌ Pendiente | |
| **MEJORA:** Roles de admin (superadmin / coach) | ❌ Pendiente | |
| **MEJORA:** Historial de cambios (auditoría) | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 3. Dashboard Coach (Timeline)

| Feature | Estado | Notas |
|---|---|---|
| Timeline visual de actividades | ✅ | `renderCoachDashboard()` |
| Notas rápidas por alumno | ✅ | |
| Evaluaciones por alumno | ✅ | |
| Tareas por alumno | ✅ | |
| Clases por grupo | ✅ | |
| Quizzes por alumno | ✅ | |
| Materiales por grupo | ✅ | |
| Currículum por grupo | ✅ | |
| **MEJORA:** Vista semanal del coach | ❌ Pendiente | |
| **MEJORA:** Notificaciones de tareas vencidas | ❌ Pendiente | |
| **MEJORA:** Gráficas de progreso por alumno | ❌ Pendiente | |
| **MEJORA:** Comparativa entre alumnos del grupo | ❌ Pendiente | |
| **MEJORA:** Agenda / calendario integrado | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 4. Tracker API (HenrikDev)

| Feature | Estado | Notas |
|---|---|---|
| Obtener stats por Riot ID | ✅ | `fetchTrackerStats()` en `students.js` |
| Cache en memoria (`_trackerCache`) | ✅ | |
| Cache en localStorage (1 hora) | ✅ | |
| Mostrar HS%, KD, DPR | ✅ | |
| Actualizar rank desde tracker | ✅ | Sobrescribe `member.rank` |
| Botón de refresh manual | ✅ | |
| **MEJORA:** Mostrar más stats (ACS, ADR, KAST) | ❌ Pendiente | |
| **MEJORA:** Historial de partidas recientes | ❌ Pendiente | |
| **MEJORA:** Comparativa entre miembros del grupo | ❌ Pendiente | |
| **MEJORA:** Auto-refresh periódico (cada N min) | ❌ Pendiente | |
| **MEJORA:** Gráfica de rendimiento (línea temporal) | ❌ Pendiente | |
| **MEJORA:** Stats por agente | ❌ Pendiente | |
| **MEJORA:** Rango peak (más alto alcanzado) | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 5. Academia / Clases

| Feature | Estado | Notas |
|---|---|---|
| Clases por grupo (vista alumno) | ✅ | |
| CRUD Clases (admin) | ✅ | `admin/classes.js` |
| Plan de estudios (currículum semanal) | ✅ | |
| Materiales por clase | ✅ | |
| Tareas con entregas | ✅ | Tabla `task_completions` |
| Quizzes interactivos | ✅ | |
| Evaluaciones de rendimiento | ✅ | |
| Coach Notes por alumno | ✅ | |
| Sustituciones de horarios | ✅ | |
| **MEJORA:** Subir archivos (tareas / materiales) | ❌ Pendiente | |
| **MEJORA:** Calificación automática de quizzes | ❌ Pendiente | |
| **MEJORA:** Progreso visual del curso (barra %) | ❌ Pendiente | |
| **MEJORA:** Certificados al completar curso | ❌ Pendiente | |
| **MEJORA:** Recordatorios de clase (push/toast) | ❌ Pendiente | |
| **MEJORA:** Grabaciones de clases integradas | ❌ Pendiente | |
| **MEJORA:** Foro de dudas por clase | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 6. Logros / Achievements

| Feature | Estado | Notas |
|---|---|---|
| CRUD Logros (admin) | ✅ | `admin/logros.js` |
| Asignar logros a miembros (admin) | ✅ | Tabla `member_achievements` |
| Mostrar logros en perfil del alumno | ❌ Pendiente | No renderizado en `renderProfile()` |
| **MEJORA:** Notificación al obtener logro | ❌ Pendiente | |
| **MEJORA:** Logros automáticos por stats (tracker) | ❌ Pendiente | |
| **MEJORA:** Animación al desbloquear | ❌ Pendiente | |
| **MEJORA:** Logros ocultos / secretos | ❌ Pendiente | |
| **MEJORA:** Puntos de logro (score) | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 7. Sistema de Asistencia

| Feature | Estado | Notas |
|---|---|---|
| CRUD Asistencia (admin) | ✅ | `admin/attendance.js` |
| Confirmación de asistencia por alumno | ✅ | Tabla `attendance_confirmations` |
| Vista de asistencia para alumno | ❌ Pendiente | No hay sección en students.html |
| **MEJORA:** QR para check-in en clase | ❌ Pendiente | |
| **MEJORA:** Auto-registro por horario | ❌ Pendiente | |
| **MEJORA:** Reporte mensual de asistencia | ❌ Pendiente | |
| **MEJORA:** Gráfica de asistencia por alumno | ❌ Pendiente | |
| **MEJORA:** Penalización por inasistencia | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 8. Registro / Aplicaciones

| Feature | Estado | Notas |
|---|---|---|
| Página de registro (`register.html`) | ✅ | Formulario público |
| CRUD Aplicaciones en admin | ✅ | `admin/applications.js` |
| Aprobar / rechazar solicitantes | ✅ | |
| **MEJORA:** Formulario más detallado (rol, disponibilidad) | ❌ Pendiente | |
| **MEJORA:** Email de confirmación automático | ❌ Pendiente | |
| **MEJORA:** Integración con Discord (join automático) | ❌ Pendiente | |
| **MEJORA:** Cola de espera / lista de espera | ❌ Pendiente | |
| **MEJORA:** Notificación al solicitante | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 9. Comunidad

| Feature | Estado | Notas |
|---|---|---|
| Página comunidad (`community.html`) | ✅ | `public.js` |
| Visibilidad de secciones (admin control) | ✅ | |
| Noticias públicas | ✅ | |
| Vista de miembros / equipo | ✅ | |
| **MEJORA:** Chat / Foro integrado | ❌ Pendiente | |
| **MEJORA:** Leaderboard comunitario público | ❌ Pendiente | |
| **MEJORA:** Calendario de eventos público | ❌ Pendiente | |
| **MEJORA:** Galería de clips / highlights | ❌ Pendiente | |
| **MEJORA:** Sistema de likes / reacciones | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 10. Realtime / Supabase

| Feature | Estado | Notas |
|---|---|---|
| Conexión Supabase JS (v2) | ✅ | |
| Realtime channels (2 canales) | ✅ | `public-changes` + `admin-changes` |
| Payload.new para INSERT/UPDATE | ✅ | Evita re-fetch completo |
| Payload.old para DELETE | ✅ | |
| Sincronización automática entre pestañas | ✅ | |
| **MEJORA:** Reconexión automática más robusta | ❌ Pendiente | |
| **MEJORA:** Indicador de estado en tiempo real | ❌ Pendiente | Mejorar el badge actual |
| **MEJORA:** Presencia (quién está online) | ❌ Pendiente | |
| **MEJORA:** Fila de espera para escrituras offline | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 11. UX / Overlays / Loadings

| Feature | Estado | Notas |
|---|---|---|
| Pantalla de carga inicial (loader) | ✅ | Círculo + logo, 3 fases de carga |
| Login overlay | ✅ | |
| Edit profile overlay | ✅ | |
| Share profile overlay | ✅ | |
| Detail overlay (genérico) | ✅ | |
| Image overlay (zoom) | ✅ | |
| Toast notifications | ✅ | |
| Skeleton loading | ✅ | |
| Partículas de fondo | ✅ | |
| Scroll reveal animations | ✅ | |
| Ripple effect en botones | ✅ | |
| Navbar con scroll effect | ✅ | |
| **MEJORA:** Modo oscuro / claro toggle | ❌ Pendiente | |
| **MEJORA:** PWA (offline, service worker) | ❌ Pendiente | |
| **MEJORA:** Animaciones de transición entre secciones | ❌ Pendiente | |
| **MEJORA:** Temas de color (múltiples acentos) | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 12. Backend / Infraestructura (Frontend Next.js)

| Feature | Estado | Notas |
|---|---|---|
| Proyecto Next.js en `/frontend` | ⚠️ Parcial | Existe pero no se usa (HTML vanilla activo) |
| PostCSS config | ✅ | |
| `globals.css` | ⚠️ Parcial | No sincronizado con `base.css` |
| **MEJORA:** Migrar de HTML vanilla a Next.js | ❌ Pendiente | |
| **MEJORA:** SSR / SEO para páginas públicas | ❌ Pendiente | |
| **MEJORA:** API routes para HenrikDev proxy | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

## 13. Pendientes Técnicos Generales

| Feature | Estado | Notas |
|---|---|---|
| Limpiar JS huérfanos (`index.js`, etc.) | ❌ Pendiente | No los carga ninguna página |
| Unificar constantes (extrasKeys, etc.) | ❌ Pendiente | Repetido en 3 archivos |
| TypeScript / JSDoc | ❌ Pendiente | |
| Tests automatizados | ❌ Pendiente | |
| CI/CD (GitHub Actions) | ❌ Pendiente | |
| Documentación de API interna | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

---

> **Leyenda:** ✅ = Completo, ⚠️ = Parcial / Mejorable, ❌ = No implementado, 🔲 = Espacio para futuras features
