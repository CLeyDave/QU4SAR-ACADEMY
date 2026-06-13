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

## Fase 1 — Perfil PRO (Sprint 1)

### 1.1 Historial de Rango Visual
- [ ] Renderizar `rank_history` en el perfil del alumno
- [ ] Timeline visual (gráfica de evolución de rango)
- [ ] Mostrar rango actual + peak rank

### 1.2 Logros en Perfil
- [ ] Renderizar `member_achievements` en perfil
- [ ] Grid de logros con rarezas (Common, Rare, Epic, Legendary, Cosmic)
- [ ] Animación hover con glow
- [ ] Contador de logros desbloqueados

### 1.3 Sistema XP + Niveles
- [ ] Crear sistema de cálculo de XP
- [ ] Niveles con nombres QU4SAR (ej: Cosmic I-V)
- [ ] Barra de progreso de XP en perfil

### 1.4 Badges Flotantes
- [ ] Badges decorativos con glow
- [ ] Posiciones flotantes alrededor del avatar

### 1.5 Bio / Estado Personal
- [ ] Campo "bio" en formulario de edición
- [ ] Sincronizar a Supabase
- [ ] Mostrar en perfil

### 1.6 Color Personalizado
- [ ] Selector de color acento para el alumno
- [ ] Aplicar a bordes/glows del perfil
- [ ] Sincronizar a Supabase

---

## Fase 2 — Command Center (Sprint 2)

### 2.1 Vista Semanal del Coach
- [ ] Calendario con actividades del grupo
- [ ] Navegación entre semanas

### 2.2 Gráficas de Rendimiento
- [ ] Asistencia del grupo (gráfica)
- [ ] Evolución de stats semanal
- [ ] Top alumnos del grupo

### 2.3 Alertas de Tareas
- [ ] Detectar tareas vencidas
- [ ] Badge de alerta en dashboard coach
- [ ] Lista de alumnos con tareas pendientes

### 2.4 Comparativa de Alumnos
- [ ] Tabla comparativa lado a lado
- [ ] Stats, progreso, asistencia

---

## Fase 3 — Tracker Avanzado (Sprint 3)

### 3.1 Más Stats de HenrikDev
- [ ] ACS
- [ ] ADR
- [ ] KAST
- [ ] Winrate
- [ ] Top agentes jugados
- [ ] Peak rank automático

### 3.2 Visualizaciones
- [ ] Radar charts de stats
- [ ] Evolución temporal (línea de tiempo)
- [ ] Heatmap de rendimiento

### 3.3 Auto-refresh
- [ ] Refresh periódico automático
- [ ] Indicador de última actualización
- [ ] Botón de refresh con feedback

---

## Fase 4 — Academia Premium (Sprint 4)

### 4.1 Barra de Progreso
- [ ] % de avance por curso
- [ ] Vinculado a XP del alumno

### 4.2 Certificados
- [ ] Generar certificado al completar curso
- [ ] Diseño QU4SAR (html2canvas)
- [ ] Descargar / compartir

### 4.3 Recordatorios
- [ ] Toast recordatorio de próxima clase
- [ ] Basado en horario del alumno

### 4.4 Entrega de Archivos
- [ ] Subir archivos en tareas
- [ ] Almacenar en Supabase Storage
- [ ] Vista de entregas para el coach

---

## Fase 5 — Comunidad (Sprint 5)

### 5.1 Leaderboard
- [ ] Tabla de posiciones por XP
- [ ] Filtro por grupo
- [ ] Top mensual / semanal

### 5.2 Calendario de Eventos
- [ ] Eventos públicos visibles en community.html
- [ ] Integrar con sistema de horarios existente

### 5.3 Highlights / Clips
- [ ] Galería de clips destacados
- [ ] Subida de videos (embed)
- [ ] Reacciones / likes

### 5.4 Sistema de Reacciones
- [ ] Like en noticias, clips, logros
- [ ] Contador visible

---

## Fase 6 — Limpieza Técnica (Sprint 6)

### 6.1 JS Huérfanos
- [ ] Revisar `index.js`, `index-init.js`, `index-core.js`, `index-dashboard.js`, `index-render.js`
- [ ] Eliminar o migrar si es necesario

### 6.2 Constantes Duplicadas
- [ ] Unificar `extrasKeys` (repetido en students.js, admin/shared.js)
- [ ] Crear archivo de constantes compartido

### 6.3 TypeScript
- [ ] Migrar JS a TS gradualmente

### 6.4 Tests
- [ ] Configurar framework de tests
- [ ] Tests unitarios para funciones críticas

### 6.5 CI/CD
- [ ] GitHub Actions para lint + tests
- [ ] Deploy automático a GitHub Pages

---

## Ideas Futuras (sin priorizar)

- [ ] PWA / Service Worker (offline)
- [ ] Modo oscuro / claro toggle
- [ ] Tema de color personalizable por alumno
- [ ] QR para check-in de asistencia
- [ ] Chat / foro (baja prioridad, Discord ya existe)
- [ ] Notificaciones push
- [ ] Integración con Discord (join automático al aceptar)
- [ ] API routes en Next.js para proxy HenrikDev
- [ ] Migración completa a Next.js
