---
title: "Research existing open-source breath sensor hardware"
labels: [research, hardware]
---
## Goal
Before anyone builds hardware, find out what already exists.

## Questions
- Are there open-source / open-hardware breath analyzers or VSC (volatile sulfur compound) monitors?
- Which sensors do hobby projects use (e.g. electrochemical H₂S cells, metal-oxide gas sensors)? What do they measure, and what do they miss?
- How do projects handle sampling: mouthpiece, chamber, flow, humidity?

## Output
A short summary as a comment, or a PR adding a "Hardware landscape" section to `docs/RESEARCH.md`, with links. A table is ideal:

| Project / sensor | Gases | Range | Interface | Cost | Notes |
|---|---|---|---|---|---|

No hardware experience is required. Careful searching and honest notes are enough.
