import type { RequestHandler } from "@sveltejs/kit";
import type { Config } from "@sveltejs/adapter-vercel";
import { update } from "$scripts/update";

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

  await update();

  return new Response(
    JSON.stringify({
      status: 200,
      body: "OK",
    }),
  );
};
