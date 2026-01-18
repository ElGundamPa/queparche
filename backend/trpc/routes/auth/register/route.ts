import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import {
  hashPassword,
  generateToken,
  isValidEmail,
  isValidUsername,
  isValidPassword,
  normalizeUsername,
} from "@/lib/auth-helpers";

export default publicProcedure
  .input(
    z.object({
      email: z.string().email("Email inválido"),
      username: z.string().min(3, "Username debe tener al menos 3 caracteres"),
      password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
      name: z.string().min(1, "Nombre requerido"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { email, username: rawUsername, password, name } = input;

    try {
      // Normalizar username (agregar @ si no lo tiene)
      const username = normalizeUsername(rawUsername);

      console.log("🚀 Iniciando registro:", {
        email,
        username,
        name,
      });

      // Validaciones
      if (!isValidEmail(email)) {
        throw new Error("Email inválido");
      }

      if (!isValidUsername(username)) {
        throw new Error("Username inválido (debe tener entre 3-20 caracteres)");
      }

      if (!isValidPassword(password)) {
        throw new Error("Contraseña debe tener al menos 6 caracteres");
      }

      // Verificar que email no exista
      const { data: existingEmail } = await ctx.supabase
        .from("users_auth")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingEmail) {
        console.error("❌ Email ya existe:", email);
        throw new Error("El email ya está registrado");
      }

      // Verificar que username no exista
      const { data: existingUsername } = await ctx.supabase
        .from("users_auth")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existingUsername) {
        console.error("❌ Username ya existe:", username);
        throw new Error("El username ya está en uso");
      }

      // Hashear contraseña
      console.log("🔐 Hasheando contraseña...");
      const passwordHash = await hashPassword(password);

      // Crear usuario en users_auth
      console.log("👤 Creando usuario en users_auth...");
      const { data: newUser, error: createError } = await ctx.supabase
        .from("users_auth")
        .insert({
          email,
          username,
          password_hash: passwordHash,
        })
        .select("id, email, username")
        .single();

      if (createError || !newUser) {
        console.error("❌ Error creando usuario:", createError);
        throw new Error("Error al crear usuario: " + createError?.message);
      }

      console.log("✅ Usuario creado en users_auth:", newUser.id);

      // Esperar a que el trigger cree el perfil
      console.log("⏳ Esperando creación de perfil...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Obtener o crear perfil
      let profile = null;
      const { data: existingProfile } = await ctx.supabase
        .from("profiles")
        .select("*")
        .eq("id", newUser.id)
        .maybeSingle();

      if (existingProfile) {
        console.log("📄 Perfil encontrado via trigger");
        profile = existingProfile;
      } else {
        // Crear perfil manualmente si el trigger falló
        console.log("🔧 Creando perfil manualmente...");
        const { data: createdProfile, error: profileError } = await ctx.supabase
          .from("profiles")
          .insert({
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            name: name,
          })
          .select()
          .single();

        if (profileError || !createdProfile) {
          console.error("❌ Error creando perfil:", profileError);
          throw new Error("Error al crear perfil: " + profileError?.message);
        }

        profile = createdProfile;
      }

      // Generar token JWT
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      console.log("✅ Registro completado exitosamente:", {
        userId: newUser.id,
        username: newUser.username,
      });

      return {
        success: true,
        token,
        user: {
          ...profile,
          email: newUser.email,
        },
      };
    } catch (error: any) {
      console.error("❌ Error en registro:", error);
      return {
        success: false,
        error: error.message || "Error al registrar usuario",
      };
    }
  });
