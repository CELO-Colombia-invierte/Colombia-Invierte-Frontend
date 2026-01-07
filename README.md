# Colombia-Invierte-Frontend

Aplicación móvil desarrollada con Ionic + React + TypeScript.

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Lint y Formato

```bash
pnpm lint
pnpm format
```

## Capacitor - Despliegue Móvil

### Instalación Inicial

Después de instalar las dependencias, agrega las plataformas nativas:

**iOS (requiere macOS con Xcode):**
```bash
pnpm cap add ios
pnpm cap sync
pnpm cap open ios
```

**Android (requiere Android Studio):**
```bash
pnpm cap add android
pnpm cap sync
pnpm cap open android
```

### Comandos de Capacitor

**Sincronizar cambios:**
```bash
pnpm build
pnpm cap sync
```

**Abrir proyectos nativos:**
```bash
pnpm cap:open:ios      # Abre Xcode
pnpm cap:open:android # Abre Android Studio
```

**Comandos completos (build + sync + abrir):**
```bash
pnpm cap:run:ios       # Build, sync y abre iOS
pnpm cap:run:android   # Build, sync y abre Android
```

**Otros comandos útiles:**
```bash
pnpm cap:add           # Agregar plugin de Capacitor
pnpm cap:copy          # Copiar web assets
pnpm cap:sync          # Sincronizar web assets y plugins
```

### Flujo de Trabajo

1. **Desarrollo:** Trabaja en el código web normalmente
2. **Build:** Ejecuta `pnpm build` para compilar
3. **Sync:** Ejecuta `pnpm cap sync` para sincronizar con proyectos nativos
4. **Abrir:** Ejecuta `pnpm cap:open:ios` o `pnpm cap:open:android` para abrir en el IDE nativo
5. **Probar:** Ejecuta desde Xcode o Android Studio

### Notas Importantes

- **iOS:** Requiere macOS con Xcode instalado
- **Android:** Requiere Android Studio y Android SDK
- **App ID:** Configurado en `capacitor.config.ts` como `co.celo.colombiainvierte`
- **Build:** Siempre ejecuta `pnpm build` antes de `cap sync` para ver los cambios

