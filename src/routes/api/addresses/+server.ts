import { read } from "$app/server";
import type { RequestHandler } from "@sveltejs/kit";
import addressesTree from "$lib/addresses-tree.json?url";

export const GET: RequestHandler = async () => {
  return read(addressesTree);
};
