# TODO — QU4SAR Academy

> Lista maestra de tareas fase por fase.
> Marcamos en PHASE.md lo que estamos ejecutando ahora.

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

## Fase 1 — Perfil PRO (Sprint 1) (COMPLETADO)

### 1.1 Historial de Rango Visual
- [x] Renderizar `rank_history` en el perfil del alumno
- [x] Timeline visual (línea temporal con dots)
- [x] Mostrar rango actual + peak en timeline

### 1.2 Logros en Perfil
- [x] Renderizar `member_achievements` en perfil
- [x] Grid de logros con rarezas (Common, Rare, Epic, Legendary, Cosmic)
- [x] Animación hover con glow
- [x] Contador de logros desbloqueados

### 1.3 Sistema XP + Niveles
- [x] Crear sistema de cálculo de XP (logros, tareas, evaluaciones, asistencia)
- [x] Niveles con nombres QU4SAR (Cosmic I–V, Astral I–V, Nebula)
- [x] Barra de progreso de XP en perfil

### 1.4 Badges Flotantes
- [x] Badges decorativos con glow
- [x] Posiciones flotantes alrededor del avatar (TL, TR, BL, BR)

### 1.5 Bio / Estado Personal
- [x] Campo "estado" (bio_status) en formulario de edición
- [x] Sincronizar a Supabase + localStorage
- [x] Mostrar en perfil

### 1.6 Color Personalizado
- [x] Selector de color acento en formulario de edición
- [x] Aplicar a borde del avatar, glow, badges flotantes
- [x] Sincronizar a Supabase + localStorage

---

## Fase 2 — Command Center (Sprint 2) (COMPLETADO)

### 2.1 Vista Semanal del Coach
- [x] Calendario con actividades del grupo (grid 7 días)
- [x] Navegación entre semanas (chevron + botón Hoy)

### 2.2 Gráficas de Rendimiento
- [x] Asistencia del grupo (gráfica de barras CSS)
- [x] Top alumnos del grupo (por XP, asistencia, logros)

### 2.3 Alertas de Tareas
- [x] Detectar tareas vencidas por alumno
- [x] Badge de alerta en dashboard coach
- [x] Lista de alumnos con tareas pendientes + días atrasadas

### 2.4 Comparativa de Alumnos
- [x] Tabla comparativa (rango, XP, eval, tareas, asistencia, logros)

---

## Fase 3 — Tracker Avanzado (Sprint 3) (COMPLETADO)

### 3.1 Más Stats de HenrikDev
- [x] ACS
- [x] ADR
- [x] KAST
- [x] Winrate
- [x] Top agentes jugados
- [x] Peak rank automático

### 3.2 Visualizaciones
- [x] Radar charts de stats (SVG 6 ejes)
- [ ] Evolución temporal (línea de tiempo)
- [ ] Heatmap de rendimiento

### 3.3 Auto-refresh
- [x] Refresh periódico automático (90s)
- [x] Indicador de última actualización
- [x] Botón de refresh con feedback

---

## Fase 4 — Academia Premium (Sprint 4) (COMPLETADO)

### 4.1 Barra de Progreso
- [x] % de avance por curso (tareas 30%, evals 20%, quizzes 20%, asistencia 30%)
- [x] Vinculado a XP del alumno
- [x] Mostrar en perfil y panel

### 4.2 Certificados
- [x] Generar certificado al completar curso
- [x] Diseño QU4SAR (html2canvas)
- [x] Descargar / compartir

### 4.3 Recordatorios
- [x] Toast recordatorio de próxima clase
- [x] Basado en horario del alumno

### 4.4 Entrega de Archivos
- [x] Subir archivos en tareas (a Supabase Storage)
- [x] Almacenar en DATA.task_submissions
- [x] Vista de entregas para el coach (dashboard)

---

## Fase 5 — Comunidad (Sprint 5) (COMPLETADO)

### 5.1 Leaderboard
- [x] Tabla de posiciones por XP
- [x] Filtro por grupo
- [x] Top con medallas 🥇🥈🥉

### 5.2 Calendario de Eventos
- [x] Eventos públicos visibles en community.html
- [x] Integrar con sistema de horarios existente

### 5.3 Highlights / Clips
- [x] Galería de clips destacados
- [x] Subida de videos (embed YouTube/Twitch)
- [x] Reacciones / likes

