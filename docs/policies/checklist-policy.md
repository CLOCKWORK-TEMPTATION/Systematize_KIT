# سياسة قوائم المراجعة

هذه الوثيقة تحتوي على السياسة الحاكمة الثقيلة المستخرجة للأمر المقابل.

```text
commands/syskit.checklist.md
```

يجب على أمر التنسيق أن يحمّل هذه السياسة ويتبعها قبل إنتاج مخرجاته.

---

## غرض قائمة المراجعة

الفكرة الحاكمة هنا أن قوائم المراجعة هي اختبارات جودة للمتطلبات المكتوبة، وليست اختبارات لسلوك التنفيذ نفسه.

## ما الذي لا تفعله هذه القوائم

- ❌ NOT "Verify the button clicks correctly"
- ❌ NOT "Test error handling works"
- ❌ NOT "Confirm the API returns 200"
- ❌ NOT checking if code/implementation matches the sys

## ما الذي تفعله هذه القوائم

- ✅ "Are visual hierarchy requirements defined for all card types?" (completeness)
- ✅ "Is 'prominent display' quantified with specific sizing/positioning?" (clarity)
- ✅ "Are hover state requirements consistent across all interactive elements?" (consistency)
- ✅ "Are accessibility requirements defined for keyboard navigation?" (coverage)
- ✅ "Does the sys define what happens when logo image fails to load?" (edge cases)

إذا كانت وثيقة المتطلبات نصًا حاكمًا، فالقائمة هي طبقة فحص لجودة هذا النص من حيث الاكتمال والوضوح وقابلية التنفيذ.

---

## خوارزمية توضيح النية

اشتق حتى ثلاثة أسئلة توضيحية سياقية أولية من دون أي قائمة جاهزة مسبقًا. ويجب أن:
- Be generated from the user's phrasing + extracted signals from sys/plan/tasks
- Only ask about information that materially changes checklist content
- Be skipped individually if already unambiguous in `$ARGUMENTS`
- Prefer precision over breadth

### خطوات التوليد

1. Extract signals: feature domain keywords (e.g., auth, latency, UX, API), risk indicators ("critical", "must", "compliance"), stakeholder hints ("QA", "review", "security team"), and explicit deliverables ("a11y", "rollback", "contracts").
2. Cluster signals into candidate focus areas (max 4) ranked by relevance.
3. Identify probable audience & timing (author, reviewer, QA, release) if not explicit.
4. Detect missing dimensions: scope breadth, depth/rigor, risk emphasis, exclusion boundaries, measurable acceptance criteria.
5. Formulate questions chosen from these archetypes:
   - Scope refinement (e.g., "Should this include integration touchpoints with X and Y or stay limited to local module correctness?")
   - Risk prioritization (e.g., "Which of these potential risk areas should receive mandatory gating checks?")
   - Depth calibration (e.g., "Is this a lightweight pre-commit sanity list or a formal release gate?")
   - Audience framing (e.g., "Will this be used by the author only or peers during PR review?")
   - Boundary exclusion (e.g., "Should we explicitly exclude performance tuning items this round?")
   - Scenario class gap (e.g., "No recovery flows detected—are rollback / partial failure paths in scope?")

### قواعد تنسيق الأسئلة

- If presenting options, generate a compact table with columns: Option | Candidate | Why It Matters
- Limit to A–E options maximum; omit table if a free-form answer is clearer
- Never ask the user to restate what they already said
- Avoid speculative categories (no hallucination). If uncertain, ask explicitly: "Confirm whether X belongs in scope."

### القيم الافتراضية عند تعذر التفاعل

- Depth: Standard
- Audience: Reviewer (PR) if code-related; Author otherwise
- Focus: Top 2 relevance clusters

### التصعيد اللاحق

Output the questions (label Q1/Q2/Q3). After answers: if ≥2 scenario classes (Alternate / Exception / Recovery / Non-Functional domain) remain unclear, you MAY ask up to TWO more targeted follow‑ups (Q4/Q5) with a one-line justification each (e.g., "Unresolved recovery path risk"). Do not exceed five total questions. Skip escalation if user explicitly declines more.

---

## دليل كتابة القائمة

### المبدأ الأساسي

