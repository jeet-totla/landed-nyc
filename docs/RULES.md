# Rules and sources

Every rule in `engine.js` maps to a primary source. "Verified" means the text was read on the date shown.
Landed gives information, not legal advice. Laws change, so re-verify before you rely on a rule.

| Rule | What the code checks | Source | Verified |
| --- | --- | --- | --- |
| Security deposit | No deposit or advance above one month's rent | NY General Obligations Law §7-108(1-a)(a) | 2026-10-22 |
| Deposit return | 14 days after move-out to return it or send an itemized statement; otherwise the landlord forfeits any right to retain it | GOL §7-108(1-a)(e) | 2026-10-22 |
| Application fee | At most the lesser of actual cost or $20; waived if you supply a check from the last 30 days | Real Property Law §238-a(1)(b) | 2026-10-22 |
| Late fee | At most the lesser of $50 or 5% of monthly rent, and only after rent is more than 5 days late | RPL §238-a(2) | 2026-10-22 |
| Broker fees | A broker who represents the landlord cannot charge the tenant; an itemized, signed fee disclosure is required before the lease; the listing agent is presumed to act for the landlord | NYC FARE Act, in effect since 2025-06-11 (DCWP FAQ) | 2026-10-22 |
| Good Cause cap | A rent increase is presumptively unreasonable above the lesser of 10% or 5% plus the local CPI change | RPL Article 6-A §216; HPD Good Cause notice | 2026-10-22 |
| Good Cause exemptions | Small landlord (10 or fewer units), certificate of occupancy issued on or after 2009-01-01, rent above 245% of HUD fair market rent | RPL §214; HPD notice | 2026-10-22 |
| 2026 NYC CPI figure | 3.38%, so the cap is 8.38% | DHCR 2026 annual notice (reported by WBNY) | 2026-10-22, confirm on hcr.ny.gov |
| Increase notice | 30, 60 or 90 days' written notice for increases of 5% or more, by length of occupancy | RPL §226-c | 2026-10-22 |
| Rent freeze | 0% for 1- and 2-year leases starting 2026-10-01 to 2027-09-30, rent-stabilized only | NYC Rent Guidelines Board vote of 2026-06-25 (reported by Documented NY) | 2026-10-22, confirm RGB order text |
| Habitability waiver | A tenant cannot waive the warranty of habitability | RPL §235-b | not re-read |
| Reciprocal legal fees | A clause making the tenant pay the landlord's legal fees runs both ways | RPL §234 | not re-read |
| Entry with notice | Reasonable notice before entry except in emergencies | NYC Admin. Code §27-2008 (cited via NY AG guidance) | not re-read |
| Heat season | October 1 to May 31 | HPD heat and hot water page | 2026-10-22 |
| Heat minimums | 6am to 10pm: 68°F inside when outside is below 55°F. 10pm to 6am: 62°F inside regardless of outside | HPD | 2026-10-22 |
| Hot water | At least 120°F, 365 days a year | HPD | 2026-10-22 |
| Heat penalties | $250 to $500 a day for a first heat or hot water violation | HPD | 2026-10-22 |
| Complaints | Tell the landlord first, then 311; anonymous complaints are allowed | HPD | 2026-10-22 |
| Stabilization screen | Rental building with 6 or more apartments built before 1974, not a co-op or condo | 311 article KA-02346 | 2026-10-22 |
| Stabilization via tax benefit | Newer buildings with 421-a or J-51 benefits can be stabilized | HCR guidance | not re-read; shown only as "possible" |
| Rent history request | Online portal, in person, or form REC-1 by mail or email; only the legal tenant or owner can get it | HCR tenant issues page | 2026-10-22 |
| Stabilized tenants | No background-check or renewal processing fees in occupancy; legal fees only if court-ordered | DHCR guidance | not re-read |

Complaint counts on the map (186 total, Brooklyn 67, Queens 46, Manhattan 41) come from Hoodline, 2026-03-18, reporting 311 data. Not independently checked against 311. The Bronx and Staten Island are not itemised.

## Heuristics that are not law

These are labelled as such in the interface.

- Landlords commonly ask for annual income of 40 times monthly rent and a credit score near 700.
- Guarantors commonly need 80 to 100 times monthly rent and live in the tri-state area.
- Third-party guarantor companies commonly charge about one month's rent, non-refundable.
- The vet score weights open Class C violations at 3, Class B at 1.5 and Class A at 0.5 per unit.

## Adding a rule

1. Add a branch in `analyze()` in `engine.js` with `id`, `sev`, `why`, `ask` and `src`.
2. Add the source to the `SRC` table.
3. Add a case to `tests/engine.test.js`.
4. Add a row to the table above with the date you read the source.
