# Pahinga Release 0.1.2

## Build Windows Installer

```bash
pnpm install
pnpm build:win
```

Output installer path:

```text
release/0.1.2/pahinga-0.1.2-setup.exe
```

## Optional Quick Checks

```bash
pnpm lint
pnpm typecheck
```

## Git Steps

```bash
git add package.json docs/release-0.1.2.md
git commit -m "chore: release v0.1.2 build setup"
git push origin main
```
