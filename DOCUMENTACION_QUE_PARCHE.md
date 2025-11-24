# DOCUMENTACIÓN OFICIAL - QUE PARCHE

## 1. DESCRIPCIÓN GENERAL DEL PROYECTO

### ¿Qué es la app?
**Que Parche** es una aplicación móvil desarrollada con React Native y Expo que permite a los usuarios descubrir, compartir y unirse a planes (eventos/actividades) en Medellín, Colombia. La app combina funcionalidades de redes sociales, geolocalización y contenido multimedia (videos cortos estilo TikTok).

### Objetivo
Conectar a las personas con planes y lugares interesantes en Medellín, facilitando la organización de actividades sociales, descubrimiento de nuevos lugares y creación de comunidad alrededor de experiencias compartidas.

### Público objetivo
- Jóvenes y adultos en Medellín que buscan planes y actividades
- Usuarios que quieren descubrir nuevos lugares (restaurantes, bares, eventos)
- Personas que buscan conectar con otros con intereses similares
- Creadores de contenido que quieren compartir videos de lugares

### Arquitectura general del frontend
- **Framework**: Expo SDK 54 + React Native 0.81.5
- **Navegación**: Expo Router (file-based routing)
- **Estado global**: Zustand (stores para planes, usuarios, autenticación, etc.)
- **Comunicación con backend**: tRPC (TypeScript RPC)
- **Animaciones**: React Native Reanimated 4.1.1
- **UI**: NativeWind (Tailwind CSS para React Native)
- **Gestos**: React Native Gesture Handler
- **Video**: Expo Video
- **Imágenes**: Expo Image
- **Mapas**: React Native Maps
- **Geolocalización**: Expo Location

## 2. ESTRUCTURA COMPLETA DEL PROYECTO

### Carpetas principales

#### `/app` - Pantallas y rutas (Expo Router)
- `_layout.tsx`: Layout raíz con providers (tRPC, QueryClient, Zustand stores)
- `index.tsx`: Pantalla de inicio que redirige según autenticación
- `(auth)/`: Grupo de autenticación
  - `login.tsx`: Pantalla de login
  - `onboarding.tsx`: Onboarding de 3 pasos (bio, intereses, avatar)
  - `register-form.tsx`: Formulario de registro
- `(tabs)/`: Tabs principales de la app
  - `index.tsx`: Home - Feed principal con planes, carruseles, búsqueda
  - `map.tsx`: Mapa interactivo con marcadores de planes
  - `create.tsx`: Modal para elegir crear plan o short
  - `shorts.tsx`: Feed vertical estilo TikTok de videos cortos
  - `profile/index.tsx`: Perfil de usuario con planes, favoritos, historial
- `plan/[id]/`: Detalle de plan
  - `index.tsx`: Vista completa del plan con imágenes, descripción, comentarios
  - `attendees.tsx`: Lista de asistentes al plan
- `parche/[id].tsx`: (Deprecado) Redirige a `/plan/[id]`
- `create/`: Wizard de creación de plan (5 pasos)
  - `index.tsx`: Contenedor del wizard
- `create-short.tsx`: Creación de short con procesamiento de video
- `create-post.tsx`: Creación de post (legacy)
- `short/[id].tsx`: Detalle de short individual
- `friends/`: Sistema de amigos y chats
  - `index.tsx`: Lista de amigos
  - `chats.tsx`: Lista de chats
  - `search.tsx`: Búsqueda de usuarios
- `chat/[chatId].tsx`: Chat individual
- `notifications/index.tsx`: Centro de notificaciones
- `zones/`: Planes por zona de Medellín
  - `index.tsx`: Grid de zonas
  - `[zone].tsx`: Planes filtrados por zona
- `user/[id].tsx` y `user/[username].tsx`: Perfil de otro usuario
- `ai-assistant.tsx`: Asistente de IA (en desarrollo)

#### `/components` - Componentes reutilizables
- `PatchCard.tsx`, `PatchGridItem.tsx`: Tarjetas de planes
- `PlanCard.tsx`: Tarjeta de plan con toda la info
- `TikTokShortItem.tsx`: Item de short estilo TikTok
- `ShortCard.tsx`: Tarjeta de short
- `EventCard.tsx`: Tarjeta de evento
- `ZoneCard.tsx`, `AreaCard.tsx`: Tarjetas de zonas
- `TopPlansCarousel.tsx`, `TrendingPlansCarousel.tsx`: Carruseles de planes
- `TrendingTags.tsx`, `TrendingStrip.tsx`: Tags y strips de tendencias
- `HorizontalCategories.tsx`: Categorías horizontales
- `FAB.tsx`, `FABSpeedDial.tsx`, `ExpandableFAB.tsx`: Botones flotantes
- `SearchBar.tsx`: Barra de búsqueda
- `FiltersBar.tsx`: Barra de filtros
- `ZoneSelector.tsx`: Selector de zona
- `UserGreeting.tsx`: Saludo personalizado
- `HomeHeaderActions.tsx`: Acciones del header del home
- `CommentModal.tsx`: Modal de comentarios
- `ImageViewerModal.tsx`: Visor de imágenes
- `InviteFriendsModal.tsx`: Modal para invitar amigos
- `SendPlanModal.tsx`: Modal para compartir plan
- `VideoPreview.tsx`: Preview de video antes de subir
- `ProgressBar.tsx`: Barra de progreso animada
- `SuccessCard.tsx`, `ErrorCard.tsx`: Cards de estado
- `ConfettiAnimation.tsx`: Animación de confetti
- `Skeleton.tsx`, `SkeletonLoader.tsx`: Loading skeletons
- `EmptyState.tsx`: Estado vacío
- `FallbackScreen.tsx`: Pantalla de error/fallback
- `create/steps/`: Pasos del wizard de creación
  - `Step1.tsx`: Detalles básicos
  - `Step2.tsx`: Ubicación
  - `Step3.tsx`: Información adicional
  - `Step4.tsx`: Multimedia
  - `Step5.tsx`: Resumen

