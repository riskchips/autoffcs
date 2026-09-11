import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    obfuscatorPlugin({
      include: ['src/FacultyRatings.jsx'],
      exclude: [/node_modules/],
      apply: 'build',
      debugger: false,
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        identifierNamesGenerator: 'hexadecimal',
        numbersToExpressions: true,
        simplify: true,
        splitStrings: true,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: 'variable',
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
      }
    })
  ],
  envPrefix: ['VITE_', 'TURNSTILE_', 'ENCRYPTION_KEY'],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3000'
    }
  }
})
