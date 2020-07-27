# ChatApp
Backend do aplicativo web de chat em tempo real desenvolvido para um desafio.
O app consiste basicamente de enviar e receber mensagens em tempo real em uma espécie de "grupo público", 
os usuários do tipo administrador podem, além de enviar e receber mensagens, filtrar e apagar mensagens de outros usuários.

# O projeto
- [frontend](https://github.com/jbsaraiva/chat-app-frontend)
- [backend](https://github.com/jbsaraiva/chat-app-backend)

# GraphQL Schema
```graphql
schema {
  query: RootQueryType
  mutation: Mutation
  subscription: Subscription
}

type messages {
  _id: ID
  text: String
  createdAt: String
  usersId: ID
  usersUsername: String
  users: users
}

type updatechat {
  messageId: String
  message: messages
  mutationType: String
}

type users {
  _id: ID
  username: String
  userType: Int
  lastseen: String
  token: String
  messages: [messages]
}

type Mutation {
  signUp(username: String!, password: String!, userType: Int!): users
  signIn(username: String!, password: String!): users
  updateLastSeen: users
  sendMessage(text: String!): messages
  deleteMessage(messageId: String!): messages
}


type RootQueryType {
  message(id: ID): messages
  messages(sort: String, username: String, createdAt: String): [messages]
  user(id: ID, username: String): users
  currentUser: users
  users: [users]
}

type Subscription {
  newMessage: messages
  deleteMessage: messages
  updateChat: updatechat
  addOnlineUser: users
  newUser: users
}
```

# Instalação

```bash
> npm install
```

# Inicialização
Precisa ter o mongodb rodando na máquina.

```bash
> npm start
```

# Requisitos 
- [x] Cadastrar usuários.
- [x] Salvar novas mensagens no banco de dados.
- [x] Enviar atualizações para o frontend quando uma mensagem for adicionada ou excluída.
- [x] Enviar atualização de estado do usuário para os outros usuários.
- [x] Autenticação com jwt.
- [x] Filtrar mensagens.

# Próximas etapas
- [ ] Adicionar filtro à subscription de novas mensagens para que o usuário que filtrar no frontend, receba também as atualizações filtradas.

# Author

José Vinícius - [josevsaraiva@gmail.com](josevsaraiva@gmail.com) 

# Principais tecnologias utilizadas
- Express 
- Graphql
- Mongodb
