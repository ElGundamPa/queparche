import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AtSign } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { useAuthStore } from '../../hooks/use-auth-store';

export default function LoginFormScreen() {
  const router = useRouter();
  const { login, isLoading, clearAllData } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleEmailChange = (text: string) => {
    // Guardar el texto tal cual lo escribe el usuario
    setEmail(text);
  };

  const normalizeEmailOrUsername = (text: string) => {
    // Si el campo está vacío, retornar vacío
    if (!text.trim()) return text;

    // Si contiene @, probablemente es un email
    if (text.includes('@')) {
      // Si es un email válido (tiene @ en el medio, no al inicio), dejarlo tal cual
      if (!text.startsWith('@')) {
        return text;
      }
      // Si ya comienza con @, es username, dejarlo tal cual
      return text;
    }

    // No contiene @, es un username, agregar @ al inicio
    return '@' + text;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Normalizar el email/username antes de enviar
    const normalizedEmail = normalizeEmailOrUsername(email);

    const { success, error } = await login(normalizedEmail, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', error || 'Credenciales incorrectas');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleClearData = () => {
    Alert.alert(
      '⚠️ Limpiar Datos',
      'Esto eliminará TODOS los usuarios registrados y sesiones. Solo para desarrollo.\n\n¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, limpiar todo',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert(
              '✅ Datos Limpiados',
              'Todos los datos han sido eliminados. Ahora puedes registrarte de nuevo.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.light.white} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>¡Bienvenido de nuevo! 👋</Text>
            <Text style={styles.subtitle}>
              Inicia sesión para continuar explorando parches increíbles
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email o nombre de usuario</Text>
              <View style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused
              ]}>
                {/* Mostrar Mail icon si parece un email (tiene @ en el medio) */}
                {email.includes('@') && !email.startsWith('@') && email.indexOf('@') > 0 ? (
                  <Mail size={20} color={emailFocused ? Colors.light.primary : Colors.light.darkGray} />
                ) : (
                  <AtSign size={20} color={emailFocused ? Colors.light.primary : Colors.light.darkGray} />
                )}
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="usuario o email@dominio.com"
                  placeholderTextColor={Colors.light.darkGray}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  testID="email-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused
              ]}>
                <Lock size={20} color={passwordFocused ? Colors.light.primary : Colors.light.darkGray} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña"
                  placeholderTextColor={Colors.light.darkGray}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  testID="password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.light.darkGray} />
                  ) : (
                    <Eye size={20} color={Colors.light.darkGray} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert(
                'Recuperar contraseña',
                'Esta opción aún no está disponible. Pronto podrás recuperar tu contraseña desde aquí.',
                [{ text: 'Entendido', style: 'default' }]
              )}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              testID="login-button"
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.secondary] as [string, string]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.light.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿No tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register-form')}>
              <Text style={styles.linkText}>Regístrate</Text>
            </TouchableOpacity>
          </View>

          {/* Development Only: Clear Data Button */}
          {__DEV__ && (
            <TouchableOpacity
              onPress={handleClearData}
              style={styles.devButton}
            >
              <Text style={styles.devButtonText}>🗑️ Limpiar datos (Dev)</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    paddingBottom: 36,
    paddingTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#333',
    transition: 'all 0.2s',
  },
  inputWrapperFocused: {
    borderColor: Colors.light.primary,
    backgroundColor: '#1F1F1F',
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.white,
    letterSpacing: 0.5,
  },
  footer: {
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#AAAAAA',
  },
  linkText: {
    fontSize: 15,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  devButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF4444',
  },
});
