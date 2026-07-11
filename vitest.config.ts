import path from 'path';

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.{ts,tsx}'],
    exclude: ['test/**/*/setup*.ts'],
    setupFiles: ['test/unit/setup.test.unit.ts'],
  },
};
