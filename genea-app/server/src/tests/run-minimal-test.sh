#!/bin/bash

# Cambiar al directorio del servidor
cd "$(dirname "$0")/../../"

# Ejecutar solo la prueba mínima
npx jest src/tests/minimal.test.js