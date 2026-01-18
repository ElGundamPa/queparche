# FASE 7: Storage de Imágenes y Videos - Resumen

## Objetivo
Integrar Supabase Storage para subir avatares, imágenes de planes y videos de shorts directamente al almacenamiento en la nube.

---

## ✅ Trabajo Completado

### 1. Helpers de Storage (Ya existían)

**Archivo:** `/lib/storage-helpers.ts`

**Funciones disponibles:**
- `uploadAvatar(userId, imageUri)` - Sube avatar de usuario
- `uploadPlanImages(planId, imageUris[])` - Sube múltiples imágenes de plan
- `uploadShortVideo(shortId, videoUri, thumbnailUri)` - Sube video + thumbnail
- `uploadEventImage(eventId, imageUri)` - Sube imagen de evento
- `deleteStorageFile(bucket, path)` - Elimina archivo del storage
- `getFileSize(uri)` - Obtiene tamaño de archivo
- `validateFileSize(uri, maxSizeMB)` - Valida tamaño de archivo

**Buckets de Supabase utilizados:**
- `avatars` - Avatares de usuarios
- `plan-images` - Imágenes de planes
- `short-videos` - Videos de shorts
- `short-thumbnails` - Thumbnails de shorts
- `event-images` - Imágenes de eventos

---

### 2. Integración en Auth Store

**Archivo:** `/hooks/use-auth-store.ts`

**Cambios realizados:**

#### 2.1 completeOnboarding()
- Detecta si el avatar es una URI local (`file://`)
- Sube el avatar a Supabase Storage antes de guardar
- Actualiza el perfil con la URL pública del avatar

```typescript
let avatarUrl = onboardingData.avatar;
if (avatarUrl && avatarUrl.startsWith('file://')) {
  const { uploadAvatar } = await import('../lib/storage-helpers');
  avatarUrl = await uploadAvatar(currentUser.id, avatarUrl);
}
```

#### 2.2 updateProfile()
- Verifica si el avatar a actualizar es una URI local
- Sube el nuevo avatar si es necesario
- Actualiza el perfil con la URL pública

---

### 3. Integración en Creación de Planes

**Archivo:** `/components/create/steps/Step5.tsx`

**Cambios realizados:**

#### 3.1 Estado de carga
- Agregado `isPublishing` state para controlar el proceso de upload
- Botón muestra `ActivityIndicator` durante la subida
- Botón deshabilitado mientras se sube

#### 3.2 handlePublish() async
- Filtra imágenes locales (`file://`) vs URLs remotas
- Sube imágenes locales a Supabase Storage
- Combina URLs remotas con las recién subidas
- Crea el plan con todas las URLs

```typescript
const localImages = draft.images.filter(img => img.startsWith('file://'));
const remoteImages = draft.images.filter(img => !img.startsWith('file://'));

if (localImages.length > 0) {
  const tempPlanId = `plan-${Date.now()}`;
  const uploadedUrls = await uploadPlanImages(tempPlanId, localImages);
  imageUrls = [...remoteImages, ...uploadedUrls];
}
```

#### 3.3 Manejo de errores
- Try/catch para capturar errores de upload
- Mensaje de error al usuario si falla
- Loading state reseteo en finally block

---

### 4. Integración en Creación de Shorts

**Archivo:** `/app/create-short.tsx`

**Cambios realizados:**

#### 4.1 Simplificación del flujo
- **Antes:** Seleccionar video → Procesar → Convertir a Blob → Subir
- **Ahora:** Seleccionar video → Subir directamente

#### 4.2 Eliminación de código innecesario
- Removido `useVideoProcessor` hook
- Removido estados `processedVideoBlob` y `originalVideoFile`
- Removido función `handleVideoSelection` para web
- Simplificado `pickVideo` para solo móvil

#### 4.3 handleProcessAndUpload()
- Llama directamente a `uploadVideo()` con URIs
- Pasa `videoUri` y `thumbnailUri` al hook
- Recibe URLs públicas en el callback de éxito

---

### 5. Refactorización de useBackgroundUpload Hook

**Archivo:** `/hooks/use-background-upload.ts`

**Cambios realizados:**

#### 5.1 Nueva firma de uploadVideo()
```typescript
// Antes
uploadVideo(videoBlob: Blob, metadata, options)

// Ahora
uploadVideo(videoUri: string, thumbnailUri: string, metadata, options)
```

#### 5.2 Integración con Supabase Storage
- Importa `uploadShortVideo` de storage-helpers
- Genera ID temporal para el short
- Sube video y thumbnail a Supabase
- Retorna URLs públicas en el resultado

#### 5.3 Progreso de upload
- Mantiene sistema de progreso visual
- Etapas: preparing → uploading → processing → complete
- Callbacks `onProgress`, `onSuccess`, `onError`

---

## 📊 Resumen de Cambios

