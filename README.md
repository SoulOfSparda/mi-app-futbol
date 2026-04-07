# ⚽ MiFutbolitoFc

Una aplicación web moderna para seguir las mejores ligas de fútbol, consultar resultados, próximos partidos, tablas de posiciones y biografías de jugadores.

Este proyecto extrae información en tiempo real desde [TheSportsDB](https://www.thesportsdb.com/) y cuenta con un sistema inteligente de "autotraducción" mediante Google Translate, para que disfrutes de toda la información de Europa y Colombia en Español.

## 🚀 Características Principales

- **Resultados y Próximos Partidos**: Fechas, encuentros y resúmenes de la Champions League, Premier League y Liga BetPlay (Apertura y Finalización).
- **Tablas de Posiciones Dinámicas**: Lógica personalizada capaz de armar tablas de 36 equipos para formatos liguilla (como Champions League).
- **Fase Eliminatoria Interactiva (Bracket)**: Vista de llaves (Playoffs, Octavos, Cuartos) generada y estructurada dinámicamente con agregación de marcadores.
- **Zona de Minijuegos Gamificada 🎮**: 
  - *Maestro de Champions*: Trivia histórica con ranking de puntaje basado en rachas.
  - *Adivina el Escudo*: Desafío contra reloj tipo silueta usando filtros avanzados para adivinar el club.
- **Detalle de Equipos**: Descripciones dinámicas en español, escudos, uniformes e información de fundación.
- **Biografía de Jugadores**: Fotografía, dorsal, equipo y detalles físicos de los jugadores de cada equipo.
- **Horarios Locales**: El código lee automáticamente la zona horaria de tu computadora para que los partidos se muestren en tu hora local.
- **Buscador de Equipos Global**: Capacidad anti-error 404 usando fallbacks con listados de plantillas o últimos partidos para encontrar a cualquier escuadra mundial.

## 🛠 Instalación y Uso Local

Este es un proyecto construido con [Next.js](https://nextjs.org) (App Router). 

Para comenzar el servidor de desarrollo localmente:

1. Clona el repositorio e instala las dependencias:
```bash
npm install
```

2. Corre el servidor de desarrollo:
```bash
npm run dev
```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador preferido.

## 🌍 Despliegue en Vercel

MiFutbolitoFc está optimizado para funcionar y compilarse directamente en Vercel. Sólo requieres enlazar este repositorio apuntando las configuraciones estándar de Next.js y Vercel se encargará del resto de manera automática.
