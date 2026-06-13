# QU4SAR Academy — Plan Estratégico de Integración

> No más features al azar. Esto es una academia, no una navaja suiza.

---

## Pilares de Identidad QU4SAR

Todo debe girar alrededor de estos 4 pilares:

| Pilar | Significado |
|---|---|
| 🔺 **Progreso** | Cada acción suma. Niveles, XP, evolución |
| ⚔️ **Competencia** | Leaderboards, stats, rendimiento |
| 🛡️ **Disciplina** | Asistencia, streaks, constancia |
| 🌌 **Evolución** | Logros, certificados, crecimiento |

### Guía visual (NO romper)

| Hacer | NO hacer |
|---|---|
| Nebulosas, energía púrpura | Minecraft references |
| Interfaces VCT + sci-fi | Omen / agentes específicos |
| Glow espacial (#8B5CF6, #A855F7, #C084FC) | Copias de Tracker.gg |
| Anillos cósmicos, estrellas | Copias de Discord |
| Sensación de "centro de mando" | Interfaces genéricas |

> Cuando alguien abra la plataforma debe decir **"Esto es QU4SAR Academy"**, no "esto parece una copia de otra herramienta".

---

## LO QUE ESTÁ COMPLETO (no tocar)

| Área | Estado |
|---|---|
| Perfil base de alumno | ✅ No tocar salvo bugs |
| CRUDs principales (admin) | ✅ No tocar salvo bugs |
| Dashboard Coach básico | ✅ No tocar salvo bugs |
| Tracker HenrikDev básico | ✅ No tocar salvo bugs |
| Academia / Clases núcleo | ✅ No tocar salvo bugs |
| Realtime Supabase | ✅ No tocar salvo bugs |
| UX base (loaders, overlays, toasts) | ✅ No tocar salvo bugs |
| Comunidad básica | ✅ No tocar salvo bugs |

---

## INVENTARIO DETALLADO POR PRIORIDAD

### Prioridad CRÍTICA (Parciales)

#### 1. Perfil de Alumno (80% → 100%)

| Feature | Estado | Notas |
|---|---|---|
| Historial de rango visual | ❌ Pendiente | Tabla `rank_history` existe, no se renderiza |
| Logros renderizados en perfil | ❌ Pendiente | `member_achievements` existe, sin UI |
| Sistema de niveles | ❌ Pendiente | XP acumulado |
| Sistema de XP | ❌ Pendiente | |
| Badges flotantes | ❌ Pendiente | |
| Bio / texto de estado | ❌ Pendiente | |
| Color personalizado por alumno | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

> **Propuesta QU4SAR:** "QU4SAR OPERATIVE PROFILE" — Nivel Cosmic, XP, badges flotantes con glow, timeline de progreso, logros holográficos. Todo en #8B5CF6, #A855F7, #C084FC.

---

#### 2. Dashboard Coach (40% → 100%)

| Feature | Estado | Notas |
|---|---|---|
| Timeline básico | ✅ | Ya existe |
| Vista semanal | ❌ Pendiente | |
| Calendario integrado | ❌ Pendiente | |
| Comparativa entre alumnos del grupo | ❌ Pendiente | |
| Alertas de tareas vencidas | ❌ Pendiente | |
| Progreso visual por alumno (barra) | ❌ Pendiente | |
| Gráficas de rendimiento del grupo | ❌ Pendiente | |
| Top alumnos del grupo | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

> **Propuesta QU4SAR:** "QU4SAR COMMAND CENTER" — Paneles holográficos con rendimiento del grupo, asistencia, evolución semanal, top alumnos. Como centro de mando espacial, no un Trello.

---

#### 3. Tracker API — HenrikDev (50% → 100%)

| Feature | Estado | Notas |
|---|---|---|
| HS% / KD / DPR | ✅ | Ya funciona |
| Mostrar ACS | ❌ Pendiente | API lo devuelve |
| Mostrar ADR | ❌ Pendiente | |
| Mostrar KAST | ❌ Pendiente | |
| Winrate | ❌ Pendiente | |
| Top agentes jugados | ❌ Pendiente | |
| Peak Rank (rango máximo histórico) | ❌ Pendiente | |
| Historial de partidas recientes | ❌ Pendiente | |
| Auto-refresh periódico | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

> **Propuesta QU4SAR:** "Cosmic Performance Analytics" — Radar charts, heatmaps, evolución temporal. Nada de copiar Tracker Network.

---

#### 4. Academia (70% → 100%)

| Feature | Estado | Notas |
|---|---|---|
| Clases, currículum, materiales | ✅ | Núcleo completo |
| Barra de progreso del curso | ❌ Pendiente | |
| Certificados al completar | ❌ Pendiente | |
| Recordatorios de clase | ❌ Pendiente | |
| Grabaciones integradas | ❌ Pendiente | |
| Entrega de archivos en tareas | ❌ Pendiente | |
| Foro de dudas por clase | ❌ Pendiente | |
| **NUEVO:** | 🔲 | |
| **NUEVO:** | 🔲 | |

> **Propuesta QU4SAR:** Cada curso como "Ruta de entrenamiento QU4SAR", no simplemente una lista de clases.

---

### Prioridad ALTA

#### 5. Sistema de Logros

| Feature | Estado |
|---|---|
| CRUD Logros (admin) | ✅ |
| Asignar a miembros (admin) | ✅ |
| Renderizar en perfil del alumno | ❌ Pendiente |

**Propuesta de categorías:**

| Categoría | Descripción |
|---|---|
| 🏆 Competitivo | Logros por rango, winrate, stats |
| 🎯 Disciplina | Asistencia, streaks, constancia |
| 👑 Liderazgo | Coach, mentoría, trabajo en equipo |
| 🤝 Comunidad | Participación, eventos, ayuda |
| 📚 Coach | Logros para coaches |

**Rarezas:**

| Rareza | Color |
|---|---|
| Common | Gris |
| Rare | Azul |
| Epic | Púrpura |
| Legendary | Dorado |
| 🌌 Cosmic | #8B5CF6 glow |

---

#### 6. Asistencia

| Feature | Estado |
|---|---|
| CRUD Asistencia (admin) | ✅ |
| Confirmación por alumno | ✅ |
| Vista para alumno | ❌ Pendiente |
| Estadísticas / reportes | ❌ Pendiente |
| Gráficas | ❌ Pendiente |
| **Propuesta:** Sistema de Streaks (7 días, 30 días → ganas XP) | ❌ Pendiente |

---

#### 7. Comunidad

| Feature | Estado |
|---|---|
| Noticias públicas | ✅ |
| Vista de miembros | ✅ |
| Calendario de eventos público | ❌ Pendiente |
| Leaderboard comunitario | ❌ Pendiente |
| Galería de highlights / clips | ❌ Pendiente |
| Reacciones / likes | ❌ Pendiente |
| ⚠️ **NO hacer chat integrado** (Discord ya existe) | ❌ |

---

### Prioridad TÉCNICA (Media)

#### 8. Deuda Técnica

| Feature | Prioridad |
|---|---|
| JS huérfanos (`index.js`, `index-*.js`) — no los carga ninguna página | 🔴 Alta |
| Constantes duplicadas (`extrasKeys` repetido en 3 archivos) | 🔴 Alta |
| TypeScript / JSDoc | 🟡 Media |
| Tests automatizados | 🟡 Media |
| CI/CD (GitHub Actions) | 🟡 Media |
| Unificar estilos entre CSS files | 🟢 Baja |
| Migrar a Next.js | 🟢 Baja |

---

## ROADMAP — SPRINTS

### Sprint 1 — Perfil PRO (recomendado empezar aquí)

| Tarea | Dependencias |
|---|---|
| Historial de rango visual en perfil | `rank_history` table existe |
| Logros renderizados en perfil | `member_achievements` table existe |
| Badges flotantes con glow | Diseño CSS |
| Sistema XP + Niveles | Nuevo cálculo |
| Bio / estado personal | Campo en `members` |

### Sprint 2 — Command Center (Coach PRO)

| Tarea | Dependencias |
|---|---|
| Vista semanal del coach | Sprint 1 |
| Calendario integrado | |
| Gráficas de rendimiento | Datos de tracker |
| Alertas de tareas vencidas | |
| Comparativa de alumnos | |

### Sprint 3 — Tracker Avanzado

| Tarea | Dependencias |
|---|---|
| ACS, ADR, KAST, Winrate | HenrikDev API |
| Top agentes | |
| Peak Rank | |
| Radar charts | Librería gráficos |
| Evolución temporal | |

### Sprint 4 — Academia Premium

| Tarea | Dependencias |
|---|---|
| Barra de progreso por curso | Sprint 1 (XP) |
| Certificados | html2canvas (ya existe) |
| Recordatorios | |
| Entrega de archivos | |

### Sprint 5 — Comunidad

| Tarea | Dependencias |
|---|---|
| Leaderboard | Datos tracker + XP |
| Calendario de eventos | |
| Highlights / clips | |
| Reacciones | |

### Sprint 6 — Limpieza Técnica

| Tarea | Dependencias |
|---|---|
| Eliminar JS huérfanos | |
| Unificar constantes | |
| TypeScript | |
| Tests | |
| CI/CD | |

---

## ZONAS QUE NO REPETIR

| Evitar | Porque |
|---|---|
| Otro sistema de noticias | Ya funciona |
| Otro CRUD genérico | Ya existe para todas las tablas |
| Otro panel administrativo | admin/shared.js ya cubre |
| Otro sistema de overlays | login, edit, share, detail, image ya existen |
| Otro sistema de branding | QU4SAR identity definida |
| Más dashboards duplicados | |
| Chat integrado | Discord ya existe |

---

## GUÍA RÁPIDA DE DECISIONES

Antes de agregar algo nuevo, preguntar:

1. ¿Refuerza **Progreso**, **Competencia**, **Disciplina** o **Evolución**?
2. ¿Se siente como **QU4SAR** o como copia de otra herramienta?
3. ¿Realmente hace falta o es ruido?
4. ¿Se puede hacer con lo que ya existe?

Si no pasa el filtro → no se hace.

---

> **Leyenda:** ✅ = Completo (no tocar), ❌ = Pendiente, 🔲 = Espacio para ideas futuras