### 5.4 Sistema de Reacciones
- [x] Like en clips
- [x] Contador visible
- [x] Persistido a Supabase

---

## Fase 6 — Limpieza Técnica (Sprint 6) (COMPLETADO)

### 6.1 JS Huérfanos
- [x] Revisar `index.js`, `index-init.js`, `index-core.js`, `index-dashboard.js`, `index-render.js`
- [x] Eliminar (eran código muerto, sin referencias en ningún HTML)

### 6.2 Constantes Duplicadas
- [x] Crear `js/constants.js` con `window.EXTRAS_KEYS`
- [x] Referenciar desde `students.js` con fallback inline
- [x] Cargar en `students.html` antes de `shared.js`

### 6.3 TypeScript
- [ ] Migrar JS a TS gradualmente (pendiente)

### 6.4 Tests
- [ ] Configurar framework de tests (pendiente)
- [ ] Tests unitarios para funciones críticas (pendiente)

### 6.5 CI/CD
- [ ] GitHub Actions para lint + tests (pendiente)
- [ ] Deploy automático a GitHub Pages (ya activo manualmente)

---

## Fase 7 — Seguridad y Quick Wins

> Auditoría técnica. Prioridad absoluta antes de cualquier cambio funcional.
> Tiempo estimado: ~40 minutos. Riesgo de seguridad: CRÍTICO.

### 🔴 7.1 Rotación de Claves

- [ ] **Rotar Service Role Key en Supabase Dashboard**
  - Ubicación actual: `configuracion.md:9` (línea expuesta)
  - Impacto: CRÍTICO — clave con permisos totales sobre la DB
  - Acción: Generar nueva clave en Supabase > Settings > API > service_role key
  - Verificación: Confirmar que `sbp_64fbeac...` ya no funciona en Supabase
  - Nota: Esta clave NUNCA se usa en el código frontend, solo está documentada

- [ ] **Eliminar Service Role Key de configuracion.md**
  - Reemplazar con: `⚠️ ROTADA — no usar. Solicitar nueva si es necesario.`

- [ ] **Verificar que ANON key en shared.js:2-3 no esté comprometida**
  - Archivo: `js/shared.js` líneas 2-3
  - Acción: Confirmar que es la publishable key (anónima, diseñada para estar expuesta)
  - Conclusión esperada: Es segura por diseño, no requiere rotación

### 🟡 7.2 Gitignore

- [ ] **Agregar al `.gitignore`:**
  ```
  .env.local
  *.env.local
  .env.*
  !.env.example
  ```
- [ ] **Verificar que `frontend/.env.local` NO esté en staging**
  - Comando: `git status` — confirmar que `frontend/.env.local` no aparece
  - Si aparece: `git rm --cached frontend/.env.local`

### 🟡 7.3 JWT Fallback Hardcodeado

- [ ] **Eliminar fallback en `backend/src/middleware/auth.ts:18`**
  - Línea actual: `const secret = process.env.JWT_SECRET || 'fallback-dev-secret-key';`
  - Reemplazar con: `const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET no configurado');`
  - Justificación: El fallback permite autenticación sin variable de entorno

- [ ] **Eliminar fallback en `backend/src/routes/auth.ts:31`**
  - Mismo patrón que arriba

