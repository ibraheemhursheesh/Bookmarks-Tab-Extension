import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  description:
    "turn your bookmarksbar into a nice-looking UI that facilitates access to bookmarks, providing you with a better browsing experience",
  chrome_url_overrides: {
    newtab: "src/index.html",
  },
  host_permissions: ["<all_urls>"],
  permissions: [
    "bookmarks",
    "storage",
    "unlimitedStorage",
    // "favicon",
  ],
  action: {
    default_title: "My Extension",
  },
});
