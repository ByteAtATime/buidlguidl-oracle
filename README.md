# BuidlGuidl Oracle/Authentication

This project is a decentralized oracle that provides a trustless way to verify information about the user's profile in the [BuidlGuidl](https://buidlguidl.com).

## How it works

All the information is stored as two [Merkle trees](https://byteatatime.dev/posts/merkle-trees/): one for the addresses, and one for the full user data. The root of the trees is stored in the smart contract (`/contracts/BuidlGuidlOracle.sol`).

The leaf of the user data tree is a tuple which stores the user's information. When a Merkle proof is requested, it first gets the cached information by address, then creates the leaf data from the cached information and the address, and then generates the proof.

This data is updated by the `/scripts/update.ts` script. This script fetches the user's information from the BuidlGuidl API and updates the Merkle tree, cached user data, and (if there are any changes) the root of the tree.


## Formal Specification

Ideally, the contents of this section should match exactly to both the smart contract and the scripts. However, because ~~I have a horrible memory~~ I'm a human, there might be some discrepancies. If you find any, please let me know by [raising an issue](https://github.com/ByteAtATime/buidlguidl-oracle/issues).

### Data Types

A BuidlGuidl member is represented by the following data structure (here represented as a Solidity `struct`):

```solidity
struct BGStream {
  bool hasStream;
  uint256 cap;
  uint256 balance;
  uint256 frequency;
  address streamAddress;
  uint256 lastIndexedBlock;
}

struct BGMember {
  address id;
  BGStream stream;
  uint256 builds;
  uint256 socials;
}
```

Things to take note:
 - If `member.stream.hasStream` is equal to `false`, then there are no promises as to the rest of the data.
 - `member.socials` is a bitmap representing whether the user has provided a social or not. The mapping is as follows:
   - 0x01: Telegram
   - 0x02: Twitter
   - 0x04: GitHub
   - 0x08: Discord
   - 0x10: Email
   - 0x20: Instagram

### Merkle Tree

In the Merkle tree, each leaf is a hash of the following tuple:

```solidity
[
  member.id, // address
  member.stream.hasStream, // bool
  member.stream.cap, // uint256
  member.stream.balance, // 
  member.stream.frequency,
  member.stream.streamAddress,
  member.stream.lastIndexedBlock,
  member.builds,
  member.socials,
]

[
  address, // member.id,
  bool, // member.stream.hasStream,
  uint256, // member.stream.cap,
  uint256, // member.stream.balance,
  uint256, // member.stream.frequency,
  address, // member.stream.streamAddress,
  uint256, // member.stream.lastIndexedBlock,
  uint256, // member.builds,
]
```

As you can see, this is a "concatenation" of the `BGMember` struct. We have the `memberStructToLeaf` and `memberLeafToStruct` helper functions in the `BuidlGuidlOracle` contract to aid in conversions.

### API

There is an OpenAPI documentation available at `api.yml` which details the API endpoints. The built version of the documentation is available at [https://buidlers.byteatatime.dev/docs.html](https://buidlers.byteatatime.dev/docs.html).

While there are endpoints to fetch the full Merkle tree, this is not recommended as the full tree is over 1MB in size. Instead, the `/api/.../proof` endpoints should be used to fetch the Merkle proof for a specific address.

