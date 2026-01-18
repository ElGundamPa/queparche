-- ============================================
-- FIX: Eliminar foreign key constraint de profiles
-- ============================================

-- 1. Ver todas las foreign keys de la tabla profiles
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'profiles'
    AND tc.constraint_type = 'FOREIGN KEY';

-- 2. Eliminar la foreign key que apunta a auth.users
-- (Esto permite que profiles.id sea independiente de auth.users)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 3. Agregar nueva foreign key hacia users_auth (OPCIONAL)
-- DESCOMENTAR si quieres mantener integridad referencial:
-- ALTER TABLE public.profiles
-- ADD CONSTRAINT profiles_users_auth_fkey
-- FOREIGN KEY (id) REFERENCES public.users_auth(id)
-- ON DELETE CASCADE;

-- 4. Verificar que se eliminó
SELECT
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name = 'profiles'
    AND tc.constraint_type = 'FOREIGN KEY';

-- ✅ Ahora profiles.id puede tener valores independientes de auth.users
