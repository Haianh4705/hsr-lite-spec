---
name: ambition-booster
description: Turn a modest task or prompt into a more ambitious one along three axes - Altitude (goal behind the goal), Depth (work like a field-leading expert, from raw data, with outside validation) and Range (borrow methods from other fields). Use whenever the user wants to "be more ambitious", "think bigger", "go deeper", "level up" a prompt, plan, project, report, deck or analysis, asks "how can I use AI/Claude better for this", or shares a small task (fix this, summarize that, make slides, polish this email) that clearly has a bigger outcome behind it. Also trigger on Vietnamese phrasing such as "tham vọng hơn", "nghĩ lớn hơn", "làm sâu hơn", "nâng cấp prompt", "cải thiện cách dùng AI". Use even if the user never says the word "ambition".
---

# Ambition Booster

Most people use AI for small, well-bounded tasks. The model can usually do far more, but nobody asked. This skill helps the user (or Claude itself) stretch a task along three axes, then rewrite it into a prompt or plan that is actually worth running.

Ambition comes in four kinds. **Speed** (same work, less time) needs no creativity, so skip it. Work with the other three:

| Axis | Core question | Moves from -> to |
|---|---|---|
| **Altitude** | What do I want to happen *next*? What is the goal beyond the goal? | one task -> an outcome or standing workflow |
| **Depth** | What would a field-leading expert do that I'm not asking for? | professional-sounding -> professional-grade |
| **Range** | Which other fields have methods that would help? | one discipline -> a crew of disciplines |

Read `references/techniques.md` for the detailed moves, a worked example and the psychology behind them when you need more than the summary below.

## Workflow

1. **Capture the task.** Take what the user gave you (a prompt, a plan, a half-built project). If it is too vague to stretch (no subject at all), ask one short question. Otherwise proceed and state assumptions in one line.
2. **Diagnose.** In 2-3 lines, say what the current framing is optimizing for (usually "finish this one artifact") and which axis has the most headroom. Not every task needs all three axes. Altitude suits tasks that normally end in a meeting or decision; it suits pure creative work poorly. Depth suits anything with data, methods or quality bars. Range suits anything where the output must persuade, be produced to a high standard, or survive scrutiny.
3. **Offer labeled options.** Give the user 3 clearly labeled stretched versions (for example **A - Altitude**, **B - Depth**, **C - Range**, or a combined **D**) rather than one verdict, so they can choose. Each option: one-sentence idea + the rewritten prompt in a code block, ready to paste. Keep each prompt specific and checkable.
4. **Check feasibility before they run it.** Ambitious prompts need ingredients. List what the model needs (raw data, connectors/MCP, a computer that can install software, access to the real environment) and what the user must change in their workflow to supply it. If an ingredient is missing, say so plainly rather than pretending the prompt will work.
5. **Offer to run it.** If tools allow, ask whether to execute the chosen version.

## Principles to apply when rewriting

**Altitude**
- Replace "do X" with the outcome X serves; make the output a decision, a standing process, or something that runs without being re-prompted.
- Ask for the decisions that matter most, with arguments for and against, not just a polished artifact.
- Prefer proposing a better mechanism than the artifact, plus evidence from the user's own history that it would have worked, and a trial run alongside the old way.
- Be honest about limits: open-ended goals like "make money" still fail for most businesses; keep a human at the points where judgment or accountability lives.

**Depth** (aim for a deeper version of the task, not a bigger one)
- Demand the experts' actual instruments (databases, statistical models, simulations) instead of the model merely adopting expert vocabulary.
- Start from the rawest material, not from digested summaries.
- Set a target that feels unreasonable and state that it is reachable; tell the model to keep going when it declares something impossible.
- Make the model adversarially test the user's cherished assumptions against raw data.
- Ask for new knowledge: blind spots, early signals, predictions checked on data the model has not seen.
- Use an outside judge (a test suite, a benchmark, a tool that returns pass/fail), never the model grading its own work.

**Range**
- Rewrite the noun as a verb: not "a deck" but what the deck must *do* to people. The verb reveals which fields matter.
- Assemble a crew by asking what team you would need if the stakes were enormous (analyst, journalist, editor, designer, plus a red team such as a short seller or forensic accountant).
- Assign *methods*, not costumes: tell the model to do what that expert does to research or test, not to write in their voice. Role-play makes transcripts stranger without improving results.

## Output format

Reply in the user's language, concisely. Structure:

1. One-line diagnosis.
2. Labeled options (A/B/C, optional D = combined), each with its paste-ready prompt.
3. "You'll need" list (data, tools, workflow changes).
4. One line asking which option to run or refine.

Do not lecture on the theory unless asked. If the user wants the motivation (why ambition is held back by belief in what's possible), use the short summary in `references/techniques.md`.
