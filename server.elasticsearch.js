const client = require('./server.client');

/**
 * TODO Ping the CLIENT to be sure 
 * *** ElasticSearch *** is up
 */
client.ping({
  requestTimeout: 30000,
}, function (error) {
  error
    ? console.error('ElasticSearch cluster is down!')
    : console.log('ElasticSearch is ok');
});

function ElasticSearchClient(req) {
  // perform the actual search passing in the index, the search query and the type
  return client.search(req);
}

function ApiElasticSearchClient(req, res) {
  // perform the actual search passing in the index, the search query and the type
  ElasticSearchClient({index: 'account', body: {
		"query": {
		  "match_all": {}
		}
	  }
	})
    .then(r => res.send(r['hits']['hits']))
    .catch(e => {
      console.error(e);
      res.send([]);
    });
}

module.exports = {
  ApiElasticSearchClient,
  ElasticSearchClient
};