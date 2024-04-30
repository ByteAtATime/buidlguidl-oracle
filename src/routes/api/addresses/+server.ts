import { read } from "$app/server";
import type { RequestHandler } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const ADDRESSES_TREE_PATH = "/" + (env["ADDRESSES_TREE_PATH"] ?? "addresses-tree.json");

export const GET: RequestHandler = () => {
  return read(ADDRESSES_TREE_PATH);
};
