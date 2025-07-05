# SpotSaver - Spotify Canvas Screensaver

Um screensaver elegante que exibe o Canvas do Spotify da música atualmente tocando em tela cheia.

## 🚀 Como usar

### 1. Configuração

1. Clone o repositório:
```bash
git clone <repository-url>
cd spotsaver
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a variável de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua variável SP_DC:
   ```
   SP_DC=seu_valor_do_cookie_sp_dc_aqui
   ```

### 2. Como obter o cookie SP_DC

1. Abra o [Spotify Web Player](https://open.spotify.com) no seu navegador
2. Faça login na sua conta
3. Abra as ferramentas de desenvolvedor (F12)
4. Vá para a aba **Application** (Chrome) ou **Storage** (Firefox)
5. No painel esquerdo, expanda **Cookies** e clique em `https://open.spotify.com`
6. Procure pelo cookie chamado `sp_dc`
7. Copie o valor do cookie (deve começar com "AQ" e ter mais de 50 caracteres)
8. Cole esse valor no arquivo `.env`

### 3. Executar o projeto

```bash
npm run dev
```

4. Acesse `http://localhost:3000` no seu navegador
5. Clique em "Iniciar Canvas" para começar o screensaver

## 🎯 Funcionalidades

- ✅ Autenticação automática com TOTP
- ✅ Busca da música atualmente tocando
- ✅ Exibição do Canvas em tela cheia
- ✅ Transição automática entre múltiplos Canvas
- ✅ Informações da música sobrepostas
- ✅ Controle com tecla ESC para sair
- ✅ Interface responsiva e moderna

## 🔧 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Axios** - Requisições HTTP
- **OTPAuth** - Autenticação TOTP
- **Spotify Web API** - Dados da música

## 📱 Como funciona

O SpotSaver usa uma implementação robusta de autenticação TOTP (Time-based One-Time Password) que simula exatamente como o Spotify Web Player funciona:

1. **Autenticação**: Gera tokens TOTP para autenticar com a API do Spotify
2. **Busca da música**: Obtém a música atualmente tocando via Spotify Web API
3. **Canvas**: Busca os Canvas disponíveis para a música via API interna do Spotify
4. **Exibição**: Reproduz os vídeos Canvas em tela cheia com informações da música

## 🎨 Interface

- **Tela inicial**: Instruções e botão para iniciar
- **Tela do Canvas**: Vídeo em tela cheia com overlay de informações
- **Controles**: ESC para sair, transição automática entre Canvas

## 🔒 Segurança

- O cookie SP_DC é armazenado apenas localmente
- Não há armazenamento de dados sensíveis no servidor
- Autenticação temporária com tokens TOTP

## 🐛 Solução de problemas

### Erro de autenticação
- Verifique se o cookie SP_DC está correto e atualizado
- Certifique-se de que está logado no Spotify Web Player
- Tente obter um novo cookie SP_DC

### Nenhum Canvas disponível
- Nem todas as músicas possuem Canvas
- Verifique se há uma música tocando no Spotify
- Tente com uma música diferente

### Erro de rede
- Verifique sua conexão com a internet
- Certifique-se de que o Spotify Web Player está acessível

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
