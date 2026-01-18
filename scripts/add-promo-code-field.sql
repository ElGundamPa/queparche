-- Agregar campo promo_code a la tabla profiles
-- Este código promocional será único para cada usuario y se genera al registrarse

DO $$
BEGIN
  -- Agregar campo promo_code si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'promo_code'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN promo_code TEXT UNIQUE;

    RAISE NOTICE 'Campo promo_code agregado exitosamente a profiles';
  ELSE
    RAISE NOTICE 'Campo promo_code ya existe en profiles';
  END IF;

  -- Crear índice para búsquedas rápidas
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_promo_code'
  ) THEN
    CREATE INDEX idx_profiles_promo_code ON public.profiles(promo_code);
    RAISE NOTICE 'Índice idx_profiles_promo_code creado exitosamente';
  ELSE
    RAISE NOTICE 'Índice idx_profiles_promo_code ya existe';
  END IF;
END $$;
