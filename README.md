<p align="center"><img src="assets/logo.svg" width="96" alt="Landed logo"></p>

# Landed

Protection for New York City renters, from the first message to the last month.

Paste or upload a lease, rider, listing, renewal offer or an agent's message. Landed checks every fee and clause against New York law, shows the rule behind each flag, and drafts the reply or complaint. Rules decide; AI only reads messy text and writes your reply.

Built in one day for the NYC Founders Challenge.


## Tools

**Before you sign**
- Lease and listing checker: fees, deposits, clauses and scam patterns, with citations. Accepts pasted text, text files, PDFs with selectable text, and photos (read by Claude).
- Vet landlord and broker: looks the building up live in HPD (violations, complaints, litigation, registered owner) and the broker in the state licence database, then reads the result in plain English.
- True move-in cost: compares income, personal guarantor, guarantor company and prepaid rent.
- Renter passport: builds a document package and cover note for people with no US credit history.

**After you've signed**
- Renewal check: Good Cause cap for market-rate apartments, rent freeze for stabilized ones.
- Fee audit: finds fees NYC does not allow and drafts a DCWP, Attorney General or DHCR complaint.
- Deposit clock: 14-day countdown and a reminder or demand letter.

## Run it

It is a static site. Open `index.html` in a browser, or serve the folder with any static host.

```
python3 -m http.server 8000
```

`python3 build.py` inlines `engine.js` into `dist/landed.html`, a single file that works on hosts that only accept one page.

## Test

```
npm test
```

## Layout

| File | What it is |
| --- | --- |
| `engine.js` | The rules engine. Pure functions, no DOM. Every rule has its citation beside it. |
| `lookup.js` | Live HPD and licence lookups against NYC Open Data and data.ny.gov. |
| `index.html` | The site: design tokens, sections, tool UI. |
| `docs/RULES.md` | Each rule, its source and the date it was last verified. |
| `tests/engine.test.js` | Engine checks against the sample cases. |
| `assets/logo.svg` | The Landed mark. |

## Limits

- Information, not legal advice. Check `docs/RULES.md` and the linked statutes before relying on a result.
- Live lookups call NYC Open Data and data.ny.gov straight from the browser. They work when Landed is opened from a normal page (locally or on GitHub Pages) and are blocked inside some embedded views, where you can still enter counts by hand. HPD matches addresses literally, so use the street as HPD spells it. The state dataset lists brokers and brokerages, not individual salespeople.
- Units per building are not in these datasets and are entered by hand.
- Photo reading needs Claude; without it, paste the text.

