// webpack.mix.js
const mix = require('laravel-mix');

mix.js('resources/js/app.jsx', 'public/js')
   .react()  // Enables React support
//    .sass('resources/sass/app.scss', 'public/css')  // Optional: If you use Sass
   .setPublicPath('public'); // Output directory
