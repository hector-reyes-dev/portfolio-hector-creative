/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'components-no-features',
      comment:
        'src/components/** (atoms/molecules/organisms/templates) es capa de presentación; no debe importar de src/features/**. Si un componente necesita ese comportamiento, invierte la dependencia (prop/callback), inserta una interfaz, o parte el módulo.',
      severity: 'error',
      from: { path: '^src/components' },
      to: { path: '^src/features' }
    }
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    }
  }
};
