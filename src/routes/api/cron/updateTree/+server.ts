import type { RequestHandler } from "@sveltejs/kit";
import type { Config } from "@sveltejs/adapter-vercel";
import { updateTree } from "$scripts/update-tree";

export const config: Config = {
  split: true,
};

export const GET: RequestHandler = async ({ request }) => {
  const authorization = request.headers.get("Authorization");

  if (authorization !== `Bearer ${process.env["CRON_SECRET"]}`) {
    return new Response(
      JSON.stringify({
        status: 401,
        body: "Unauthorized",
      }),
    );
  }

  await updateTree();

  return new Response(
    JSON.stringify({
      status: 200,
      body: "OK",
    }),
  );
};
