const fs = require('fs');
const path = require('path');

const envDirectory = path.join(__dirname, 'src', 'environments');

// Criar a pasta se não existir
if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

// 1. Criar o environment.prod.ts (Com as chaves do Netlify)
const prodPath = path.join(envDirectory, 'environment.prod.ts');
const prodConfig = `export const environment = {
  production: true,
  mapboxToken: '${process.env.mapboxToken || ''}',
  apiUrl: '${process.env.apiUrl || '/api'}'
};`;

// 2. Criar o environment.ts (Arquivo base que o Angular exige)
const devPath = path.join(envDirectory, 'environment.ts');
const devConfig = `export const environment = {
  production: false,
  mapboxToken: '',
  apiUrl: '/api'
};`;

fs.writeFileSync(prodPath, prodConfig);
fs.writeFileSync(devPath, devConfig);

console.log('Arquivos de environment (dev e prod) gerados com sucesso!');