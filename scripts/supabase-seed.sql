-- ============================================
-- SEED DATA para QuéParche
-- ============================================
-- Script para poblar la base de datos con datos iniciales
-- EJECUTAR DESPUÉS de supabase-schema.sql, supabase-rls.sql y supabase-storage.sql
--
-- IMPORTANTE: Este script usa UUIDs fijos para mantener referencias consistentes
-- ============================================

-- Limpiar datos existentes (si es necesario)
-- DESCOMENTAR SOLO SI QUIERES BORRAR TODOS LOS DATOS
-- TRUNCATE TABLE comments, likes, favorites, plan_attendees, reviews, shorts, plans, profiles CASCADE;

-- ============================================
-- 1. CREAR USUARIOS
-- ============================================
-- Nota: Los perfiles se crean automáticamente por el trigger on_auth_user_created

-- Usuario Admin
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@admin',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Admin","username":"@admin"}'::jsonb,
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Actualizar perfil de Admin con datos completos
UPDATE profiles SET
  name = 'Admin',
  username = '@admin',
  bio = 'Cuenta de administrador para pruebas.',
  avatar = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80',
  location = 'Medellín, Colombia',
  is_premium = true,
  is_verified = true,
  interests = ARRAY['nightlife', 'rooftop'],
  preferences = ARRAY[]::text[],
  points = 0,
  level = 1,
  badges = ARRAY[]::text[]
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Usuario Demo
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'usuario@example.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Usuario Demo","username":"@usuario"}'::jsonb,
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

UPDATE profiles SET
  name = 'Usuario Demo',
  username = '@usuario',
  bio = 'Explorer | Food lover | Always looking for new adventures in Medellín 🌟',
  avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000',
  location = 'Medellín, Colombia',
  is_premium = true,
  is_verified = true,
  interests = ARRAY['restaurants', 'culture', 'nature'],
  preferences = ARRAY['Restaurants', 'Culture', 'Nature'],
  points = 1250,
  level = 12,
  badges = ARRAY['explorer', 'foodie', 'social'],
  followers_count = 234,
  following_count = 89,
  plans_created = 15,
  plans_attended = 47
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;

-- María González
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'maria@example.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"María González","username":"@mariag"}'::jsonb,
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

UPDATE profiles SET
  name = 'María González',
  username = '@mariag',
  bio = 'Street art enthusiast | Comuna 13 guide | Sharing Medellín''s transformation ✨',
  avatar = 'https://images.unsplash.com/photo-1494790108755-2616b332c1c2?q=80&w=1000',
  location = 'Comuna 13, Medellín',
  is_premium = false,
  is_verified = true,
  interests = ARRAY['culture', 'free plans', 'nightlife'],
  preferences = ARRAY['Culture', 'Free plans', 'Nightlife'],
  points = 890,
  level = 8,
  badges = ARRAY['social', 'explorer'],
  followers_count = 567,
  following_count = 123,
  plans_created = 22,
  plans_attended = 31
WHERE id = '00000000-0000-0000-0000-000000000003'::uuid;

-- Carlos Rodríguez
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000004'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'carlos@example.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Carlos Rodríguez","username":"@carlosr"}'::jsonb,
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

UPDATE profiles SET
  name = 'Carlos Rodríguez',
  username = '@carlosr',
  bio = 'Foodie | Chef | Discovering the best flavors of Paisa cuisine 🍽️',
  avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000',
  location = 'El Poblado, Medellín',
  is_premium = true,
  is_verified = false,
  interests = ARRAY['restaurants', 'rooftops'],
  preferences = ARRAY['Restaurants', 'Rooftops'],
  points = 670,
  level = 6,
  badges = ARRAY['foodie'],
  followers_count = 145,
  following_count = 67,
  plans_created = 8,
  plans_attended = 29
WHERE id = '00000000-0000-0000-0000-000000000004'::uuid;

-- ============================================
-- 2. CREAR PLANES
-- ============================================

-- Plan 1: Cielo Abierto Rooftop
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, event_date, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, is_spotlight, created_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Cielo Abierto Rooftop', 'Rooftop chill, música suave, conversación rica. Si vas con alguien… algo pasa 😉🔥', 'El Poblado', 'Medellín', 'Cra 37 #10', ST_SetSRID(ST_MakePoint(-75.5677, 6.2097), 4326), 40, 24, '2025-12-14T21:00:00'::timestamp, 85000, 'medio-alto', 'rooftop', ARRAY['Rooftops', 'cocteles de autor', 'vista panorámica'], ARRAY['https://images.unsplash.com/photo-1600369672770-b77b7c4c8c85', 'https://images.unsplash.com/photo-1600047506001-6c1de94d541f'], ARRAY['luces cálidas', 'cita suave', 'vista linda'], 'Rooftop chill, música suave, conversación rica.', '8:00pm — 12:00am', 45, 18, 4.7, true, NOW());

