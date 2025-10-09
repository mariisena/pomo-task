# Base Playwright com Chromium já incluído
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci --silent

# Instala navegadores do Playwright (Chromium)
RUN npx playwright install --with-deps chromium

# Copia o resto dos arquivos
COPY . .

# Build da extensão para dist/
RUN npm run build

# Comando padrão
CMD ["npm", "test"]
