# Techniques, example and background

Source of ideas: Felix Rieseberg, "How to be more ambitious: A tutorial for humans with models" (13 Oct 2026). The text below is a paraphrased working summary.

## Contents
1. Worked example (quarterly business review)
2. Depth checklist prompt (template)
3. Range: finding fields
4. Prerequisites
5. Why ambition is held back (short)

## 1. Worked example: quarterly business review (QBR) at a fictional company

Baseline: "Fill this template with the quarter's numbers."

Altitude ladder, each step more ambitious:
1. Feed in as much business data as possible and ask what changed, why, and what to do about it.
2. Ask for the three most urgent decisions given everything learned, with for/against analysis for each direction.
3. State what the review is *for* (leadership catching problems early and moving money and people), then ask for a better mechanism than a quarterly deck, back-tested on the company's own history to show it would have caught issues sooner, and run it in parallel with the existing review for a quarter.

Depth applied to a churn problem:
- Use databases and statistical models instead of markdown tables.
- "We believe churn is an onboarding problem - try to disprove that from raw data."
- Build a simulation of customers that reproduces the last year from logs, find the earliest churn signal not yet known, and show it predicts on held-out data.

Range applied to the deck: the deck is really "getting busy people to believe a causal story and decide under uncertainty in 30 minutes". Crew: analyst, journalist, editor; if presented, motion/audio designer; red team: short seller, forensic accountant.

## 2. Depth checklist prompt (template, write in your own words)

Ask the model to produce a *deeper*, not bigger, version of the task, answering before rewriting:
1. What would a top professional do that the user is not asking for?
2. What is the rawest material they would start from?
3. Which specific methods and tools would they use?
4. What, other than the model or the user, would show the result is correct?
Then rewrite the prompt to request exactly that.

## 3. Range: finding fields
- Verb rewrite (from *The Art of Innovation*, Kelley & Littman): replace the deliverable noun with the action it must achieve.
- "Heist crew" thinking: who would you recruit if failure were catastrophic?
- Anecdote: seeing a colleague use Blender (3D) for interior design led the author to use Claude for a 3D environment on his homepage - cross-field transfer is where surprising results come from.
- Multi-agent setups (subagents, orchestrators) make a crew cheap to run.

## 4. Prerequisites
- A computer-capable environment: can install software, run code, reach data.
- Data access (connectors / MCP, exports, logs).
- For durable altitude workflows: make the model's feedback loop automatic. Example from the author: to have Claude keep an app crash-free, it first needed crash reports, a mapping from app version to git commit, and machines for each OS to reproduce and verify fixes.

## 5. Why ambition is held back (short)
- Self-efficacy: believing you can do something raises the odds you do. Locke & Latham's review of ~35 years of goal-setting research: specific hard goals beat "do your best".
- Documented hacks: (a) believe it's possible - George Dantzig solved two open statistics problems in 1939 thinking they were homework; (b) watch someone else do it - the four-minute mile, then the sub-two-hour marathon; (c) allow yourself to fail - *The Inner Game of Tennis*, Linux's "just a hobby" announcement.
- Patrick Collison's "Fast" list collects achievements made with audacious goals and tight deadlines.
- Takeaway: AI capability jumps every few weeks, so the habit of re-checking what you consider possible matters more than ever.
