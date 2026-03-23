# سياسة التوضيح

هذه الوثيقة تحتوي على السياسة الحاكمة الثقيلة المستخرجة للأمر المقابل.

```text
commands/syskit.clarify.md
```

يجب على أمر التنسيق أن يحمّل هذه السياسة ويتبعها قبل إنتاج مخرجاته.

---

## المبادئ الحاكمة

هذه المبادئ غير قابلة للتفاوض، وهي التي تحكم كل قرار في هذه المرحلة:

1. **Clarification is for resolving ambiguity that blocks correct execution** — not for collecting information randomly or extending dialogue.
2. **Only ask about what changes an engineering decision** — a question is valid ONLY if its answer materially impacts design, architecture, behavior, constraints, or priorities.
3. **Never ask about what can be inferred** — if the answer can be reliably derived from the task description, attached context, existing system, or known technical conventions, do NOT ask.
4. **Convert vague ambiguity into specific decision points** — instead of "What do you want exactly?", extract concrete decisions like: "Is backward compatibility required?" or "What is the acceptable response time?"
5. **Distinguish critical unknowns from non-critical unknowns**:
   - **Critical**: Blocks execution or may produce a fundamentally wrong solution → MUST ask.
   - **Non-critical**: Can be resolved with a reasonable documented assumption → assume and document.
   - Work MUST NOT stop for non-critical unknowns.
6. **Use documented operational assumptions when possible** — if you can proceed without returning to the user, place explicit assumptions like: "Assuming production environment", "Assuming backward compatibility required", "Assuming functional correctness over cosmetic improvements".
7. **Questions must be directly answerable** — short, specific, no ambiguous interpretations, leading to one or a few clear decisions.
8. **Order questions by impact** — start from: Final goal → Scope boundaries → Mandatory constraints → Acceptance criteria → Secondary implementation details.
9. **Define what is OUT of scope** — one of the most important outputs is explicitly stating what will NOT be done, to prevent scope creep.
10. **Every answer must become an actionable artifact** — each clarification becomes: a design rule, an implementation constraint, an acceptance criterion, a priority decision, or an architectural decision.
11. **Detect contradictions before execution begins** — the clarification phase must expose conflicts like: high speed + no simplification allowed, lowest cost + highest reliability without tradeoff, limited change + fundamental architecture redesign.
12. **Good clarification reduces rework** — success is measured by reduction in: returning to user later, repeated modifications, misunderstandings, deviation from requirements.
13. **The phase ends with a mini execution contract** — the output must clearly define: what is required, what is not required, constraints, assumptions, and success criteria.

### قاعدة التصعيد

> **MANDATORY**: If answering a question would change the architecture, threaten functional safety, or invalidate a mandatory constraint — you MUST NOT assume. You MUST escalate to the user immediately regardless of the question quota.

---

## تصنيف فحص الغموض والتغطية

Perform a structured scan of the sys using this taxonomy. For each category, mark status: Clear / Partial / Missing.

| Domain | Check Areas |
|--------|-------------|
| **Functional Scope & Behavior** | Core user goals & success criteria; Explicit out-of-scope declarations; User roles/personas differentiation |
| **Domain & Data Model** | Entities, attributes, relationships; Identity & uniqueness rules; Lifecycle/state transitions; Data volume/scale assumptions |
| **Interaction & UX Flow** | Critical user journeys/sequences; Error/empty/loading states; Accessibility or localization notes |
| **Non-Functional Quality Attributes** | Performance (latency, throughput); Scalability (horizontal/vertical, limits); Reliability & availability (uptime, recovery); Observability (logging, metrics, tracing); Security & privacy (authN/Z, data protection); Compliance/regulatory constraints |
| **Integration & External Dependencies** | External services/APIs and failure modes; Data import/export formats; Protocol/versioning assumptions |
| **Edge Cases & Failure Handling** | Negative scenarios; Rate limiting/throttling; Conflict resolution (e.g., concurrent edits) |
| **Constraints & Tradeoffs** | Technical constraints (language, storage, hosting); Explicit tradeoffs or rejected alternatives |
| **Terminology & Consistency** | Canonical glossary terms; Avoided synonyms/deprecated terms |
| **Completion Signals** | Acceptance criteria testability; Measurable Definition of Done indicators |
| **Misc / Placeholders** | TODO markers/unresolved decisions; Ambiguous adjectives ("robust", "intuitive") lacking quantification |

For each Partial or Missing category, generate a candidate question ONLY if (per Principle 2) the answer would materially change an engineering decision. Skip if:
- The answer can be inferred (Principle 3)
- The unknown is non-critical and can be assumed (Principle 5/6)
- Better deferred to planning phase

---

## تصنيف المجهولات

Classify unknowns before generating questions:

| Unknown | Critical? | Reasoning | Action |
|---------|-----------|-----------|--------|
| [unknown] | Yes/No | [why] | Ask / Assume / Defer |

- Critical unknowns → become questions (max 5).
- Non-critical unknowns → become documented assumptions (written to `### Assumptions` in the Clarification Contract).
- Deferred items → noted in final report.

---

## قواعد توليد الأسئلة

