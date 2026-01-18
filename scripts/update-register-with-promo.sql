-- Actualizar función register_user para generar código promocional
CREATE OR REPLACE FUNCTION public.register_user(
  p_email TEXT,
  p_username TEXT,
  p_password TEXT,
  p_name TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_existing_email INTEGER;
  v_existing_username INTEGER;
  v_password_hash TEXT;
  v_profile RECORD;
  v_promo_code TEXT;
  v_promo_exists INTEGER;
BEGIN
  -- Normalizar username (agregar @ si no lo tiene)
  IF NOT p_username LIKE '@%' THEN
    p_username := '@' || p_username;
  END IF;

  -- Verificar que email no exista
  SELECT COUNT(*) INTO v_existing_email
  FROM public.users_auth
  WHERE email = p_email;

  IF v_existing_email > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'El email ya está registrado'
    );
  END IF;

  -- Verificar que username no exista
  SELECT COUNT(*) INTO v_existing_username
  FROM public.users_auth
  WHERE username = p_username;

  IF v_existing_username > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'El username ya está en uso'
    );
  END IF;

  -- Hashear contraseña usando pgcrypto (bf = blowfish, similar a bcrypt)
  v_password_hash := crypt(p_password, gen_salt('bf', 10));

  -- Generar código promocional único
  LOOP
    -- Generar código de 8 caracteres (formato: QP-XXXXXX donde X es alfanumérico)
    v_promo_code := 'QP-' || UPPER(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

    -- Verificar que no exista
    SELECT COUNT(*) INTO v_promo_exists
    FROM public.profiles
    WHERE promo_code = v_promo_code;

    -- Si no existe, salir del loop
    EXIT WHEN v_promo_exists = 0;
  END LOOP;

  -- Crear usuario
  INSERT INTO public.users_auth (email, username, password_hash, created_at, updated_at)
  VALUES (p_email, p_username, v_password_hash, NOW(), NOW())
  RETURNING id INTO v_user_id;

  -- El trigger creará el perfil automáticamente, esperamos un momento
  PERFORM pg_sleep(0.5);

  -- Verificar si el perfil se creó, si no, crearlo manualmente
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;

  IF v_profile IS NULL THEN
    -- Crear perfil manualmente con código promocional
    INSERT INTO public.profiles (id, email, username, name, promo_code, created_at)
    VALUES (v_user_id, p_email, p_username, p_name, v_promo_code, NOW())
    RETURNING * INTO v_profile;
  ELSE
    -- Actualizar nombre y código promocional en el perfil existente
    UPDATE public.profiles
    SET name = p_name, promo_code = v_promo_code
    WHERE id = v_user_id
    RETURNING * INTO v_profile;
  END IF;

  -- Retornar éxito con usuario
  RETURN json_build_object(
    'success', true,
    'user', row_to_json(v_profile)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION public.register_user IS 'Registra un nuevo usuario con contraseña hasheada y código promocional único';
