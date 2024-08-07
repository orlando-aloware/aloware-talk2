module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [2, 'always', ['feature', 'fix','hotfix' , 'chore', 'docs', 'refactor', 'revert', 'build', 'test',  'style', 'ci', 'perf', 'conflict', 'cleanup']],
        'scope-case': [2, 'always', 'lower-case']
      },
  };