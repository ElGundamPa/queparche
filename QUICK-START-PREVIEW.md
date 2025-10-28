# 🚀 Inicio Rápido - Vista Previa Móvil

## ✅ Configuración completada

Tu proyecto ya está configurado para vista previa móvil. Sigue estos pasos:

---

## 📱 OPCIÓN 1: Simple Browser (Más rápido y fácil)

### Paso 1: Inicia el servidor
```bash
npm run start-web
```

### Paso 2: Abre Simple Browser
1. Presiona `Ctrl+Shift+P`
2. Escribe: `Simple Browser: Show`
3. Ingresa URL: `http://localhost:19006`

### Paso 3: Ajusta el tamaño
- Arrastra el divisor del panel a ~390px de ancho
- ¡Listo! Ya tienes tu simulador móvil

---

## 🎨 OPCIÓN 2: Vista previa HTML personalizada

### Paso 1: Inicia el servidor
```bash
npm run start-web
```

### Paso 2: Abre el preview
1. Abre el archivo: `.vscode/mobile-preview.html`
2. Click derecho → "Open with Live Server"
   - O instala la extensión "Live Server" si no la tienes

### Paso 3: Disfruta
- Verás un iPhone 14 Pro simulado
- Con notch y todo 📱

---

## 🌐 OPCIÓN 3: Chrome DevTools (Recomendado para desarrollo)

### Paso 1: Inicia el servidor
```bash
npm run start-web
```

### Paso 2: Chrome se abrirá automáticamente

### Paso 3: Activa vista móvil
1. Presiona `F12` para abrir DevTools
2. Click en el ícono de móvil (o `Ctrl+Shift+M`)
3. Selecciona "iPhone 14 Pro" en el menú

---

## ⚡ Hot Reload

Los cambios se aplicarán automáticamente al guardar:
- ✅ Auto-guardado activado (1 segundo)
- ✅ Hot reload de Expo configurado
- ✅ Recarga automática en el navegador

---

## 🎯 Dimensiones configuradas

- **iPhone 14 Pro**: 390px × 844px
- **Puerto**: 19006 (fijo)
- **Orientación**: Portrait (vertical)

---

## 🔥 Comandos disponibles

```bash
npm run dev          # Desarrollo normal (móvil/Expo Go)
npm run start-web    # Web con vista previa móvil
npm start            # Desarrollo con tunnel
```

---

## 💡 Tips

1. **Recargar preview**: `Ctrl+R` en la ventana de preview
2. **Inspeccionar elementos**: `F12` en la ventana de preview
3. **Zoom**: `Ctrl + +` o `Ctrl + -`
4. **Panel flotante**: Arrastra la pestaña fuera del editor

---

## 📂 Archivos creados

```
.vscode/
├── settings.json           # Auto-guardado y configuración
├── tasks.json             # Tareas automatizadas
├── launch.json            # Configuración de debugging
├── extensions.json        # Extensiones recomendadas
└── mobile-preview.html    # Preview personalizado

.cursor/
└── workspace.json         # Configuración de workspace

package.json               # Script start-web actualizado
```

---

## ✨ ¡Listo para desarrollar!

Simplemente ejecuta:
```bash
npm run start-web
```

Y abre Simple Browser o Chrome DevTools para ver tu app en tiempo real. 🎉


