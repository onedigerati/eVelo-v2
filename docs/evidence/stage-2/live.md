# Stage 2 · Live check
Deploy run: https://github.com/onedigerati/eVelo-v2/actions/runs/45550785170 (success, head d0d1d14). Live site: https://onedigerati.github.io/eVelo-v2/

`node live.mjs` against the live site, Playwright Chromium, 2026-11-24:
```
2560 landing .landing__frame width=2400 scroll=2560/2560
2560 #plan .workspace width=2400 scroll=2560/2560
2560 #atlas .page.page--atlas width=2355.2 scroll=2560/2560
2560 #atlas .topbar__inner width=2400 scroll=2560/2560
1440 landing .landing__frame width=1280 scroll=1440/1440
1440 #plan .workspace width=1440 scroll=1440/1440
1440 #atlas .page.page--atlas width=1200 scroll=1440/1440
1440 #atlas .topbar__inner width=1440 scroll=1440/1440
```
The live site matches the verified build: wide frames at 2560, unchanged at 1440, no horizontal scroll.
