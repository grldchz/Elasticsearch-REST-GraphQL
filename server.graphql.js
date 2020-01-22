const {ElasticSearchClient} = require('./server.elasticsearch');
const {makeExecutableSchema} = require('graphql-tools');
// Construct a schema, using GraphQL schema language
const typeDefs = `
  type Account {
    account_number: Int
    address: String
    age: Int
    balance: Float
	city: String
	email: String
	employer: String
	firstname: String
	gender: String
	lastname: String
	state: String
	pokemon(id: Int): Pokemon
  }
  type Query {
    accounts: [Account]
	aggregate(index: String!, aggregate: String!): [Aggregation]
	query(index: String!, query: String!): [Account]
  }
  type Aggregation {
	  key: String
	  doc_count: Int
  }
  type Pokemon {
	  name: String
	  id: Int
	  forms: [PokemonForm]
  }
  type PokemonForm {
	  name: String
	  url: String
  }
`;

// The root provides a resolver function for each API endpoint
const resolvers = {
  Query: {
    accounts: () => new Promise((resolve, reject) => {
      ElasticSearchClient({index: "account", body: {
		  "query": {
			"match_all": {}
		  }
	    }})
        .then(r => {
          let _source = r['hits']['hits'];
              _source.map((item, i) => _source[i] = item._source);

          resolve(_source);
        });
    }),
    aggregate: (parent, {index, aggregate}) => new Promise((resolve, reject) => {
	  const agg = JSON.parse(aggregate);
      ElasticSearchClient({index, body: agg})
        .then(r => {
          let _source = r['aggregations']['values']['buckets'];
          resolve(_source);
        });
    }),
    query: (parent, {index, query}) => new Promise((resolve, reject) => {
	  const queryObj = JSON.parse(query);
      ElasticSearchClient({index, body: queryObj})
        .then(r => {
          let _source = r['hits']['hits'];
              _source.map((item, i) => _source[i] = item._source);

          resolve(_source);
        });
    })
  },
  Account:{
    pokemon: (parent, num, {dataSources}) => new Promise((resolve, reject) => {
      dataSources.pokemonAPI.getPokemanByID(parent.account_number)
        .then(r => {
          resolve(r);
        });
    }),
	
  }
};

module.exports = makeExecutableSchema({
  "typeDefs": [typeDefs],
  "resolvers": resolvers
});