#### `/hooks` - Custom hooks
- `use-auth-store.ts`: Store de autenticación (Zustand)
- `use-user-store.ts`: Store de usuario actual
- `use-plans-store.ts`: Store de planes
- `use-search-store.ts`: Store de búsqueda
- `use-onboarding-store.ts`: Store de onboarding
- `use-video-processor.ts`: Procesamiento de videos
- `use-background-upload.ts`: Subida en background
- `useActiveVideo.ts`: Gestión de video activo
- `useLocation.ts`: Hook de geolocalización
- `useAnalytics.ts`: Analytics
- `useFonts.ts`: Carga de fuentes

#### `/store` - Stores de Zustand
- `plansStore.ts`: Estado de planes, uniones, asistentes
- `userStore.ts`: Estado de usuario
- `chatStore.ts`: Estado de chats y mensajes
- `friendsStore.ts`: Estado de amigos y seguimientos
- `notificationsStore.ts`: Estado de notificaciones
- `commentsStore.ts`: Estado de comentarios
- `draftsStore.ts`: Borradores guardados
- `filters.ts`: Filtros globales

#### `/types` - Tipos TypeScript
- `plan.ts`: Interfaces de Plan, Short, Review, Event, Category
- `user.ts`: Interfaces de User, UserStats, Friendship, Follow, Comment, Notification, ChatMessage

#### `/lib` - Utilidades y librerías
- `trpc.ts`: Cliente tRPC configurado
- `theme.ts`: Tema de la app (colores, tipografía, spacing)
- `animations.ts`: Funciones de animación reutilizables
- `format.ts`: Funciones de formateo
- `storage.ts`: Utilidades de almacenamiento
- `userName.ts`: Utilidades de nombres de usuario
- `useStaggeredFade.ts`: Hook de animación staggered
- `videoStateManager.ts`: Gestor de estado de videos
- `simple-video-processor.ts`: Procesador de video
- `geo/`: Utilidades de geolocalización
  - `distance.ts`: Cálculo de distancias
  - `cluster.ts`: Clustering de ubicaciones
- `analytics/ga4.ts`: Google Analytics 4

#### `/backend` - Backend tRPC (mock actual)
- `hono.ts`: Servidor Hono
- `trpc/`: Router tRPC
  - `app-router.ts`: Router principal con todas las rutas
  - `create-context.ts`: Contexto de tRPC
  - `routes/`: Rutas organizadas por entidad
    - `plans/`: get-all, get-by-id, create, join, like
    - `shorts/`: get-all, get-by-id, create, like, favorite
    - `comments/`: get-by-short, get-by-plan, create, create-plan-comment
    - `reviews/`: get-by-plan
    - `users/`: get-profile, update-profile, get-stats

#### `/constants` - Constantes
- `colors.ts`: Paleta de colores
- `images.ts`: Imágenes constantes
- `videos.ts`: Videos constantes

#### `/data` - Datos estáticos
- `parches.ts`: Datos mock de parches
- `zones.ts`: Datos de zonas de Medellín

#### `/mocks` - Datos mock
- `plans.ts`, `patches.ts`, `events.ts`: Datos mock de planes
- `shorts.ts`: Datos mock de shorts
- `users.ts`: Datos mock de usuarios
- `categories.ts`: Categorías disponibles
- `comments.ts`: Comentarios mock

#### `/utils` - Utilidades
- `permissions.ts`: Manejo de permisos (cámara, galería, ubicación)

## 3. TECNOLOGÍAS UTILIZADAS

### Versiones principales
- **Expo**: ^54.0.20
- **React**: 19.1.0
- **React Native**: ^0.81.5
- **TypeScript**: ~5.9.2
- **Node.js**: Compatible con LTS

### Dependencias principales

#### Navegación y routing
- `expo-router`: ~6.0.13 - File-based routing
- `@react-navigation/native`: ^7.1.6

#### Estado y datos
- `zustand`: ^5.0.2 - Estado global
- `@tanstack/react-query`: ^5.83.0 - Cache y sincronización
- `@trpc/client`: ^11.4.3 - Cliente tRPC
- `@trpc/react-query`: ^11.4.3 - Integración tRPC + React Query
- `@trpc/server`: ^11.4.3 - Servidor tRPC
- `superjson`: ^2.2.2 - Serialización avanzada

#### UI y estilos
- `nativewind`: ^4.1.23 - Tailwind CSS para RN
- `expo-linear-gradient`: ~15.0.7 - Gradientes
- `expo-blur`: ~15.0.7 - Efectos blur
- `lucide-react-native`: ^0.546.0 - Iconos
- `react-native-toast-message`: ^2.3.3 - Toasts

