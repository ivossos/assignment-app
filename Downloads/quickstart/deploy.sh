#!/bin/bash

# Script de Deploy para Google Cloud Run
# Este script automatiza o processo de deploy do Call Center AI

set -e  # Parar em caso de erro

# Configurações
PROJECT_ID=${1:-"seu-projeto-gcp"}
SERVICE_NAME="call-center-ai"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 INICIANDO DEPLOY DO CALL CENTER AI"
echo "================================================"
echo "📋 Projeto: $PROJECT_ID"
echo "📋 Serviço: $SERVICE_NAME"
echo "📋 Região: $REGION"
echo "================================================"

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK não encontrado. Instale em: https://cloud.google.com/sdk"
    exit 1
fi

# Verificar autenticação
echo "🔐 Verificando autenticação..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Não autenticado no Google Cloud. Execute: gcloud auth login"
    exit 1
fi

# Definir projeto
echo "📁 Configurando projeto..."
gcloud config set project $PROJECT_ID

# Habilitar APIs necessárias
echo "⚙️ Habilitando APIs necessárias..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build da imagem usando Cloud Build
echo "🔨 Iniciando build da imagem..."
gcloud builds submit --tag $IMAGE_NAME

# Deploy para Cloud Run
echo "🚀 Fazendo deploy para Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --timeout 300 \
    --port 8080 \
    --set-env-vars "PORT=8080,ENVIRONMENT=production"

# Obter URL do serviço
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================================"
echo "🌐 URL do Serviço: $SERVICE_URL"
echo "🎤 Chatbot: $SERVICE_URL/chatbot"
echo "📊 API Base: $SERVICE_URL/api"
echo "================================================"
echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "1. Configure variáveis de ambiente no Cloud Console:"
echo "   - OPENAI_API_KEY"
echo "   - TWILIO_ACCOUNT_SID (se necessário)"
echo "   - TWILIO_AUTH_TOKEN (se necessário)"
echo ""
echo "2. Teste o serviço:"
echo "   curl $SERVICE_URL/health"
echo ""
echo "3. Acesse o chatbot em:"
echo "   $SERVICE_URL/chatbot"
echo ""

# Opcional: Configurar domínio customizado
read -p "🌐 Deseja configurar um domínio customizado? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "📝 Digite o domínio (ex: call-center.example.com): " DOMAIN
    if [ ! -z "$DOMAIN" ]; then
        echo "🔗 Configurando domínio customizado..."
        gcloud run domain-mappings create \
            --service $SERVICE_NAME \
            --domain $DOMAIN \
            --region $REGION \
            --platform managed

        echo "✅ Domínio configurado! Configure o DNS:"
        gcloud run domain-mappings describe --domain $DOMAIN --region $REGION --platform managed
    fi
fi

echo ""
echo "🎉 Deploy finalizado! Seu Call Center AI está no ar!"