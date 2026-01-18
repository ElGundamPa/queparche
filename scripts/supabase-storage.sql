-- ============================================
-- SUPABASE STORAGE CONFIGURATION
-- ============================================
-- Este archivo debe ejecutarse DESPUÉS de supabase-rls.sql
-- Configura buckets y políticas de almacenamiento

-- ============================================
-- CREAR BUCKETS
-- ============================================

-- Bucket: avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Público para lectura
  5242880, -- 5MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: plan-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plan-images',
  'plan-images',
  true,
  10485760, -- 10MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: short-videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'short-videos',
  'short-videos',
  true,
  52428800, -- 50MB límite
  ARRAY['video/mp4', 'video/quicktime', 'video/x-m4v']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: short-thumbnails
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'short-thumbnails',
  'short-thumbnails',
  true,
  2097152, -- 2MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: event-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-images',
  'event-images',
  true,
  10485760, -- 10MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES: avatars
-- ============================================

-- Todos pueden ver avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Los usuarios pueden subir su propio avatar
-- Estructura de carpetas: avatars/{user_id}/filename.jpg
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Los usuarios pueden actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Los usuarios pueden eliminar su propio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- STORAGE POLICIES: plan-images
-- ============================================

-- Todos pueden ver imágenes de planes
CREATE POLICY "Plan images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'plan-images');

-- Usuarios autenticados pueden subir imágenes de planes
CREATE POLICY "Authenticated users can upload plan images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'plan-images' AND
  auth.role() = 'authenticated'
);

-- Los usuarios pueden actualizar imágenes de planes
CREATE POLICY "Authenticated users can update plan images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'plan-images' AND
  auth.role() = 'authenticated'
);

-- Los usuarios pueden eliminar imágenes de planes que subieron
CREATE POLICY "Authenticated users can delete plan images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'plan-images' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- STORAGE POLICIES: short-videos
-- ============================================

-- Todos pueden ver videos
CREATE POLICY "Short videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'short-videos');

-- Usuarios autenticados pueden subir videos
CREATE POLICY "Authenticated users can upload short videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'short-videos' AND
  auth.role() = 'authenticated'
);

-- Los usuarios pueden actualizar sus videos
CREATE POLICY "Authenticated users can update short videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'short-videos' AND
  auth.role() = 'authenticated'
);

-- Los usuarios pueden eliminar sus videos
CREATE POLICY "Authenticated users can delete short videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'short-videos' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- STORAGE POLICIES: short-thumbnails
-- ============================================

-- Todos pueden ver thumbnails
CREATE POLICY "Short thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'short-thumbnails');

-- Usuarios autenticados pueden subir thumbnails
CREATE POLICY "Authenticated users can upload short thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'short-thumbnails' AND
  auth.role() = 'authenticated'
);

-- Actualizar thumbnails
CREATE POLICY "Authenticated users can update short thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'short-thumbnails' AND
  auth.role() = 'authenticated'
);

-- Eliminar thumbnails
CREATE POLICY "Authenticated users can delete short thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'short-thumbnails' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- STORAGE POLICIES: event-images
-- ============================================

-- Todos pueden ver imágenes de eventos
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Usuarios autenticados pueden subir imágenes de eventos
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

-- Actualizar imágenes de eventos
CREATE POLICY "Authenticated users can update event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

-- Eliminar imágenes de eventos
CREATE POLICY "Authenticated users can delete event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- VERIFICACIÓN DE CONFIGURACIÓN
-- ============================================

DO $$
DECLARE
  bucket_count INTEGER;
  expected_buckets INTEGER := 5;
BEGIN
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE id IN ('avatars', 'plan-images', 'short-videos', 'short-thumbnails', 'event-images');

  IF bucket_count = expected_buckets THEN
    RAISE NOTICE '✅ Storage configurado correctamente: % buckets creados', bucket_count;
  ELSE
    RAISE WARNING '⚠️  Se crearon % de % buckets esperados', bucket_count, expected_buckets;
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎉 ¡Configuración de Supabase completada!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos pasos:';
  RAISE NOTICE '  1. Actualiza tu archivo .env con las credenciales de Supabase';
  RAISE NOTICE '  2. Genera los tipos TypeScript: npx supabase gen types typescript --project-id YOUR-REF > types/supabase.ts';
  RAISE NOTICE '  3. Ejecuta el script de migración de datos mock (scripts/migrate-mock-data.ts)';
  RAISE NOTICE '  4. Comienza a migrar el código de autenticación';
  RAISE NOTICE '';
END $$;

-- ============================================
-- QUERIES ÚTILES PARA DEBUGGING
-- ============================================

-- Ver todos los buckets creados
-- SELECT id, name, public, file_size_limit, allowed_mime_types
-- FROM storage.buckets;

-- Ver todas las políticas de storage
-- SELECT
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   cmd
-- FROM pg_policies
-- WHERE schemaname = 'storage'
-- ORDER BY tablename, cmd, policyname;

-- Ver tamaño total usado por bucket
-- SELECT
--   bucket_id,
--   COUNT(*) as file_count,
--   pg_size_pretty(SUM(COALESCE((metadata->>'size')::bigint, 0))) as total_size
-- FROM storage.objects
-- GROUP BY bucket_id;
