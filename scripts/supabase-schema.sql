-- ============================================
-- ESQUEMA DE BASE DE DATOS DE QUÉPARCHE
-- ============================================
-- Este archivo contiene el esquema completo de la base de datos
-- Ejecutar en Supabase SQL Editor en este orden:
-- 1. Este archivo (supabase-schema.sql)
-- 2. supabase-rls.sql
-- 3. supabase-storage.sql

-- ============================================
-- EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- Para geolocalización

-- ============================================
-- TABLA: profiles (separada de auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  location TEXT,
  interests TEXT[] DEFAULT '{}',
  preferences TEXT[] DEFAULT '{}',

  -- Gamificación
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges TEXT[] DEFAULT '{}',

  -- Verificación
  is_verified BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,

  -- Contadores (denormalizados para performance)
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  plans_created INTEGER DEFAULT 0,
  plans_attended INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^@[a-zA-Z0-9_]+$')
);

-- Índices para profiles
CREATE INDEX profiles_username_idx ON profiles(username);
CREATE INDEX profiles_created_at_idx ON profiles(created_at DESC);
CREATE INDEX profiles_level_idx ON profiles(level DESC);

COMMENT ON TABLE profiles IS 'Perfiles de usuario extendidos (separados de auth.users)';
COMMENT ON COLUMN profiles.username IS 'Nombre de usuario único (3-30 caracteres, debe comenzar con @ seguido de alfanumérico y guiones bajos)';
COMMENT ON COLUMN profiles.points IS 'Puntos acumulados por actividad en la app';
COMMENT ON COLUMN profiles.level IS 'Nivel calculado basado en puntos';

-- ============================================
-- TABLA: plans
-- ============================================
CREATE TABLE public.plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Información básica
  name TEXT NOT NULL,
  description TEXT,
  primary_category TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- Ubicación
  address TEXT,
  city TEXT DEFAULT 'Medellín',
  zone TEXT,
  location GEOGRAPHY(POINT, 4326), -- PostGIS para búsquedas geoespaciales

  -- Capacidad y asistencia
  capacity INTEGER,
  current_attendees INTEGER DEFAULT 0,
  max_people INTEGER,

  -- Fecha y tiempo
  event_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  best_time TEXT,

  -- Precio
  average_price NUMERIC(10, 2) DEFAULT 0,
  price NUMERIC(10, 2),
  price_type TEXT,
  price_avg TEXT,

  -- Multimedia
  images TEXT[] DEFAULT '{}',

  -- Engagement
  likes INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,

  -- Flags
  is_premium BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  is_spotlight BOOLEAN DEFAULT FALSE,

  -- Metadata
  vibe TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_primary_category CHECK (
    primary_category IN ('barrio', 'mirador', 'rooftop', 'restaurante', 'cafe', 'bar', 'club', 'parque')
  ),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5),
  CONSTRAINT positive_capacity CHECK (capacity IS NULL OR capacity > 0),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR event_date IS NULL OR end_date > event_date)
);

-- Índices para plans
CREATE INDEX plans_user_id_idx ON plans(user_id);
CREATE INDEX plans_primary_category_idx ON plans(primary_category);
CREATE INDEX plans_zone_idx ON plans(zone);
CREATE INDEX plans_event_date_idx ON plans(event_date) WHERE event_date IS NOT NULL;
CREATE INDEX plans_created_at_idx ON plans(created_at DESC);
CREATE INDEX plans_rating_idx ON plans(rating DESC);
CREATE INDEX plans_likes_idx ON plans(likes DESC);
CREATE INDEX plans_location_idx ON plans USING GIST(location) WHERE location IS NOT NULL; -- Índice espacial
CREATE INDEX plans_categories_idx ON plans USING GIN(categories); -- Búsqueda en arrays
CREATE INDEX plans_tags_idx ON plans USING GIN(tags); -- Búsqueda en arrays

