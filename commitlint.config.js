export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'docs', 'style',
        'refactor', 'perf', 'test',
        'build', 'ci', 'chore', 'revert',
      ],
    ],
    'type-case':        [2, 'always', 'lower-case'],
    'type-empty':       [2, 'never'],
    'scope-enum': [
      1,
      'always',
      [
        'domain', 'application', 'adapter',
        'infra', 'config', 'ci', 'deps',
        'lambda', 'mpay',
      ],
    ],
    'scope-case':          [2, 'always', 'lower-case'],
    'subject-empty':       [2, 'never'],
    'subject-full-stop':   [2, 'never', '.'],
    'subject-case':        [2, 'always', 'lower-case'],
    'subject-max-length':  [2, 'always', 72],
    'body-leading-blank':  [2, 'always'],
    'footer-leading-blank':[2, 'always'],
  },
};