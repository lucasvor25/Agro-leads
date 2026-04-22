const fs = require('fs');
const path = require('path');

// Caminho onde o arquivo será criado
const envDirectory = path.join(__dirname, 'src', 'environments');
const targetPath = path.join(envDirectory, 'environment.prod.ts');

// Se a pasta não existir (raro), criamos
if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

// Conteúdo do arquivo usando as variáveis de ambiente do Netlify
const envConfigFile = `
export const environment = {
  production: true,
  mapboxToken: '${process.env.mapboxToken || ''}',
  apiUrl: '${process.env.apiUrl || '/api'}'
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`Arquivo de environment gerado em: ${targetPath}`);