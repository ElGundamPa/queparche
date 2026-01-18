# FASE 8: Testing y Verificación Completa

## Objetivo
Verificar que todas las fases de integración de Supabase funcionan correctamente y que la aplicación está lista para producción.

---

## 📋 Checklist de Testing

### 1. Autenticación (FASE 3)

#### 1.1 Registro de Usuario
- [ ] Formulario de registro valida campos requeridos
- [ ] Email debe ser único
- [ ] Username debe ser único
- [ ] Contraseña mínima de 6 caracteres
- [ ] Usuario se crea en `auth.users`
- [ ] Perfil se crea automáticamente en `profiles` (trigger)
- [ ] Session se guarda en Zustand persist
- [ ] Redirección a onboarding después de registro

#### 1.2 Login
- [ ] Login con email y contraseña correctos funciona
- [ ] Error claro con credenciales incorrectas
- [ ] Session persiste después de cerrar la app
- [ ] Token se refresca automáticamente
- [ ] Redirección a home después de login exitoso

#### 1.3 Onboarding
- [ ] Avatar se sube correctamente a `avatars` bucket
- [ ] Bio se guarda en perfil
- [ ] Interests se guardan como array
- [ ] Avatar URL pública es accesible
- [ ] Redirección a home después de completar

#### 1.4 Logout
- [ ] Session se elimina de Zustand
- [ ] Token se invalida en Supabase
- [ ] Redirección a login screen
- [ ] Usuario no puede acceder a rutas protegidas

---

### 2. Datos y Endpoints (FASES 4-5)

#### 2.1 Planes
- [ ] `getAll()` carga planes desde Supabase
- [ ] Planes incluyen información del creador
- [ ] Geolocalización funciona (lat/lng)
- [ ] Filtros por categoría funcionan
- [ ] Filtros por zona funcionan
- [ ] `getById()` carga plan con reviews
- [ ] `create()` crea plan en base de datos
- [ ] `join()` incrementa attendees
- [ ] `like()` incrementa contador de likes
- [ ] Imágenes se cargan correctamente

#### 2.2 Shorts
- [ ] `getAll()` carga shorts desde Supabase
- [ ] Videos se reproducen correctamente
- [ ] Thumbnails se cargan
- [ ] `create()` sube video a storage
- [ ] `like()` incrementa likes
- [ ] `favorite()` guarda en favoritos
- [ ] Comentarios funcionan

#### 2.3 Reviews
- [ ] `getByPlan()` carga reviews de un plan
- [ ] Crear review actualiza rating promedio
- [ ] Rating promedio se calcula correctamente
- [ ] Solo usuarios autenticados pueden crear reviews

#### 2.4 Comentarios
- [ ] Comentarios de planes se cargan
- [ ] Comentarios de shorts se cargan
- [ ] Crear comentario actualiza contador
- [ ] Perfil del autor se incluye
- [ ] Solo usuarios autenticados pueden comentar

---

### 3. React Query + Realtime (FASE 6)

#### 3.1 Comments Queries
- [ ] `usePlanComments()` carga comentarios
- [ ] `useShortComments()` carga comentarios
- [ ] `useCreateComment()` invalida query correctamente
- [ ] Cache se mantiene entre navegaciones

#### 3.2 Users Queries
- [ ] `useUserProfile()` carga perfil de usuario
- [ ] `useUserStats()` carga estadísticas
- [ ] `useUpdateProfile()` usa optimistic updates
- [ ] Rollback funciona en caso de error
- [ ] Cache se sincroniza con servidor

#### 3.3 Chat con Realtime
- [ ] `useChatMessages()` carga mensajes
- [ ] Mensajes nuevos aparecen en tiempo real
- [ ] `useSendMessage()` envía mensaje correctamente
- [ ] `useMarkAsRead()` marca como leído
- [ ] Suscripción se limpia al desmontar componente
- [ ] Contador de no leídos actualiza

