import { getStore } from "@netlify/blobs";
import { MACHINES, RULES, settings } from "./seed.mjs";

// Shared planner data for the whole team. One small record per job / machine,
// plus one settings record, so two people editing different rows never overwrite each other.
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const newVer = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

async function readAll(store) {
  const out = { jobs: [], machines: [], cfg: null };
  for (const c of ["jobs", "machines"]) {
    const { blobs } = await store.list({ prefix: c + "/" });
    for (let i = 0; i < blobs.length; i += 20) {
      const part = await Promise.all(blobs.slice(i, i + 20).map((b) => store.get(b.key, { type: "json" })));
      part.forEach((d) => d && out[c].push(d));
    }
  }
  out.cfg = await store.get("cfg/main", { type: "json" });
  return out;
}

async function seed(store) {
  for (const m of MACHINES) await store.setJSON("machines/" + m.id, m);
  await store.setJSON("cfg/main", { set: settings(), rules: RULES });
  const v = newVer();
  await store.set("meta/ver", v);
  return v;
}

export default async (req) => {
  const key = process.env.TEAM_KEY;                       // optional team password
  if (key && req.headers.get("x-team-key") !== key) return J({ error: "unauthorized" }, 401);
  const store = getStore({ name: "planner", consistency: "strong" });
  const url = new URL(req.url);

  if (req.method === "GET") {
    let ver = await store.get("meta/ver");
    if (!ver) ver = await seed(store);
    if (url.searchParams.get("ver") === ver) return J({ same: true, ver });
    return J({ ver, ...(await readAll(store)) });
  }
  if (req.method === "POST") {
    let body; try { body = await req.json(); } catch { return J({ error: "bad json" }, 400); }
    for (const o of body.ops || []) {
      if (!["jobs", "machines", "cfg"].includes(o.c) || !/^[A-Za-z0-9_-]{1,64}$/.test(String(o.id))) continue;
      const k = o.c + "/" + o.id;
      if (o.data === null) await store.delete(k); else await store.setJSON(k, o.data);
    }
    const ver = newVer();
    await store.set("meta/ver", ver);
    return J({ ver });
  }
  return J({ error: "method not allowed" }, 405);
};

export const config = { path: "/api/planner" };
