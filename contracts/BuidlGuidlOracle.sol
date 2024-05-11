// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./BGMember.sol";

contract BuidlGuidlOracle is Ownable {
  bytes32 public addressesRoot;
  bytes32 public buidlersRoot;

  using MerkleProof for bytes32[];

  constructor(bytes32 _addressesRoot, bytes32 _buidlersRoot) Ownable(msg.sender) {
    addressesRoot = _addressesRoot;
    buidlersRoot = _buidlersRoot;
  }

  function updateRoots(bytes32 _addressesRoot, bytes32 _buidlersRoot) public onlyOwner {
    addressesRoot = _addressesRoot;
    buidlersRoot = _buidlersRoot;
  }

  function isMember(bytes32[] memory _proof, address _member) public view returns (bool) {
    return _proof.verify(addressesRoot, keccak256(abi.encodePacked(_member)));
  }

  function verifyBuidler(bytes32[] memory _proof, BGMember.Member memory _buidler) public view returns (bool) {
    bytes32 _leaf = BGMember.memberStructToLeaf(_buidler);
    return _proof.verify(buidlersRoot, _leaf);
  }
}

