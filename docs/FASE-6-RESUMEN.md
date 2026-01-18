# FASE 6: Refactorización de Stores - Resumen

## Objetivo
Migrar stores de Zustand locales a React Query + tRPC con soporte de Supabase Realtime para actualizaciones en tiempo real.

---

## ✅ Trabajo Completado

### 1. Hooks de React Query para Comentarios

**Archivo:** `/hooks/use-comments-queries.ts`

**Hooks creados:**
- `usePlanComments(planId)` - Obtiene comentarios de un plan
- `useShortComments(shortId)` - Obtiene comentarios de un short
- `useCreateComment()` - Crea comentarios (planes o shorts)
- `useCreatePlanComment()` - Alias para comentarios de planes

**Reemplaza:** `/store/commentsStore.ts`

---

### 2. Hooks de React Query para Usuarios

**Archivo:** `/hooks/use-users-queries.ts`

**Hooks creados:**
- `useUserProfile(userId?)` - Obtiene perfil de usuario
- `useUserStats(userId?)` - Obtiene estadísticas del usuario
- `useUpdateProfile()` - Actualiza perfil con optimistic updates
- `useUserData(userId?)` - Hook combinado para perfil + stats

**Reemplaza:** `/hooks/use-user-store.ts`

---

### 3. Endpoints tRPC para Chat

**Directorio:** `/backend/trpc/routes/chat/`

**Endpoints creados:**
- `GET /chat/get-messages` - Obtiene mensajes de una conversación
- `POST /chat/send-message` - Envía un mensaje
- `POST /chat/mark-as-read` - Marca mensajes como leídos
- `GET /chat/get-conversations` - Lista todas las conversaciones

---

### 4. Hooks de Chat con Realtime

**Archivo:** `/hooks/use-chat-queries.ts`

**Hooks creados:**
- `useChatMessages(recipientId)` - Obtiene mensajes con Realtime
- `useConversations()` - Lista conversaciones con Realtime
- `useSendMessage()` - Envía mensaje
- `useMarkAsRead()` - Marca como leído

**Características:**
- Suscripción a mensajes nuevos en tiempo real
- Invalidación automática de queries
- Update optimista para UX fluida

**Reemplaza:** `/store/chatStore.ts`

---

### 5. Endpoints tRPC para Notificaciones

**Directorio:** `/backend/trpc/routes/notifications/`

**Endpoints creados:**
- `GET /notifications/get-all` - Obtiene todas las notificaciones
- `POST /notifications/mark-as-read` - Marca una notificación como leída
- `POST /notifications/mark-all-as-read` - Marca todas como leídas
- `DELETE /notifications/delete` - Elimina una notificación

---

### 6. Hooks de Notificaciones con Realtime

**Archivo:** `/hooks/use-notifications-queries.ts`

**Hooks creados:**
- `useNotifications()` - Obtiene notificaciones con contador de no leídas
- `useMarkNotificationAsRead()` - Marca una como leída
- `useMarkAllNotificationsAsRead()` - Marca todas como leídas
- `useDeleteNotification()` - Elimina una notificación

**Características:**
- Suscripción a notificaciones nuevas en tiempo real
- Contador de no leídas calculado automáticamente
- Invalidación automática de queries

**Reemplaza:** `/store/notificationsStore.ts`

---

### 7. Endpoints tRPC para Follows

**Directorio:** `/backend/trpc/routes/follows/`

**Endpoints creados:**
- `POST /follows/follow-user` - Seguir a un usuario
- `DELETE /follows/unfollow-user` - Dejar de seguir
- `GET /follows/get-followers` - Obtiene seguidores
- `GET /follows/get-following` - Obtiene usuarios seguidos

---

### 8. Endpoints tRPC para Friends

**Directorio:** `/backend/trpc/routes/friends/`

**Endpoints creados:**
- `GET /friends/get-friends` - Obtiene lista de amigos

---

### 9. Hooks de Friends/Follows con Realtime

**Archivo:** `/hooks/use-friends-queries.ts`