Every checklist item MUST evaluate the REQUIREMENTS THEMSELVES for:
- **Completeness**: Are all necessary requirements present?
- **Clarity**: Are requirements unambiguous and specific?
- **Consistency**: Do requirements align with each other?
- **Measurability**: Can requirements be objectively verified?
- **Coverage**: Are all scenarios/edge cases addressed?

### بنية التصنيف

Group items by requirement quality dimensions:
- **Requirement Completeness** (Are all necessary requirements documented?)
- **Requirement Clarity** (Are requirements specific and unambiguous?)
- **Requirement Consistency** (Do requirements align without conflicts?)
- **Acceptance Criteria Quality** (Are success criteria measurable?)
- **Scenario Coverage** (Are all flows/cases addressed?)
- **Edge Case Coverage** (Are boundary conditions defined?)
- **Non-Functional Requirements** (Performance, Security, Accessibility, etc. — are they specified?)
- **Dependencies & Assumptions** (Are they documented and validated?)
- **Ambiguities & Conflicts** (What needs clarification?)

### بنية العنصر

Each item should follow this pattern:
- Question format asking about requirement quality
- Focus on what's WRITTEN (or not written) in the sys/plan
- Include quality dimension in brackets [Completeness/Clarity/Consistency/etc.]
- Reference sys section `[Sys §X.Y]` when checking existing requirements
- Use `[Gap]` marker when checking for missing requirements

### أمثلة بحسب بُعد الجودة

**Completeness:**
- "Are error handling requirements defined for all API failure modes? [Gap]"
- "Are accessibility requirements specified for all interactive elements? [Completeness]"
- "Are mobile breakpoint requirements defined for responsive layouts? [Gap]"

**Clarity:**
- "Is 'fast loading' quantified with specific timing thresholds? [Clarity, Sys §NFR-2]"
- "Are 'related episodes' selection criteria explicitly defined? [Clarity, Sys §FR-5]"
- "Is 'prominent' defined with measurable visual properties? [Ambiguity, Sys §FR-4]"

**Consistency:**
- "Do navigation requirements align across all pages? [Consistency, Sys §FR-10]"
- "Are card component requirements consistent between landing and detail pages? [Consistency]"

**Coverage:**
- "Are requirements defined for zero-state scenarios (no episodes)? [Coverage, Edge Case]"
- "Are concurrent user interaction scenarios addressed? [Coverage, Gap]"
- "Are requirements specified for partial data loading failures? [Coverage, Exception Flow]"

**Measurability:**
- "Are visual hierarchy requirements measurable/testable? [Acceptance Criteria, Sys §FR-1]"
- "Can 'balanced visual weight' be objectively verified? [Measurability, Sys §FR-2]"

### تصنيف السيناريوهات والتغطية

- Check if requirements exist for: Primary, Alternate, Exception/Error, Recovery, Non-Functional scenarios
- For each scenario class, ask: "Are [scenario type] requirements complete, clear, and consistent?"
- If scenario class missing: "Are [scenario type] requirements intentionally excluded or missing? [Gap]"
- Include resilience/rollback when state mutation occurs: "Are rollback requirements defined for migration failures? [Gap]"

### متطلبات التتبع

- MINIMUM: ≥80% of items MUST include at least one traceability reference
- Each item should reference: sys section `[Sys §X.Y]`, or use markers: `[Gap]`, `[Ambiguity]`, `[Conflict]`, `[Assumption]`
- If no ID system exists: "Is a requirement & acceptance criteria ID scheme established? [Traceability]"

### إظهار المشكلات ومعالجتها

Ask questions about the requirements themselves:
- Ambiguities: "Is the term 'fast' quantified with specific metrics? [Ambiguity, Sys §NFR-1]"
- Conflicts: "Do navigation requirements conflict between §FR-10 and §FR-10a? [Conflict]"
- Assumptions: "Is the assumption of 'always available podcast API' validated? [Assumption]"
- Dependencies: "Are external podcast API requirements documented? [Dependency, Gap]"
- Missing definitions: "Is 'visual hierarchy' defined with measurable criteria? [Gap]"

### دمج المحتوى

- Soft cap: If raw candidate items > 40, prioritize by risk/impact
- Merge near-duplicates checking the same requirement aspect
- If >5 low-impact edge cases, create one item: "Are edge cases X, Y, Z addressed in requirements? [Coverage]"

### الأنماط الممنوعة

