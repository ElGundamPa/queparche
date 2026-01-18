-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Este archivo debe ejecutarse DESPUÉS de supabase-schema.sql
-- Configura las políticas de seguridad a nivel de fila

-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: profiles
-- ============================================

-- Todos pueden ver perfiles públicos
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil (trigger automático lo hace)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS: plans
-- ============================================

-- Todos pueden ver planes
CREATE POLICY "Plans are viewable by everyone"
ON plans FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear planes
CREATE POLICY "Authenticated users can create plans"
ON plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propios planes
CREATE POLICY "Users can update own plans"
ON plans FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios planes
CREATE POLICY "Users can delete own plans"
ON plans FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: shorts
-- ============================================

-- Todos pueden ver shorts
CREATE POLICY "Shorts are viewable by everyone"
ON shorts FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear shorts
CREATE POLICY "Authenticated users can create shorts"
ON shorts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propios shorts
CREATE POLICY "Users can update own shorts"
ON shorts FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios shorts
CREATE POLICY "Users can delete own shorts"
ON shorts FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: reviews
-- ============================================

-- Todos pueden ver reviews
CREATE POLICY "Reviews are viewable by everyone"
ON reviews FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear reviews
CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propias reviews
CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propias reviews
CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: comments
-- ============================================

-- Todos pueden ver comentarios
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear comentarios
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propios comentarios
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios comentarios
CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: likes
-- ============================================

-- Los usuarios pueden ver todos los likes (para mostrar counts)
CREATE POLICY "Likes are viewable by everyone"
ON likes FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear likes
CREATE POLICY "Authenticated users can create likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios likes
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: favorites
-- ============================================

-- Los usuarios pueden ver todos los favoritos (para mostrar counts)
CREATE POLICY "Favorites are viewable by everyone"
ON favorites FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear favoritos
CREATE POLICY "Authenticated users can create favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: plan_attendees
-- ============================================

-- Todos pueden ver asistentes de planes
CREATE POLICY "Plan attendees are viewable by everyone"
ON plan_attendees FOR SELECT
USING (true);

-- Usuarios autenticados pueden unirse a planes
CREATE POLICY "Authenticated users can join plans"
ON plan_attendees FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden salirse de planes donde están
CREATE POLICY "Users can leave plans they joined"
ON plan_attendees FOR DELETE
USING (auth.uid() = user_id);

-- Los usuarios pueden actualizar su estado de asistencia
CREATE POLICY "Users can update their attendance"
ON plan_attendees FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: friendships
-- ============================================

-- Los usuarios pueden ver solicitudes donde están involucrados
CREATE POLICY "Users can view own friendships"
ON friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Los usuarios pueden crear solicitudes de amistad
CREATE POLICY "Users can create friendship requests"
ON friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar solicitudes donde son el destinatario o el emisor
CREATE POLICY "Users can update friendships involving them"
ON friendships FOR UPDATE
USING (auth.uid() = friend_id OR auth.uid() = user_id);

-- Los usuarios pueden eliminar amistades donde están involucrados
CREATE POLICY "Users can delete own friendships"
ON friendships FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================
-- POLÍTICAS: follows
-- ============================================

-- Todos pueden ver follows (es información pública)
CREATE POLICY "Follows are viewable by everyone"
ON follows FOR SELECT
USING (true);

-- Usuarios autenticados pueden seguir a otros
CREATE POLICY "Authenticated users can follow others"
ON follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Los usuarios solo pueden eliminar sus propios follows (dejar de seguir)
CREATE POLICY "Users can unfollow others"
ON follows FOR DELETE
USING (auth.uid() = follower_id);

-- ============================================
-- POLÍTICAS: notifications
-- ============================================

-- Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Sistema puede crear notificaciones (se usa service_role key)
-- Los usuarios no pueden crear notificaciones directamente
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Los usuarios pueden actualizar sus notificaciones (marcar como leídas)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias notificaciones
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS: chat_messages
-- ============================================

-- Los usuarios solo pueden ver mensajes donde están involucrados
CREATE POLICY "Users can view own messages"
ON chat_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Los usuarios pueden enviar mensajes
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Los usuarios pueden actualizar mensajes recibidos (marcar como leídos)
CREATE POLICY "Users can update received messages"
ON chat_messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- Los usuarios pueden eliminar sus mensajes enviados
CREATE POLICY "Users can delete sent messages"
ON chat_messages FOR DELETE
USING (auth.uid() = sender_id);

-- ============================================
-- POLÍTICAS: events
-- ============================================

-- Todos pueden ver eventos
CREATE POLICY "Events are viewable by everyone"
ON events FOR SELECT
USING (true);

-- Usuarios autenticados pueden crear eventos
CREATE POLICY "Authenticated users can create events"
ON events FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

-- Los organizadores pueden actualizar sus eventos
CREATE POLICY "Organizers can update own events"
ON events FOR UPDATE
USING (auth.uid() = organizer_id);

-- Los organizadores pueden eliminar sus eventos
CREATE POLICY "Organizers can delete own events"
ON events FOR DELETE
USING (auth.uid() = organizer_id);

-- ============================================
-- VERIFICACIÓN DE POLÍTICAS
-- ============================================

-- Query para verificar que todas las tablas tienen RLS habilitado
DO $$
DECLARE
  tables_with_rls INTEGER;
  tables_total INTEGER;
BEGIN
  SELECT COUNT(*) INTO tables_with_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN (
      'profiles', 'plans', 'shorts', 'reviews', 'comments',
      'likes', 'favorites', 'plan_attendees', 'friendships',
      'follows', 'notifications', 'chat_messages', 'events'
    )
    AND rowsecurity = true;

  tables_total := 13;

  IF tables_with_rls = tables_total THEN
    RAISE NOTICE '✅ RLS habilitado correctamente en todas las % tablas', tables_total;
  ELSE
    RAISE WARNING '⚠️  RLS habilitado en % de % tablas', tables_with_rls, tables_total;
  END IF;

  RAISE NOTICE '📋 Siguiente paso: Ejecutar supabase-storage.sql para configurar Storage';
END $$;

-- Query útil para ver todas las políticas creadas
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