COMMENT ON TABLE plans IS 'Planes y lugares disponibles en la aplicación';
COMMENT ON COLUMN plans.location IS 'Coordenadas geográficas (PostGIS POINT)';
COMMENT ON COLUMN plans.primary_category IS 'Categoría principal del plan (enum de 8 valores)';
COMMENT ON COLUMN plans.current_attendees IS 'Actualizado automáticamente por trigger';
COMMENT ON COLUMN plans.rating IS 'Promedio de calificaciones (0-5), actualizado por trigger';

-- ============================================
-- TABLA: shorts
-- ============================================
CREATE TABLE public.shorts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Información básica
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  place_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,

  -- Engagement
  likes INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  -- Flags
  is_premium BOOLEAN DEFAULT FALSE,
  is_sponsored BOOLEAN DEFAULT FALSE,
  business_id UUID,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para shorts
CREATE INDEX shorts_user_id_idx ON shorts(user_id);
CREATE INDEX shorts_category_idx ON shorts(category);
CREATE INDEX shorts_created_at_idx ON shorts(created_at DESC);
CREATE INDEX shorts_likes_idx ON shorts(likes DESC);

COMMENT ON TABLE shorts IS 'Videos cortos estilo TikTok de lugares';
COMMENT ON COLUMN shorts.comments IS 'Actualizado automáticamente por trigger';

-- ============================================
-- TABLA: reviews
-- ============================================
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  rating INTEGER NOT NULL,
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_review_per_plan UNIQUE(plan_id, user_id)
);

-- Índices para reviews
CREATE INDEX reviews_plan_id_idx ON reviews(plan_id, created_at DESC);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);

COMMENT ON TABLE reviews IS 'Calificaciones y reseñas de planes';
COMMENT ON CONSTRAINT unique_review_per_plan ON reviews IS 'Un usuario solo puede dejar una review por plan';

-- ============================================
-- TABLA: comments (polimórfico)
-- ============================================
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Polimórfico: puede ser de plan, short, u otro comment (reply)
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  short_id UUID REFERENCES shorts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT has_target CHECK (
    (plan_id IS NOT NULL AND short_id IS NULL AND parent_comment_id IS NULL) OR
    (plan_id IS NULL AND short_id IS NOT NULL AND parent_comment_id IS NULL) OR
    (plan_id IS NULL AND short_id IS NULL AND parent_comment_id IS NOT NULL)
  ),
  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

-- Índices para comments
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_plan_id_idx ON comments(plan_id, created_at DESC) WHERE plan_id IS NOT NULL;
CREATE INDEX comments_short_id_idx ON comments(short_id, created_at DESC) WHERE short_id IS NOT NULL;
CREATE INDEX comments_parent_id_idx ON comments(parent_comment_id, created_at DESC) WHERE parent_comment_id IS NOT NULL;

COMMENT ON TABLE comments IS 'Comentarios polimórficos (pueden ser de planes, shorts, o replies)';
COMMENT ON CONSTRAINT has_target ON comments IS 'Debe tener exactamente un target (plan_id, short_id, o parent_comment_id)';

