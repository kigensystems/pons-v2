# Run the project on another PC

Use Git with access to the private `kigensystems/pons-v2` repository and Node.js 24 with npm. From the directory where you want to keep the project:

```sh
git clone https://github.com/kigensystems/pons-v2.git
cd pons-v2
npm --prefix frontend install --legacy-peer-deps
npm --prefix frontend run dev
```

Open the local URL printed by Vite. For an existing checkout, preserve any local changes and pull the latest `main` before running `npm --prefix frontend install --legacy-peer-deps`.

The checkout includes the runtime Macintosh GLB, purchased source copies, current Blender files and study renders, fonts, fallback artwork, all `reports-examples/` research files, and `reviews/`. There is no separate model restoration step. Blender is needed only to regenerate or edit the model. Numbered Blender save backups are intentionally excluded; current `.blend` files are included.

## Validate and preview

Run from the repository root:

```sh
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend test
node assets/tools/inspect_macintosh_glb.mjs
npm --prefix frontend run preview
```

The build checks TypeScript and creates the production bundle. Lint checks the code; tests cover screen geometry and camera framing. The GLB inspector checks its structure, embedded image dimensions, geometry, and screen UVs. Preview the printed local URL and confirm the loader finishes and the live Macintosh appears. Check the scene visually on the destination PC: passing these commands does not establish that device's GPU behavior or performance.

## Verify original source copies

The source manifest records byte lengths and SHA256 hashes for the 12 supplied FBX, OBJ, and texture files. In PowerShell, run from the repository root:

```powershell
$sourceRoot = Join-Path (Get-Location) 'assets/source/macintosh-512k/original'
$manifest = Get-Content 'assets/source/macintosh-512k/source-manifest.json' -Raw | ConvertFrom-Json
foreach ($entry in $manifest) {
    $sourceFile = Join-Path $sourceRoot $entry.Path
    if ((Get-Item -LiteralPath $sourceFile).Length -ne $entry.Bytes -or
        (Get-FileHash -LiteralPath $sourceFile -Algorithm SHA256).Hash -ne $entry.SHA256) {
        throw "Source integrity mismatch: $($entry.Path)"
    }
}
"Verified $($manifest.Count) original source files."
```

This verifies the checked-out copies against the recorded manifest; it does not validate licensing. The user's desktop originals are separate and untouched. Asset provenance and optional rebuild instructions are in [the source README](../assets/source/macintosh-512k/README.md).

This is a private development transfer for the owner's other PC. Public deployment and distribution packaging remain deferred.
