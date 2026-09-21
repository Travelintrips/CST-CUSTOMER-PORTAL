"use strict";

import("./dist/index.js").catch((error) => {
  console.error("[customer-portal] failed to start Hostinger runtime", error);
  process.exit(1);
});