-- Plan 2: Café La Esquina
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, created_at) VALUES
('00000000-0000-0000-0000-000000000001'::uuid, 'Café La Esquina', 'Suavecito, olor a café fresco, gente bonita escribiendo cosas que no terminan.', 'Laureles–Estadio', 'Medellín', 'Cra 74 #48-21', ST_SetSRID(ST_MakePoint(-75.5959, 6.2458), 4326), 28, 11, 18000, 'bajo-medio', 'cafe', ARRAY['Cafés', 'café de origen', 'ambiente chill'], ARRAY['https://images.unsplash.com/photo-1511920170033-f8396924c348', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd'], ARRAY['chill', 'lectura', 'primera cita'], 'Suavecito, olor a café fresco.', '4:00pm — 7:00pm', 32, 15, 4.6, NOW());

-- Plan 3: El Patio 70
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, created_at) VALUES
('00000000-0000-0000-0000-000000000002'::uuid, 'El Patio 70', 'Mesas afuera, risas, humo y la vida pasando. Aquí empieza la noche.', 'Laureles–Estadio', 'Medellín', 'Av. 70 #Circular 4', ST_SetSRID(ST_MakePoint(-75.5935, 6.2451), 4326), 60, 34, 35000, 'económico', 'bar', ARRAY['Bares', 'previa con amigos', 'música latina'], ARRAY['https://images.unsplash.com/photo-1551522435-7c58b99f98c3', 'https://images.unsplash.com/photo-1556740772-1a741367b93e'], ARRAY['cerveza fría', 'amigos', 'previa'], 'Mesas afuera, risas, humo y la vida pasando.', '7:00pm — 11:00pm', 67, 28, 4.3, NOW());

-- Plan 4: Mirador Las Palmas
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, is_spotlight, created_at) VALUES
('00000000-0000-0000-0000-000000000003'::uuid, 'Mirador Las Palmas', 'Luz bajita, viento fresco y esa conversación donde se mira a los ojos.', 'Medellín', 'Medellín', 'Kilómetro 9 vía Las Palmas', ST_SetSRID(ST_MakePoint(-75.5303, 6.1755), 4326), 120, 48, 0, 'gratis', 'mirador', ARRAY['Miradores', 'puesta de sol', 'charla profunda'], ARRAY['https://images.unsplash.com/photo-1529927066849-79b339b67c14', 'https://images.unsplash.com/photo-1522878308974-5a981838b6d8'], ARRAY['puesta de sol', 'charla profunda', 'panorámica'], 'Luz bajita, viento fresco.', '5:30pm — 9:00pm', 89, 41, 4.8, true, NOW());

-- Plan 5: Luna Negra Club
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, event_date, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, is_spotlight, created_at) VALUES
('00000000-0000-0000-0000-000000000002'::uuid, 'Luna Negra Club', 'Perreo que huele a perfume caro y decisiones peligrosas.', 'El Poblado', 'Medellín', 'Carrera 36 #10-21, Provenza', ST_SetSRID(ST_MakePoint(-75.5653, 6.2083), 4326), 90, 57, '2025-12-31T23:00:00'::timestamp, 120000, 'alto', 'club', ARRAY['Clubes', 'reggaetón fino', 'vip experience'], ARRAY['https://images.unsplash.com/photo-1542128968-5aded1f2f9de', 'https://images.unsplash.com/photo-1559511260-26d3e76e96f4'], ARRAY['reggaeton suave', 'perreo fino', 'luces cálidas'], 'Perreo que huele a perfume caro.', '11:00pm — 3:00am', 124, 67, 4.5, true, NOW());

