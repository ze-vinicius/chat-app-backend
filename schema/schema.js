const graphql = require("graphql");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PubSub } = require("apollo-server-express");

const User = require("../models/user");
const Message = require("../models/message");

const pubsub = new PubSub();

const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const MessageType = new GraphQLObjectType({
  name: "messages",
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    text: {
      type: GraphQLString,
    },
    date: {
      type: GraphQLString,
    },
    time: {
      type: GraphQLString,
    },
    users: {
      type: UserType,
      resolve: async (parent, args) => {
        let user = await User.findById(parent.usersId);
        return user;
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "users",
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    username: {
      type: GraphQLString,
    },
    userType: {
      type: GraphQLInt,
    },
    token: {
      type: GraphQLString,
    },
    messages: {
      type: new GraphQLList(MessageType),
      resolve: async (parent, args) => {
        const messages = await Message.find({
          usersId: parent.id,
        });

        return messages;
      },
    },
  }),
});

const NEW_MESSAGE = "NEW_MESSAGE";
const NEW_USER = "NEW_USER";

const SubscriptionType = new GraphQLObjectType({
  name: "Subscription",
  fields: {
    newMessage: {
      type: MessageType,
      subscribe: () => pubsub.asyncIterator([NEW_MESSAGE]),
    },
    newUser: {
      type: UserType,
      subscribe: () => pubsub.asyncIterator([NEW_USER]),
    },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    message: {
      type: MessageType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      resolve: async (parent, args) => {
        return Message.findById(args.id);
      },
    },
    messages: {
      type: new GraphQLList(MessageType),
      resolve(parent, args) {
        return Message.find({});
      },
    },
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLID,
        },
        username: {
          type: GraphQLString,
        },
      },
      resolve(parent, args) {
        return User.findOne().or([
          { _id: args.id },
          { username: args.username },
        ]);
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      },
    },
    verifyToken: {
      type: UserType,
      args: {
        token: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        try {
          const decoded = jwt.verify(args.token, "mysecret");
          const user = await User.findOne({ _id: decoded.id });
          return { ...user._doc, password: null };
        } catch (error) {
          throw err;
        }
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        username: {
          type: new GraphQLNonNull(GraphQLString),
        },
        password: {
          type: new GraphQLNonNull(GraphQLString),
        },
        userType: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      async resolve(parent, args) {
        try {
          const { username, password, userType } = args;
          const existingUser = await User.findOne({ username });

          if (existingUser) {
            throw new Error("Uma conta com esse nome de usuário já existe");
          }

          const hashedPassword = await bcryptjs.hash(password, 10);

          let user = new User(
            {
              username,
              password: hashedPassword,
              userType,
            },
            (err) => {
              if (err) throw err;
            }
          );

          const newUser = user.save();

          pubsub.publish(NEW_USER, { newUser: newUser });

          const token = jwt.sign({ id: user._id }, "mysecret");

          return { token, password: null, ...user._doc };
        } catch (err) {
          throw err;
        }
      },
    },
    login: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        try {
          const { username, password } = args;

          const existingUser = await User.findOne({
            username,
          });

          if (!existingUser) {
            throw new Error("Username incorreto");
          }

          const comparePassword = bcryptjs.compare(
            password,
            existingUser.password
          );

          if (comparePassword) {
            const token = jwt.sign({ id: existingUser._id }, "mysecret");

            return { token, password: null, ...existingUser._doc };
          } else {
            throw new Error("Senha incorreta");
          }
        } catch (err) {
          throw err;
        }
      },
    },
    addMessage: {
      type: MessageType,
      args: {
        text: {
          type: new GraphQLNonNull(GraphQLString),
        },
        date: {
          type: new GraphQLNonNull(GraphQLString),
        },
        time: {
          type: new GraphQLNonNull(GraphQLString),
        },
        usersId: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve(parent, args) {
        let message = new Message({
          text: args.text,
          date: args.date,
          time: args.time,
          usersId: args.usersId,
        });
        const newMessage = message.save();

        pubsub.publish(NEW_MESSAGE, { newMessage: newMessage });
        return newMessage;
      },
    },
    deleteMessage: {
      type: MessageType,
      args: {
        token: { type: new GraphQLNonNull(GraphQLString) },
        messageId: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const decoded = jwt.verify(args.token, "mysecret");
        const user = await User.findOne({ _id: decoded.id });

        if (!user.userType === 2) {
          throw new Error("Você não tem permissão para deletar uma mensagem");
        }

        const removedMessage = Message.findByIdAndDelete(args.messageId);

        if (!removedMessage) {
          throw new Error("Erro ao deletar mensagem.");
        }

        return removedMessage;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
  subscription: SubscriptionType,
});
