# سياسة التنفيذ

هذه الوثيقة تحتوي على السياسة الحاكمة الثقيلة المستخرجة للأمر المقابل.

```text
commands/syskit.implement.md
```

يجب على أمر التنسيق أن يحمّل هذه السياسة ويتبعها قبل إنتاج مخرجاته.

---

## بروتوكول الخطافات

هذا البروتوكول ينطبق على الخطافات السابقة للتنفيذ واللاحقة له، ويُستدعى مرة قبل البدء ومرة بعد اكتمال التحقق.

### الإجراء

1. Check if `.Systematize/config/extensions.yml` exists in the project root.
2. If it exists, read it and look for entries under the relevant hook key (`hooks.before_implement` or `hooks.after_implement`).
3. If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally.
4. Filter to only hooks where `enabled: true`.
5. For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
   - If the hook has no `condition` field, or it is null/empty, treat the hook as executable.
   - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation.
6. For each executable hook, output based on its `optional` flag:

**Optional hook** (`optional: true`):
```
## Extension Hooks

**Optional Pre-Hook**: {extension}
Command: `/{command}`
Description: {description}

Prompt: {prompt}
To execute: `/{command}`
```

**Mandatory hook** (`optional: false`):
```
## Extension Hooks

**Automatic Hook**: {extension}
Executing: `/{command}`
EXECUTE_COMMAND: {command}

Wait for the result of the hook command before proceeding.
```

7. If no hooks are registered or `.Systematize/config/extensions.yml` does not exist, skip silently.

---

## بروتوكول بوابة القوائم

If `FEATURE_DIR/checklists/` exists:

1. Scan all checklist files in the `checklists/` directory.
2. For each checklist, count:
   - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
   - Completed items: Lines matching `- [X]` or `- [x]`
   - Incomplete items: Lines matching `- [ ]`
3. Create a status table:

   ```text
   | Checklist | Total | Completed | Incomplete | Status |
   |-----------|-------|-----------|------------|--------|
   | ux.md     | 12    | 12        | 0          | ✓ PASS |
   | test.md   | 8     | 5         | 3          | ✗ FAIL |
   | security.md | 6   | 6         | 0          | ✓ PASS |
   ```

4. **PASS** = all checklists have 0 incomplete items. **FAIL** = one or more have incomplete items.
5. If any checklist is incomplete: display the table, **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)". Wait for response. If user declines, halt.
6. If all checklists are complete: display the table and proceed automatically.

---

## التحقق من إعداد المشروع

Create/verify ignore files based on actual project setup:

### منطق الاكتشاف والإنشاء

- `git rev-parse --git-dir 2>/dev/null` succeeds → create/verify `.gitignore`
- `Dockerfile*` exists or Docker in plan.md → create/verify `.dockerignore`
- `.eslintrc*` exists → create/verify `.eslintignore`
- `eslint.config.*` exists → ensure the config's `ignores` entries cover required patterns
- `.prettierrc*` exists → create/verify `.prettierignore`
- `.npmrc` or `package.json` exists → create/verify `.npmignore` (if publishing)
- `*.tf` files exist → create/verify `.terraformignore`
- Helm charts present → create/verify `.helmignore`

**If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only.
**If ignore file missing**: Create with full pattern set for detected technology.

### الأنماط الشائعة بحسب التقنية