### Archivos Modificados:
1. ✅ `/hooks/use-auth-store.ts` - Avatar upload en onboarding y perfil
2. ✅ `/components/create/steps/Step5.tsx` - Plan images upload con loading
3. ✅ `/app/create-short.tsx` - Short video upload simplificado
4. ✅ `/hooks/use-background-upload.ts` - Integración con Supabase Storage

### Archivos Sin Cambios:
- ✅ `/lib/storage-helpers.ts` - Ya tenía todas las funciones necesarias

### Funcionalidad NO Implementada:
- ❌ Event images upload - No existe componente de creación de eventos

---

## 🔄 Flujos Implementados

### 1. Onboarding con Avatar
```
Usuario selecciona avatar
    ↓
Avatar local (file://) detectado
    ↓
Upload a Supabase Storage (bucket: avatars)
    ↓
URL pública retornada
    ↓
Perfil actualizado con URL
```

### 2. Creación de Plan con Imágenes
```
Usuario selecciona 1-N imágenes
    ↓
Completa formulario de plan
    ↓
Presiona "Publicar"
    ↓
Imágenes locales detectadas
    ↓
Upload a Supabase Storage (bucket: plan-images)
    ↓
URLs públicas retornadas
    ↓
Plan creado con URLs
    ↓
Usuario redirigido a inicio
```

### 3. Creación de Short con Video
```
Usuario selecciona video
    ↓
Completa formulario de short
    ↓
Presiona confirmar en preview
    ↓
Upload de video + thumbnail a Supabase Storage
    ↓
URLs públicas retornadas
    ↓
Short creado con URLs
    ↓
Usuario redirigido a shorts
```

---

## 🎯 Beneficios

### 1. **Persistencia Real**
- Los archivos se almacenan en Supabase Storage
- URLs públicas accesibles desde cualquier dispositivo
- No dependemos de almacenamiento local temporal

### 2. **Optimización de Rendimiento**
- Imágenes y videos servidos desde CDN
- Carga más rápida para usuarios
- Menor uso de datos en la app

### 3. **Seguridad**
- Row Level Security (RLS) en buckets
- Solo usuarios autenticados pueden subir
- Políticas de lectura pública para visualización

### 4. **Escalabilidad**
- Storage ilimitado con plan de Supabase
- Sin límites de tamaño de archivos (configurables)
- CDN global para mejor distribución

### 5. **UX Mejorada**
- Loading states visuales durante upload
- Progress bars para videos largos
- Mensajes de error claros
- Deshabilitación de botones durante proceso

---

## 📝 Notas Técnicas

### Formato de URIs
- **Locales:** `file:///path/to/file.jpg`
- **Remotas:** `https://project.supabase.co/storage/v1/...`

### Detección de Archivos Locales
```typescript
if (imageUri.startsWith('file://')) {
  // Es archivo local, necesita upload
  const publicUrl = await uploadToStorage(imageUri);
}
```

### Manejo de Múltiples Imágenes
```typescript
const localImages = images.filter(img => img.startsWith('file://'));
const remoteImages = images.filter(img => !img.startsWith('file://'));
const uploadedUrls = await uploadPlanImages(planId, localImages);
const allUrls = [...remoteImages, ...uploadedUrls];
```

### IDs Temporales
- Se usan timestamps para generar IDs únicos temporales
- Ejemplo: `plan-${Date.now()}`, `short-${Date.now()}`
- Evita colisiones en storage

---

## 🐛 Posibles Problemas y Soluciones

### Problema 1: Upload lento
**Causa:** Archivos muy grandes
**Solución:** Implementar compresión antes de subir

### Problema 2: Permisos denegados
**Causa:** Galería no autorizada
**Solución:** Mensaje claro solicitando permisos

### Problema 3: Storage lleno
**Causa:** Plan de Supabase con límite alcanzado
**Solución:** Implementar cleanup de archivos viejos

### Problema 4: Network error
**Causa:** Sin conexión a Internet
**Solución:** Verificar conectividad antes de subir

---

## 🔮 Mejoras Futuras

### 1. Compresión de Imágenes
- Usar `expo-image-manipulator` para comprimir antes de subir
- Reducir tamaño de archivos automáticamente
- Mantener calidad visual

### 2. Progress Bars Reales
- Tracking de progreso de upload con XHR
- Mostrar porcentaje exacto
- Permitir cancelación de uploads

### 3. Caché de Imágenes
- Usar `expo-image` para caché automático
- Reducir re-descargas innecesarias
- Mejor performance en listas

### 4. Validación de Archivos
- Verificar tamaño máximo antes de subir
- Validar formatos permitidos
- Prevenir uploads fallidos

### 5. Resize de Videos
- Procesamiento del lado del servidor
- Generar thumbnails automáticamente
- Optimizar para diferentes dispositivos

---

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-12-05
**Archivos modificados:** 4
**Funcionalidad agregada:** Upload de avatares, imágenes de planes, y videos de shorts
