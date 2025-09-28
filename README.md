# Fastify GPT API

Uma API REST construída com **Fastify** que interage com o modelo GPT da OpenAI.  
Inclui suporte a **histórico de conversas**, limite de mensagens, validação com **Zod** e proteção via **API key**.

---

## 📦 Tecnologias utilizadas

- [Node.js](https://nodejs.org/)
- [Fastify](https://www.fastify.io/)
- [OpenAI SDK](https://www.npmjs.com/package/openai)
- [Zod](https://zod.dev/) para validação de requests
- [Either Monad](https://www.npmjs.com/package/@devmaggioni/either-monad) para tratamento funcional de erros
- [CORS](https://www.npmjs.com/package/@fastify/cors)

---

## ⚡ Funcionalidades

- Endpoint protegido por **API key** (`?apiKey=YOUR_KEY`)
- Suporte a múltiplas versões (`/v1/gpt`)
- Histórico de conversas por usuário (máximo 50 mensagens)
- Retorno estruturado com `Either` (sucesso ou erro)
- Validação de input usando Zod

---

## 🚀 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/devmaggioni/gpt-api
cd gpt-api
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto:

```env
HISTORY_LIMIT=50 (opcional)
PORT=3000
APP_API_KEY=123456789
OPENAI_API_KEY=sua_chave_openai
NODE_ENV=development
```

---

## 🏃‍♂️ Executando a aplicação

```bash
npm run dev
```

O servidor estará rodando em:

```
http://localhost:3000
```

---

## 📌 Endpoints

### POST `/v1/gpt`

- **Query Parameters**:

  - `apiKey` (obrigatório) – chave de acesso à API

- **Body (JSON)**:

```json
{
  "systemPrompt": "Você é um assistente útil.",
  "userPrompt": "Olá, tudo bem?",
  "temperature": 0.6,
  "useMemory": true
}
```

- **Response (sucesso)**:

```json
{
  "response": {
    "role": "assistant",
    "content": "Olá! Estou bem, obrigado por perguntar.",
    "refusal": null,
    "annotations": []
  },
  "history": [
    { "role": "system", "content": "Você é um assistente útil." },
    { "role": "user", "content": "Olá, tudo bem?" },
    {
      "role": "assistant",
      "content": "Olá! Estou bem, obrigado por perguntar."
    }
  ]
}
```

- **Response (erro)**:

```json
{
  "error": "Unauthorized"
}
```

---

## 🔒 Proteção com API Key

Todas as requisições para `/v1/gpt` devem incluir o query param `apiKey`:

```
GET /v1/gpt?apiKey=123456789
```

Se a chave estiver incorreta, o servidor retorna `401 Unauthorized`.

---

## ⚙️ Configurações

- `HISTORY_LIMIT` – número máximo de mensagens salvas no histórico (atualmente 50)
- `APP_API_KEY` – chave da API para proteger endpoints
- `OPENAI_API_KEY` – chave da OpenAI
- `PORT` – porta do servidor

---

## 📂 Estrutura do projeto

```
.
├── routes/
│   └── v1/gpt.ts        # Rotas da API GPT v1
├── agent.ts             # Função talkWithGPT com histórico e cache
├── zodSchemas.ts        # Schemas de validação
├── index.ts            # Inicialização do Fastify
├── .env                 # Variáveis de ambiente
└── package.json
```

---

## 💡 Observações

- O histórico é **armazenado em memória**, então será perdido quando o servidor reiniciar.

---
