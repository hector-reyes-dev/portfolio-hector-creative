---
title: Presupuesto de rendimiento en sitios estáticos
description: Aunque el HTML se genere en el build, el presupuesto de rendimiento se sigue gastando en el cliente.
pubDate: 2024-11-07
tags: ['Rendimiento', 'Astro']
draft: false
topic: engineering
---

Un sitio estático nace con una ventaja enorme: el HTML ya está construido. Esa ventaja se pierde si el cliente descarga JavaScript que reconstruye lo mismo que ya venía en el documento.

El presupuesto útil no se mide en kilobytes abstractos, se mide en decisiones. Generar la estructura en el build, enviar al navegador solo el comportamiento que necesita estado, y no hidratar lo que nunca cambia, cubren la mayor parte del ahorro.

Conviene además fijar el costo de las fuentes y de las imágenes antes de crecer: fuentes locales con `font-display: swap` y dimensiones explícitas en las imágenes evitan los dos saltos de layout más comunes.

La verificación se hace siempre sobre el artefacto compilado, no sobre el servidor de desarrollo, porque las diferencias entre ambos suelen ser justamente las que explican el resultado final.