-- ============================================
-- TABLA: likes (polimórfico)
-- ============================================
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Polimórfico: puede ser de plan, short, o comment
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  short_id UUID REFERENCES shorts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT has_target CHECK (
    (plan_id IS NOT NULL AND short_id IS NULL AND comment_id IS NULL) OR
    (plan_id IS NULL AND short_id IS NOT NULL AND comment_id IS NULL) OR
    (plan_id IS NULL AND short_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Índices únicos compuestos para evitar duplicados
CREATE UNIQUE INDEX likes_user_plan_idx ON likes(user_id, plan_id) WHERE plan_id IS NOT NULL;
CREATE UNIQUE INDEX likes_user_short_idx ON likes(user_id, short_id) WHERE short_id IS NOT NULL;
CREATE UNIQUE INDEX likes_user_comment_idx ON likes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- Índices para queries comunes
CREATE INDEX likes_plan_id_idx ON likes(plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX likes_short_id_idx ON likes(short_id) WHERE short_id IS NOT NULL;
CREATE INDEX likes_comment_id_idx ON likes(comment_id) WHERE comment_id IS NOT NULL;

COMMENT ON TABLE likes IS 'Likes polimórficos (pueden ser de planes, shorts, o comentarios)';

-- ============================================
-- TABLA: favorites (polimórfico)
-- ============================================
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Polimórfico: puede ser de plan o short
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  short_id UUID REFERENCES shorts(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT has_target CHECK (
    (plan_id IS NOT NULL AND short_id IS NULL) OR
    (plan_id IS NULL AND short_id IS NOT NULL)
  )
);

-- Índices únicos compuestos
CREATE UNIQUE INDEX favorites_user_plan_idx ON favorites(user_id, plan_id) WHERE plan_id IS NOT NULL;
CREATE UNIQUE INDEX favorites_user_short_idx ON favorites(user_id, short_id) WHERE short_id IS NOT NULL;

-- Índices para queries
CREATE INDEX favorites_plan_id_idx ON favorites(plan_id) WHERE plan_id IS NOT NULL;
CREATE INDEX favorites_short_id_idx ON favorites(short_id) WHERE short_id IS NOT NULL;

COMMENT ON TABLE favorites IS 'Favoritos del usuario (pueden ser planes o shorts)';

-- ============================================
-- TABLA: plan_attendees
-- ============================================
CREATE TABLE public.plan_attendees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  status TEXT DEFAULT 'confirmed',
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_attendee UNIQUE(plan_id, user_id),
  CONSTRAINT valid_status CHECK (status IN ('confirmed', 'pending', 'cancelled'))
);

-- Índices
CREATE INDEX plan_attendees_plan_id_idx ON plan_attendees(plan_id);
CREATE INDEX plan_attendees_user_id_idx ON plan_attendees(user_id);

COMMENT ON TABLE plan_attendees IS 'Asistentes confirmados a planes';

-- ============================================
-- TABLA: friendships
-- ============================================
CREATE TABLE public.friendships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'blocked')),
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
  CONSTRAINT unique_friendship UNIQUE(user_id, friend_id)
);

-- Índices
CREATE INDEX friendships_user_id_idx ON friendships(user_id, status);
CREATE INDEX friendships_friend_id_idx ON friendships(friend_id, status);

COMMENT ON TABLE friendships IS 'Relaciones de amistad entre usuarios';
COMMENT ON COLUMN friendships.status IS 'pending: solicitud enviada, accepted: aceptada, blocked: bloqueado';

-- ============================================
-- TABLA: follows
-- ============================================
CREATE TABLE public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT unique_follow UNIQUE(follower_id, following_id)
);

-- Índices
CREATE INDEX follows_follower_id_idx ON follows(follower_id);
CREATE INDEX follows_following_id_idx ON follows(following_id);

COMMENT ON TABLE follows IS 'Relaciones de seguimiento (follower sigue a following)';

-- ============================================
-- TABLA: notifications
-- ============================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,

  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (
    type IN ('like', 'comment', 'follow', 'plan_join', 'plan_reminder', 'friend_request')
  )
);

-- Índices
CREATE INDEX notifications_user_id_idx ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'Notificaciones para usuarios';
COMMENT ON COLUMN notifications.data IS 'Metadatos adicionales en formato JSON';

-- ============================================
-- TABLA: chat_messages
-- ============================================
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  content TEXT,
  type TEXT NOT NULL DEFAULT 'text',
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL, -- Plan compartido

  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_type CHECK (type IN ('text', 'image', 'location', 'plan')),
  CONSTRAINT no_self_message CHECK (sender_id != receiver_id),
  CONSTRAINT has_content CHECK (
    (type = 'text' AND content IS NOT NULL) OR
    (type = 'plan' AND plan_id IS NOT NULL) OR
    (type IN ('image', 'location'))
  )
);

