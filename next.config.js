/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier', '@dimforge/rapier3d'],

  webpack: (config) => {
    // Фикс дублирования React
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   react: path.resolve(__dirname, 'node_modules/react'),
    //   'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    //   'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
    // };

    // Фикс для Node.js специфичных модулей (например, в Three.js)
    config.externals = [
      ...(config.externals || []),
      { canvas: 'canvas' }, // Пример: предотвращает ошибки "canvas is not defined"
      // Можно добавить другие модули:
      // { bufferutil: 'bufferutil' },
      // { 'utf-8-validate': 'utf-8-validate' }
    ];

    return config;
  },
};

module.exports = nextConfig;
