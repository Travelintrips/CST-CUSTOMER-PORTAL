---
name: Replit configuration persistence
description: Replit environment configurations are represented by the userenv sections in .replit and can be removed by a recovery overwrite.
---

Replit Configurations for this project must remain represented in the `.replit` `userenv` sections, not only in the dashboard view.

**Why:** A recovery checkpoint replaced `.replit` without its `userenv` blocks, which removed the dashboard Configuration entries while leaving Secrets intact.

**How to apply:** Before replacing or restoring `.replit`, preserve the `userenv.shared`, `userenv.development`, and `userenv.production` sections and verify the Configuration entries afterward.