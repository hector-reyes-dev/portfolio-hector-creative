---
title: Tokens de diseño frente a clases utilitarias
description: Cuándo conviene un token propio y cuándo una utilidad suelta, y cómo evitar dos sistemas de diseño conviviendo.
pubDate: 2025-02-19
tags: ['CSS', 'Diseño', 'Tokens']
draft: false
topic: design
---

Los tokens de diseño son el contrato entre el tema y los componentes. Un token como `--app-elevated` o `--card-border` no describe un color: describe un rol. Cambiar el tema es redefinir el rol, no recorrer cada archivo buscando valores.

El problema aparece cuando un proyecto mantiene dos vocabularios a la vez. Si la mitad de la interfaz usa tokens y la otra mitad usa utilidades con colores literales, el modo oscuro se rompe por partes y nadie sabe cuál es la fuente de verdad.

La regla que mejor funciona es simple: los tokens se declaran en el tema y se consumen en los estilos de cada sección. Las utilidades quedan para lo que no es semántico —espaciado, ocultar, alinear— y nunca para el color o la elevación.

Ese reparto también hace que el estilo de una sección sea un archivo legible, con nombres que describen el producto y no la herramienta.
