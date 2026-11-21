// The per-plan paragraph for each walkthrough chapter (docs/PLAN.md stage 2). Pure: no DOM, no React.
// STUB: the foundation's placeholder; the story builder replaces the body, keeping the signature
// (ChapterStoryFn in walkthrough.ts).

import type { ChapterStoryFn } from './walkthrough'

export const chapterStory: ChapterStoryFn = (chapter, years) => {
  const a = years[chapter.from]?.age
  const b = years[chapter.to]?.age
  const ages = a === b ? `age ${a}` : `ages ${a}–${b}`
  return {
    income: { title: chapter.name, figure: ages, text: 'Story to come.' },
    evelo: { title: chapter.name, figure: ages, text: 'Story to come.' },
  }
}
