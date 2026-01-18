-- Agregar columna email a la tabla profiles si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;

    -- Crear índice para búsquedas rápidas
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

    -- Si hay usuarios existentes, actualizar sus emails desde users_auth
    UPDATE public.profiles p
    SET email = ua.email
    FROM public.users_auth ua
    WHERE p.id = ua.id AND p.email IS NULL;

    RAISE NOTICE 'Columna email agregada a profiles';
  ELSE
    RAISE NOTICE 'Columna email ya existe en profiles';
  END IF;
END $$;

-- Verificar estructura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
