import { defineConfig } from 'vite';
import reactRefresh from 'vite-plugin-react-refresh';
import laravel from 'laravel-vite-plugin';
import dotenv from "dotenv";
const env =dotenv.config().parsed||{};
const envKeys = Object.keys(env).reduce((prev, curr) => {
    prev[`process.env.${curr}`] = JSON.stringify(env[curr]);
    return prev;
},{})
export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),
        reactRefresh(),
    ],
    define: {
      ...envKeys,
    },
});

