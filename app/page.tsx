import { readFile } from "node:fs/promises";
import path from "node:path";
import SiteClient from "./site-client";

export default async function HomePage() {
  const markup = await readFile(path.join(process.cwd(), "public", "site-content.html"), "utf8");
  return <SiteClient markup={markup} />;
}
