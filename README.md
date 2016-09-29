# Redundant Peer

Offers a redundant networking layer for spreading the Blockchain, as an alternative to the Bitcoin peer to peer network.

Redundant Peers have three optional, configurable roles:

1. Service Blockchain Requests
2. Push Blockchain Data
3. Retrieve and import Blockchain Data

## Install And Run Service

    $ npm install
    $ npm start

## Configure Service

Create a ./credentials.json file next to the service.js file.

Set strings *bitcoin_core_rpc_password* and *bitcoin_core_rpc_user* if a local Core instance is present. Set *cache_peers* to an array with *host* and *secret* strings to push blockchain data at caching instances. Set *remote_peers* to an array of strings to poll blockchain data from remote peers.

    {
      "bitcoin_core_rpc_password": "$rpcPassword",
      "bitcoin_core_rpc_user": "$rpcUser",
      "cache_peers": [{
        "host": "https://service-to-push-to.example.com",
        "secret": "$serviceSecret"
      }],
      "remote_peers": ["https://service-to-poll.example.com"]
    }

## Light Weight Cache Mode

A peer may be run without an instance of Bitcoin Core, in that case, it operates as a light weight caching service and only makes a best effort to sync the Blockchain.

This mode is designed purely with the intent that the peer may be run on an inexpensive server or over many weak instances. As small as possible set of requirements should apply when configured to simply spread the Blockchain data.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://heroku.com/deploy?template=https://github.com/HackerResidency/redundant-peer/)

## Personal Mode

A peer may be run without servicing Blockchain requests or pushing data to other peers. This operates as a greedy Blockchain data sync service and does not contribute to the network.

The basic idea of this is so that a user can opt-out of the Bitcoin p2p network, but still keep up-to-date with the Blockchain, or continue to use the Bitcoin p2p network but add diversity to their set of Blockchain data sources.

## Bridge Mode

A peer may be run without servicing Blockchain requests or retrieving data from other peers.

This can be used for two types of bridging: populating light weight cache nodes with Blockchain data, and populating the redundant-peer network with Bitcoin Network data.

Bridges can be combined with caches to take advantage of specialized inexpensive hardware and service offerings. A few cheap Raspberry pis can be configured to sync the Blockchain, push the data to the cache servers, which are can be free webhosts like Amazon EC2 free tier, RedHat OpenShift or Heroku. 

