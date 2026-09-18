---
title: Animar interfaces con GSAP sin capa de motion
description: Notas sobre animar un elemento de posición y tamaño con una librería imperativa, y sobre respetar la preferencia de movimiento reducido.
pubDate: 2025-05-03
tags: ['Animación', 'GSAP', 'Accesibilidad']
draft: false
topic: engineering
---

Animar un resaltado que se desliza entre pestañas es un caso donde la librería importa poco y la geometría importa mucho. El elemento se posiciona de forma absoluta dentro de un contenedor posicionado, y su `left` y su `width` se calculan a partir de la pestaña activa.

Medir con `offsetLeft` y `offsetWidth` tiene una ventaja sobre `getBoundingClientRect`: los valores ya vienen expresados respecto al contenedor posicionado más cercano, que es exactamente el origen del resaltado. No hay que restar rectángulos ni preocuparse por el scroll en el momento de la medición.

El segundo punto es la accesibilidad. `prefers-reduced-motion` no puede resolverse solo con CSS cuando el movimiento lo produce JavaScript: hay que consultar `matchMedia` antes de decidir entre animar y aplicar el estado final de golpe. La transición se convierte entonces en un extra, nunca en el requisito para que la interfaz quede en el estado correcto.

Cuando el estado visual se aplica igual —con o sin animación— el componente sigue siendo verificable en un entorno sin layout real, porque la aserción es sobre el valor final, no sobre los fotogramas intermedios.
