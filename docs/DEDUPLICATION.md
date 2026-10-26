# 🔎 Source deduplication and variant authority

This page reports **only aggregate decisions** from a more detailed nonpublic source reconciliation. No source-by-source internal filenames, private notes, unpublished review text or historical Git ancestry are copied here.

## Pinned earlier/public implementation overlap

| Comparison class | File paths | Public-admission status |
| --- | ---: | --- |
| Matching path and identical Git blob content | 194 | Deduplicated by identity; not automatically imported |
| Matching path with materially different content | 9 | Seven scoped to their existing public documentation/CI roles; two require manual technical reconciliation |
| Existing public mirror only | 57 | Distinct public-source candidates; no automatic admission |
| Earlier implementation only | 811 | Not in the public mirror; content, rights and dependencies held for individual review |

There are **203 same-path pairs**, of which 194 have identical bytes and nine do not. This establishes *file identity*, not equal behavior across different code versions, and does not authorize bulk publication.

The divergent files were reviewed by role. Some belong specifically to a public CI/browser-verification implementation and should not be replaced by earlier internal tool revisions. Substantial preview-renderer/server divergences remain on hold; selecting whichever version looks newer would be an ungrounded decision. Only a concrete scene migration requiring them should reopen that review.

## Historical scene versions

A previously approved outdoor scene has a **179-piece corrected production representation** and a **181-piece historical representation**. Preserve the older source as archived technical evidence and do not claim it is the latest geometry.

The failed geometry-shell outline and experimental screen-space follow-up are distinct archived renderer studies. They remain independently inspectable research, not new visual-art approvals.

One screened historical **2D SVG character-motion prototype** is reproduced in Sceneology with public, dependency-free playback. Its unsatisfactory visual/motion quality remains documented despite its passing runtime tests.

## Scope and unresolved uncertainty

The selected archived WebGL2 viewers were checked for self-contained source payloads and tested in actual Chrome software WebGL. The public 2D SVG scene was screened and its only third-party script replaced with an authored local timeline sampler, followed by browser behavior tests. These scoped releases have no observed missing runtime assets.

**No project-wide claim is made that all historical media assets, renderers or specifications have complete dependency closure.** Unreviewed source units, uncertain-rights media, and unresolved preview variants remain held. Rights clearance and file-content privacy review must be repeated for any future selected unit, not inherited from this deduplication.

See [source census](SOURCE-CENSUS.md), [migration eligibility](MIGRATION.md), and [browser/release evidence](RELEASE-EVIDENCE.md).
