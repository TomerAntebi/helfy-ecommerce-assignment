# Documentation Guidelines

These guidelines define how to document AI interactions, manual interventions, and the project README during Phase 6 and throughout generation.

---

## 1. Phase 6 — Documentation Goal

Finalize all documentation files after the application is generated and tested.

### README.md

Populate the README with:
- Project overview
- Technology stack table
- How to run (copy `.env.example` to `.env`, run `docker compose up`)
- Environment variables table (name, description, example value)
- All manual interventions encountered during generation in the required template format

### ai-interactions.md

Ensure every phase has a complete entry using the required template format defined in Section 2 of this file.

---

## 2. AI Interaction Documentation

Every AI interaction during this project must be recorded in `ai-interactions.md` using the following entry template. This is not optional.

### Entry template

```markdown
## Interaction [N] — [Short descriptive title]

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Tool | Cline / ChatGPT / Claude.ai / Cursor / etc. |
| Model | e.g. claude-sonnet-4-5, gpt-4o, gemini-2.0-flash |
| Phase | Phase 1 / Phase 2 / Planning / etc. |

### Prompt

[Full prompt text, or a summary if the prompt was very long]

### Result

[What was generated or answered. Be specific about files created and key decisions made.]

### Files Changed

- `path/to/file.ts` — what was created or modified

### Manual Intervention

[Yes / No]

### Reason for Manual Intervention

[If Yes: describe exactly what failed, why the AI could not handle it, and what was done manually.
If No: N/A]
```

---

## 3. Manual Intervention Documentation

Every fix applied manually after AI generation must be logged in `README.md` under the Manual Interventions section using this template.

### Entry template

```markdown
## Manual Intervention [N] — [Short descriptive title]

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Phase | Phase where the fix was applied |
| Files Affected | `path/to/file.ts`, `path/to/other.ts` |

### What was fixed

[Clear description of the problem that existed before the fix and what the fix changed.]

### Why the AI failed

[Root cause analysis. Examples: hallucinated import path, wrong assumption about Docker networking,
missing environment variable handling, incorrect SQL syntax for MySQL 8.0, etc.]

### How it was fixed

[Exact steps taken. If code was changed, show the before and after.]
```
