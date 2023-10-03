import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
    },
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    include: [
      '**/*.{test,spec}.?(c|m)[jt]s?(x)',
      '**/__{tests,specs}__/*.?(c|m)[jt]s?(x)',
    ],
  },
})
