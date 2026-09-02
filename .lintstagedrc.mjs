export default {
  ignore: [
    '.agents/**',
    '.claude/**',
    '.github/**',
    '.playwright-mcp/**',
    'docs/**',
    'CLAUDE.md',
    'skills-lock.json',
  ],
  '*.{htm?(l),css,scss,sass,less,js?(x),json,md}': ['prettier --write'],
  '*.ts?(x),vue': ['eslint', 'prettier --write'],
}
