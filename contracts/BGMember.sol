// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

library BGMember {
  struct Stream {
    bool hasStream;
    uint256 cap;
    uint256 balance;
    uint256 frequency;
    address streamAddress;
    uint256 lastIndexedBlock;
  }

  struct Member {
    address id;
    Stream stream;
    uint256 builds;
    /// Whether they have each social, stored as a bitmask
    /// 0x01 - telegram
    /// 0x02 - twitter
    /// 0x04 - github
    /// 0x08 - discord
    /// 0x10 - email
    /// 0x20 - instagram
    uint256 socials;
  }

  function memberStructToLeaf(Member memory _member) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(_member.id, _member.stream.cap, _member.stream.balance, _member.stream.frequency, _member.stream.streamAddress, _member.stream.lastIndexedBlock, _member.builds, _member.socials));
  }

  function hasMinBuilds(Member memory _member, uint256 _minBuilds) public pure returns (bool) {
    return _member.builds >= _minBuilds;
  }

  function hasMaxBuilds(Member memory _member, uint256 _maxBuilds) public pure returns (bool) {
    return _member.builds <= _maxBuilds;
  }

  // socials
  function hasTelegram(Member memory _member) public pure returns (bool) {
    return (_member.socials & 0x01) == 0x01;
  }
  function hasTwitter(Member memory _member) public pure returns (bool) {
    return (_member.socials & 0x02) == 0x02;
  }
  function hasGithub(Member memory _member) public pure returns (bool) {
    return (_member.socials & 0x04) == 0x04;
  }
  function hasDiscord(Member memory _member) public pure returns (bool) {
    return (_member.socials & 0x08) == 0x08;
  }
  function hasEmail(Member memory _member) public pure returns (bool) {
    return (_member.socials & 0x10) == 0x10;
  }
  function hasInstagram(Member memory _member) public pure returns (bool) {
    return (_member.socials & 0x20) == 0x20;
  }

  function hasStream(Member memory _member) public pure returns (bool) {
    return _member.stream.hasStream;
  }

  function hasMinStreamBalance(Member memory _member, uint256 _minBalance) public pure returns (bool) {
    return _member.stream.balance >= _minBalance;
  }

  function hasMinStreamCap(Member memory _member, uint256 _minCap) public pure returns (bool) {
    return _member.stream.cap >= _minCap;
  }
}