-- Índices
CREATE INDEX chat_messages_sender_idx ON chat_messages(sender_id, created_at DESC);
CREATE INDEX chat_messages_receiver_idx ON chat_messages(receiver_id, is_read, created_at DESC);
CREATE INDEX chat_messages_conversation_idx ON chat_messages(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

COMMENT ON TABLE chat_messages IS 'Mensajes directos entre usuarios';
COMMENT ON INDEX chat_messages_conversation_idx IS 'Índice optimizado para obtener conversaciones';

-- ============================================
-- TABLA: events
-- ============================================
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,

  -- Ubicación
  address TEXT,
  city TEXT DEFAULT 'Medellín',
  zone TEXT,
  location GEOGRAPHY(POINT, 4326),

  -- Fechas
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,

  -- Capacidad
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,

  -- Multimedia y precio
  image TEXT,
  price NUMERIC(10, 2),
  tags TEXT[] DEFAULT '{}',

  -- Flags
  is_premium BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Índices
CREATE INDEX events_organizer_id_idx ON events(organizer_id);
CREATE INDEX events_start_date_idx ON events(start_date);
CREATE INDEX events_category_idx ON events(category);
CREATE INDEX events_location_idx ON events USING GIST(location) WHERE location IS NOT NULL;

COMMENT ON TABLE events IS 'Eventos especiales organizados';

-- ============================================
-- TRIGGERS: updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shorts_updated_at BEFORE UPDATE ON shorts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS: Actualizar contadores
-- ============================================

-- Trigger: Actualizar followers_count y following_count
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER follow_counts_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Trigger: Actualizar likes en plans
CREATE OR REPLACE FUNCTION update_plan_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.plan_id IS NOT NULL THEN
    UPDATE plans SET likes = likes + 1 WHERE id = NEW.plan_id;
  ELSIF TG_OP = 'DELETE' AND OLD.plan_id IS NOT NULL THEN
    UPDATE plans SET likes = GREATEST(0, likes - 1) WHERE id = OLD.plan_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_likes_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_plan_likes();

-- Trigger: Actualizar likes en shorts
CREATE OR REPLACE FUNCTION update_short_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.short_id IS NOT NULL THEN
    UPDATE shorts SET likes = likes + 1 WHERE id = NEW.short_id;
  ELSIF TG_OP = 'DELETE' AND OLD.short_id IS NOT NULL THEN
    UPDATE shorts SET likes = GREATEST(0, likes - 1) WHERE id = OLD.short_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER short_likes_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_short_likes();

-- Trigger: Actualizar likes en comments
CREATE OR REPLACE FUNCTION update_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.comment_id IS NOT NULL THEN
    UPDATE comments SET likes = likes + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.comment_id IS NOT NULL THEN
    UPDATE comments SET likes = GREATEST(0, likes - 1) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_likes_trigger
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes();

-- Trigger: Actualizar favorites en plans
CREATE OR REPLACE FUNCTION update_plan_favorites()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.plan_id IS NOT NULL THEN
    UPDATE plans SET favorites = favorites + 1 WHERE id = NEW.plan_id;
  ELSIF TG_OP = 'DELETE' AND OLD.plan_id IS NOT NULL THEN
    UPDATE plans SET favorites = GREATEST(0, favorites - 1) WHERE id = OLD.plan_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_favorites_trigger
AFTER INSERT OR DELETE ON favorites
FOR EACH ROW EXECUTE FUNCTION update_plan_favorites();

-- Trigger: Actualizar favorites en shorts
CREATE OR REPLACE FUNCTION update_short_favorites()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.short_id IS NOT NULL THEN
    UPDATE shorts SET favorites = favorites + 1 WHERE id = NEW.short_id;
  ELSIF TG_OP = 'DELETE' AND OLD.short_id IS NOT NULL THEN
    UPDATE shorts SET favorites = GREATEST(0, favorites - 1) WHERE id = OLD.short_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER short_favorites_trigger
AFTER INSERT OR DELETE ON favorites
FOR EACH ROW EXECUTE FUNCTION update_short_favorites();

-- Trigger: Actualizar comment count en shorts
CREATE OR REPLACE FUNCTION update_short_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.short_id IS NOT NULL THEN
    UPDATE shorts SET comments = comments + 1 WHERE id = NEW.short_id;
  ELSIF TG_OP = 'DELETE' AND OLD.short_id IS NOT NULL THEN
    UPDATE shorts SET comments = GREATEST(0, comments - 1) WHERE id = OLD.short_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER short_comment_count_trigger
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_short_comment_count();

-- Trigger: Actualizar current_attendees en plans
CREATE OR REPLACE FUNCTION update_plan_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE plans SET current_attendees = current_attendees + 1 WHERE id = NEW.plan_id;
    UPDATE profiles SET plans_attended = plans_attended + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE plans SET current_attendees = GREATEST(0, current_attendees - 1) WHERE id = OLD.plan_id;
    UPDATE profiles SET plans_attended = GREATEST(0, plans_attended - 1) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_attendees_count_trigger
AFTER INSERT OR DELETE ON plan_attendees
FOR EACH ROW EXECUTE FUNCTION update_plan_attendees_count();

-- Trigger: Actualizar plans_created en profiles
CREATE OR REPLACE FUNCTION update_profile_plans_created()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    UPDATE profiles SET plans_created = plans_created + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' AND OLD.user_id IS NOT NULL THEN
    UPDATE profiles SET plans_created = GREATEST(0, plans_created - 1) WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_plans_created_trigger
AFTER INSERT OR DELETE ON plans
FOR EACH ROW EXECUTE FUNCTION update_profile_plans_created();

-- Trigger: Actualizar rating promedio en plans
CREATE OR REPLACE FUNCTION update_plan_rating()
RETURNS TRIGGER AS $$
DECLARE
  new_rating NUMERIC;
  new_count INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*) INTO new_rating, new_count
  FROM reviews
  WHERE plan_id = COALESCE(NEW.plan_id, OLD.plan_id);

  UPDATE plans
  SET rating = COALESCE(new_rating, 0),
      review_count = new_count
  WHERE id = COALESCE(NEW.plan_id, OLD.plan_id);

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plan_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_plan_rating();