#### 3.4 Notificaciones con Realtime
- [ ] `useNotifications()` carga notificaciones
- [ ] Notificaciones nuevas aparecen instantáneamente
- [ ] Contador de no leídas funciona
- [ ] `useMarkNotificationAsRead()` actualiza estado
- [ ] `useMarkAllNotificationsAsRead()` funciona
- [ ] `useDeleteNotification()` elimina correctamente

#### 3.5 Friends/Follows con Realtime
- [ ] `useFriends()` carga lista de amigos
- [ ] `useFollowers()` carga seguidores
- [ ] `useFollowing()` carga siguiendo
- [ ] `useFollowUser()` crea follow
- [ ] `useUnfollowUser()` elimina follow
- [ ] Cambios se reflejan en tiempo real
- [ ] Notificación de nuevo seguidor funciona

---

### 4. Storage de Archivos (FASE 7)

#### 4.1 Avatares
- [ ] Avatar se sube en onboarding
- [ ] Avatar se actualiza en perfil
- [ ] URL pública es accesible
- [ ] Imagen se muestra correctamente
- [ ] Compresión (si aplica) funciona

#### 4.2 Imágenes de Planes
- [ ] 1-N imágenes se suben correctamente
- [ ] Loading state se muestra durante upload
- [ ] URLs públicas son accesibles
- [ ] Imágenes se muestran en detalle de plan
- [ ] Botón deshabilitado durante upload

#### 4.3 Videos de Shorts
- [ ] Video se sube correctamente
- [ ] Thumbnail se sube correctamente
- [ ] Progress bar muestra progreso
- [ ] Video se reproduce después de subir
- [ ] Thumbnail se muestra en lista
- [ ] Manejo de errores funciona

---

### 5. Row Level Security (RLS)

#### 5.1 Profiles
- [ ] Todos pueden ver perfiles
- [ ] Solo dueño puede editar su perfil
- [ ] Solo dueño puede eliminar su perfil

#### 5.2 Plans
- [ ] Todos pueden ver planes públicos
- [ ] Solo creador puede editar su plan
- [ ] Solo creador puede eliminar su plan
- [ ] Usuarios pueden unirse a planes

#### 5.3 Shorts
- [ ] Todos pueden ver shorts públicos
- [ ] Solo creador puede editar su short
- [ ] Solo creador puede eliminar su short

#### 5.4 Comments
- [ ] Todos pueden ver comentarios
- [ ] Solo autor puede editar su comentario
- [ ] Solo autor puede eliminar su comentario

#### 5.5 Likes/Favorites
- [ ] Usuario solo ve sus propios likes
- [ ] Usuario puede dar/quitar like
- [ ] No puede dar like dos veces

#### 5.6 Friendships
- [ ] Solo involucrados ven la amistad
- [ ] Solo requester puede cancelar solicitud
- [ ] Solo addressee puede aceptar/rechazar

#### 5.7 Chat
- [ ] Solo participantes ven mensajes
- [ ] Solo remitente puede enviar mensaje
- [ ] No puede leer mensajes de otros

#### 5.8 Notifications
- [ ] Solo destinatario ve sus notificaciones
- [ ] Solo destinatario puede marcar como leída
- [ ] Solo destinatario puede eliminar

---

### 6. Triggers y Funciones

#### 6.1 updated_at Trigger
- [ ] Se actualiza automáticamente en ediciones
- [ ] Formato de timestamp correcto

#### 6.2 Crear Perfil Automático
- [ ] Perfil se crea al registrar usuario
- [ ] Datos de auth.users se copian
- [ ] ID coincide entre auth.users y profiles

#### 6.3 Contadores
- [ ] `followers_count` actualiza en follows
- [ ] `likes` actualiza en likes
- [ ] `favorites` actualiza en favorites
- [ ] `comments` actualiza en comments
- [ ] `current_attendees` actualiza en plan_attendees