#### Animaciones
- `react-native-reanimated`: ~4.1.1 - Animaciones nativas
- `react-native-gesture-handler`: ~2.28.0 - Gestos
- `lottie-react-native`: ^7.3.4 - Animaciones Lottie

#### Multimedia
- `expo-video`: ^3.0.11 - Reproductor de video
- `expo-image`: ~3.0.10 - Optimización de imágenes
- `expo-image-picker`: ~17.0.8 - Selector de imágenes/videos
- `expo-audio`: ^1.0.13 - Audio

#### Geolocalización y mapas
- `expo-location`: ~19.0.7 - Geolocalización
- `react-native-maps`: 1.20.1 - Mapas
- `geolib`: ^3.3.4 - Utilidades geográficas
- `supercluster`: ^8.0.1 - Clustering de marcadores

#### Listas y rendimiento
- `@shopify/flash-list`: 2.0.2 - Lista optimizada

#### Utilidades
- `zod`: ^4.0.5 - Validación de esquemas
- `uuid`: ^11.1.0 - Generación de IDs
- `react-native-uuid`: ^2.0.3
- `@react-native-async-storage/async-storage`: 2.2.0 - Storage local

#### Backend
- `hono`: ^4.8.5 - Framework web
- `@hono/trpc-server`: ^0.4.0 - Integración Hono + tRPC

### Configuraciones especiales

#### Expo (app.json)
- **Orientación**: Portrait
- **New Architecture**: Habilitada
- **Permisos iOS**: Location, Camera, Photos, Microphone, Tracking
- **Permisos Android**: Location (foreground/background), Camera, Storage, Audio
- **Background Modes**: Location, Audio

#### TypeScript (tsconfig.json)
- Strict mode habilitado
- Path aliases: `@/*` → `./*`

#### NativeWind (tailwind.config.js)
- Tema dark por defecto
- Colores personalizados (brand, accent, bg, text)
- Fuentes: Inter, Poppins

## 4. DOCUMENTACIÓN POR PANTALLAS

### 4.1 Home (`app/(tabs)/index.tsx`)

**Función**: Feed principal con planes destacados, búsqueda y navegación.

**Props**: Ninguna (pantalla raíz)

**Estados**:
- `selectedZone`: Zona seleccionada para filtrar
- `searchQuery`: Query de búsqueda
- `plans`: Lista de planes del store

**Efectos**:
- Animaciones de entrada (header, search)
- Scroll handler para animar header
- Filtrado de planes por zona

**Lógica visual**:
- Header animado que se oculta al hacer scroll
- Carruseles horizontales de planes top y trending
- Grid de 3 columnas para todos los planes
- FAB (Floating Action Button) para crear contenido

**Datos que espera del backend**:
- Lista de planes con: id, name, location, images, rating, category, currentPeople, capacity
- Estadísticas de usuario: points, isPremium

**Datos que envía al backend**:
- Query de búsqueda (filtrado local por ahora)
- Zona seleccionada (filtrado local)

### 4.2 Shorts (`app/(tabs)/shorts.tsx`)

**Función**: Feed vertical estilo TikTok de videos cortos.

**Props**: Ninguna

**Estados**:
- `activeIndex`: Índice del video activo
- `validShorts`: Shorts validados y filtrados
- `isLoading`: Estado de carga

**Efectos**:
- Pausa videos cuando la pantalla pierde foco
- Pausa videos cuando la app va a background
- Viewability tracking para activar solo el video visible

**Lógica visual**:
- FlashList vertical con snap por video
- Solo un video visible a la vez (pantalla completa)
- Gestos de swipe vertical
- Controles de like, comentario, guardar, compartir

**Datos que espera del backend**:
```json
{
  "id": "string",
  "videoUrl": "string",
  "thumbnailUrl": "string",
  "placeName": "string",
  "category": "string",
  "description": "string",
  "likes": "number",
  "favorites": "number",
  "comments": "number",
  "createdBy": "string",
  "userId": "string",
  "createdAt": "string"
}
```

**Datos que envía al backend**:
- Like: `{ shortId: string, userId: string }`
- Favorite: `{ shortId: string, userId: string }`
- Comment: `{ shortId: string, userId: string, content: string }`

### 4.3 Mapa (`app/(tabs)/map.tsx`)

**Función**: Mapa interactivo con marcadores de planes.

**Props**: Ninguna

**Estados**:
- `region`: Región del mapa (lat, lng, delta)
- `userLocation`: Ubicación del usuario
- `showFilters`: Modal de filtros visible
- `selectedCategory`: Categoría filtrada

**Efectos**:
- Solicita permisos de ubicación al montar
- Centra mapa en ubicación del usuario
- Carga dinámica de react-native-maps (solo en native)

**Lógica visual**:
- Marcadores de colores según categoría
- Botón flotante de filtros
- Botón "Publica tu parche"
- Modal de filtros con animación

**Datos que espera del backend**:
- Lista de planes con coordenadas: `{ lat, lng, latitude, longitude }`
- Categorías disponibles

**Datos que envía al backend**:
- Filtro de categoría (local por ahora)

### 4.4 Crear Plan (`app/create/index.tsx`)

**Función**: Wizard de 5 pasos para crear un plan.

**Props**: Ninguna

**Estados**:
- `currentStep`: Paso actual (0-4)
- `progress`: Progreso animado

**Efectos**:
- Animación de transición entre pasos
- Progress bar animada

