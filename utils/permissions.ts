import { Platform, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const requestImagePickerPermission = async (): Promise<boolean> => {
  try {
    // Verificar permisos existentes primero
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    
    let finalStatus = existingStatus;
    
    // Si no tiene permisos, solicitarlos
    if (existingStatus !== 'granted') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      const platformMessage = Platform.OS === 'ios' 
        ? 'En iOS: Ve a Configuración > Privacidad y Seguridad > Fotos > Que Parche y selecciona \'Todas las fotos\'.'
        : 'En Android: Ve a Configuración > Aplicaciones > Que Parche > Permisos > Almacenamiento y activa el permiso.';
      
      Alert.alert(
        'Permiso requerido',
        `Para acceder a tu galería de fotos, necesitas conceder permiso.\n\n${platformMessage}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ir a Configuración', 
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else if (Platform.OS === 'android') {
                Linking.openSettings();
              }
            }
          }
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting image picker permission:', error);
    Alert.alert(
      'Error',
      'No se pudo verificar los permisos de la galería.',
      [{ text: 'OK' }]
    );
    return false;
  }
};

export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Reducir calidad para evitar errores
      exif: false, // No incluir datos EXIF
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert(
      'Error',
      'No se pudo acceder a la galería. Verifica que la aplicación tenga permisos para acceder a tus fotos.',
      [{ text: 'OK' }]
    );
    return null;
  }
};

