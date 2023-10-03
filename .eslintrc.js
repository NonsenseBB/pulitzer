module.exports = {
  'root': true,
  'parser': '@typescript-eslint/parser',
  'extends': [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:@typescript-eslint/recommended',
  ],
  'plugins': [
    '@typescript-eslint',
  ],
  'env': {
    'node': true,
  },
  'parserOptions': {
    'ecmaVersion': 2022,
  },
  'settings': {
    'import/extensions': [
      '.js',
      '.ts',
    ],
    'import/resolver': {
      'node': {
        'extensions': [
          '.js',
          '.ts',
        ],
      },
    },
  },
  'ignorePatterns': [
    'vitest.config.mts', // FIXME: re-enable this file (issue with import/no-unresolved)
    'node_modules',
    'build/',
    'src/**/*.generated.*',
  ],
  'rules': {
    'semi': [
      'warn',
      'never',
    ],
    'indent': [
      'warn',
      2,
      {
        'SwitchCase': 1,
        'VariableDeclarator': 'first',
        'outerIIFEBody': 1,
        'FunctionDeclaration': {
          'parameters': 1,
          'body': 1,
        },
        'FunctionExpression': {
          'parameters': 1,
          'body': 1,
        },
        'CallExpression': {
          'arguments': 1,
        },
        'ArrayExpression': 1,
        'ObjectExpression': 1,
        'ImportDeclaration': 1,
        'flatTernaryExpressions': false,
        'ignoredNodes': [
          'JSXElement',
          'JSXElement > *',
          'JSXAttribute',
          'JSXIdentifier',
          'JSXNamespacedName',
          'JSXMemberExpression',
          'JSXSpreadAttribute',
          'JSXExpressionContainer',
          'JSXOpeningElement',
          'JSXClosingElement',
          'JSXFragment',
          'JSXOpeningFragment',
          'JSXClosingFragment',
          'JSXText',
          'JSXEmptyExpression',
          'JSXSpreadChild',
        ],
        'ignoreComments': false,
      },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'no-plusplus': 'off',
    'object-curly-newline': [
      'error',
      {
        'ObjectExpression': {
          'minProperties': 6,
          'multiline': true,
          'consistent': true,
        },
        'ObjectPattern': {
          'minProperties': 6,
          'multiline': true,
          'consistent': true,
        },
        'ImportDeclaration': {
          'minProperties': 6,
          'multiline': true,
          'consistent': true,
        },
        'ExportDeclaration': {
          'minProperties': 6,
          'multiline': true,
          'consistent': true,
        },
      },
    ],
    'prefer-const': 'error',
    'import/prefer-default-export': 'off',
    'import/no-named-as-default': 'off',
    'import/no-unresolved': [
      'error',
      {
        'ignore': [
          '.*\\.generated(\\..+)?',
        ],
      },
    ],
    'no-console': 'error',
    'consistent-return': 'off',
    'import/order': [
      'warn',
      {
        'newlines-between': 'always',
        'groups': [
          [
            'builtin',
            'external',
          ],
          'parent',
          'sibling',
          'index',
        ],
      },
    ],
    'import/no-deprecated': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        'prefer': 'type-imports',
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/indent': [
      'warn',
      2,
      {
        'SwitchCase': 1,
        'VariableDeclarator': 'first',
        'outerIIFEBody': 1,
        'FunctionDeclaration': {
          'parameters': 1,
          'body': 1,
        },
        'FunctionExpression': {
          'parameters': 1,
          'body': 1,
        },
        'CallExpression': {
          'arguments': 1,
        },
        'ArrayExpression': 1,
        'ObjectExpression': 1,
        'ImportDeclaration': 1,
        'flatTernaryExpressions': false,
        'ignoredNodes': [
          'JSXElement',
          'JSXElement > *',
          'JSXAttribute',
          'JSXIdentifier',
          'JSXNamespacedName',
          'JSXMemberExpression',
          'JSXSpreadAttribute',
          'JSXExpressionContainer',
          'JSXOpeningElement',
          'JSXClosingElement',
          'JSXFragment',
          'JSXOpeningFragment',
          'JSXClosingFragment',
          'JSXText',
          'JSXEmptyExpression',
          'JSXSpreadChild',
        ],
        'ignoreComments': false,
      },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        'functions': false,
        'classes': false,
        'variables': true,
        'enums': true,
        'typedefs': true,
        'ignoreTypeReferences': true,
      },
    ],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
  },
}
