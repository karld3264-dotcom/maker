# Genes

## Fixed serialization order

| # | Locus | Alleles | Inheritance | Visible effect | Restrictions |
|---|---|---|---|---|---|
| 1 | Extension | E, e | E dominant, e recessive | e/e = chestnut base; E_ permits black pigment | - |
| 2 | Agouti | A, a | A dominant over a; acts only with E_ | E_ A_ = bay; E_ a/a = black; no effect with e/e | - |
| 3 | Cream | Cr, n | Incomplete dominant | Cr/n single dilution; Cr/Cr double dilution (not lethal) | - |
| 4 | Dun | D, nd1, nd2 | D > nd1 > nd2 | D: dun dilution + primitive markings; nd1: primitive markings only; nd2: no dun effect | - |
| 5 | Silver | Z, n | Dominant | Dilutes black pigment only; no visible silver effect on chestnut | - |
| 6 | Champagne | Ch, n | Dominant | Gold/amber/classic champagne depending on base; pink skin, light eyes | - |
| 7 | Pearl | Prl, n | Recessive | Prl/n: no visible effect; Prl/Prl or Prl+Cr compound dilutes | - |
| 8 | Mushroom | Mu, n | Recessive | Mu/Mu mutes red pigment; no effect from one copy | - |
| 9 | Grey | G, g | G dominant | Progressive greying on any base | - |
| 10 | Tobiano | TO, n | Dominant | White patches crossing the topline; extent varies | - |
| 11 | Frame Overo | O, n | Dominant | Irregular white on sides, neck, belly; O/O = lethal white overo syndrome | O/O: Lethal white overo syndrome (not a viable adult genotype) |
| 12 | Sabino 1 | SB1, n | Incomplete dominant | Variable white: high stockings, face, belly; SB1/SB1 can be near-white | - |
| 13 | Splashed White | SW1, n | SW1 variant; incomplete dominant | Blue eyes, white head/legs; other SW variants not modelled | - |
| 14 | Dominant White | W20, n | W20 variant, dominant | Variable white; viability is variant-specific | W20/W20: No W20 homozygotes documented; viability unknown |
| 15 | Classic Roan | Rn, n | Dominant | White hairs in body, head/lower legs darker | Rn/Rn: Homozygote viability evidence incomplete (embryonic loss suspected) |
| 16 | Leopard Complex | LP, lp | LP dominant (incomplete) | Appaloosa patterns; LP/LP associated with CSNB | - |
| 17 | PATN1 | PATN1, n | Modifier of LP | Modifies LP pattern extent; alone not sufficient for a pattern | - |

## Health flags

| Condition | Genotype | Kind | Severity | Note |
|---|---|---|---|---|
| Lethal white overo syndrome | O/O | deterministic | Lethal | In real genetics O/O foals are born white with a non-functional colon and die within days. When two Frame Overo carriers are crossed each foal has a 25% chance of O/O; the Foal calculator rolls this with a d20 (a lethal result means no foal). |
| Melanoma (age-related) | G/- | risk | Variable | Grey horses have an elevated risk of melanoma that grows with age; it is not guaranteed. Rolled in the game from age 15+. No validated probability is configured. |
| Congenital stationary night blindness | LP/LP | risk | Non-lethal | LP/LP is associated with CSNB (poor vision in dim light). Not lethal. No validated probability is configured. |
| Equine recurrent uveitis (ERU) | LP/- | risk | Variable | Leopard Complex horses are reported to have a higher risk of recurrent uveitis (painful eye inflammation). No validated probability is configured. |
| Multiple congenital ocular anomalies (MCOA) | Z/Z | risk | Variable | Z/Z is associated with more severe eye anomalies than Z/n. Silver is not lethal. No validated probability is configured. |
| Deafness | SW1/- | risk | Variable | Splashed white is associated with deafness in some horses; most carriers are not affected. No validated probability is configured. |
| Sunburn / skin cancer risk | Cr/Cr or pink skin | risk | Variable | Unpigmented skin is more prone to sunburn and skin tumours such as squamous cell carcinoma. No validated probability is configured. |
| W20 homozygote viability | W20/W20 | unknown | Unknown | No documented W20 homozygotes. Viability is unknown and no lethal probability is invented. |
| Classic roan homozygote | Rn/Rn | unknown | Unknown | Evidence on Rn/Rn viability is incomplete; no probability assigned. |

## Donkey loci (simplified editor model; real donkey colour genetics are less established)

| Locus | Allowed pairs | Effect |
|---|---|---|
| MC1R | E/E, E/e, e/e | Base pigment incl. red (e/e). *Simplified donkey model |
| ASIP | A/A, A/a, a/a | Distribution of dark pigment (a/a = darker). *Simplified donkey model |
| TBX3 | D/D, D/nd, nd/nd | Dun colour and primitive markings. *Simplified donkey model |
| KIT | N/N, N/W, N/Ws, W/W | White markings and spotting; W/W viability not established. *Simplified |
| FGF5 | N/N, N/lh1, N/lh2, lh1/lh1, lh1/lh2, lh2/lh2 | Long mane, tail and coat hair |
