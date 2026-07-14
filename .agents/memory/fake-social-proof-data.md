---
name: Fake social-proof data
description: Why hand-authored seed/demo content must not invent ratings, review counts, or usage stats.
---

Hand-written seed/demo data for a content site (recipes, products, listings) is tempting to dress up with
plausible-looking ratings ("4.8, 412 reviews") to make the UI look populated. This is fabricated data
presented as real user engagement and must be treated the same as any other fake data.

**Why:** Found in this project's original 10 seed recipes — invented ratings/review counts sat alongside
honestly-sourced (0/0) values on later-imported recipes, creating an inconsistent, misleading impression of
real user activity. It also breaks "popular/most rated" sorting once real data (all zero) is introduced,
since the fake numbers used to dominate the ranking.

**How to apply:** Default rating/reviewCount (and similar engagement metrics) to 0/null for any
non-user-generated content. If the UI needs a "no reviews yet" state, build it explicitly (hide the
rating badge when reviewCount is 0) rather than inventing numbers to fill the space. For "popular/featured"
rankings with no real signal yet, use an honest alternative (curation flag, recency) instead of sorting by
fabricated scores.
