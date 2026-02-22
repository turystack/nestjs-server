import path from 'node:path'

import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			fileName: 'index',
			formats: [
				'es',
			],
		},
		rollupOptions: {
			external: [
				'react',
				'react-dom',
				'react/jsx-runtime',
				'@radix-ui/react-slot',
				'lucide-react',
			],
		},
	},
	plugins: [
		react(),
		dts({
			include: [
				'src',
			],
			rollupTypes: true,
			tsconfigPath: './tsconfig.app.json',
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
