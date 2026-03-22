# Governance Policy Layer

> هذه وثيقة مرجعية.
>
> للبداية التشغيلية:
>
> ```text
> docs/START_HERE.md
> ```

This directory contains the extracted heavy governance policies that were previously embedded directly inside the command surface files.

## Purpose

- Keep `commands/*.md` focused on orchestration and routing.
- Keep stable, reusable policy and rubric text in a dedicated policy layer.
- Make the separation between Governance DSL and Policy Layer explicit inside the repository.

## Extracted Policies

- `docs/policies/systematize-policy.md`
- `docs/policies/research-policy.md`
- `docs/policies/tasks-policy.md`
- `docs/policies/analyze-policy.md`
- `docs/policies/checklist-policy.md`
- `docs/policies/implement-policy.md`
- `docs/policies/clarify-policy.md`

## Operating Rule

Each governance command must explicitly point to its extracted policy file and treat that policy as the normative source for the heavy rules, rubrics, and output contract.