- Maximum 5 total questions across the session.
- Each question must be answerable with EITHER:
   - A short multiple-choice selection (2–5 options), OR
   - A one-word / short-phrase answer (≤5 words).
- Priority by: (Impact × Uncertainty) heuristic.
- Category balance: cover highest-impact unresolved categories first.
- Exclude: already answered, trivial preferences, plan-level details (unless blocking correctness).
- Favor: clarifications that reduce rework risk or prevent misaligned acceptance tests.

---

## حلقة الاستيضاح المتسلسلة

Present EXACTLY ONE question at a time.

### For Multiple-Choice Questions

1. **Analyze all options** and determine the best based on: best practices, common patterns, risk reduction, alignment with project goals.
2. Present recommendation: `**Recommended:** Option [X] - <reasoning>`
3. Render options as Markdown table:

   | Option | Description |
   |--------|-------------|
   | A | \<description\> |
   | B | \<description\> |
   | C | \<description\> |
   | Short | Provide a different short answer (≤5 words) |

4. After table: `Reply with the option letter, "yes"/"recommended" to accept, or your own short answer.`

### For Short-Answer Questions

1. `**Suggested:** <answer> - <reasoning>`
2. `Format: Short answer (≤5 words). Say "yes"/"suggested" to accept, or provide your own.`

### After User Answers

- "yes"/"recommended"/"suggested" → use stated recommendation.
- Validate answer maps to option or fits ≤5 word constraint.
- If ambiguous → quick disambiguation (same question, not a new one).
- Record in working memory, advance to next question.

### Stop Conditions

- All critical ambiguities resolved, OR
- User signals completion ("done", "good", "no more"), OR
- 5 questions reached.

### Escalation Override

If during the loop you discover an answer would change architecture or threaten safety → escalate immediately to user, even if it means exceeding the display of a single question. This does NOT count against the 5-question quota.

---

## الدمج بعد كل إجابة مقبولة

1. First answer in session → ensure `## Clarification Contract` section exists in sys. Under `### Critical Questions Resolved`, create `#### Session YYYY-MM-DD` if not present.
2. Append: `- Q: <question> → A: <answer> → Impact: <section/decision affected>`
3. Apply the clarification to the appropriate sys section:
   - Functional → update Functional Requirements
   - User interaction → update User Stories
   - Data → update Key Entities
   - Non-functional → add measurable criteria to NFR section
   - Edge case → add to Edge Cases
   - Terminology → normalize across sys
4. If clarification invalidates earlier text in sys → replace (no contradictions).
5. **Save after each integration** (atomic overwrite).
6. Keep heading hierarchy intact. Keep insertions minimal and testable.

---

## عقد التوضيح

Fill the `## Clarification Contract` section in the sys with:

- **What Is Required**: concrete deliverables/behaviors derived from clarifications.
- **What Is NOT Required**: explicitly excluded items.
- **Constraints**: technical, organizational, or business constraints surfaced.
- **Assumptions**: all non-critical unknowns resolved by assumption (format: `ASM-XXX: [assumption] — Reason: [why] — If wrong: [impact]`).
- **Critical Questions Resolved**: already filled incrementally during questioning.
- **Success Criteria**: measurable criteria for "done".
- **Clarification Checklist**: update each item to ☐ Yes or ☐ No.

The Clarification Contract is the mandatory output of this phase. It is the "mini execution contract" (Principle 13). If any checklist item is ☐ No, warn that the sys is not ready for `/syskit.constitution`.

---

## قواعد التحقق

After each write and during final pass:

- Questions Resolved section has exactly one bullet per accepted answer.
- Total asked questions ≤ 5 (escalations excluded).
- No vague placeholders remain that an answer was meant to resolve.
- No contradictory earlier statement left.
- All assumptions have ID, reason, and impact.
- Clarification Checklist accurately reflects current state.
- Markdown structure valid; heading hierarchy preserved.
- Terminology consistency across all updated sections.

---

## قواعد السلوك

- If no meaningful ambiguities found → respond: "No critical ambiguities detected. Clarification Contract populated with inferred values." Fill the contract with inferred data and suggest proceeding.
- If sys file missing → instruct user to run `/syskit.systematize` first.
- Never exceed 5 asked questions (retries don't count; escalations don't count).
- Avoid speculative tech stack questions unless absence blocks functional clarity.
- Respect early termination signals ("stop", "done", "proceed").
- If quota reached with unresolved high-impact categories → flag under Deferred with rationale.
- Non-critical unknowns MUST become documented assumptions, never unanswered gaps.

---

## أمثلة قبل وبعد

**Bad question** (violates Principle 3 — can be inferred):
> "What programming language should we use?" — when the repo is clearly TypeScript.

**Good question** (Principle 2 — changes engineering decision):
> "Should the search be real-time (WebSocket) or on-demand (REST)?" — directly impacts architecture.

**Bad assumption** (violates Escalation Rule):
> "Assuming no authentication needed" — when the sys mentions user roles.

**Good assumption** (Principle 6 — non-critical, documented):
> "ASM-001: Assuming PostgreSQL as database — Reason: existing project stack — If wrong: migration effort for data layer"