**Pasos del wizard**:
1. **Step1**: Detalles básicos (nombre, descripción, categoría)
2. **Step2**: Ubicación (mapa, dirección, coordenadas)
3. **Step3**: Información (capacidad, precio, fecha, tags)
4. **Step4**: Multimedia (imágenes, video opcional)
5. **Step5**: Resumen y confirmación

**Datos que envía al backend**:
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "maxPeople": "number",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "images": ["string"],
  "userId": "string",
  "createdBy": "string",
  "price": "number (opcional)",
  "eventDate": "string (ISO, opcional)",
  "tags": ["string"]
}
```

### 4.5 Crear Short (`app/create-short.tsx`)

**Función**: Creación de short con procesamiento de video.

**Estados**:
- `currentStep`: 'form' | 'preview' | 'uploading' | 'success' | 'error'
- `videoUri`: URI del video seleccionado
- `thumbnailUri`: URI del thumbnail
- `placeName`, `description`, `category`, `tags`: Metadatos

**Efectos**:
- Procesamiento de video a formato 9:16
- Subida en background
- Animaciones de progreso

**Lógica visual**:
- Formulario inicial
- Preview del video
- Barra de progreso durante procesamiento
- Modales de éxito/error con confetti

**Datos que envía al backend**:
```json
{
  "videoUrl": "string (URL del video procesado)",
  "thumbnailUrl": "string",
  "placeName": "string",
  "category": "string",
  "description": "string",
  "userId": "string",
  "createdBy": "string"
}
```

### 4.6 Detalle de Plan (`app/plan/[id]/index.tsx`)

**Función**: Vista completa de un plan con toda su información.

**Props**: `id` (route param)

**Estados**:
- `activeHeroIndex`: Índice de imagen activa en carrusel
- `viewerVisible`: Modal de visor de imágenes
- `commentText`: Texto del comentario
- `videoPaused`: Estado de pausa del video (si existe)

**Efectos**:
- Carga de plan por ID
- Carga de comentarios
- Carga de reviews
- Scroll handler para pausar video

**Lógica visual**:
- Carrusel horizontal de imágenes hero
- Tarjeta de información estilo Apple/Airbnb
- Galería secundaria de imágenes
- Botón "Llévame allá" con animación
- Sección de asistentes con avatares
- Comentarios con likes
- Planes similares
- Composer de comentarios fijo en bottom

**Datos que espera del backend**:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "vibe": "string (opcional)",
  "location": {
    "address": "string",
    "city": "string",
    "zone": "string",
    "lat": "number",
    "lng": "number"
  },
  "images": ["string"],
  "rating": "number",
  "reviewCount": "number",
  "capacity": "number",
  "currentAttendees": "number",
  "averagePrice": "number",
  "primaryCategory": "string",
  "tags": ["string"],
  "eventDate": "string (ISO, opcional)",
  "reviews": [{
    "id": "string",
    "userName": "string",
    "comment": "string",
    "rating": "number",
    "createdAt": "string"
  }]
}
```

**Datos que envía al backend**:
- Join plan: `{ planId: string, userId: string }`
- Like plan: `{ planId: string, userId: string }`
- Comment: `{ planId: string, userId: string, content: string }`
- Like comment: `{ planId: string, commentId: string, userId: string }`

### 4.7 Perfil (`app/(tabs)/profile/index.tsx`)

**Función**: Perfil de usuario con planes creados, favoritos, historial.

**Props**: `userId` (opcional, si es perfil de otro usuario)

**Estados**:
- `activeTab`: 'plans' | 'favorites' | 'history'
- `showEditModal`: Modal de edición visible
- `editName`, `editBio`, `editLocation`, `editAvatar`: Campos de edición
- `selectedPreferences`: Preferencias seleccionadas

**Efectos**:
- Carga de planes del usuario
- Animación de cambio de tab
- Contadores animados

**Lógica visual**:
- Header con gradiente
- Avatar con badges (verified, premium)
- Barra de progreso de nivel
- Stats (planes, seguidores, siguiendo, asistidos)
- Tabs para planes/favoritos/historial
- Modal de edición con scroll

**Datos que espera del backend**:
```json
{
  "id": "string",
  "name": "string",
  "username": "string",
  "avatar": "string",
  "bio": "string",
  "location": "string",
  "points": "number",
  "isVerified": "boolean",
  "isPremium": "boolean",
  "followersCount": "number",
  "followingCount": "number",
  "plansAttended": "number",
  "preferences": ["string"]
}
```

**Datos que envía al backend**:
- Update profile: `{ name, bio, location, avatar, preferences }`
- Follow/Unfollow: `{ userId: string, targetUserId: string }`

### 4.8 Login (`app/(auth)/login.tsx`)

**Función**: Autenticación de usuarios.

**Estados**:
- Email y password (manejados por LoginScreen component)

**Lógica visual**:
- Formulario de login
- Opción de registro
- Validación de campos

