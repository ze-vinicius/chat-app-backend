const graphql = require("graphql");

import SubscriptionType from "./subscriptions";
import MutationType from "./mutations";
import RootQueryType from "./querys";

const { GraphQLSchema } = graphql;

module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
});
