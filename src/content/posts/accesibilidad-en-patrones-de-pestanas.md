---
title: Accesibilidad en patrones de pestañas
description: Qué necesita un tablist para ser usable con teclado y con lector de pantalla, más allá de que se vea bien.
pubDate: 2024-07-22
tags: ['Accesibilidad', 'UI', 'Teclado']
draft: false
topic: engineering
---

Un patrón de pestañas se rompe casi siempre en el mismo punto: el foco. Si todas las pestañas son tabulables, quien navega con teclado tiene que atravesarlas una por una antes de llegar al contenido. Lo correcto es que solo la pestaña activa esté en el orden de tabulación y que las flechas muevan el foco entre ellas.

El segundo punto es el vínculo ARIA. Cada pestaña necesita saber a qué panel controla y cada panel saber qué pestaña lo etiqueta. Con esos dos atributos, el lector de pantalla anuncia la relación sin que el orden del DOM tenga que explicarla.

El tercero es la sincronización: el estado seleccionado y el panel visible tienen que cambiar en el mismo instante. Si el `aria-selected` se actualiza antes que la visibilidad, hay una ventana en la que la interfaz se contradice.

Nada de esto exige una librería. Exige decidir cuál es la fuente de verdad y respetarla en un solo lugar.
