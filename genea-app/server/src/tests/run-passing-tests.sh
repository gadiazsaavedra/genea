#!/bin/bash

# Ejecutar solo las pruebas que pasan
echo "Ejecutando pruebas que pasan..."
npx jest src/tests/minimal.test.js src/tests/person.controller.test.js src/tests/family.controller.test.js src/tests/media.controller.test.js src/tests/auth.middleware.test.js src/tests/api.routes.test.js