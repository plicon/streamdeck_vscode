# TODO

## Marketplace & Identity

- [ ] Create an account on the [Elgato Marketplace](https://marketplace.elgato.com/) and register as a plugin developer
- [ ] Create a VS Code Marketplace publisher account at [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
- [ ] Choose a new plugin UUID namespace (e.g., `com.plicon.streamdeckvsc`) to replace `com.nicollasr.streamdeckvsc`
- [ ] Once accounts are set up, update the following across the codebase:
  - [ ] Rename `.sdPlugin` folder from `com.nicollasr.streamdeckvsc.sdPlugin` to the new UUID
  - [ ] Update `UUID` field in `manifest.json`
  - [ ] Update all action UUIDs in `manifest.json` (e.g., `com.nicollasr.streamdeckvsc.executecommand`)
  - [ ] Update all `@action({ UUID: ... })` decorators in `packages/streamdeck-plugin/src/actions/*.ts`
  - [ ] Update `main` and `pack` script paths in `packages/streamdeck-plugin/package.json`
  - [ ] Update `publisher` field in `packages/vscode-extension/package.json`
  - [ ] Update `ExtensionId` in `packages/vscode-extension/src/constants.ts`
  - [ ] Update `.gitignore` entry for the `.sdPlugin/bin/` path
  - [ ] Update `CLAUDE.md` references to the `.sdPlugin` directory
  - [ ] Update `README.md` references to the `.streamDeckPlugin` filename and symlink paths
