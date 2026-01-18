# Scripts de Configuración de Supabase

Este directorio contiene los scripts SQL necesarios para configurar la base de datos de QuéParche en Supabase.

## 📋 Orden de Ejecución

**IMPORTANTE:** Debes ejecutar los scripts en este orden específico:

### 1. Crear Proyecto en Supabase

Antes de ejecutar los scripts:

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto:
   - **Nombre:** queparche-prod (o queparche-dev para desarrollo)
   - **Región:** South America (São Paulo) - la más cercana a Colombia
   - **Database Password:** Guarda esto de forma segura
3. Espera ~2 minutos a que se aprovisione el proyecto
4. Ve a **Settings > API** y copia:
   - Project URL
   - anon/public key
   - service_role key (¡mantén esto secreto!)

### 2. Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los placeholders con tus credenciales reales:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
EXPO_PUBLIC_SUPABASE_STORAGE_URL=https://tu-proyecto.supabase.co/storage/v1
```

### 3. Ejecutar Scripts SQL

Ve a tu proyecto de Supabase Dashboard > **SQL Editor** y ejecuta los scripts en este orden:

#### Script 1: Schema Principal (15-20 min)
**Archivo:** `supabase-schema.sql`

Este script crea:
- ✅ 13 tablas (profiles, plans, shorts, reviews, comments, etc.)
- ✅ Índices de performance
- ✅ Triggers automáticos para contadores
- ✅ Funciones útiles (get_user_stats, find_nearby_plans)

**Cómo ejecutar:**
1. Abre `supabase-schema.sql` en un editor de texto
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en "Run"
5. Espera a que termine (~30 segundos)
6. Verifica que veas el mensaje: "✅ Esquema de base de datos creado exitosamente!"

#### Script 2: Row Level Security (5 min)
**Archivo:** `supabase-rls.sql`

Este script configura:
- ✅ Habilita RLS en todas las tablas
- ✅ Políticas de seguridad (quién puede ver/editar qué)

**Cómo ejecutar:**
1. Abre `supabase-rls.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor
4. Haz clic en "Run"
5. Verifica el mensaje: "✅ RLS habilitado correctamente en todas las 13 tablas"

#### Script 3: Storage Configuration (5 min)
**Archivo:** `supabase-storage.sql`

Este script configura:
- ✅ 5 buckets (avatars, plan-images, short-videos, short-thumbnails, event-images)
- ✅ Políticas de upload/download

**Cómo ejecutar:**
1. Abre `supabase-storage.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor
4. Haz clic en "Run"
5. Verifica el mensaje: "✅ Storage configurado correctamente: 5 buckets creados"

### 4. Generar Tipos TypeScript

Después de ejecutar los scripts SQL, genera los tipos para TypeScript:

```bash
npx supabase gen types typescript --project-id tu-project-ref > types/supabase.ts
```

**Nota:** El `project-ref` lo encuentras en Settings > General > Reference ID

### 5. Verificar Configuración

En el SQL Editor, ejecuta estas queries para verificar:

```sql
-- Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar buckets de storage
SELECT id, name, public, file_size_limit
FROM storage.buckets;
```

Deberías ver:
- ✅ 13 tablas en el schema public
- ✅ Todas con rowsecurity = true
- ✅ 5 buckets de storage

## 🔄 Migración de Datos Mock

Después de completar los pasos anteriores, ejecuta el script de migración de datos:

```bash
# Este script está pendiente de implementación
npm run migrate-mock-data
```

O ejecuta manualmente el SQL en `seed-data.sql` (cuando esté disponible).

## ⚠️ Solución de Problemas

### Error: "permission denied for schema public"
**Solución:** Verifica que estés usando el SQL Editor con permisos de administrador.

### Error: "extension postgis does not exist"
**Solución:** PostGIS ya viene instalado en Supabase, pero si ves este error, ejecuta:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Error: "relation already exists"
**Solución:** Si necesitas reiniciar, elimina todas las tablas primero:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Luego vuelve a ejecutar los scripts.

### Storage buckets no se crean
**Solución:** Ve manualmente a Storage > Buckets y crea los buckets con estos nombres:
- avatars
- plan-images
- short-videos
- short-thumbnails
- event-images

Todos con opción "Public bucket" habilitada.

## 📚 Recursos Adicionales

- [Documentación de Supabase SQL](https://supabase.com/docs/guides/database/tables)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Documentation](https://supabase.com/docs/guides/storage)
- [PostGIS Documentation](https://postgis.net/docs/)

## 🆘 Ayuda

Si tienes problemas:
1. Revisa los logs en el SQL Editor
2. Consulta la documentación de Supabase
3. Abre un issue en el repositorio del proyecto
