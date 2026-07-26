// Solo lo usa Jest (Vite no necesita Babel, transforma JSX con esbuild).
// Nombre en .cjs porque package.json tiene "type": "module".
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
