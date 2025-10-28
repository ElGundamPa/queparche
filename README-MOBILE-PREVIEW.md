# 📱 Configuración de Vista Previa Móvil

## 🚀 Cómo usar la vista previa móvil en Cursor

### Opción 1: Usar la extensión Live Preview (Recomendado)

1. **Instala la extensión Live Preview de VS Code/Cursor**
   - Presiona `Ctrl+Shift+X` para abrir extensiones
   - Busca "Live Preview"
   - Instala la extensión oficial de Microsoft

2. **Inicia el servidor Expo Web**
   ```bash
   npm run start-web
   ```

3. **Abre la vista previa móvil**
   - Abre el archivo `.vscode/mobile-preview.html`
   - Click derecho → "Show Preview" o presiona `Ctrl+Shift+V`
   - La vista previa se abrirá en un panel lateral

### Opción 2: Usar Simple Browser (Integrado en Cursor)

1. **Inicia el servidor Expo Web**
   ```bash
   npm run start-web
   ```

2. **Abre Simple Browser**
   - Presiona `Ctrl+Shift+P` para abrir la paleta de comandos
   - Escribe "Simple Browser: Show"
   - Ingresa la URL: `http://localhost:19006`

3. **Ajusta el tamaño del panel**
   - Arrastra el divisor del panel para ajustar el tamaño
   - Recomendado: aproximadamente 390px de ancho

### Opción 3: DevTools de Chrome (Vista móvil externa)

1. **Inicia el servidor Expo Web**
   ```bash
   npm run start-web
   ```

2. **Abre en Chrome**
   - El navegador se abrirá automáticamente
   - Presiona `F12` para abrir DevTools
   - Click en el ícono de dispositivo móvil (o `Ctrl+Shift+M`)
   - Selecciona "iPhone 14 Pro" en el menú desplegable

### 🎯 Configuración aplicada

- ✅ Puerto fijo: `19006`
- ✅ Hot reload activado
- ✅ Simulación de iPhone 14 Pro (390px × 844px)
- ✅ Auto-guardado configurado
- ✅ Archivos de configuración VS Code creados

### 📝 Scripts disponibles

```bash
npm run start-web     # Inicia Expo Web en puerto 19006
npm run dev           # Inicia Expo en modo desarrollo
npm start             # Inicia Expo con tunnel
```

### 🔧 Archivos de configuración creados

- `.vscode/settings.json` - Configuración del workspace
- `.vscode/launch.json` - Configuración de debugging
- `.vscode/tasks.json` - Tareas automatizadas
- `.vscode/mobile-preview.html` - Vista previa móvil personalizada
- `.cursor/workspace.json` - Configuración específica de Cursor

### 💡 Consejos

1. **Hot Reload**: Los cambios se reflejarán automáticamente al guardar
2. **Panel lateral**: Arrastra el divisor para ajustar el tamaño de la vista previa
3. **Múltiples vistas**: Puedes abrir varias vistas previas simultáneamente
4. **DevTools**: Usa `F12` en la vista previa para inspeccionar elementos

### 🐛 Solución de problemas

**La vista previa no carga:**
- Verifica que `npm run start-web` esté ejecutándose
- Comprueba que el puerto 19006 esté disponible
- Recarga la vista previa con `Ctrl+R`

**Los cambios no se reflejan:**
- Asegúrate de guardar el archivo (`Ctrl+S`)
- Verifica que el auto-guardado esté activado
- Recarga manualmente la vista previa

**Error de CORS:**
- Expo Web maneja CORS automáticamente
- Si persiste, reinicia el servidor con `npm run start-web`