**Hooks creados:**
- `useFriends(userId?)` - Lista de amigos con Realtime
- `useFollowers(userId?)` - Seguidores con Realtime
- `useFollowing(userId?)` - Siguiendo con Realtime
- `useFollowUser()` - Seguir usuario
- `useUnfollowUser()` - Dejar de seguir

**Características:**
- Suscripciones independientes para followers/following
- Actualización automática en cambios
- Soporte para ver perfil de otros usuarios

**Reemplaza:** `/store/friendsStore.ts`

---

## 📊 Resumen de Cambios

### Stores Eliminados/Reemplazados:
- ✅ `/store/commentsStore.ts` → `use-comments-queries.ts`
- ✅ `/hooks/use-user-store.ts` → `use-users-queries.ts`
- ✅ `/store/chatStore.ts` → `use-chat-queries.ts`
- ✅ `/store/notificationsStore.ts` → `use-notifications-queries.ts`
- ✅ `/store/friendsStore.ts` → `use-friends-queries.ts`

### Stores Mantenidos:
- ✅ `/hooks/use-auth-store.ts` - Ya migrado en FASE 3
- ✅ `/hooks/use-plans-store.ts` - Ya usa React Query + tRPC
- ✅ `/store/filters.ts` - UI state local (no requiere migración)
- ✅ `/store/draftsStore.ts` - Drafts locales (no requiere migración)
- ✅ `/store/plansStore.ts` - Cache secundario (mantener)

### Nuevos Endpoints tRPC Creados:
- **Chat:** 4 endpoints
- **Notificaciones:** 4 endpoints
- **Follows:** 4 endpoints
- **Friends:** 1 endpoint
- **Total:** 13 nuevos endpoints

### Nuevos Hooks Creados:
- **Comentarios:** 4 hooks
- **Usuarios:** 4 hooks
- **Chat:** 4 hooks
- **Notificaciones:** 4 hooks
- **Friends/Follows:** 5 hooks
- **Total:** 21 nuevos hooks

---

## 🔄 Beneficios de la Migración

### 1. **Realtime Updates**
- Chat recibe mensajes instantáneamente
- Notificaciones aparecen en tiempo real
- Followers/Following se actualizan automáticamente

### 2. **Optimistic Updates**
- Actualización inmediata de UI antes de confirmación del servidor
- Rollback automático en caso de error
- UX más fluida y rápida

### 3. **Cache Management**
- React Query maneja el caché automáticamente
- Invalidación inteligente de queries relacionadas
- Reducción de queries redundantes

### 4. **Type Safety**
- tRPC garantiza tipos end-to-end
- IntelliSense completo en todos los hooks
- Detección de errores en tiempo de desarrollo

### 5. **Código más Limpio**
- Separación clara entre queries y mutations
- Hooks reutilizables y componibles
- Menos código boilerplate

---

## 🎯 Próximos Pasos (FASE 7)

### Implementar Storage de Imágenes y Videos

1. **Helper functions para Supabase Storage:**
   - `uploadAvatar(userId, imageUri)`
   - `uploadPlanImages(planId, imageUris[])`
   - `uploadShortVideo(shortId, videoUri, thumbnailUri)`
   - `deleteStorageFile(bucket, path)`

2. **Integrar en componentes:**
   - Onboarding (avatar upload)
   - Create Plan (imágenes)
   - Create Short (video + thumbnail)

3. **Buckets de Storage:**
   - `avatars`
   - `plan-images`
   - `short-videos`
   - `short-thumbnails`
   - `event-images`

---

## 📝 Notas Importantes

### Uso de Hooks

**Antes (Zustand):**
```typescript
import { useCommentsStore } from '@/store/commentsStore';

const comments = useCommentsStore((state) => state.comments);
const addComment = useCommentsStore((state) => state.addComment);
```

**Ahora (React Query):**
```typescript
import { usePlanComments, useCreateComment } from '@/hooks/use-comments-queries';

const { data: comments, isLoading } = usePlanComments(planId);
const createComment = useCreateComment();
```

### Realtime Subscriptions

Las suscripciones se limpian automáticamente cuando el componente se desmonta. No es necesario cleanup manual.

### Invalidación de Queries

Todas las mutations invalidan automáticamente las queries relacionadas para mantener los datos sincronizados.

---

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-12-05
