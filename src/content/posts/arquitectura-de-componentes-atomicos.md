---
title: Arquitectura de componentes atómicos en un sitio real
description: Cómo repartir presentación y comportamiento sin que la carpeta de componentes se convierta en un cajón de sastre.
pubDate: 2025-08-12
tags: ['Arquitectura', 'Astro', 'CSS']
draft: false
topic: engineering
---

Un sistema de componentes atómicos solo funciona si cada capa tiene una responsabilidad clara. Los átomos son presentación pura: reciben props y devuelven marcado. Las moléculas combinan átomos con una intención concreta. Los organismos arman una sección completa del producto.

El comportamiento con estado no pertenece a esas capas. Cuando una sección necesita memoria —qué pestaña está activa, qué filtro está encendido— ese estado vive en un módulo aparte que se enlaza desde la página, no dentro del componente que lo pinta.

Esa separación tiene un efecto secundario valioso: el marcado se puede revisar y estilizar sin abrir un solo archivo de JavaScript, y la lógica interactiva se puede probar contra un fixture de HTML que replica lo que el servidor emite.

La frontera se puede verificar de forma automática con una regla de dependencias. Si los componentes no pueden importar de la capa de comportamiento, la disciplina deja de depender de la memoria de quien escribe el código.
