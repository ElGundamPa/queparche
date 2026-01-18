# Setup de Autenticación Custom

Este documento explica cómo configurar el sistema de autenticación personalizado sin usar Supabase Auth.

## ¿Por qué autenticación custom?

En lugar de usar Supabase Auth (con email provider), implementamos nuestro propio sistema de autenticación usando:
- **bcryptjs** para hashear contraseñas
- **jsonwebtoken** para generar tokens de sesión
- Tabla `users_auth` en Supabase para almacenar usuarios
- Endpoints tRPC custom para login y register

## Pasos de configuración

### 1. Ejecutar SQL en Supabase

Ve a tu proyecto de Supabase: https://supabase.com/dashboard

1. Navega a: **SQL Editor**
2. Crea un nuevo query
3. Copia y pega el contenido de: `/scripts/create-auth-table.sql`
4. Ejecuta el query (presiona `Run` o `Ctrl+Enter`)

Este SQL creará:
- Tabla `users_auth` con passwords hasheados
- Índices para búsquedas rápidas
- Trigger para actualizar `updated_at`
- Trigger para crear perfil automáticamente al registrar usuario
- Políticas RLS (Row Level Security)

### 2. Verificar variables de entorno

Asegúrate de que tu archivo `.env` tenga:

```env
# Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# JWT Secret (cambiar en producción)
JWT_SECRET=queparche-jwt-secret-key-2024-super-secure-change-in-production
```

⚠️ **IMPORTANTE**: Cambia `JWT_SECRET` por una cadena aleatoria segura en producción.

### 3. Reiniciar el servidor de desarrollo

Después de configurar las variables de entorno:

```bash
npm start
```

## Flujo de autenticación

### Registro (Sign Up)

1. Usuario completa formulario de registro
2. Frontend llama a `trpc.auth.register.mutate()`
3. Backend:
   - Valida email, username y password
   - Verifica que email y username no existan
   - Hashea la contraseña con bcrypt (10 rounds)
   - Inserta usuario en `users_auth`
   - Trigger crea perfil en `profiles`
   - Genera token JWT válido por 30 días
4. Frontend recibe token y usuario
5. Token se almacena en AsyncStorage via Zustand persist

### Login (Sign In)

1. Usuario ingresa email/username y password
2. Frontend normaliza el input (agrega @ si es username)
3. Frontend llama a `trpc.auth.login.mutate()`
4. Backend:
   - Busca usuario por email o username
   - Compara password con hash usando bcrypt
   - Actualiza `last_login`
   - Carga perfil completo
   - Genera nuevo token JWT
5. Frontend recibe token y usuario
6. Token se almacena en AsyncStorage

### Logout

1. Usuario presiona "Cerrar sesión"
2. Frontend limpia:
   - Token
   - Usuario actual
   - Estado de autenticación
3. AsyncStorage se actualiza automáticamente

## Seguridad

### Contraseñas
- Hasheadas con **bcrypt** (10 rounds)
- Nunca se envían en texto plano
- Nunca se retornan en queries

### Tokens JWT
- Válidos por 30 días
- Contienen: `userId`, `email`, `username`
- Firmados con `JWT_SECRET`
- Verificables en backend

### Base de datos
- **RLS (Row Level Security)** habilitado
- Usuarios solo pueden ver su propia información
- Inserciones requieren service_role key
- Políticas específicas por operación

## Validaciones

### Email
- Formato válido: `usuario@dominio.com`
- Único en la base de datos

### Username
- Debe comenzar con `@`
- Entre 3-20 caracteres (sin contar @)
- Solo alfanuméricos y guiones bajos
- Único en la base de datos

### Password
- Mínimo 6 caracteres
- No hay máximo
- Recomendado: usar letras, números y símbolos

## Tablas relacionadas

### `users_auth`
Tabla principal de autenticación:
```sql
- id: UUID (PK)
- email: TEXT UNIQUE
- username: TEXT UNIQUE
- password_hash: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- last_login: TIMESTAMPTZ
- is_active: BOOLEAN
```

### `profiles`
Perfil del usuario (se crea automáticamente via trigger):
```sql
- id: UUID (FK → users_auth.id)
- email: TEXT
- username: TEXT
- name: TEXT
- bio: TEXT
- avatar: TEXT
- interests: TEXT[]
- ...
```

## Endpoints tRPC

### `auth.register`
```typescript
Input: {
  email: string;
  username: string;
  password: string;
  name: string;
}

Output: {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
```

### `auth.login`
```typescript
Input: {
  emailOrUsername: string;
  password: string;
}

Output: {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
```

## Testing

### Crear usuario de prueba

1. Abre la app
2. Ve a "Registrarse"
3. Completa el formulario:
   - Email: `test@test.com`
   - Username: `testuser` (se convertirá a `@testuser`)
   - Password: `test123`
   - Nombre: `Test User`
4. Presiona "Crear cuenta"
5. Completa el onboarding

### Iniciar sesión con usuario de prueba

1. Ve a "Iniciar sesión"
2. Ingresa:
   - Email o username: `test@test.com` o `testuser` (o `@testuser`)
   - Password: `test123`
3. Presiona "Iniciar sesión"

## Troubleshooting

### Error: "Email logins are disabled"
- Esto significa que Supabase Auth está intentando funcionar
- Asegúrate de que el auth store use los endpoints tRPC correctos
- Verifica que no haya imports de `supabase.auth` en login/register

### Error: "Usuario no encontrado"
- Verifica que ejecutaste el SQL en Supabase
- Verifica que la tabla `users_auth` existe
- Intenta registrar un nuevo usuario

### Error: "Credenciales incorrectas"
- Verifica que el password sea correcto
- Las contraseñas son case-sensitive

### Token no persiste
- Verifica que AsyncStorage funcione correctamente
- Verifica que el persist de Zustand incluya `token`

### Perfil no se crea automáticamente
- Verifica que el trigger `create_profile_on_auth_user` existe
- El trigger debe estar en la tabla `users_auth`
- Si falla, el endpoint intentará crear el perfil manualmente

## Migración de usuarios existentes

Si ya tienes usuarios en Supabase Auth:

1. Exporta usuarios existentes
2. Para cada usuario:
   - Genera un password temporal
   - Hashea con bcrypt
   - Inserta en `users_auth`
   - Envía email con instrucciones de reset
3. Los perfiles ya existen, solo vincular con IDs

## Producción

Antes de ir a producción:

1. ✅ Cambiar `JWT_SECRET` por valor aleatorio seguro
2. ✅ Habilitar HTTPS en todas las requests
3. ✅ Configurar rate limiting
4. ✅ Habilitar logs de seguridad
5. ✅ Implementar reset de password
6. ✅ Agregar 2FA (opcional)
7. ✅ Configurar monitoreo de intentos fallidos

## Recursos

- [bcryptjs docs](https://github.com/dcodeIO/bcrypt.js)
- [jsonwebtoken docs](https://github.com/auth0/node-jsonwebtoken)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [tRPC docs](https://trpc.io/docs)
