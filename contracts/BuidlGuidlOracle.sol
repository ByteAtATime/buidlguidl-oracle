// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract BuidlGuidlOracle is Ownable {
  bytes32 public root;

  using MerkleProof for bytes32[];

  constructor(bytes32 _root) Ownable(msg.sender) {
    root = _root;
  }

  function setRoot(bytes32 _root) public {
    root = _root;
  }

  function isMember(bytes32[] memory _proof, address _member) public view returns (bool) {
    return _proof.verify(root, keccak256(abi.encodePacked(_member)));
  }
}