🚫 ABSOLUTELY PROHIBITED — These make it an implementation test, not a requirements test:
- ❌ Any item starting with "Verify", "Test", "Confirm", "Check" + implementation behavior
- ❌ References to code execution, user actions, system behavior
- ❌ "Displays correctly", "works properly", "functions as expected"
- ❌ "Click", "navigate", "render", "load", "execute"
- ❌ Test cases, test plans, QA procedures
- ❌ Implementation details (frameworks, APIs, algorithms)

### الأنماط المطلوبة

✅ REQUIRED PATTERNS — These test requirements quality:
- ✅ "Are [requirement type] defined/specified/documented for [scenario]?"
- ✅ "Is [vague term] quantified/clarified with specific criteria?"
- ✅ "Are requirements consistent between [section A] and [section B]?"
- ✅ "Can [requirement] be objectively measured/verified?"
- ✅ "Are [edge cases/scenarios] addressed in requirements?"
- ✅ "Does the sys define [missing aspect]?"

---

## أنواع القوائم وأمثلة العناصر

**UX Requirements Quality:** `ux.md`

Sample items (testing the requirements, NOT the implementation):

- "Are visual hierarchy requirements defined with measurable criteria? [Clarity, Sys §FR-1]"
- "Is the number and positioning of UI elements explicitly specified? [Completeness, Sys §FR-1]"
- "Are interaction state requirements (hover, focus, active) consistently defined? [Consistency]"
- "Are accessibility requirements specified for all interactive elements? [Coverage, Gap]"
- "Is fallback behavior defined when images fail to load? [Edge Case, Gap]"
- "Can 'prominent display' be objectively measured? [Measurability, Sys §FR-4]"

**API Requirements Quality:** `api.md`

Sample items:

- "Are error response formats specified for all failure scenarios? [Completeness]"
- "Are rate limiting requirements quantified with specific thresholds? [Clarity]"
- "Are authentication requirements consistent across all endpoints? [Consistency]"
- "Are retry/timeout requirements defined for external dependencies? [Coverage, Gap]"
- "Is versioning strategy documented in requirements? [Gap]"

**Performance Requirements Quality:** `performance.md`

Sample items:

- "Are performance requirements quantified with specific metrics? [Clarity]"
- "Are performance targets defined for all critical user journeys? [Coverage]"
- "Are performance requirements under different load conditions specified? [Completeness]"
- "Can performance requirements be objectively measured? [Measurability]"
- "Are degradation requirements defined for high-load scenarios? [Edge Case, Gap]"

**Security Requirements Quality:** `security.md`

Sample items:

- "Are authentication requirements specified for all protected resources? [Coverage]"
- "Are data protection requirements defined for sensitive information? [Completeness]"
- "Is the threat model documented and requirements aligned to it? [Traceability]"
- "Are security requirements consistent with compliance obligations? [Consistency]"
- "Are security failure/breach response requirements defined? [Gap, Exception Flow]"

---

## أمثلة مضادة

**❌ WRONG — These test implementation, not requirements:**

```markdown
- [ ] CHK001 - Verify landing page displays 3 episode cards [Sys §FR-001]
- [ ] CHK002 - Test hover states work correctly on desktop [Sys §FR-003]
- [ ] CHK003 - Confirm logo click navigates to home page [Sys §FR-010]
- [ ] CHK004 - Check that related episodes section shows 3-5 items [Sys §FR-005]
```

**✅ CORRECT — These test requirements quality:**

```markdown
- [ ] CHK001 - Are the number and layout of featured episodes explicitly specified? [Completeness, Sys §FR-001]
- [ ] CHK002 - Are hover state requirements consistently defined for all interactive elements? [Consistency, Sys §FR-003]
- [ ] CHK003 - Are navigation requirements clear for all clickable brand elements? [Clarity, Sys §FR-010]
- [ ] CHK004 - Is the selection criteria for related episodes documented? [Gap, Sys §FR-005]
- [ ] CHK005 - Are loading state requirements defined for asynchronous episode data? [Gap]
- [ ] CHK006 - Can "visual hierarchy" requirements be objectively measured? [Measurability, Sys §FR-001]
```

**Key Differences:**

- Wrong: Tests if the system works correctly
- Correct: Tests if the requirements are written correctly
- Wrong: Verification of behavior
- Correct: Validation of requirement quality
- Wrong: "Does it do X?"
- Correct: "Is X clearly specified?"
