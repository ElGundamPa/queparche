import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { comparePassword, generateToken, isValidEmail } from "@/lib/auth-helpers";

export default publicProcedure
  .input(
    z.object({
      emailOrUsername: z.string().min(1, "Email o username requerido"),
      password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { emailOrUsername, password } = input;

    try {
      // Determinar si es email o username
      const isEmail = isValidEmail(emailOrUsername);
      const searchField = isEmail ? "email" : "username";

      console.log("🔐 Intentando login con:", {
        field: searchField,
        value: emailOrUsername,
      });

      // Buscar usuario en users_auth
      const { data: user, error } = await ctx.supabase
        .from("users_auth")
        .select("id, email, username, password_hash, is_active, last_login")
        .eq(searchField, emailOrUsername)
        .single();

      if (error || !user) {
        console.error("❌ Usuario no encontrado:", error);
        throw new Error("Credenciales incorrectas");
      }

      // Verificar si el usuario está activo
      if (!user.is_active) {
        throw new Error("Usuario inactivo");
      }

      // Comparar contraseña
      const isValidPassword = await comparePassword(password, user.password_hash);

      if (!isValidPassword) {
        console.error("❌ Contraseña incorrecta");
        throw new Error("Credenciales incorrectas");
      }

      // Actualizar last_login
      await ctx.supabase
        .from("users_auth")
        .update({ last_login: new Date().toISOString() })
        .eq("id", user.id);

      // Obtener perfil completo
      const { data: profile, error: profileError } = await ctx.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("❌ Error cargando perfil:", profileError);
        throw new Error("Error al cargar perfil de usuario");
      }

      // Generar token JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      console.log("✅ Login exitoso:", {
        userId: user.id,
        username: user.username,
      });

      return {
        success: true,
        token,
        user: {
          ...profile,
          email: user.email,
        },
      };
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      return {
        success: false,
        error: error.message || "Error al iniciar sesión",
      };
    }
  });
