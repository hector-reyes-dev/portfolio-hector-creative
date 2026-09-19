// Feature: El showcase se puede cargar sin DOM
// @vitest-environment node
//
// Scenario: Importar e invocar el showcase durante un render de servidor
// Given un entorno sin `document`
// When se inicializa el showcase y se ejecuta su limpieza
// Then ninguna de las dos operaciones falla ni toca el DOM

import { describe, expect, it } from 'vitest';
import { initProjectShowcase } from './init';

describe('Showcase de proyectos sin DOM', () => {
  it('se inicializa como no-op en lugar de fallar', () => {
    const cleanup = initProjectShowcase();

    expect(() => cleanup()).not.toThrow();
  });
});
