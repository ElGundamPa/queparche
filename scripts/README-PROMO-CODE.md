# Sistema de Código Promocional - 808 Fest x Asado Mistico

## 🎉 Descripción

Sistema completo de códigos promocionales para usuarios que incluye:
- ✅ Generación automática de código único al registrarse (formato: QP-XXXXXX)
- ✅ Tarjeta de código promocional en el home con diseño atractivo
- ✅ QR code con toda la información del descuento
- ✅ Evento destacado "808 Fest x Asado Mistico" visible para todos los usuarios
- ✅ 10% de descuento en consumibles dentro del evento

---

## 📋 Pasos para Implementar

### 1️⃣ Ejecutar Scripts SQL en Supabase

Debes ejecutar estos scripts **en orden** en el SQL Editor de Supabase:

#### Script 1: Agregar campo `promo_code` a la tabla profiles
📁 Archivo: `/scripts/add-promo-code-field.sql`

```sql
-- Abre Supabase Dashboard → SQL Editor
-- Copia y pega el contenido de add-promo-code-field.sql
-- Click en "Run"
```

Este script:
- Agrega el campo `promo_code` (TEXT, UNIQUE) a la tabla `profiles`
- Crea un índice para búsquedas rápidas

#### Script 2: Actualizar función `register_user()`
📁 Archivo: `/scripts/update-register-with-promo.sql`

```sql
-- Abre Supabase Dashboard → SQL Editor
-- Copia y pega el contenido de update-register-with-promo.sql
-- Click en "Run"
```

Este script:
- Actualiza la función `register_user()` para generar códigos promocionales únicos
- Formato del código: `QP-XXXXXX` (donde X es alfanumérico)
- Verifica que no existan códigos duplicados usando un loop

---

## 🏗️ Arquitectura

### Base de Datos

```
profiles
├── id (UUID)
├── email (TEXT)
├── username (TEXT)
├── name (TEXT)
├── promo_code (TEXT) ← NUEVO CAMPO
└── ... otros campos
```

### Flujo de Registro

```
1. Usuario completa formulario de registro
   ↓
2. Se ejecuta register_user() en PostgreSQL
   ↓
3. Se genera código único (QP-XXXXXX)
   ↓
4. Se verifica que no exista
   ↓
5. Se crea perfil con código asignado
   ↓
6. Usuario recibe su código promocional
```

### Componentes Creados

1. **PromoCard** (`/components/PromoCard.tsx`)
   - Muestra código promocional del usuario
   - Botón para ver QR completo
   - Funcionalidad de copiar código
   - Opción de compartir

2. **FeaturedEventCard** (`/components/FeaturedEventCard.tsx`)
   - Tarjeta destacada para evento principal
   - Badge de "EVENTO PRINCIPAL"
   - Información del evento (fecha, ubicación, precio, asistentes)
   - CTA que menciona el 10% de descuento

3. **Evento Mock** (`/mocks/events.ts`)
   - Evento "808 Fest x Asado Mistico"
   - Marcado como `isFeatured: true`
   - Aparece primero en la lista de eventos

---

## 📱 Uso en la Aplicación

### Home Screen

El código promocional y el evento aparecen automáticamente en el home después de que el usuario se registra:

```tsx
// Tarjeta de Código Promocional
{currentUser?.promo_code && (
  <PromoCard
    promoCode={currentUser.promo_code}
    userName={currentUser.name}
  />
)}

// Evento Destacado
{mockEvents.find(e => e.isFeatured) && (
  <FeaturedEventCard event={mockEvents.find(e => e.isFeatured)!} />
)}
```

### QR Code

Al presionar "Ver QR" en el PromoCard, se muestra un modal con:
- QR code grande generado con `react-native-qrcode-svg`
- Logo de la app en el centro del QR
- Información del descuento
- Botones para copiar código y compartir

**Datos en el QR:**
```json
{
  "code": "QP-A1B2C3",
  "event": "808 Fest x Asado Mistico",
  "discount": "10%",
  "type": "consumibles",
  "userName": "Nombre del Usuario"
}
```

---

## 🎨 Diseño

### PromoCard
- Gradiente vibrante (rojo → naranja → amarillo)
- Icono de regalo
- Código grande y legible
- Botón de copiar integrado
- CTA "Ver QR" prominente
- Decoración con círculos semi-transparentes

### FeaturedEventCard
- Imagen de fondo del evento
- Gradiente oscuro para legibilidad
- Badge destacado "⭐ EVENTO PRINCIPAL"
- Grid de información (fecha, ubicación, asistentes, precio)
- CTA con mención del descuento: "🎉 10% de descuento con tu código"

---

## 🔒 Seguridad

- ✅ Códigos únicos garantizados con verificación en loop
- ✅ Índice en base de datos para búsquedas eficientes
- ✅ Campo UNIQUE en base de datos previene duplicados
- ✅ Validación en función PostgreSQL

---

## 🧪 Testing

### Verificar que el código se genera correctamente:

1. Registra un nuevo usuario
2. Verifica en Supabase:
   ```sql
   SELECT id, username, promo_code
   FROM public.profiles
   ORDER BY created_at DESC
   LIMIT 10;
   ```
3. Confirma que todos los usuarios nuevos tienen un `promo_code` único

### Verificar en la app:

1. Inicia sesión con el usuario recién registrado
2. Navega al Home
3. Verifica que aparece la tarjeta de código promocional
4. Presiona "Ver QR" y verifica que el modal se abre
5. Verifica que el código es correcto en el QR
6. Prueba copiar el código
7. Prueba compartir

---

## 📊 Estadísticas de Implementación

- **Scripts SQL creados:** 2
- **Componentes nuevos:** 2
- **Archivos modificados:** 4
  - `app/(tabs)/index.tsx`
  - `hooks/use-auth-store.ts`
  - `types/plan.ts`
  - `mocks/events.ts`
- **Librerías instaladas:** 2
  - `react-native-qrcode-svg`
  - `react-native-svg`

---

## ✅ Checklist de Implementación

- [ ] Ejecutar `add-promo-code-field.sql` en Supabase
- [ ] Ejecutar `update-register-with-promo.sql` en Supabase
- [ ] Verificar que las funciones se actualizaron correctamente
- [ ] Registrar un usuario de prueba
- [ ] Verificar que el usuario tiene `promo_code` en la base de datos
- [ ] Abrir la app y verificar que aparece PromoCard
- [ ] Verificar que aparece FeaturedEventCard
- [ ] Probar abrir el QR del código promocional
- [ ] Probar copiar y compartir el código

---

## 🎯 Resultado Final

Los usuarios ahora:
1. ✅ Reciben automáticamente un código promocional único al registrarse
2. ✅ Pueden ver su código en el home de la aplicación
3. ✅ Pueden generar un QR para usar en el evento
4. ✅ Ven el evento "808 Fest x Asado Mistico" destacado en el home
5. ✅ Saben que tienen 10% de descuento en consumibles con su código

---

## 🚀 Próximos Pasos Recomendados

1. **Backend de validación de códigos:**
   - Crear endpoint para validar códigos promocionales en el evento
   - Registrar uso de códigos
   - Prevenir uso múltiple del mismo código

2. **Analytics:**
   - Tracking de cuántos usuarios usan sus códigos
   - Métricas de conversión

3. **Notificaciones:**
   - Recordar a usuarios usar su código antes del evento
   - Notificación cuando el evento esté próximo

4. **Gamificación:**
   - Dar puntos extra a usuarios que usen sus códigos
   - Leaderboard de usuarios que más refieren