-- Plan 6: Almendra Cocina Viva
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, is_spotlight, created_at) VALUES
('00000000-0000-0000-0000-000000000004'::uuid, 'Almendra Cocina Viva', 'Todo suavecito. Buena conversación. Risa bajita. Manos que se acercan.', 'Laureles–Estadio', 'Medellín', 'Circular 74B #39-34', ST_SetSRID(ST_MakePoint(-75.589, 6.244), 4326), 42, 19, 95000, 'medio', 'restaurante', ARRAY['Restaurantes', 'cena romántica', 'chef table'], ARRAY['https://images.unsplash.com/photo-1529107386315-e1a2ed48a620', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'], ARRAY['romántico', 'tranquilo', 'buena comida'], 'Todo suavecito. Buena conversación.', '6:30pm — 9:30pm', 56, 24, 4.7, true, NOW());

-- Plan 7: Parque del Poblado
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, created_at) VALUES
('00000000-0000-0000-0000-000000000003'::uuid, 'Parque del Poblado', 'Sentarse, conversar, existir. No hace falta más.', 'El Poblado', 'Medellín', 'Cl 10 #43D-30', ST_SetSRID(ST_MakePoint(-75.5666, 6.2092), 4326), 200, 64, 0, 'gratis', 'parque', ARRAY['Parques', 'plan al aire libre', 'picnic urbano'], ARRAY['https://images.unsplash.com/photo-1501785888041-af3ef285b470', 'https://images.unsplash.com/photo-1519817650390-64a93db511aa'], ARRAY['matecito', 'hablar chill', 'atardecer'], 'Sentarse, conversar, existir.', '3:00pm — 7:00pm', 41, 19, 4.6, NOW());

-- Plan 8: La Casa del Santi
INSERT INTO plans (user_id, name, description, zone, city, address, location, capacity, current_attendees, average_price, price_type, primary_category, categories, images, tags, vibe, best_time, likes, favorites, rating, is_spotlight, created_at) VALUES
('00000000-0000-0000-0000-000000000002'::uuid, 'La Casa del Santi', 'Aquí nadie es serio. El sofá es cama. El baño está ocupado. Nadie pregunta nada.', 'Belén', 'Medellín', 'Belén Rosales', ST_SetSRID(ST_MakePoint(-75.5899, 6.2298), 4326), 70, 41, 25000, 'cada quien pone algo', 'barrio', ARRAY['Casas', 'fiesta casera', 'after fijo'], ARRAY['https://images.unsplash.com/photo-1558980664-10ea29200781', 'https://images.unsplash.com/photo-1509099836639-18ba1795216d'], ARRAY['perreo sin testigos', 'trago barato', 'energía caótica'], 'Aquí nadie es serio.', 'cuando se calienta el grupo', 98, 52, 5.0, true, NOW());

-- ============================================
-- 3. CREAR SHORTS
-- ============================================

INSERT INTO shorts (user_id, video_url, thumbnail_url, place_name, category, description, likes, favorites, created_at) VALUES
('00000000-0000-0000-0000-000000000003'::uuid, 'laureles-video', 'https://images.unsplash.com/photo-1593014109521-48ea0d373ef1?q=80&w=1000', 'Calle 43 # 79-124 Laureles', 'Neighborhood', 'Explorando el hermoso barrio de Laureles! 🌳', 532, 124, '2025-07-16T14:00:00'::timestamp),
('00000000-0000-0000-0000-000000000004'::uuid, 'hakuna-matata-video', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000', 'Restaurante Árabe', 'Restaurants', '¡HAKUNA MATATA! 🍽️', 178, 42, '2025-07-17T18:30:00'::timestamp),
('00000000-0000-0000-0000-000000000002'::uuid, 'sedes-video', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000', 'Nuestras Sedes', 'Restaurants', 'Conoce nuestras sedes! 📍', 312, 87, '2025-07-18T09:00:00'::timestamp),
('00000000-0000-0000-0000-000000000003'::uuid, 'estadio-video', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000', 'Estadio Medellín', 'Sports', '¡Vamos Medellín! ⚽', 423, 156, '2025-07-19T20:00:00'::timestamp);

-- ============================================
-- 4. CREAR COMENTARIOS
-- ============================================

INSERT INTO comments (user_id, short_id, content, created_at)
SELECT '00000000-0000-0000-0000-000000000003'::uuid, id, '¡Qué lugar tan hermoso!', '2025-07-15T11:00:00'::timestamp
FROM shorts WHERE place_name = 'Calle 43 # 79-124 Laureles' LIMIT 1;

-- ============================================
-- 5. CREAR LIKES (Algunos ejemplos)
-- ============================================

INSERT INTO likes (user_id, plan_id)
SELECT '00000000-0000-0000-0000-000000000002'::uuid, id
FROM plans WHERE name IN ('Cielo Abierto Rooftop', 'Mirador Las Palmas', 'Luna Negra Club')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. CREAR FAVORITOS
-- ============================================

INSERT INTO favorites (user_id, plan_id)
SELECT '00000000-0000-0000-0000-000000000002'::uuid, id
FROM plans WHERE name IN ('Cielo Abierto Rooftop', 'Luna Negra Club')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. CREAR ASISTENCIAS A PLANES
-- ============================================

INSERT INTO plan_attendees (plan_id, user_id, status)
SELECT id, '00000000-0000-0000-0000-000000000002'::uuid, 'confirmed'
FROM plans WHERE name IN ('Cielo Abierto Rooftop', 'El Patio 70')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. CREAR RELACIONES DE SEGUIMIENTO
-- ============================================

INSERT INTO follows (follower_id, following_id) VALUES
('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000003'::uuid),
('00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000004'::uuid),
('00000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-0000-0000-000000000002'::uuid)
ON CONFLICT DO NOTHING;

-- ============================================
-- FIN DE SEED DATA
-- ============================================

-- Verificar que los datos se insertaron correctamente
SELECT 'Usuarios creados:' as info, COUNT(*) as total FROM profiles;
SELECT 'Planes creados:' as info, COUNT(*) as total FROM plans;
SELECT 'Shorts creados:' as info, COUNT(*) as total FROM shorts;
SELECT 'Comentarios creados:' as info, COUNT(*) as total FROM comments;
SELECT 'Likes creados:' as info, COUNT(*) as total FROM likes;

-- ¡Listo! Tu base de datos ahora tiene datos iniciales para empezar a probar la app.
