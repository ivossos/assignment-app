# 🚀 Instruções de Deploy - Ergondata Site

## Pré-requisitos
- Docker instalado ([Download aqui](https://www.docker.com/products/docker-desktop))
- Git instalado (opcional)

## Opção 1: Rodar com Docker (Recomendado)

### Passo 1: Extrair o projeto
Se recebeu o arquivo ZIP, extraia em uma pasta.

### Passo 2: Abrir terminal na pasta do projeto
```bash
cd caminho/para/ergondata-site
```

### Passo 3: Iniciar o container
```bash
docker-compose up -d --build
```

### Passo 4: Acessar
Abra o navegador em: **http://localhost:3000**

### Comandos úteis:
```bash
# Ver logs
docker-compose logs -f

# Parar o container
docker-compose down

# Reiniciar
docker-compose restart
```

## Opção 2: Rodar sem Docker (Dev Mode)

### Passo 1: Instalar dependências
```bash
npm install --legacy-peer-deps
```

### Passo 2: Iniciar servidor de desenvolvimento
```bash
npm run dev
```

### Passo 3: Acessar
Abra o navegador em: **http://localhost:3000**

## 🌐 Acesso via Rede Local

Se quiser que outras pessoas na mesma rede WiFi acessem:

1. Descubra seu IP local:
   - **Windows**: `ipconfig` (procure IPv4)
   - **Mac/Linux**: `ifconfig` (procure inet)

2. Compartilhe o link: `http://SEU_IP:3000`
   - Exemplo: `http://192.168.15.8:3000`

## ☁️ Deploy em Produção (Cloud)

### Vercel (Grátis e Rápido)
```bash
npm install -g vercel
vercel
```

### Google Cloud Run
```bash
gcloud run deploy ergondata-site \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Railway (Grátis)
1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Deploy automático!

## 🔧 Variáveis de Ambiente

O arquivo `.env.local` já contém a API key do Google Gemini configurada.

Para usar sua própria key:
1. Obtenha em: https://aistudio.google.com/app/apikey
2. Edite `.env.local`:
```
GOOGLE_GENERATIVE_AI_API_KEY=sua_key_aqui
GEMINI_API_KEY=sua_key_aqui
```

## 📦 Funcionalidades

- ✅ Geração de Blueprints com IA
- ✅ Análise de Dados (CSV/Excel)
- ✅ Dashboard Automático com Recharts
- ✅ 3 Agentes de IA especializados
- ✅ Seção AI First completa
- ✅ Página de Inteligência Contínua

## 🆘 Problemas?

### Container não inicia
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### Erro de porta ocupada
Mude a porta no `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Usar porta 3001 ao invés de 3000
```

### Erro de API Key
Verifique se `.env.local` existe e tem as variáveis corretas.

## 📞 Suporte

Para mais informações: https://github.com/ivossos/assignment-app
