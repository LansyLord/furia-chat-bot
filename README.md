🦁 FURIA Chat Bot - Plataforma de Notificações e Informações de Partidas
Aplicação full-stack desenvolvida para oferecer aos fãs da FURIA Esports notificações por e-mail sobre próximas partidas, além de acesso a dados sobre jogadores e confrontos da equipe via integração com a API da PandaScore.

📌 Funcionalidades

🔧 Back-end (Spring Boot)
Cadastro de e-mails para receber notificações de novas partidas.

Envio automático de e-mails com as informações da próxima partida.

Descadastro de e-mails manual via endpoint ou link no e-mail.

API REST para buscar:

Lista e detalhes de jogadores.

Próximas partidas.

Últimas partidas da equipe.

💻 Front-end (Angular)
Formulário para cadastro e remoção de e-mails.

Tela de confirmação de inscrição.

Listagem de próximos e últimos jogos.

Página com informações dos jogadores.

Interface moderna, responsiva e com foco na experiência do torcedor.

🗂 Estrutura do Projeto
furia-chat-bot/
├── backend/
│   ├── src/main/java/com/lansy/project/furia_chat_bot/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── dto/
│   │   ├── model/
│   │   ├── util/
│   │   └── client/
│   └── resources/
│       └── application.properties
├── frontend/
│   └── (projeto Angular)
└── README.md


🚀 Como Executar Localmente
📦 Pré-requisitos
Java 17+

Maven

Node.js

Angular CLI

Conta de e-mail com SMTP habilitado (Gmail, por exemplo)

Chave da API PandaScore

🧪 Backend (Spring Boot)
Configure o arquivo application.properties:

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=seuemail@gmail.com
spring.mail.password=suasenha
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# PandaScore API
pandascore.api.token=SUA_CHAVE_API
pandascore.base.url=https://api.pandascore.co
Execute a aplicação:

cd backend
./mvnw spring-boot:run
Endpoints disponíveis:

Método	Endpoint	Descrição
POST	/api/v1/notificacoes/proxima-partida	Cadastra e notifica novo e-mail
POST	/api/v1/notificacoes/descadastrar	Descadastra e-mail manualmente
GET	/api/v1/check-email?email=	Verifica se um e-mail já está ativo
GET	/api/v1/jogadores	Lista todos os jogadores da FURIA
GET	/api/v1/jogadores/{id}	Detalhes de um jogador específico
GET	/api/v1/partidas/proximas	Próximas partidas da FURIA
GET	/api/v1/partidas/ultimas	Últimas 3 partidas da FURIA

🌐 Front-end (Angular)
Instale dependências e inicie o projeto:


cd frontend
npm install
ng serve
Acesse o app:

http://localhost:4200
📬 Exemplo de E-mail Enviado:

🏆 ESL Pro League - Group Stage

🔥 FURIA vs G2 🔥

📅 Data: 04/05/2025 às 16:00 (Horário de Brasília)
🎥 Transmissão: https://twitch.tv/esl_csgo

⏰ Não perca este jogo eletrizante!

📢 Acompanhe a FURIA nesta batalha épica pelo ESL Pro League!

💛🖤 #GoFURIA 💛🖤

🔔 Você está recebendo esta notificação porque se inscreveu no FURIA Chat Bot.
Descadastre-se clicando aqui: http://localhost:8080/unsubscribe?email=...
⏰ Cron Job Sugerido (verificação automática)

Para envio automático de notificações sobre novas partidas, crie um agendador (@Scheduled) ou configure um cron externo chamando:


notificationService.verificarEEnviarNotificacoes();
🧠 Tecnologias Utilizadas
Spring Boot: REST API, agendamento, envio de e-mail.

Angular: Front-end moderno e responsivo.

PandaScore API: Dados de e-sports.

JavaMailSender: Envio de e-mails com notificações.

Bootstrap / Tailwind (opcional): Estilização do front.
