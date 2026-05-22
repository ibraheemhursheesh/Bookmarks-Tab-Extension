import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  description:
    "turn your bookmarks into a nice-looking UI that facilitates access to bookmarks, providing you with a better browsing experience",
  chrome_url_overrides: {
    newtab: "src/index.html",
  },
  permissions: ["favicon", "bookmarks", "storage", "unlimitedStorage"],
  host_permissions: ["http://127.0.0.1:3333"],
  icons: {
    "48": "icon48.png",
    "128": "icon128.png",
  },
});
