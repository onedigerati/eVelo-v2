// Prints a side-by-side table of baseline vs main landing measurements. usage: node summarize.mjs
import fs from 'node:fs'
const b = JSON.parse(fs.readFileSync(new URL('baseline-4c35b8a-measurements.json', import.meta.url)))
const m = JSON.parse(fs.readFileSync(new URL('main-e28c521-measurements.json', import.meta.url)))
const row = (r) => {
  const t = r.svg ? Object.entries(r.svg.text).map(([k, v]) => `${k.replace('story__t ', '')}:${v.screenFs}px(bbox ${v.minBboxH}-${v.maxBboxH})`).join(' ') : '-'
  return `${r.label.padEnd(17)} ${r.theme.padEnd(5)} ${String(r.width).padEnd(4)} topbar(plan)=${r.topbarOnPlan} frame=${r.frame?.w} hero=${r.hero?.w} cols="${r.heroCols}" kids=${r.heroKids.map((k) => k.cls + ':' + k.w).join(',')} story=${r.story?.w}x${r.story?.h} share=${r.storyShareOfHero} plot=${r.plot?.w} svg=${r.svg?.cls} vb=${r.svg?.viewBox} scale=${r.svg?.scale} | sw=${r.scrollWidth} cw=${r.clientWidth} bodySW=${r.bodyScrollWidth} pastEdge=${r.pastEdge} pageH=${r.pageHeight} errors=${r.errors.length}\n    text: ${t}`
}
for (let i = 0; i < m.length; i++) { console.log(row(b[i])); console.log(row(m[i])); console.log() }
