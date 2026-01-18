-- Limpiar datos de autenticación
-- CUIDADO: Esto eliminará TODOS los usuarios de la tabla users_auth

-- Ver usuarios existentes antes de eliminar
SELECT id, email, username, created_at FROM public.users_auth;

-- Eliminar todos los usuarios de users_auth
-- DESCOMENTAR LA SIGUIENTE LÍNEA PARA EJECUTAR:
-- DELETE FROM public.users_auth;

-- También puedes eliminar perfiles huérfanos si es necesario
-- DESCOMENTAR LA SIGUIENTE LÍNEA PARA EJECUTAR:
-- DELETE FROM public.profiles WHERE id NOT IN (SELECT id FROM public.users_auth);

-- Verificar que se eliminaron
SELECT COUNT(*) as total_users FROM public.users_auth;
SELECT COUNT(*) as total_profiles FROM public.profiles;
