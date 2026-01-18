/**
 * Script de prueba para verificar la conexión a Supabase
 * Ejecutar con: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Verificando conexión a Supabase...\n');

  try {
    // Test 1: Verificar conexión básica
    console.log('1️⃣ Test: Conexión básica');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) throw profilesError;
    console.log('   ✅ Conexión exitosa\n');

    // Test 2: Contar usuarios
    console.log('2️⃣ Test: Contar usuarios');
    const { count: usersCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    console.log(`   ✅ Usuarios encontrados: ${usersCount}\n`);

    // Test 3: Obtener planes
    console.log('3️⃣ Test: Obtener planes');
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('id, name, primary_category')
      .limit(5);

    if (plansError) throw plansError;
    console.log(`   ✅ Planes encontrados: ${plans?.length || 0}`);
    plans?.forEach(plan => {
      console.log(`      - ${plan.name} (${plan.primary_category})`);
    });
    console.log('');

    // Test 4: Obtener shorts
    console.log('4️⃣ Test: Obtener shorts');
    const { data: shorts, error: shortsError } = await supabase
      .from('shorts')
      .select('id, place_name, category')
      .limit(5);

    if (shortsError) throw shortsError;
    console.log(`   ✅ Shorts encontrados: ${shorts?.length || 0}`);
    shorts?.forEach(short => {
      console.log(`      - ${short.place_name} (${short.category})`);
    });
    console.log('');

    // Test 5: Test de autenticación (login)
    console.log('5️⃣ Test: Autenticación (login con usuario demo)');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'usuario@example.com',
      password: '123456',
    });

    if (authError) throw authError;
    console.log('   ✅ Login exitoso');
    console.log(`      Usuario: ${authData.user?.email}`);

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, name')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;
    console.log(`      Perfil: ${profile.name} (${profile.username})\n`);

    // Cerrar sesión
    await supabase.auth.signOut();

    // Test 6: Verificar likes
    console.log('6️⃣ Test: Contar likes');
    const { count: likesCount, error: likesError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true });

    if (likesError) throw likesError;
    console.log(`   ✅ Likes encontrados: ${likesCount}\n`);

    // Test 7: Verificar comentarios
    console.log('7️⃣ Test: Contar comentarios');
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    if (commentsError) throw commentsError;
    console.log(`   ✅ Comentarios encontrados: ${commentsCount}\n`);

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • Usuarios: ${usersCount}`);
    console.log(`   • Planes: ${plans?.length || 0}`);
    console.log(`   • Shorts: ${shorts?.length || 0}`);
    console.log(`   • Likes: ${likesCount}`);
    console.log(`   • Comentarios: ${commentsCount}`);
    console.log('');
    console.log('🚀 La app está lista para conectarse a Supabase!');

  } catch (error: any) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR EN LA CONEXIÓN');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('Mensaje:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

testConnection();
