# 🚀 Cómo Iniciar la App QuéParche

## ✅ SOLUCIÓN RÁPIDA (Recomendada)

**Ejecuta este comando en tu terminal:**

```bash
cd /Users/user/Documents/dev/queparche && ./start-dev.sh
```

Esto:
1. ✅ Limpia todos los procesos antiguos
2. ✅ Inicia el servidor con túnel (resuelve problemas de red)
3. ✅ Muestra un código QR para escanear

---

## 📱 PASO 2: Conectar tu Dispositivo

### Opción A: Dispositivo Móvil (iOS/Android)

1. **Descarga Expo Go:**
   - iOS: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Escanea el QR:**
   - Abre Expo Go en tu teléfono
   - Escanea el código QR que aparece en tu terminal
   - La app se cargará automáticamente

### Opción B: Navegador Web

1. En la terminal donde corre el servidor, presiona: **`w`**
2. Se abrirá automáticamente en tu navegador en `http://localhost:19006`

### Opción C: Simulador iOS (requiere Xcode)

1. En la terminal donde corre el servidor, presiona: **`i`**
2. Se abrirá automáticamente en el simulador

---

## 🎯 Verificar que Funciona

Una vez conectado, deberías ver:

1. ✅ **Pantalla de inicio** con tu código promocional (QP-XXXXXX)
2. ✅ **Tarjeta de PromoCard** con gradiente rojo-naranja-amarillo
3. ✅ **Evento destacado** "808 Fest x Asado Mistico"
4. ✅ Al presionar "Ver QR" se abre modal con código QR

---

## ❌ Si Algo Sale Mal

### Error: "Internet connection appears offline"
**Solución:** Usa el script `start-dev.sh` que usa modo túnel

### Error: "Port already in use"
**Solución:** El script limpia los puertos automáticamente

### Error: "Module not found"
**Solución:**
```bash
cd /Users/user/Documents/dev/queparche
npm install
./start-dev.sh
```

---

## 🛠️ Comandos Alternativos

Si el script no funciona, usa estos comandos directamente:

### Con Túnel (recomendado):
```bash
cd /Users/user/Documents/dev/queparche
npx expo start --tunnel --clear
```

### Sin Túnel (requiere misma red WiFi):
```bash
cd /Users/user/Documents/dev/queparche
npx expo start --clear
```

### Solo Web:
```bash
cd /Users/user/Documents/dev/queparche
npx expo start --web
```

---

## 📝 Notas Importantes

- ✅ El código ya está corregido (se removió la referencia a icon.png que causaba error)
- ✅ El modo túnel resuelve problemas de conectividad de red
- ✅ La primera vez puede tardar ~30-60 segundos en compilar
- ✅ Presiona **`r`** en la terminal para recargar la app
- ✅ Presiona **`m`** para abrir el menú de desarrollo

---

## 🎉 ¡Listo!

Ahora podrás ver y probar el sistema de código promocional funcionando.