| Technology | Patterns |
|------------|----------|
| Node.js/JS/TS | `node_modules/`, `dist/`, `build/`, `*.log`, `.env*` |
| Python | `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/` |
| Java | `target/`, `*.class`, `*.jar`, `.gradle/`, `build/` |
| C#/.NET | `bin/`, `obj/`, `*.user`, `*.suo`, `packages/` |
| Go | `*.exe`, `*.test`, `vendor/`, `*.out` |
| Ruby | `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/` |
| PHP | `vendor/`, `*.log`, `*.cache`, `*.env` |
| Rust | `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*` |
| Kotlin | `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*` |
| C++ | `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*` |
| C | `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `*.dll`, `autom4te.cache/`, `config.status`, `config.log`, `.idea/`, `*.log`, `.env*` |
| Swift | `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/` |
| R | `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/` |
| Universal | `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/` |

### الأنماط الخاصة بالأدوات

| Tool | Patterns |
|------|----------|
| Docker | `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/` |
| ESLint | `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js` |
| Prettier | `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` |
| Terraform | `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl` |
| K8s | `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt` |

---

## ترتيب المهام الذكي

1. Parse `tasks.md` structure and extract all task cards.
2. Analyze `Depends On` field in each task card to build a dependency graph (DAG).
3. Identify tasks that can run in parallel (no shared dependencies).
4. Apply **fail-fast ordering**: tasks with highest risk or most dependents execute first.
5. Group tasks into execution waves:
   ```
   Wave 1: [tasks with no dependencies — can all run in parallel]
   Wave 2: [tasks depending only on Wave 1 — can run in parallel]
   Wave 3: [tasks depending on Wave 1+2]
   ...
   ```
6. Display the execution plan before starting:
   ```
   📋 Execution Plan:
   Wave 1 (parallel): DO-T-001, DO-T-002, DO-T-003
   Wave 2 (parallel): BE-T-001, BE-T-002
   Wave 3 (sequential): BE-T-003 → BE-T-004 → FE-T-001
   Wave 4 (parallel): CC-T-001, CC-T-002
   ```

---

## نقاط التحقق أثناء التنفيذ

After completing each Phase/Wave:

1. Verify the code builds without errors.
2. Run related tests (if applicable).
3. Update progress in `tasks.md` — mark completed tasks with `[X]`.
4. Run quick healthcheck:
   - **PowerShell**: `pwsh -File .Systematize/scripts/powershell/run-healthcheck.ps1 -Json`
   - **Node.js**: `node .Systematize/scripts/node/cli.mjs healthcheck --json`
5. If `auto_commit` is enabled in `syskit-config.yml`, run `auto-commit.ps1` / `node cli.mjs auto-commit`.
6. If `auto_changelog` is enabled, add changelog entry via `Export-ChangelogEntry`.
7. Display checkpoint summary:
   ```
   ✅ Phase 2 Checkpoint:
   ├── Tasks completed: 3/3
   ├── Build: ✅ passing
   ├── Tests: ✅ 12/12 passing
   ├── Health: 85/100
   └── Committed: docs(features): implement — phase 2 complete [001-user-auth]
   ```

---

## دعم التراجع

1. Before starting each task, save a snapshot:
   - **PowerShell**: `pwsh -File .Systematize/scripts/powershell/snapshot-artifacts.ps1 -Tag "pre-{TASK_ID}"`
   - **Node.js**: `node .Systematize/scripts/node/cli.mjs snapshot --tag "pre-{TASK_ID}"`
2. If a task fails:
   a. Log the error with context.
   b. Present options to the user:
      - **Retry**: Attempt the task again
      - **Skip**: Mark as skipped and continue with next non-dependent task
      - **Rollback**: Restore from the pre-task snapshot
      - **Abort**: Stop implementation entirely
   c. If rollback is chosen, restore the snapshot and recalculate remaining waves.
3. Track failed/skipped tasks separately in the progress report.

---

## تتبع التقدم

- Report progress after each completed task with running totals.
- Maintain a live progress display:
  ```
  📊 Implementation Progress: 12/24 tasks (50%)
  ├── ✅ Completed: 12
  ├── 🔄 In progress: 1 (BE-T-005)
  ├── ⏭️ Skipped: 0
  ├── ❌ Failed: 0
  └── ⬜ Remaining: 11
  ```
- Halt execution if a blocking (non-parallel) task fails.
- For parallel tasks, continue with successful ones and report failures.
- **IMPORTANT**: Mark completed tasks as `[X]` in `tasks.md` immediately.
- If `analytics_enabled` is true, record events via `record-analytics.ps1` / `node cli.mjs record-analytics`.
