-- Habilitar extensión pgcrypto para hashing de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar funciones si existen (para poder recrearlas)
DROP FUNCTION IF EXISTS public.register_user(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.login_user(TEXT, TEXT);

-- Función para registrar un nuevo usuario
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

  -- Crear usuario
  INSERT INTO public.users_auth (email, username, password_hash, created_at, updated_at)
  VALUES (p_email, p_username, v_password_hash, NOW(), NOW())
  RETURNING id INTO v_user_id;

  -- El trigger creará el perfil automáticamente, esperamos un momento
  PERFORM pg_sleep(0.5);

  -- Verificar si el perfil se creó, si no, crearlo manualmente
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;

  IF v_profile IS NULL THEN
    -- Crear perfil manualmente
    INSERT INTO public.profiles (id, email, username, name, created_at)
    VALUES (v_user_id, p_email, p_username, p_name, NOW())
    RETURNING * INTO v_profile;
  ELSE
    -- Actualizar nombre en el perfil existente
    UPDATE public.profiles
    SET name = p_name
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

-- Función para login
CREATE OR REPLACE FUNCTION public.login_user(
  p_email_or_username TEXT,
  p_password TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_profile RECORD;
  v_is_email BOOLEAN;
BEGIN
  -- Determinar si es email o username
  v_is_email := p_email_or_username LIKE '%@%.%';

  -- Si no parece email y no comienza con @, agregar @
  IF NOT v_is_email AND NOT p_email_or_username LIKE '@%' THEN
    p_email_or_username := '@' || p_email_or_username;
  END IF;

  -- Buscar usuario
  IF v_is_email THEN
    SELECT * INTO v_user
    FROM public.users_auth
    WHERE email = p_email_or_username;
  ELSE
    SELECT * INTO v_user
    FROM public.users_auth
    WHERE username = p_email_or_username;
  END IF;

  -- Verificar que usuario existe
  IF v_user IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Credenciales incorrectas'
    );
  END IF;

  -- Verificar que usuario esté activo
  IF NOT v_user.is_active THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario inactivo'
    );
  END IF;

  -- Verificar contraseña usando pgcrypto
  IF v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Credenciales incorrectas'
    );
  END IF;

  -- Actualizar last_login
  UPDATE public.users_auth
  SET last_login = NOW()
  WHERE id = v_user.id;

  -- Obtener perfil completo
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_user.id;

  -- Retornar éxito con usuario
  RETURN json_build_object(
    'success', true,
    'user', row_to_json(v_profile)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', 'Error al iniciar sesión'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para que cualquiera pueda ejecutar estas funciones
GRANT EXECUTE ON FUNCTION public.register_user TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.login_user TO anon, authenticated;

-- Comentarios
COMMENT ON FUNCTION public.register_user IS 'Registra un nuevo usuario con contraseña hasheada';
COMMENT ON FUNCTION public.login_user IS 'Autentica usuario y retorna su perfil';