**Datos que envía al backend**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Datos que espera del backend**:
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "isVerified": "boolean",
    "isPremium": "boolean"
  },
  "token": "string (opcional, si usas JWT)"
}
```

### 4.9 Onboarding (`app/(auth)/onboarding.tsx`)

**Función**: Configuración inicial del perfil (3 pasos).

**Estados**:
- `currentStep`: 1 | 2 | 3
- `data`: { bio, interests, avatar }

**Pasos**:
1. Bio (descripción personal)
2. Intereses (selección múltiple de categorías)
3. Avatar (foto de perfil)

**Datos que envía al backend**:
```json
{
  "bio": "string",
  "interests": ["string"],
  "avatar": "string (URI)"
}
```

### 4.10 Chats (`app/friends/chats.tsx`)

**Función**: Lista de chats del usuario.

**Estados**:
- `chats`: Lista de chats ordenados por último mensaje
- `unreadCount`: Contador de no leídos

**Lógica visual**:
- Lista de chats con avatar, nombre, último mensaje, timestamp
- Badge de no leídos
- Estado vacío si no hay chats

**Datos que espera del backend**:
```json
{
  "chats": [{
    "id": "string",
    "userIds": ["string"],
    "lastMessage": {
      "text": "string",
      "createdAt": "number",
      "senderId": "string"
    },
    "unreadCount": "number"
  }]
}
```

### 4.11 Notificaciones (`app/notifications/index.tsx`)

**Función**: Centro de notificaciones.

**Estados**:
- `notifications`: Lista de notificaciones
- `lastReadAt`: Timestamp de última lectura

**Lógica visual**:
- Lista de notificaciones con avatar, mensaje, timestamp
- Botón "Marcar leídas"
- Animaciones de entrada

**Datos que espera del backend**:
```json
{
  "notifications": [{
    "id": "string",
    "type": "like" | "comment" | "follow" | "plan_join" | "plan_reminder" | "friend_request",
    "title": "string",
    "message": "string",
    "actorId": "string",
    "targetPlanId": "string (opcional)",
    "isRead": "boolean",
    "createdAt": "number"
  }]
}
```

## 5. DOCUMENTACIÓN DE COMPONENTES UI

### 5.1 PatchCard / PlanCard

**Props**:
```typescript
{
  plan: Plan;
  horizontal?: boolean;
  onPress?: () => void;
}
```

**Funcionalidad**: Muestra información resumida de un plan (imagen, nombre, ubicación, rating, precio).

### 5.2 TikTokShortItem

**Props**:
```typescript
{
  item: Short;
  isActive: boolean;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
  onTap: () => void;
}
```

**Funcionalidad**: Renderiza un short estilo TikTok con controles laterales, información inferior, y gestión de reproducción.

### 5.3 FABSpeedDial

**Props**: Ninguna

**Funcionalidad**: Botón flotante expandible con opciones rápidas (crear plan, crear short, etc.).

### 5.4 SearchBar

**Props**:
```typescript
{
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showFilter?: boolean;
  onFilterPress?: () => void;
}
```

**Funcionalidad**: Barra de búsqueda con sugerencias y filtros.

### 5.5 ZoneSelector

**Props**:
```typescript
{
  selectedZone: string;
  onZoneSelect: (zone: string) => void;
  navigateOnPress?: boolean;
}
```

**Funcionalidad**: Selector horizontal de zonas de Medellín.

## 6. FLUJOS DEL USUARIO

### 6.1 Flujo del Home

1. Usuario abre app → Redirige a Home si está autenticado
2. Home muestra:
   - Saludo personalizado
   - Puntos y badge premium (si aplica)
   - Barra de búsqueda
   - Selector de zona
   - Carrusel "Top 5 del día"
   - Carrusel "Tendencias en Medellín"
   - Grid de todos los planes
3. Usuario puede:
   - Buscar planes
   - Filtrar por zona
   - Ver detalle de plan (tap en card)
   - Crear contenido (FAB)

### 6.2 Flujo de Parches

1. Usuario ve planes en Home/Mapa/Zonas
2. Tap en un plan → Navega a `/plan/[id]`
3. Vista de detalle muestra:
   - Carrusel de imágenes
   - Información completa
   - Asistentes
   - Comentarios
   - Planes similares
4. Usuario puede:
   - Unirse al plan
   - Comentar
   - Dar like
   - Abrir en maps
   - Compartir

### 6.3 Flujo de Shorts

1. Usuario va a tab "Shorts"
2. Feed vertical estilo TikTok
3. Swipe vertical para cambiar de video
4. Controles laterales: like, comentario, guardar, compartir
5. Tap en video para pausar/reanudar
6. Solo un video activo a la vez (audio)

### 6.4 Flujo de Autenticación

1. Usuario no autenticado → Redirige a `/login`
2. Login con email/password
3. Si es nuevo usuario → Onboarding (3 pasos)
4. Después de onboarding → Home

### 6.5 Flujo de Creación de Plan

1. Usuario toca FAB o botón "Crear"
2. Modal: elegir "Crear Parche" o "Subir Parche" (short)
3. Si "Crear Parche":
   - Wizard de 5 pasos
   - Paso 1: Detalles
   - Paso 2: Ubicación (mapa)
   - Paso 3: Información (capacidad, precio, fecha)
   - Paso 4: Multimedia
   - Paso 5: Resumen
4. Confirmación → Plan creado

### 6.6 Flujo de Creación de Short

1. Usuario elige "Subir Parche"
2. Formulario: nombre, descripción, categoría, tags
3. Seleccionar video
4. Preview del video
5. Procesamiento automático (9:16)
6. Subida en background
7. Éxito → Redirige a Shorts

## 7. INTEGRACIÓN CON BACKEND

### 7.1 Endpoints requeridos

#### Autenticación

**POST `/api/auth/login`**
- **Recibe**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Retorna**:
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "isVerified": "boolean",
    "isPremium": "boolean"
  },
  "token": "string"
}
```

