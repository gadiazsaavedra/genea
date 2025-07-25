#!/bin/bash

# Script para crear alias permanente
echo "# Genea License Manager" >> ~/.bashrc
echo "alias genea-licencias='cd /home/gustavo/Documents/dev/genea && node licencias.js'" >> ~/.bashrc

echo "✅ Alias creado!"
echo "Reinicia la terminal o ejecuta: source ~/.bashrc"
echo "Luego solo escribe: genea-licencias"