- [ ] **Verificar que no haya más JWT fallbacks en backend/**
  - Búsqueda: `grep -rn "fallback\||| '" backend/src/`

### 🟡 7.4 Catch Handlers Vacíos

Ubicaciones identificadas con patrón `catch(()=>{})`:

- [ ] **`js/students.js:1989-1993`** — Realtime subscription
  - Reemplazar con: `.catch(err => { console.error('[Students Realtime]', err); window.showToast?.('Error en conexión en vivo', 'error'); })`

- [ ] **`js/students.js:~1993-1995`** — Posible segundo catch vacío
  - Verificar y corregir

- [ ] **`js/admin/shared.js:388-422`** — Realtime subscription admin
  - Reemplazar con: `.catch(err => { console.error('[Admin Realtime]', err); window.showToast?.('Error en conexión en vivo', 'error'); })`

- [ ] **Buscar más catch vacíos en todo `js/`:**
  - Búsqueda: `grep -rn "catch\s*(\s*)\s*=>" js/`
  - Búsqueda: `grep -rn "catch\s*(\s*_\s*)\s*{" js/`

### 🟢 7.5 .env.example

- [ ] **Crear `.env.example` en raíz del proyecto:**
  ```env
  # Supabase
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here

  # Backend (Node.js/Express - deprecated)
  JWT_SECRET=your-jwt-secret-here
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

  # HenrikDev API (opcional)
  HENRIKDEV_API_KEY=your-henrikdev-key-here
  ```

---

## Fase 8 — Sincronización y Observabilidad

> Garantizar integridad de datos entre localStorage y Supabase.
> Problema raíz: `_pendingLocalSave` + catch vacíos generan pérdida silenciosa de datos.

### 🔴 8.1 Race Condition: `_pendingLocalSave`

- [ ] **Auditar `js/admin/shared.js:17`** — bandera `_pendingLocalSave`
  - Problema: Bandera booleana sin timeout ni cola. Si falla una operación, queda en `true` permanentemente y bloquea futuras sincronizaciones.
  - Solución: Reemplazar con cola de sincronización

- [ ] **Crear `js/sync.js`** — Sistema de cola de sincronización
  ```javascript
  window.SyncQueue = {
    _queue: [],
    _processing: false,
    _retryCount: 3,
    _retryDelay: 2000,
    enqueue(operation, priority = 'normal') {
      this._queue.push({ operation, priority, timestamp: Date.now() });
      if (!this._processing) this._process();
    },
    async _process() {
      this._processing = true;
      this._updateIndicator('syncing');
      while (this._queue.length > 0) {
        const item = this._queue.shift();
        for (let attempt = 0; attempt < this._retryCount; attempt++) {
          try {
            await item.operation();
            this._updateIndicator('saved');
            break;
          } catch (err) {
            console.error(`[Sync] Intento ${attempt + 1} falló:`, err);
            if (attempt < this._retryCount - 1) {
              await new Promise(r => setTimeout(r, this._retryDelay));
            } else {
              this._updateIndicator('error');
              window.showToast?.('Error al sincronizar. Reintentando...', 'error');
            }
          }
        }
      }
      this._processing = false;
      this._updateIndicator('idle');
    },
    _updateIndicator(status) {
      // TODO: Implementar indicador visual en Fase 8.2
    }
  };
  ```

### 🟡 8.2 Indicador Visual de Sync

- [ ] **Agregar indicador en UI admin** (esquina superior derecha)
  - Estados: `syncing` (spinning), `saved` (check verde), `error` (rojo), `offline` (gris)
  - Implementación: Elemento flotante `<div id="sync-indicator">`

- [ ] **Agregar indicador en UI students** (mismo diseño, menos prominente)

- [ ] **Integrar con `SyncQueue._updateIndicator()`**

### 🟡 8.3 Auditoría de `.catch()`

- [ ] **Buscar y reemplazar TODOS los `catch(()=>{})` en `js/`**
  - Reemplazo estándar:
    ```javascript
    .catch(err => {
      console.error('[SITE] Error:', err);
      window.showToast?.('Ocurrió un error inesperado', 'error');
    })
    ```

### 🟢 8.4 Migración SQL: `updated_at`

- [ ] **Agregar columna `updated_at` a tablas críticas:**
  ```sql
  -- Tablas que deben tener updated_at
  ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE members ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE task_submissions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE evaluations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE academy ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE groups ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE schedules ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE member_achievements ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE rank_history ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE community_posts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE draft_picks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  ```

- [ ] **Crear trigger function genérica:**
  ```sql
  CREATE OR REPLACE FUNCTION trigger_set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

- [ ] **Aplicar trigger a cada tabla:**
  ```sql
  CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  -- repetir para cada tabla de arriba
  ```

### 🟢 8.5 Estado de Sync en DATA

- [ ] **Agregar `window.DATA._sync = { status: 'idle', lastAttempt: null, lastSuccess: null, pendingCount: 0 }`**
- [ ] **Actualizar en cada operación de sync**
- [ ] **Mostrar en consola si `localStorage.debugSync = true`**

---

## Fase 9 — Academia 2.0: Estructura de Datos

> Modelo híbrido aprobado:
> - **Cohorte dominante**: `groups` → cohortes con `month_current`
> - **Progresión individual como excepción**: `members.current_month`
> - **90% del código existente se reutiliza** porque `group_id` sigue siendo el eje principal
>
> Filosofía: QU4SAR es una academia competitiva, no un curso asíncrono.
> Comunidad, competencia, eventos, scrims y progreso grupal definen el ritmo.
> El alumno excepcional puede atrasarse o adelantarse, pero el default es "sigue a tu cohorte".

### 9.1 Migración groups → cohortes

- [ ] **ALTER TABLE groups**
  ```sql
  ALTER TABLE groups ADD COLUMN type TEXT DEFAULT 'cohort';
  ALTER TABLE groups ADD COLUMN start_date DATE;
  ALTER TABLE groups ADD COLUMN end_date DATE;
  ALTER TABLE groups ADD COLUMN month_current INTEGER DEFAULT 1;
  ```

- [ ] **Renombrar grupos existentes:**
  ```sql
  UPDATE groups SET name = 'Alfa 2026', type = 'cohort', month_current = 1 WHERE id = 'g1';
  UPDATE groups SET name = 'Beta 2026', type = 'cohort', month_current = 1 WHERE id = 'g2';
  ```

- [ ] **Seed de cohortes (nuevas):**
  ```sql
  INSERT INTO groups (id, name, type, start_date, end_date, month_current) VALUES
    ('cohort_alfa_2026',  'Alfa 2026',  'cohort', '2026-01-15', '2027-01-15', 1),
    ('cohort_beta_2026',  'Beta 2026',  'cohort', '2026-04-15', '2027-04-15', 1),
    ('cohort_gamma_2026', 'Gamma 2026', 'cohort', '2026-07-15', '2027-07-15', 1),
    ('cohort_delta_2026', 'Delta 2026', 'cohort', '2026-10-15', '2027-10-15', 1);
  ```

### 9.2 Nuevas columnas en members

- [ ] **ALTER TABLE members**
  ```sql
  ALTER TABLE members ADD COLUMN current_month INTEGER DEFAULT 1;
  ALTER TABLE members ADD COLUMN enrollment_date DATE DEFAULT CURRENT_DATE;
  ALTER TABLE members ADD COLUMN academy_status TEXT DEFAULT 'active';
  ALTER TABLE members ADD COLUMN primary_role TEXT;
  ALTER TABLE members ADD COLUMN secondary_role TEXT;
  ALTER TABLE members ADD COLUMN specialization TEXT;
  ```

  **Estados de `academy_status`:**

  | Estado | Significado |
  |--------|-------------|
  | `active` | Alumno activo, sigue el ritmo de la cohorte |
  | `recovery` | Alumno en recuperación académica (current_month < cohorte) |
  | `graduated` | Completó los 12 meses del programa |
  | `inactive` | Suspendido / pausado temporalmente |
  | `draft` | En proceso de draft competitivo (no oficial aún) |
  | `academy_team` | Graduado, juega en academy team oficial |
  | `main_team` | Graduado, juega en main team de QU4SAR |

### 9.3 Adaptación de tablas existentes

- [ ] **ALTER TABLE academy**
  ```sql
  ALTER TABLE academy ADD COLUMN month INTEGER;
  ALTER TABLE academy ADD COLUMN module_name TEXT;
  ALTER TABLE academy ADD COLUMN subject TEXT;
  ```

- [ ] **ALTER TABLE evaluations**
  ```sql
  ALTER TABLE evaluations ADD COLUMN subject TEXT;
  ALTER TABLE evaluations ADD COLUMN month INTEGER;
  ALTER TABLE evaluations ADD COLUMN weight INTEGER DEFAULT 1;
  ```

- [ ] **ALTER TABLE group_coaches**
  ```sql
  ALTER TABLE group_coaches ADD COLUMN subject TEXT;
  ALTER TABLE group_coaches ADD COLUMN month INTEGER;
  ```
  > Justificación: Un coach puede enseñar materias específicas en meses específicos,
  > no necesariamente todo el programa. Ej: "Coach A: Aim Lab en Mes 1-3",
  > "Coach B: Teamplay en Mes 4-6".

### 9.4 Tablas nuevas

- [ ] **CREATE TABLE draft_picks**
  ```sql
  CREATE TABLE draft_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    season TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scouted',
    notes TEXT,
    picked_by UUID REFERENCES members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Índices
  CREATE INDEX idx_draft_picks_member ON draft_picks(member_id);
  CREATE INDEX idx_draft_picks_season ON draft_picks(season);
  CREATE INDEX idx_draft_picks_status ON draft_picks(status);
  ```

  **Estados de `draft_picks.status`:**

  | Estado | Significado |
  |--------|-------------|
  | `scouted` | Detectado, en observación |
  | `trial` | En período de prueba |
  | `accepted` | Aceptó oferta |
  | `rejected` | Rechazó oferta |
  | `signed` | Firmó contrato (miembro oficial) |

---

## Fase 10 — Academia 2.0: Migración y Adaptación

> Reemplazar conceptos antiguos sin romper funcionalidad existente.

### 10.1 Código a deprecar/eliminar

- [ ] **Eliminar `getGroupFromRank()` en `shared.js:88-93`**
  - Función que derivaba group_id automáticamente desde el rank de Valorant
  - Ya no tiene sentido: los grupos son cohortes, no rangos
  - Alternativa: El coach/admin asigna manualmente la cohorte al alumno

- [ ] **Eliminar `rankDivision()` en `students.js:513-515`**
  - Dividía estudiantes por rango competitivo
  - Ya no aplica con el modelo de cohortes
  - Alternativa: Convertir a badge decorativo en el perfil si se desea mantener

- [ ] **Eliminar derivación automática de `group_id` desde rank en login**
  - Buscar en `shared.js` y `students.js` lógica como:
    ```javascript
    if (!member.group_id) member.group_id = getGroupFromRank(member.rank);
    ```
  - Reemplazar con: la cohorte se asigna manualmente en el panel admin

### 10.2 Formularios admin

- [ ] **Actualizar selectores de grupo a cohortes** en:
  - `admin/members.html` — asignación de cohorte + current_month
  - `admin/tasks.html` — filtro por cohorte
  - `admin/academy.html` — filtro por cohorte + month + subject
  - `admin/evaluations.html` — filtro por cohorte + month + subject
  - `admin/schedule.html` — filtro por cohorte

- [ ] **Agregar campos nuevos en formularios:**
  - `admin/members.html`: `current_month`, `enrollment_date`, `academy_status`, `primary_role`, `secondary_role`, `specialization`
  - `admin/academy.html`: `month`, `module_name`, `subject`
  - `admin/evaluations.html`: `subject`, `month`, `weight`
  - `admin/group_coaches.html`: `subject`, `month`

- [ ] **Agregar estado de graduación en perfil admin**: Selector de `academy_status`

### 10.3 Datos

- [ ] **Asignar cohorte a miembros existentes:**
  ```sql
  UPDATE members SET group_id = 'cohort_alfa_2026' WHERE group_id = 'g1';
  UPDATE members SET group_id = 'cohort_beta_2026' WHERE group_id = 'g2';
  ```

- [ ] **Asignar valores por defecto a miembros existentes:**
  ```sql
  UPDATE members SET
    current_month = 1,
    enrollment_date = created_at::DATE,
    academy_status = 'active'
  WHERE current_month IS NULL;
  ```

- [ ] **Migrar academy al nuevo formato:**
  ```sql
  -- Asignar month basado en el orden de creación (aproximación)
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY group_id ORDER BY created_at) AS rn
    FROM academy
  )
  UPDATE academy a SET month = r.rn FROM ranked r WHERE a.id = r.id;
  ```

---

## Fase 11 — Academia 2.0: Nuevas Vistas UI

> Funcionalidades visibles que aprovechan la nueva estructura.

### 11.1 Timeline de 12 Meses

- [ ] **Vista en perfil del alumno** (`students.html`)
  - Línea temporal con los 12 meses del programa
  - Mes actual resaltado
  - Meses completados con check
  - Tooltip: "Mes 4: Estrategia Avanzada"

- [ ] **Integrar con `academy.month` y `evaluations.month`**
  - Cada mes muestra los módulos, evaluaciones y tareas asociadas

### 11.2 Progreso por Módulo

- [ ] **Basado en `evaluations.subject`**
  - Agrupar evaluaciones por materia
  - Mostrar % de avance por materia
  - Ejemplo: "Aim Lab: 80% | Teamplay: 60% | Estrategia: 40%"

### 11.3 Vista de Recuperación Académica

- [ ] **Detectar alumnos con `current_month < group.month_current`**
- [ ] **Vista en dashboard del coach:**
  - Lista de alumnos en recuperación
  - Mes actual del alumno vs mes de la cohorte
  - Material pendiente por mes
  - Botón "Asignar material de recuperación"

- [ ] **Vista para el alumno:**
  - Banner: "Estás en recuperación académica. Tu mes: X | Cohorte: Y"
  - Acceso rápido a material de meses anteriores

### 11.4 Badge de Cohorte en Perfil

- [ ] **Reemplazar badge de grupo numérico** por badge de cohorte
  - Diseño: "Alfa 2026" con color de cohorte
  - Tooltip: "Ingresó: Ene 2026 | Mes actual: 4"

- [ ] **Paleta de colores por cohorte:**
  | Cohorte | Color |
  |---------|-------|
  | Alfa | #FF6B35 (naranja) |
  | Beta | #00B4D8 (cian) |
  | Gamma | #7209B7 (púrpura) |
  | Delta | #06D6A0 (verde) |

### 11.5 Dashboard Coach: Filtros

- [ ] **Filtros mejorados en `admin/dashboard.js`:**
  - Por cohorte (en lugar de grupo)
  - Por materia (`evaluations.subject`)
  - Por mes (`academy.month`)
  - Por estado (`members.academy_status`)

- [ ] **Vista de progreso de cohorte:**
  - % de alumnos al día
  - Alumnos en recuperación
  - Promedio de avance por materia

### 11.6 Estado de Graduación

- [ ] **Mostrar en perfil del alumno:**
  - Badge de estado (active / recovery / graduated / inactive / draft)
  - Timeline de hitos alcanzados

- [ ] **Vista de graduados:**
  - Alumnos con `academy_status = 'graduated'`
  - Certificado visible en perfil
  - Ruta de evolución: academy → academy_team → main_team

### 11.7 Panel de Draft Competitivo

- [ ] **Vista para admins y coaches** (`admin/draft.html`)
  - Lista de alumnos scouteados (de otras academias o reclutas)
  - Evaluación basada en: progreso, asistencia, evaluaciones, scrims, XP, achievements
  - Sistema de tracking: scouted → trial → accepted → rejected → signed
  - Notas por jugador

- [ ] **Tabla `draft_picks` como almacenamiento:**
  - CRUD completo en panel admin
  - Histórico por temporada

---

## Fase 12 — Next.js Backend Inteligente (Progresivo)

> API Routes en Next.js para funciones específicas.
> NO se migran las vistas frontend todavía.

### 12.1 API Route: HenrikDev Proxy

- [ ] **`frontend/src/app/api/tracker/[region]/[name]/[tag]/route.ts`**
  - Proxy para ocultar HenrikDev API Key
  - Cache en Supabase o Redis
  - Rate limiting por alumno
  - Código ya existe en `backend/src/routes/tracker.ts`

### 12.2 API Route: Reportes Agregados

- [ ] **`frontend/src/app/api/admin/reports/route.ts`**
  - Reportes que hoy son consultas pesadas desde el frontend
  - Endpoints: progreso general, asistencia, rendimiento por cohorte

### 12.3 API Route: Progreso de Cohorte

- [ ] **`frontend/src/app/api/cohorts/[id]/progress/route.ts`**
  - Stats agregados de la cohorte: completitud, alumnos en recovery, materias más débiles

### 12.4 Migración de Páginas Públicas

- [ ] Landing page (`index.html` → Next.js)
- [ ] Team page (`team.html` → Next.js)
- [ ] News page (`news.html` → Next.js)
- [ ] Academy page (`academy.html` → Next.js)

### 12.5 Migración de Students Panel

- [ ] Migración progresiva de páginas protegidas (última prioridad)
- [ ] Autenticación con NextAuth.js + Supabase

### 12.6 Migración de Admin Panel

- [ ] Último paso del roadmap
- [ ] Solo cuando todo lo demás esté estable

---

## Arquitectura Decidida: Modelo Híbrido Academia 2.0

### Decisión Técnica

**Modelo elegido:** Cohorte dominante con progresión individual como excepción.

```
Cohorte (groups.month_current) → Ritmo general
  └── Alumno sincronizado (members.current_month = cohorte) → Default
  └── Alumno en recuperación (members.current_month < cohorte) → Excepción
  └── Alumno adelantado (members.current_month > cohorte) → Excepción rara
```

### Por qué este modelo

```
QU4SAR no es una plataforma tipo Udemy.
Es una academia competitiva.

Y las academias competitivas viven de:
  Comunidad
  Competencia
  Eventos
  Scrims
  Progreso grupal

Si cada alumno está en un mes distinto, pierdes gran parte de eso.
```

### Reutilización de código

| Componente | Cambio requerido |
|------------|------------------|
| `filterByGroup(items)` | Sin cambios |
| `filterByCoach(items)` | Sin cambios |
| `adminGroupFilterHTML()` | Sin cambios |
| Todos los CRUDs admin | Sin cambios estructurales |
| Dashboard coach | Sin cambios |
| Leaderboard | Sin cambios |
| Schedule | Sin cambios |
| Perfil de alumno | Agregar timeline + badge de cohorte |
| Panel admin de members | Agregar campos nuevos |

**Esto es oro: ~90% del código existente se reutiliza.**

### Lo único NUEVO que se agrega

1. **Vista de Recuperación Académica** — convierte el desfase en funcionalidad
2. **Timeline de 12 Meses** — progreso visible del programa
3. **Progreso por Módulo/Materia** — basado en `evaluations.subject`
4. **Panel de Draft** — competitive drafting workflow
5. **Badge de Cohorte** — identidad visual de grupo

### Tablas involucradas

**24 de ~30 tablas existentes se mantienen sin cambios.**

| Tabla | Cambio |
|-------|--------|
| `groups` | +4 columnas (type, start_date, end_date, month_current) |
| `members` | +6 columnas (current_month, enrollment_date, academy_status, roles, specialization) |
| `academy` | +3 columnas (month, module_name, subject) |
| `evaluations` | +3 columnas (subject, month, weight) |
| `group_coaches` | +2 columnas (subject, month) |
| `draft_picks` | **NUEVA** — competitivo |
| ~24 tablas más | Sin cambios |

### Regla de negocio fundamental

```javascript
// Normal:
member.current_month === group.month_current

// Excepción (ingresó tarde, suspendió, recuperación, adelantó):
member.current_month !== group.month_current
```

---

## Historial de Decisiones

### 2026-06-13: Modelo Híbrido Aprobado

Se rechazaron:
- **Cohorte pura** (no maneja admisión continua)
- **Progresión individual pura** (rompe 50% del código, destruye dinámica grupal)

Se aprobó:
- **Híbrido con cohorte dominante** (90% código reutilizado, admisión continua, recuperación académica)

### 2026-06-13: Fase 7 como Prioridad Absoluta

Se decide que NO se toca ninguna funcionalidad hasta resolver:
1. Service Role Key expuesta en docs
2. .env.local no gitignored
3. JWT fallback en backend
4. Catch handlers vacíos
5. Sync race condition

---

## Referencias de Código por Fase

### Fase 7 — Archivos a modificar

| Archivo | Líneas | Cambio |
|---------|--------|--------|
| `configuracion.md:9` | 1 | Eliminar Service Role Key |
| `.gitignore` | ~3 | Agregar .env.local |
| `backend/src/middleware/auth.ts:18` | 1 | Eliminar JWT fallback |
| `backend/src/routes/auth.ts:31` | 1 | Eliminar JWT fallback |
| `js/students.js:1989-1993` | ~5 | Catch vacío → error handling |
| `js/admin/shared.js:388-422` | ~5 | Catch vacío → error handling |

### Fase 8 — Archivos a modificar/crear

| Archivo | Cambio |
|---------|--------|
| `js/sync.js` | **NUEVO** — SyncQueue |
| `js/admin/shared.js` | Reemplazar `_pendingLocalSave` por SyncQueue |
| `js/shared.js` | Agregar `DATA._sync` |

### Fase 9 — Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/...sql` | Migraciones ALTER TABLE |
| `js/shared.js:88-93` | Eliminar `getGroupFromRank()` |

### Fase 10 — Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `js/students.js:513-515` | Eliminar `rankDivision()` |
| `admin/*.html` | Formularios con campos nuevos |

### Fase 11 — Archivos a modificar/crear

| Archivo | Cambio |
|---------|--------|
| `admin/draft.html` | **NUEVO** — Panel de draft |
| `js/students.js` | Timeline, badge de cohorte, recuperación |
| `js/admin/dashboard.js` | Filtros por cohorte/materia/mes |

---

> **Regla:** Al completar una tarea, cambiar `[ ]` por `[x]`.
> Al empezar una, cambiar `[ ]` por `[-]`.