**POST `/api/auth/register`**
- **Recibe**:
```json
{
  "name": "string",
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **Retorna**: Mismo formato que login

**POST `/api/auth/onboarding`**
- **Recibe**:
```json
{
  "bio": "string",
  "interests": ["string"],
  "avatar": "string (URL o base64)"
}
```

#### Planes

**GET `/api/trpc/plans.getAll`**
- **Query params**: `zone?`, `category?`, `limit?`, `offset?`
- **Retorna**:
```json
{
  "plans": [{
    "id": "string",
    "name": "string",
    "description": "string",
    "vibe": "string",
    "location": {
      "address": "string",
      "city": "string",
      "zone": "string",
      "lat": "number",
      "lng": "number"
    },
    "images": ["string"],
    "rating": "number",
    "reviewCount": "number",
    "capacity": "number",
    "currentAttendees": "number",
    "averagePrice": "number",
    "primaryCategory": "string",
    "tags": ["string"],
    "eventDate": "string (ISO)",
    "userId": "string",
    "createdBy": "string",
    "createdAt": "string"
  }]
}
```

**GET `/api/trpc/plans.getById`**
- **Params**: `planId: string`
- **Retorna**: Un plan completo con reviews y comentarios

**POST `/api/trpc/plans.create`**
- **Recibe**:
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "maxPeople": "number",
  "location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "images": ["string (URLs)"],
  "userId": "string",
  "createdBy": "string",
  "price": "number (opcional)",
  "eventDate": "string (ISO, opcional)",
  "tags": ["string"]
}
```
- **Retorna**: Plan creado

**POST `/api/trpc/plans.join`**
- **Recibe**:
```json
{
  "planId": "string",
  "userId": "string"
}
```

**POST `/api/trpc/plans.like`**
- **Recibe**:
```json
{
  "planId": "string",
  "userId": "string"
}
```

#### Shorts

**GET `/api/trpc/shorts.getAll`**
- **Query params**: `limit?`, `offset?`
- **Retorna**:
```json
{
  "shorts": [{
    "id": "string",
    "videoUrl": "string",
    "thumbnailUrl": "string",
    "placeName": "string",
    "category": "string",
    "description": "string",
    "likes": "number",
    "favorites": "number",
    "comments": "number",
    "userId": "string",
    "createdBy": "string",
    "createdAt": "string"
  }]
}
```

**POST `/api/trpc/shorts.create`**
- **Recibe**:
```json
{
  "videoUrl": "string (URL del video procesado)",
  "thumbnailUrl": "string",
  "placeName": "string",
  "category": "string",
  "description": "string",
  "userId": "string",
  "createdBy": "string"
}
```

**POST `/api/trpc/shorts.like`**
- **Recibe**: `{ shortId: string, userId: string }`

**POST `/api/trpc/shorts.favorite`**
- **Recibe**: `{ shortId: string, userId: string }`

#### Comentarios

**GET `/api/trpc/comments.getByPlan`**
- **Params**: `planId: string`
- **Retorna**:
```json
{
  "comments": [{
    "id": "string",
    "planId": "string",
    "userId": "string",
    "userName": "string",
    "userAvatar": "string",
    "content": "string",
    "likes": ["string (userIds)"],
    "createdAt": "number"
  }]
}
```

**POST `/api/trpc/comments.createPlanComment`**
- **Recibe**:
```json
{
  "planId": "string",
  "userId": "string",
  "content": "string"
}
```

#### Reviews

**GET `/api/trpc/reviews.getByPlan`**
- **Params**: `planId: string`
- **Retorna**:
```json
{
  "reviews": [{
    "id": "string",
    "planId": "string",
    "userId": "string",
    "userName": "string",
    "rating": "number (1-5)",
    "comment": "string",
    "createdAt": "string"
  }]
}
```

#### Usuarios

**GET `/api/trpc/users.getProfile`**
- **Params**: `userId: string`
- **Retorna**: Perfil completo del usuario

**POST `/api/trpc/users.updateProfile`**
- **Recibe**:
```json
{
  "name": "string",
  "bio": "string",
  "location": "string",
  "avatar": "string",
  "preferences": ["string"]
}
```

**GET `/api/trpc/users.getStats`**
- **Params**: `userId: string`
- **Retorna**: Estadísticas del usuario

## 8. MODELOS DE DATOS SUGERIDOS

### 8.1 Usuario

