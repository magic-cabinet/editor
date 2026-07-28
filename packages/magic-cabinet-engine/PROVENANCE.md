# Magic Cabinet engine provenance

This is the deployable package artifact for `@magic-cabinet/engine` built from:

- Repository: `magic-cabinet/mvp`
- Commit: `69ac3d3772e43498b66283a3c54ebd6fd5f0eade`
  (`feat(engine): package deterministic kitchen core (#1016)`, merged 2026-07-28)
- Bundle SHA-256: `d893cc884c79f9b73e21777d79417f97a74c6db20e11024d144174ffd8675df1`

The solver source remains authoritative in the MVP repository. Pascal consumes
the package's public renderer-neutral contracts and bundled runtime. Update this
artifact by rebuilding and packing that source commit; do not fork the solver in
the Pascal adapter.

## Rebuilding

```bash
git -C <mvp> worktree add --detach /tmp/mvp-engine 69ac3d37
cd /tmp/mvp-engine/apps/web && bun install --frozen-lockfile --ignore-scripts
cd /tmp/mvp-engine/packages/engine
bun build ./src/index.ts --outdir ./dist --target browser --format esm --sourcemap=external
```

The engine's `src/index.ts` re-exports out of `apps/web/src/lib/layout/`, so the
build needs the whole repo at that commit and `apps/web`'s dependencies — not
just `packages/engine`.

## What "reproducible" means here, exactly

The commit this file used to name — `a28b8a0d777cbbbcf7fa1f46a3d2407bb6e5f65e` —
**does not exist**. PR #1016 was squash-merged, so the intermediate branch commit
it recorded was never in the repo's history; `gh api .../commits/a28b8a0d` returns
422 while the merge commit above returns 200.

Rebuilt from `69ac3d37` under **bun 1.3.14**, the bundle is `8d3e5c3e…dba6d4`, not
the hash above. That difference is entirely bundler runtime, not solver source —
diffing the two gives exactly two hunks:

- bun's own `__toESM` interop helper, which gained `WeakMap` caching between the
  version that produced the vendored artifact and 1.3.14
- the trailing `//# debugId=`, which is per-build

Zero lines of solver output differ. So the artifact is faithful to `69ac3d37`;
the hash above is only byte-reproducible under the original bun. Pin the bun
version alongside the commit on the next re-vendor and this stops being a
footnote.
