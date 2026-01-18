-- ============================================
-- ASEGURAR COLUMNAS EN TABLA PROFILES
-- ============================================

-- 1. Ver estructura actual de profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Agregar columnas necesarias si no existen
DO $$
BEGIN
  -- Email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
    RAISE NOTICE '✅ Columna email agregada';
  END IF;

  -- Bio (descripción del usuario)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    RAISE NOTICE '✅ Columna bio agregada';
  END IF;

  -- Interests (array de strings)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'interests'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Columna interests agregada';
  END IF;

  -- Avatar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar TEXT;
    RAISE NOTICE '✅ Columna avatar agregada';
  END IF;

  -- Preferences (copia de interests para compatibilidad)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN preferences TEXT[] DEFAULT '{}';
    RAISE NOTICE '✅ Columna preferences agregada';
  END IF;

  -- Name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN name TEXT DEFAULT '';
    RAISE NOTICE '✅ Columna name agregada';
  END IF;

  -- Username
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
    RAISE NOTICE '✅ Columna username agregada';
  END IF;

  RAISE NOTICE '✅ Verificación completada';
END $$;

-- 3. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_preferences ON public.profiles USING GIN(preferences);

-- 4. Verificar estructura final
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
    AND column_name IN ('id', 'email', 'username', 'name', 'bio', 'interests', 'preferences', 'avatar', 'created_at')
ORDER BY
    CASE column_name
        WHEN 'id' THEN 1
        WHEN 'email' THEN 2
        WHEN 'username' THEN 3
        WHEN 'name' THEN 4
        WHEN 'bio' THEN 5
        WHEN 'interests' THEN 6
        WHEN 'preferences' THEN 7
        WHEN 'avatar' THEN 8
        WHEN 'created_at' THEN 9
        ELSE 10
    END;

-- ✅ Script completado
-- Ahora la tabla profiles tiene todas las columnas necesarias