-- Trigger: Crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, bio, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función: Obtener stats de un usuario
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_plans BIGINT,
  total_attended BIGINT,
  total_likes BIGINT,
  total_reviews BIGINT,
  average_rating NUMERIC,
  favorite_categories TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id)::BIGINT AS total_plans,
    COUNT(DISTINCT pa.plan_id)::BIGINT AS total_attended,
    COALESCE(SUM(p.likes), 0)::BIGINT AS total_likes,
    COUNT(DISTINCT r.id)::BIGINT AS total_reviews,
    COALESCE(AVG(r.rating), 0)::NUMERIC AS average_rating,
    ARRAY(
      SELECT p2.primary_category
      FROM plan_attendees pa2
      JOIN plans p2 ON pa2.plan_id = p2.id
      WHERE pa2.user_id = user_uuid
      GROUP BY p2.primary_category
      ORDER BY COUNT(*) DESC
      LIMIT 3
    ) AS favorite_categories
  FROM profiles prof
  LEFT JOIN plans p ON p.user_id = prof.id
  LEFT JOIN plan_attendees pa ON pa.user_id = prof.id
  LEFT JOIN reviews r ON r.user_id = prof.id
  WHERE prof.id = user_uuid
  GROUP BY prof.id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_stats IS 'Obtiene estadísticas calculadas de un usuario';

-- Función: Buscar planes cercanos (usando PostGIS)
CREATE OR REPLACE FUNCTION find_nearby_plans(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000,
  limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  primary_category TEXT,
  zone TEXT,
  distance_meters DOUBLE PRECISION,
  rating NUMERIC,
  likes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.primary_category,
    p.zone,
    ST_Distance(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters,
    p.rating,
    p.likes
  FROM plans p
  WHERE p.location IS NOT NULL
    AND ST_DWithin(
      p.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_nearby_plans IS 'Busca planes cercanos a una ubicación (requiere PostGIS)';

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN FINAL
-- ============================================
COMMENT ON DATABASE postgres IS 'Base de datos de QuéParche - App para descubrir y compartir planes en Medellín';

-- Mensaje final
DO $$
BEGIN
  RAISE NOTICE '✅ Esquema de base de datos creado exitosamente!';
  RAISE NOTICE '📋 Siguiente paso: Ejecutar supabase-rls.sql para configurar Row Level Security';
END $$;