#### 6.4 Rating Promedio
- [ ] `average_rating` se calcula correctamente
- [ ] Se actualiza al crear nueva review
- [ ] Se actualiza al editar review
- [ ] Se actualiza al eliminar review

---

### 7. Performance y UX

#### 7.1 Cache de React Query
- [ ] Queries se cachean correctamente
- [ ] staleTime configurado apropiadamente
- [ ] Invalidación de queries funciona
- [ ] No hay re-fetches innecesarios

#### 7.2 Optimistic Updates
- [ ] UI actualiza inmediatamente
- [ ] Rollback en caso de error
- [ ] Mensajes de error claros
- [ ] Loading states apropiados

#### 7.3 Realtime Subscriptions
- [ ] Suscripciones se establecen correctamente
- [ ] Cleanup al desmontar componente
- [ ] No hay memory leaks
- [ ] Reconexión automática en caso de desconexión

#### 7.4 Loading States
- [ ] Spinners durante cargas
- [ ] Skeletons en listas
- [ ] Deshabilitación de botones durante acciones
- [ ] Progress bars en uploads

---

### 8. Manejo de Errores

#### 8.1 Network Errors
- [ ] Mensaje claro cuando no hay internet
- [ ] Retry automático o manual
- [ ] Fallback a datos cacheados

#### 8.2 Validation Errors
- [ ] Mensajes de validación claros
- [ ] Campos requeridos marcados
- [ ] Formato de email validado
- [ ] Tamaño de archivos validado

#### 8.3 Storage Errors
- [ ] Mensaje si upload falla
- [ ] Rollback si upload parcial
- [ ] Cleanup de archivos huérfanos

#### 8.4 Auth Errors
- [ ] Token expirado maneja correctamente
- [ ] Session inválida redirige a login
- [ ] Permisos insuficientes muestran error

---

### 9. Seguridad

#### 9.1 SQL Injection
- [ ] Queries usan prepared statements
- [ ] Input sanitizado

#### 9.2 XSS
- [ ] Output escapado
- [ ] No ejecución de scripts en comentarios

#### 9.3 CSRF
- [ ] Tokens de sesión seguros
- [ ] HTTPOnly cookies (si aplica)

#### 9.4 File Upload
- [ ] Validación de tipo de archivo
- [ ] Límite de tamaño
- [ ] Prevención de sobrescritura

---

### 10. Edge Cases

#### 10.1 Datos Vacíos
- [ ] Planes sin imágenes
- [ ] Shorts sin comentarios
- [ ] Usuario sin avatar
- [ ] Lista vacía de notificaciones

#### 10.2 Límites
- [ ] Plan con capacidad máxima
- [ ] Archivo muy grande
- [ ] Muchos comentarios (paginación)
- [ ] Muchas notificaciones

#### 10.3 Concurrencia
- [ ] Dos usuarios dan like simultáneamente
- [ ] Edición simultánea de perfil
- [ ] Join simultáneo a plan lleno

---

## 🧪 Tests Manuales Prioritarios

### Test 1: Flujo de Registro Completo
1. Abrir app sin autenticación
2. Ir a registro
3. Llenar formulario con datos únicos
4. Registrar
5. Completar onboarding con avatar
6. Verificar que perfil se muestra correctamente
7. Cerrar y reabrir app
8. Verificar que session persiste

**Resultado Esperado:** Usuario puede registrarse y su sesión persiste.

---

### Test 2: Crear Plan con Imágenes
1. Login con usuario existente
2. Ir a "Crear Plan"
3. Llenar todos los campos
4. Agregar 3 imágenes de galería
5. Presionar "Publicar"
6. Verificar loading state
7. Verificar redirección a home
8. Buscar plan recién creado
9. Abrir detalle
10. Verificar que imágenes se muestran

**Resultado Esperado:** Plan se crea con imágenes visibles.

