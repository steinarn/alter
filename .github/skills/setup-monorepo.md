# Skill: Setup Monorepo

When asked to add a new package or app to the monorepo:

1. Create the directory under `apps/` or `packages/`.
2. Add `package.json` with `name: "@alter/<name>"`, `private: true`.
3. Extend the appropriate tsconfig from `@alter/config-typescript`.
4. Add `typecheck` script: `"tsc --noEmit"`.
5. If it has build output, add `"build": "tsc"` and set `outDir: "dist"` in tsconfig.
6. Add the package as a workspace dependency where needed: `"@alter/<name>": "workspace:*"`.
7. Run `pnpm install` to link.
