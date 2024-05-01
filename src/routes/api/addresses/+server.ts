import { read } from "$app/server";
import type { RequestHandler } from "@sveltejs/kit";
import addressesTree from "$lib/addresses-tree.json?url";

export const GET: RequestHandler = async () => {
  const res = await read(addressesTree).blob();

  return new Response(res, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
};
