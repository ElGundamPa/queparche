-- Crear tabla de autenticación custom
-- Esta tabla maneja la autenticación sin usar Supabase Auth

CREATE TABLE IF NOT EXISTS public.users_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT username_format CHECK (username ~* '^@[A-Za-z0-9_]{3,20}$')
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_auth_email ON public.users_auth(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_username ON public.users_auth(username);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_users_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_auth_updated_at
  BEFORE UPDATE ON public.users_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_users_auth_updated_at();

-- Asegurarse de que la tabla profiles tenga columna email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
  END IF;
END $$;

-- Vincular con la tabla profiles existente
-- Cuando se crea un usuario en users_auth, crear su perfil
CREATE OR REPLACE FUNCTION create_profile_for_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.username,
    '', -- nombre vacío por defecto, se completa en onboarding
    NEW.created_at
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_profile_on_auth_user ON public.users_auth;

CREATE TRIGGER create_profile_on_auth_user
  AFTER INSERT ON public.users_auth
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_auth_user();

-- RLS Policies
ALTER TABLE public.users_auth ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propia información
CREATE POLICY "Users can view own auth data"
  ON public.users_auth
  FOR SELECT
  USING (id = auth.uid() OR id IN (
    SELECT id FROM public.profiles WHERE id = auth.uid()
  ));

-- Solo el sistema puede insertar (via service role)
CREATE POLICY "Service role can insert users"
  ON public.users_auth
  FOR INSERT
  WITH CHECK (true);

-- Los usuarios pueden actualizar su propia información (excepto password_hash)
CREATE POLICY "Users can update own data"
  ON public.users_auth
  FOR UPDATE
  USING (id = auth.uid() OR id IN (
    SELECT id FROM public.profiles WHERE id = auth.uid()
  ));

-- Comentarios
COMMENT ON TABLE public.users_auth IS 'Tabla de autenticación custom con contraseñas hasheadas';
COMMENT ON COLUMN public.users_auth.password_hash IS 'Password hasheado con bcrypt';
COMMENT ON COLUMN public.users_auth.username IS 'Username único, debe comenzar con @';
