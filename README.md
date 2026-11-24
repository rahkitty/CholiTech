# CholiTech

Collar inteligente para perros con tecnología LoRa y aplicación móvil que
detecta cambios de comportamiento y envía alertas preventivas al tutor.

Proyecto del Taller de Diseño en Ingeniería (10148), Facultad de Ingeniería,
Universidad de Santiago de Chile.

## Estado del proyecto

Este repositorio contiene el **prototipo de la aplicación** (mockup
interactivo). Los datos que muestra son de ejemplo. El collar físico y la
conexión LoRa todavía no están implementados.

## Qué incluye la aplicación

- Inicio con índice de bienestar y alertas de conducta
- Sueño, actividad y alimentación
- Métrica de ansiedad y estado de conexión del collar
- Agenda veterinaria y cumplimiento de la Ley 21.020
- Vinculación del collar por QR y acceso compartido entre codueños

## Cómo ejecutarlo

Requisitos: Node.js y pnpm.

    git clone https://github.com/rahkitty/CholiTech.git
    cd CholiTech
    pnpm install
    pnpm dev

Abre http://localhost:5173 en el navegador.

## Tecnologías

React, Vite, Tailwind CSS, Recharts.

## Próximos pasos

- Base de datos y autenticación
- Simulador de collar para generar datos
- Reglas de detección de anomalías
- Integración con una red LoRaWAN
