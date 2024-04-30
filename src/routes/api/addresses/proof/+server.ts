import { read } from "$app/server";
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "@sveltejs/kit";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { isAddress } from "ethers";

const ADDRESSES_TREE_PATH = "/" + (env["ADDRESSES_TREE_PATH"] ?? "addresses-tree.json");

export const GET: RequestHandler = async ({ url }) => {
  const address = url.searchParams.get("address");

  if (!address || !isAddress(address)) {
    return new Response("Invalid address", { status: 400 });
  }

  const treeData = await read(ADDRESSES_TREE_PATH).json();

  const tree = StandardMerkleTree.load(treeData);

  try {
    const proof = tree.getProof([address]);

    return new Response(JSON.stringify(proof));
  } catch {
    return new Response("Address not found, make sure it is a BuidlGuidl member", { status: 404 });
  }
};
