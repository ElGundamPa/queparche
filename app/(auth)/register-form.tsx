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
import { User, AtSign, Mail, Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { useAuthStore } from '../../hooks/use-auth-store';

export default function RegisterFormScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    // Auto-agregar @ al username
    if (field === 'username') {
      // Si el usuario está escribiendo y no hay @, agregarlo
      if (value.length > 0 && !value.startsWith('@')) {
        value = '@' + value;
      }
      // Si el usuario borra todo, permitir que quede vacío
      if (value === '@') {
        value = '';
      }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validación en tiempo real
  const isPasswordValid = formData.password.length >= 6;
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
  const isUsernameValid = formData.username.startsWith('@') && formData.username.length > 1;

  const handleRegister = async () => {
    const { name, username, email, password, confirmPassword } = formData;

    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!username.startsWith('@')) {
      Alert.alert('Error', 'El nombre de usuario debe comenzar con @');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const { success, error } = await register({
      name,
      username,
      email,
      password,
    });

    if (success) {
      // Redirigir al onboarding para completar el perfil
      router.replace('/(auth)/onboarding');
    } else {
      Alert.alert('Error', error || 'Error al crear la cuenta');
    }
  };

  const handleBack = () => {
    router.back();
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
            <Text style={styles.title}>Crea tu cuenta ✨</Text>
            <Text style={styles.subtitle}>
              Únete a la comunidad y descubre los mejores parches
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'name' && styles.inputWrapperFocused
              ]}>
                <User size={20} color={focusedField === 'name' ? Colors.light.primary : Colors.light.darkGray} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={Colors.light.darkGray}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  testID="name-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'username' && styles.inputWrapperFocused,
                isUsernameValid && formData.username.length > 0 && styles.inputWrapperValid
              ]}>
                <AtSign size={20} color={focusedField === 'username' ? Colors.light.primary : Colors.light.darkGray} />
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  placeholder="@tu_usuario"
                  placeholderTextColor={Colors.light.darkGray}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  testID="username-input"
                />
                {isUsernameValid && (
                  <Check size={20} color={Colors.light.primary} />
                )}
              </View>
              {formData.username.length > 0 && !isUsernameValid && (
                <Text style={styles.errorText}>Debe comenzar con @</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused
              ]}>
                <Mail size={20} color={focusedField === 'email' ? Colors.light.primary : Colors.light.darkGray} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="tu@email.com"
                  placeholderTextColor={Colors.light.darkGray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  testID="email-input"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'password' && styles.inputWrapperFocused,
                isPasswordValid && formData.password.length > 0 && styles.inputWrapperValid
              ]}>
                <Lock size={20} color={focusedField === 'password' ? Colors.light.primary : Colors.light.darkGray} />
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={Colors.light.darkGray}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
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
              {formData.password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <View style={[
                    styles.passwordStrengthBar,
                    { width: `${Math.min((formData.password.length / 6) * 100, 100)}%` },
                    isPasswordValid ? styles.passwordStrengthBarValid : styles.passwordStrengthBarWeak
                  ]} />
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[
                styles.inputWrapper,
                focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                doPasswordsMatch && styles.inputWrapperValid
              ]}>
                <Lock size={20} color={focusedField === 'confirmPassword' ? Colors.light.primary : Colors.light.darkGray} />
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={Colors.light.darkGray}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  testID="confirm-password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.light.darkGray} />
                  ) : (
                    <Eye size={20} color={Colors.light.darkGray} />
                  )}
                </TouchableOpacity>
                {doPasswordsMatch && (
                  <Check size={20} color={Colors.light.primary} />
                )}
              </View>
              {formData.confirmPassword.length > 0 && !doPasswordsMatch && (
                <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              testID="register-button"
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.secondary]}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.light.white} />
                ) : (
                  <Text style={styles.registerButtonText}>Crear cuenta</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login-form')}>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 32,
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
  inputWrapperValid: {
    borderColor: '#22c55e',
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
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    marginTop: 8,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  passwordStrengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthBarWeak: {
    backgroundColor: '#ef4444',
  },
  passwordStrengthBarValid: {
    backgroundColor: '#22c55e',
  },
  registerButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  registerButtonText: {
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
});
