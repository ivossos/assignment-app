# 🚀 Deploy para Google Cloud Run

Sistema completo de Call Center com IA pronto para deploy em produção.

## 📋 Pré-requisitos

1. **Google Cloud Account** com projeto criado
2. **Google Cloud SDK** instalado
3. **Docker** instalado (opcional, Cloud Build fará o build)
4. **OpenAI API Key** configurada

## 🔧 Configuração Inicial

### 1. Instalar Google Cloud SDK
```bash
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Baixe o instalador em: https://cloud.google.com/sdk/docs/install
```

### 2. Autenticar no Google Cloud
```bash
gcloud auth login
gcloud config set project SEU-PROJETO-ID
```

### 3. Habilitar APIs necessárias
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🚀 Deploy Automático

### Opção 1: Script de Deploy (Recomendado)
```bash
# Dar permissão de execução
chmod +x deploy.sh

# Executar deploy
./deploy.sh SEU-PROJETO-ID
```

### Opção 2: Deploy Manual
```bash
# 1. Build da imagem
gcloud builds submit --tag gcr.io/SEU-PROJETO-ID/call-center-ai

# 2. Deploy para Cloud Run
gcloud run deploy call-center-ai \
    --image gcr.io/SEU-PROJETO-ID/call-center-ai \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --timeout 300 \
    --port 8080
```

## ⚙️ Configuração de Variáveis de Ambiente

### No Google Cloud Console:
1. Vá para **Cloud Run** → Seu serviço → **Editar e implementar nova revisão**
2. Vá para **Variáveis de ambiente**
3. Adicione:

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxx
ENVIRONMENT=production
PORT=8080
FLASK_SECRET_KEY=sua-chave-secreta-muito-segura

# Opcional - Twilio (se usar telefonia)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+5511999999999
```

## 🌐 Endpoints Disponíveis

Após o deploy, seu serviço estará disponível em: `https://call-center-ai-xxxxx-xx.a.run.app`

### Principais endpoints:
- **`/`** - Dashboard principal
- **`/chatbot`** - Interface do chatbot com voz
- **`/health`** - Health check para monitoramento
- **`/api/chat`** - API REST para chat
- **`/api/speech/text-to-speech`** - Conversão texto para voz
- **`/api/speech/speech-to-text`** - Conversão voz para texto

## 🔍 Monitoramento

### Logs
```bash
# Ver logs em tempo real
gcloud logs tail projects/SEU-PROJETO-ID/logs/run.googleapis.com%2Fstdout

# Ver logs específicos
gcloud run services logs read call-center-ai --region=us-central1
```

### Métricas
- Acesse **Cloud Console** → **Cloud Run** → Seu serviço → **Métricas**
- Configure alertas em **Cloud Monitoring**

## 🎯 Testes Pós-Deploy

### 1. Health Check
```bash
curl https://seu-servico-url.run.app/health
```

### 2. Teste da API
```bash
curl -X POST https://seu-servico-url.run.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, preciso de ajuda",
    "session_id": "test_123",
    "agent": "triage"
  }'
```

### 3. Teste do Chatbot
Acesse: `https://seu-servico-url.run.app/chatbot`

## 🛡️ Segurança

### Configurações implementadas:
- ✅ Container rodando como usuário não-root
- ✅ Timeouts configurados
- ✅ Limits de memória e CPU
- ✅ HTTPS automático
- ✅ Variáveis de ambiente seguras

### Recomendações adicionais:
1. **Configure IAM** para restringir acesso
2. **Use Cloud Armor** para proteção DDoS
3. **Configure Cloud CDN** para performance
4. **Implemente logging estruturado**

## 📊 Escalabilidade

### Configurações atuais:
- **Memória**: 2GB
- **CPU**: 2 vCPUs
- **Instâncias máximas**: 10
- **Timeout**: 300 segundos
- **Concorrência**: 1000 requests/instância

### Para ajustar:
```bash
gcloud run services update call-center-ai \
    --memory 4Gi \
    --cpu 4 \
    --max-instances 20 \
    --region us-central1
```

## 🔄 CI/CD com Cloud Build

O arquivo `cloudbuild.yaml` está configurado para deploy automático:

1. **Trigger automático** no push para branch main
2. **Build da imagem** via Cloud Build
3. **Deploy automático** para Cloud Run
4. **Rollback automático** em caso de falha

### Configurar trigger:
```bash
gcloud builds triggers create github \
    --repo-name=seu-repositorio \
    --repo-owner=seu-usuario \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml
```

## 🎨 Customização

### Alterar região:
Edite `deploy.sh` e `cloudbuild.yaml` para usar outra região:
```bash
REGION="europe-west1"  # ou us-east1, asia-east1, etc.
```

### Configurar domínio customizado:
```bash
gcloud run domain-mappings create \
    --service call-center-ai \
    --domain call-center.exemplo.com \
    --region us-central1
```

## 🆘 Troubleshooting

### Problemas comuns:

1. **Build falha**:
   ```bash
   # Verificar logs
   gcloud builds log $(gcloud builds list --limit=1 --format="value(ID)")
   ```

2. **Serviço não responde**:
   ```bash
   # Verificar logs do serviço
   gcloud run services logs read call-center-ai --region=us-central1 --limit=50
   ```

3. **Erro de autenticação OpenAI**:
   - Verificar se `OPENAI_API_KEY` está configurada
   - Verificar se a chave tem créditos

4. **Timeout nas requisições**:
   - Aumentar timeout do Cloud Run
   - Verificar performance da aplicação

## 💰 Custos Estimados

### Estimativa mensal (uso médio):
- **Cloud Run**: $10-50/mês
- **Cloud Build**: $5-15/mês
- **Container Registry**: $2-10/mês
- **Cloud Logging**: $5-20/mês

**Total estimado**: $22-95/mês (dependendo do tráfego)

### Otimização de custos:
1. Configure **cold start** adequado
2. Use **regional deployment**
3. Monitore métricas de uso
4. Configure **auto-scaling** apropriado

---

## ✅ Checklist de Deploy

- [ ] Google Cloud SDK instalado e configurado
- [ ] Projeto Google Cloud criado
- [ ] APIs necessárias habilitadas
- [ ] OpenAI API Key obtida
- [ ] Script de deploy executado
- [ ] Variáveis de ambiente configuradas
- [ ] Health check funcionando
- [ ] Testes básicos realizados
- [ ] Monitoramento configurado
- [ ] Domínio customizado (opcional)

🎉 **Seu Call Center AI está no ar e pronto para uso!**