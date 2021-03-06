import gql from 'graphql-tag';
import { execute, overrideResolversInService } from '../execution-utils';

const accounts = {
  name: 'accounts',
  typeDefs: gql`
    type User @key(fields: "id") {
      id: Int!
      name: String
    }
    extend type Query {
      me: User
    }
  `,
  resolvers: {
    Query: {
      me: () => ({ id: 1, name: 'Martijn' }),
    },
  },
};

it('executes a query plan over concrete types', async () => {
  const me = jest.fn(() => ({ id: 1, name: 'James' }));
  const localAccounts = overrideResolversInService(accounts, {
    Query: { me },
  });

  const query = gql`
    query GetUser {
      me {
        id
        name
      }
    }
  `;
  const { data, queryPlan } = await execute([localAccounts], {
    query,
  });

  expect(data).toEqual({ me: { id: 1, name: 'James' } });
  expect(queryPlan).toCallService('accounts');
  expect(me).toBeCalled();
});
