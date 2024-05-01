import { read } from "$app/server";
import type { RequestHandler } from "@sveltejs/kit";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { isAddress } from "ethers";
import addressesTree from "$lib/addresses-tree.json?url";

export const GET: RequestHandler = async ({ url }) => {
  const address = url.searchParams.get("address");

  if (!address || !isAddress(address)) {
    return new Response("Invalid address", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const treeData = await read(addressesTree).json();

  const tree = StandardMerkleTree.load(treeData);

  try {
    const proof = tree.getProof([address]);

    return new Response(JSON.stringify(proof), {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Address not found, make sure it is a BuidlGuidl member", {
      status: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
};
