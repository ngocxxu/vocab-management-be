import {
  GraphQLID,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { projects, clients } from '../sampleData';

// CLient type
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: '',
  fields: {
    clients: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      resolve: (parent, args) => {
        return clients.find((client) => client.id === args.id);
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
});