---

### Test 3: Chat en Tiempo Real
1. Login con Usuario A en dispositivo 1
2. Login con Usuario B en dispositivo 2
3. Usuario A abre chat con Usuario B
4. Usuario B abre chat con Usuario A
5. Usuario A envía mensaje
6. Verificar que aparece en dispositivo 2
7. Usuario B responde
8. Verificar que aparece en dispositivo 1

**Resultado Esperado:** Mensajes aparecen instantáneamente.

---

### Test 4: Like con Optimistic Update
1. Login
2. Ir a lista de planes
3. Dar like a un plan
4. Verificar que UI actualiza inmediatamente
5. Verificar que contador incrementa
6. Quitar like
7. Verificar que UI actualiza inmediatamente

**Resultado Esperado:** UI responde instantáneamente.

---

### Test 5: Notificaciones en Tiempo Real
1. Login con Usuario A en dispositivo 1
2. Login con Usuario B en dispositivo 2
3. Usuario B sigue a Usuario A
4. Verificar que Usuario A recibe notificación instantánea
5. Usuario A marca como leída
6. Verificar que contador de no leídas disminuye

**Resultado Esperado:** Notificaciones aparecen en tiempo real.

---

### Test 6: Crear Short con Video
1. Login
2. Ir a "Crear Short"
3. Seleccionar video de galería
4. Llenar formulario
5. Confirmar en preview
6. Verificar progress bar
7. Esperar upload completo
8. Verificar redirección a shorts
9. Buscar short recién creado
10. Verificar que video se reproduce

**Resultado Esperado:** Short se crea y video se reproduce.

---

## 🔍 Verificación de Base de Datos

### SQL Queries de Verificación

```sql
-- 1. Verificar triggers de updated_at
SELECT schemaname, tablename, triggers
FROM pg_tables
WHERE schemaname = 'public';

-- 2. Verificar RLS activo
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 3. Verificar políticas RLS
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- 4. Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. Verificar funciones
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public';

-- 6. Verificar contadores funcionan
SELECT id, name, likes, favorites, comments
FROM plans
WHERE likes > 0;

-- 7. Verificar perfiles creados
SELECT COUNT(*) as total_profiles
FROM profiles;

-- 8. Verificar storage buckets
-- Ejecutar en Supabase Dashboard > Storage
```

---

## 📊 Métricas de Calidad

### Code Coverage (Ideal)
- [ ] Funciones de storage: 100%
- [ ] Hooks de React Query: 100%
- [ ] Endpoints tRPC: 100%
- [ ] Auth store: 100%

### Performance Metrics
- [ ] Initial load < 3s
- [ ] Image upload < 5s por imagen
- [ ] Video upload < 30s para video de 30s
- [ ] Realtime latency < 500ms
- [ ] Query response < 1s

### User Experience
- [ ] No pantallas blancas
- [ ] Loading states en todas las acciones
- [ ] Mensajes de error claros
- [ ] Navegación intuitiva
- [ ] Feedback visual en acciones

---

## 🐛 Bugs Conocidos (Documentar aquí)

### 1. [Descripción del bug]
- **Severidad:** Alta/Media/Baja
- **Reproducción:** Pasos para reproducir
- **Causa:** Causa raíz
- **Fix:** Solución propuesta

---

## ✅ Criterios de Aceptación

Para considerar FASE 8 completa:

1. ✅ Todos los tests críticos pasan
2. ✅ No hay errores en consola durante uso normal
3. ✅ RLS verificado y activo
4. ✅ Triggers funcionan correctamente
5. ✅ Storage upload funciona
6. ✅ Realtime subscriptions funcionan
7. ✅ No hay memory leaks evidentes
8. ✅ Performance aceptable

---

**Estado:** 🔄 EN PROGRESO
**Fecha Inicio:** 2025-12-05
**Tests Completados:** 0 / 6 prioritarios
