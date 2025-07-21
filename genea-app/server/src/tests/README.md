# Tests para Genea

Este directorio contiene las pruebas unitarias y de integración para la aplicación Genea.

## Estructura de pruebas

- **minimal.test.js**: Pruebas mínimas para verificar que Jest funciona correctamente
- **auth.middleware.test.js**: Pruebas para el middleware de autenticación
- **person.controller.test.js**: Pruebas para el controlador de personas
- **family.controller.test.js**: Pruebas para el controlador de familias
- **media.controller.test.js**: Pruebas para el controlador de medios
- **api.routes.test.js**: Pruebas para las rutas API principales

## Pruebas deshabilitadas temporalmente

Las siguientes pruebas están deshabilitadas temporalmente debido a problemas con MongoDB y timeouts:

- **media.routes.test.js**: Pruebas para las rutas de medios
- **tree.routes.test.js**: Pruebas para las rutas del árbol genealógico
- **family.routes.test.js**: Pruebas para las rutas de familias
- **person.routes.test.js**: Pruebas para las rutas de personas

## Ejecución de pruebas

Para ejecutar las pruebas, utiliza el script `run-tests.sh`:

```bash
./run-tests.sh
```

Este script limpiará node_modules, reinstalará las dependencias y ejecutará las pruebas habilitadas.

Si solo quieres ejecutar las pruebas sin reinstalar dependencias, puedes usar:

```bash
./run-passing-tests.sh
```

## Notas sobre los mocks

Las pruebas utilizan mocks para simular:

1. **Mongoose y modelos**: Se mockean los modelos de MongoDB para evitar conexiones reales a la base de datos
2. **Firebase Admin**: Se mockea para simular la autenticación
3. **Multer**: Se mockea para simular la subida de archivos
4. **fs y path**: Se mockean para simular operaciones de archivos

## Solución de problemas comunes

- **Timeouts en beforeEach**: Algunas pruebas tienen problemas con timeouts en los hooks beforeEach. Esto puede deberse a intentos de conexión a MongoDB.
- **Errores de validación de modelos**: Algunos tests fallan debido a errores de validación en los modelos de Mongoose.
- **Problemas con multer**: Las pruebas de subida de archivos pueden fallar debido a problemas con el mock de multer.

## Mejoras futuras

- Implementar MongoDB Memory Server para pruebas de integración
- Mejorar los mocks para evitar timeouts
- Implementar pruebas end-to-end con Cypress o Playwright