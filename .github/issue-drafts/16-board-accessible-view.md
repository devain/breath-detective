---
title: "Accessible text/table view of the evidence board"
labels: [good first issue, UX]
---
## Problem
The evidence board (`src/components/EvidenceBoard.jsx`) is a single SVG labelled "Evidence board". Screen-reader users get none of its content, and strength is mostly shown with colour.

## Task
- Add a "Table view" toggle on the board that shows the same data as an HTML table: suspect, evidence %, confidence, status, and each run (#, experiment, response %, strength)
- Make sure strength is never shown with colour alone (the board already prints STRONG/MODERATE/WEAK; keep it that way)

## Done when
- [ ] The table view is keyboard-reachable and readable with a screen reader
- [ ] It works in both themes
