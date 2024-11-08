import { defineConfig } from 'vite';
import reactRefresh from 'vite-plugin-react-refresh';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        reactRefresh(),
    ],
});

