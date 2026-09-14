---
name: Git lock and provider authentication
description: Recovery rules for stale Git lock files and GitHub provider authentication in this Replit workspace.
---

Treat an `INDEX_LOCKED` Git error as potentially stale metadata, not proof that the repository index is damaged. Check for an active Git process first; only remove a lock file when no Git operation is running, then verify `git status` and the index.

**Why:** A failed remote operation can leave a lock under `.git/refs/remotes/` even when `.git/index.lock` is absent. The repository can remain readable after the lock is removed, while a separate credential-helper problem still causes fetch failures.

**How to apply:** Keep remote URLs token-free. If a GitHub App connection is accepted but shell fetches still use an invalid `GIT_ASKPASS`, diagnose authentication separately from lock cleanup and do not merge or reset when local and remote branches have diverged without explicit approval.