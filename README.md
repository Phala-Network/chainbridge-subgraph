# Subgraph for Phala ChainBridge

## Deploying to a Graph node

```console
# install dependencies
$ yarn

# build the project
$ yarn codegen && yarn build

# create this graph on a graph node
$ graph create --node <GRAPH_NODE_ADMIN_ADDRESS> chainbridge

# deploy to the node
$ graph deploy --node <GRAPH_NODE_ADMIN_ADDRESS> --ipfs <IPFS_NODE_ADDRESS> chainbridge
```

## Querying

```graphql
query {
    depositRecords {
        amount
        depositor
        destinationChainId
        destinationRecipient
        nonce
        resourceId
        transaction
    }
    proposals {
        depositNonce
        executedAt
        originChainId
        resourceId
        status
    }
}
```