```typescript
{
  id: string (UUID);
  name: string;
  username: string (único);
  email: string (único);
  password: string (hasheado);
  avatar: string (URL);
  bio: string;
  location: string;
  preferences: string[]; // Categorías de interés
  isVerified: boolean;
  isPremium: boolean;
  points: number;
  level: number; // Calculado: floor(points / 100) + 1
  badges: string[];
  followersCount: number;
  followingCount: number;
  plansCreated: number;
  plansAttended: number;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Relaciones**:
- `follows`: Tabla de seguimientos (followerId, followingId)
- `friendships`: Tabla de amistades (userId, friendId, status)

### 8.2 Plan

```typescript
{
  id: string (UUID);
  name: string;
  description: string;
  vibe: string (opcional); // Descripción corta del ambiente
  primaryCategory: "barrio" | "mirador" | "rooftop" | "restaurante" | "cafe" | "bar" | "club" | "parque";
  location: {
    address: string;
    city: string; // "Medellín"
    zone: string; // "El Poblado", "Laureles", etc.
    lat: number;
    lng: number;
  };
  images: string[]; // URLs
  videoUrl: string (opcional); // URL de video promocional
  capacity: number;
  currentAttendees: number;
  averagePrice: number; // En pesos colombianos
  priceType: "free" | "paid" | "minimum_consumption";
  tags: string[];
  eventDate: timestamp (opcional);
  endDate: timestamp (opcional);
  bestTime: string (opcional); // "Noche", "Mediodía", etc.
  rating: number; // Promedio de reviews (0-5)
  reviewCount: number;
  likes: number;
  favorites: number;
  visits: number;
  saves: number;
  userId: string; // Creador
  createdBy: string; // Nombre del creador
  isPremium: boolean;
  isSponsored: boolean;
  isSpotlight: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Relaciones**:
- `plan_attendees`: Tabla de asistentes (planId, userId, joinedAt)
- `plan_likes`: Tabla de likes (planId, userId)
- `plan_favorites`: Tabla de favoritos (planId, userId)
- `reviews`: Tabla de reviews (planId, userId, rating, comment)
- `comments`: Tabla de comentarios (planId, userId, content)

### 8.3 Short

```typescript
{
  id: string (UUID);
  videoUrl: string; // URL del video procesado (9:16)
  thumbnailUrl: string;
  placeName: string;
  category: string;
  description: string;
  location: {
    lat: number (opcional);
    lng: number (opcional);
    address: string (opcional);
  };
  likes: number;
  favorites: number;
  comments: number;
  userId: string;
  createdBy: string;
  isPremium: boolean;
  isSponsored: boolean;
  businessId: string (opcional); // Si es promocional
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

**Relaciones**:
- `short_likes`: Tabla de likes (shortId, userId)
- `short_favorites`: Tabla de favoritos (shortId, userId)
- `comments`: Tabla de comentarios (shortId, userId, content)

### 8.4 Ubicación / Geolocalización

**Estructura de Location**:
```typescript
{
  address: string; // "Calle 10 # 43-20"
  city: string; // "Medellín"
  zone: string; // "El Poblado", "Laureles", "Centro", etc.
  lat: number; // -75.5658
  lng: number; // 6.2476
  // Alternativamente:
  latitude: number;
  longitude: number;
}
```

**Zonas de Medellín** (según `data/zones.ts`):
- El Poblado
- Laureles
- Envigado
- Sabaneta
- Itagüí
- Bello
- Centro
- La Candelaria
- Belén
- Robledo
- etc.

### 8.5 Estadísticas

**UserStats**:
```typescript
{
  userId: string;
  totalPlans: number;
  totalAttended: number;
  totalLikes: number;
  totalReviews: number;
  averageRating: number;
  favoriteCategories: string[];
  lastActivity: timestamp;
}
```

**PlanStats** (calculadas):
- Rating promedio de reviews
- Número de asistentes
- Número de likes
- Número de favoritos
- Número de comentarios
- Número de visitas

## 9. REQUERIMIENTOS TÉCNICOS PARA EL BACKEND

### 9.1 Validaciones necesarias

#### Usuario
- Email: formato válido, único
- Username: único, sin espacios, 3-20 caracteres
- Password: mínimo 8 caracteres, al menos 1 mayúscula, 1 número
- Avatar: URL válida o base64 válido

#### Plan
- Name: requerido, 3-100 caracteres
- Description: requerido, mínimo 10 caracteres
- Location: lat/lng válidos (-90 a 90, -180 a 180)
- Capacity: número positivo
- Images: mínimo 1, máximo 10, URLs válidas
- Category: debe ser una de las categorías válidas
- EventDate: formato ISO válido, fecha futura (si se proporciona)

#### Short
- VideoUrl: URL válida, formato de video soportado
- ThumbnailUrl: URL válida, formato de imagen
- PlaceName: requerido, 2-50 caracteres
- Description: máximo 500 caracteres

### 9.2 Estructuras obligatorias

#### Respuestas de error
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (opcional)"
  }
}
```

#### Respuestas de éxito
```json
{
  "data": "object o array",
  "meta": {
    "total": "number (opcional)",
    "page": "number (opcional)",
    "limit": "number (opcional)"
  }
}
```

### 9.3 Relaciones entre entidades

**Usuario ↔ Plan**:
- Un usuario puede crear muchos planes (1:N)
- Un usuario puede unirse a muchos planes (N:M via plan_attendees)
- Un usuario puede dar like a muchos planes (N:M via plan_likes)

**Usuario ↔ Short**:
- Un usuario puede crear muchos shorts (1:N)
- Un usuario puede dar like a muchos shorts (N:M)

**Usuario ↔ Usuario**:
- Seguimientos (N:M via follows)
- Amistades (N:M via friendships)

**Plan ↔ Review**:
- Un plan puede tener muchas reviews (1:N)

**Plan ↔ Comment**:
- Un plan puede tener muchos comentarios (1:N)

### 9.4 Seguridad y control de datos

#### Autenticación
- JWT tokens con expiración (recomendado: 7 días)
- Refresh tokens para renovación
- Hash de passwords con bcrypt (mínimo 10 rounds)

#### Autorización
- Usuarios solo pueden editar/eliminar sus propios planes/shorts
- Usuarios solo pueden unirse/salir de planes públicos
- Moderación de contenido: reportes, flags

#### Validación de archivos
- Videos: máximo 100MB, formatos: mp4, mov
- Imágenes: máximo 10MB, formatos: jpg, png, webp
- Validación de dimensiones de video (9:16 para shorts)

#### Rate limiting
- Crear plan: 10 por hora
- Crear short: 5 por hora
- Comentarios: 50 por hora
- Likes: 100 por hora

## 10. GUÍA PARA DESARROLLADORES

### 10.1 Cómo instalar el proyecto

```bash
# Clonar repositorio
git clone <repo-url>
cd queparche

# Instalar dependencias
npm install

# O con yarn
yarn install
```

### 10.2 Cómo correrlo

```bash
# Desarrollo (con tunnel para probar en dispositivo físico)
npm start
# O
npm run dev

# Web
npm run start-web

# Limpiar cache y reiniciar
npx expo start --clear
```

### 10.3 Variables de entorno

Crear archivo `.env` (no está en el repo por seguridad):

```env
# Backend
EXPO_PUBLIC_API_URL=http://localhost:3000
# O en producción:
# EXPO_PUBLIC_API_URL=https://api.queparche.com

# Analytics (opcional)
EXPO_PUBLIC_GA4_ID=G-XXXXXXXXXX

# Google Maps (opcional)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-here
```

### 10.4 Cómo extender el código

#### Agregar una nueva pantalla

1. Crear archivo en `/app` siguiendo la estructura de Expo Router
2. Si es tab, agregar en `(tabs)/_layout.tsx`
3. Agregar tipos en `/types` si es necesario
4. Agregar store en `/store` si necesita estado global

#### Agregar un nuevo endpoint

1. Crear archivo en `/backend/trpc/routes/[entidad]/[accion]/route.ts`
2. Exportar procedure con validación Zod
3. Agregar en `/backend/trpc/app-router.ts`
4. El cliente tRPC lo detecta automáticamente

#### Agregar un nuevo componente

1. Crear en `/components`
2. Usar TypeScript con props tipadas
3. Usar NativeWind para estilos
4. Agregar animaciones con Reanimated si es necesario

## 11. CHECKLIST FINAL DE BACKEND

| Endpoint | Método | Qué retorna | Qué recibe | Estado actual |
|----------|--------|-------------|------------|---------------|
| `/api/auth/login` | POST | User + token | email, password | ⚠️ Mock |
| `/api/auth/register` | POST | User + token | name, username, email, password | ⚠️ Mock |
| `/api/auth/onboarding` | POST | Success | bio, interests, avatar | ⚠️ Mock |
| `/api/trpc/plans.getAll` | GET | Array de Plan | zone?, category?, limit?, offset? | ⚠️ Mock |
| `/api/trpc/plans.getById` | GET | Plan completo | planId | ⚠️ Mock |
| `/api/trpc/plans.create` | POST | Plan creado | name, description, category, location, images, etc. | ⚠️ Mock |
| `/api/trpc/plans.join` | POST | Success | planId, userId | ⚠️ Mock |
| `/api/trpc/plans.like` | POST | Success | planId, userId | ⚠️ Mock |
| `/api/trpc/shorts.getAll` | GET | Array de Short | limit?, offset? | ⚠️ Mock |
| `/api/trpc/shorts.getById` | GET | Short completo | shortId | ⚠️ Mock |
| `/api/trpc/shorts.create` | POST | Short creado | videoUrl, thumbnailUrl, placeName, category, etc. | ⚠️ Mock |
| `/api/trpc/shorts.like` | POST | Success | shortId, userId | ⚠️ Mock |
| `/api/trpc/shorts.favorite` | POST | Success | shortId, userId | ⚠️ Mock |
| `/api/trpc/comments.getByPlan` | GET | Array de Comment | planId | ⚠️ Mock |
| `/api/trpc/comments.createPlanComment` | POST | Comment creado | planId, userId, content | ⚠️ Mock |
| `/api/trpc/comments.getByShort` | GET | Array de Comment | shortId | ⚠️ Mock |
| `/api/trpc/comments.create` | POST | Comment creado | shortId, userId, content | ⚠️ Mock |
| `/api/trpc/reviews.getByPlan` | GET | Array de Review | planId | ⚠️ Mock |
| `/api/trpc/users.getProfile` | GET | User completo | userId | ⚠️ Mock |
| `/api/trpc/users.updateProfile` | POST | User actualizado | name, bio, location, avatar, preferences | ⚠️ Mock |
| `/api/trpc/users.getStats` | GET | UserStats | userId | ⚠️ Mock |

**Leyenda**:
- ✅ Implementado y funcional
- ⚠️ Mock (implementación temporal con datos estáticos)
- ❌ No implementado

### Notas importantes para el backend

1. **Todos los endpoints actualmente son mocks** usando datos estáticos en `/mocks`
2. **tRPC está configurado** pero necesita implementación real en el backend
3. **Autenticación** actualmente es local con Zustand, necesita JWT
4. **Subida de archivos** (videos/imágenes) necesita implementación de storage (S3, Cloudinary, etc.)
5. **Procesamiento de video** se hace en el frontend, pero debería moverse al backend
6. **Notificaciones** necesitan sistema de push notifications
7. **Chats** necesitan WebSocket o similar para tiempo real

---

**Documentación generada el**: $(date)
**Versión de la app**: 1.0.0
**Última actualización**: $(date)

