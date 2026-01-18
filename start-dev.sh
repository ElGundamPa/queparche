#!/bin/bash

echo "🧹 Limpiando procesos antiguos..."
pkill -9 node 2>/dev/null
pkill -9 expo 2>/dev/null
lsof -ti:8081,19000,19001,19002,19006 2>/dev/null | xargs kill -9 2>/dev/null

echo "⏳ Esperando 3 segundos..."
sleep 3

echo "🚀 Iniciando Expo con túnel (funciona sin problemas de red)..."
echo ""
echo "IMPORTANTE:"
echo "1. En tu teléfono, descarga 'Expo Go' desde App Store o Play Store"
echo "2. Escanea el código QR que aparecerá abajo"
echo "3. O presiona 'w' para abrir en navegador web"
echo ""

npx expo start --tunnel --clear
