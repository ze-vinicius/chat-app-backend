const express = require("express");
const bodyParser = require("body-parser");
const mongo = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const { ApolloServer } = require("apollo-server-express");
const http = require("http");

const schema = require("./schema/schema");

const PORT = 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = new ApolloServer({
  schema,
});
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

mongo.connect("mongodb://localhost:27017/chat-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});
