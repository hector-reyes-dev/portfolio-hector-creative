---
title: Contenido tipado con content collections
description: Validar el frontmatter en el build convierte errores de contenido en errores de compilación.
pubDate: 2024-03-14
tags: ['Astro', 'Contenido', 'Tipado']
draft: false
topic: engineering
---

Cuando el contenido vive en markdown, el frontmatter es una interfaz sin tipos. Validarlo con un esquema no es burocracia: es lo que evita que un campo faltante llegue a producción disfrazado de texto vacío.

Los esquemas compartidos entre colecciones reducen la duplicación. Un mismo bloque de campos —título, descripción, fecha, etiquetas— sirve para notas, proyectos y experimentos, y cada colección añade lo que le es propio.

El estado de borrador merece un tratamiento explícito. Filtrar en el momento de construir la lista deja el contenido a medio escribir dentro del repositorio sin que aparezca en el sitio, y convierte la publicación en un cambio de un solo campo.

La ventaja se nota cuando el contenido crece: el build falla antes que el visitante.
