import "@/utils/loadEnv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { api } from "@/api";

const app = new Hono();

app.route("/api", api);

serve(
  {
    fetch: app.fetch,
    port: 3200,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
