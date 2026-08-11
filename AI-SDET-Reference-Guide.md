# AI-SDET Interview — Complete Reference Guide
### Eightfold · AI-SDET Engineer Assessment

This is the single consolidated reference: every skill area the assessment
touches, and a plain explanation of what "plugins" means in the JD's prep
checklist. Read this alongside the `ai-sdet-kit` code skeleton — this doc
is the *why/what*, the kit is the *how*.

---

## 1. What "plugins" actually means here

The JD says: *"Install an AI-powered IDE or coding assistant... familiarise
yourself with your chosen tool's ability to edit files directly in the
filesystem — avoid copy-pasting from chat windows; use the plugin's
file-editing capabilities instead."*

**In plain terms:** a "plugin" here is an AI coding assistant that lives
*inside your editor* (not a separate chat window) and can directly read,
create, and edit files on your disk — as opposed to you copy-pasting code
between a chatbot tab and your IDE.

### The main tools this refers to

| Tool | What it is | How it edits files |
|---|---|---|
| **Cursor** | A fork of VS Code with AI built into the core editor | Native — AI proposes a diff, you accept/reject inline |
| **GitHub Copilot** | An extension/plugin for VS Code, JetBrains, etc. | Inline autocomplete + "Copilot Chat" can apply edits to open files |
| **Windsurf** | Standalone AI-native IDE (by Codeium) | Native — has an agentic "Cascade" mode that edits multi-file, runs terminal commands |
| **Factory.ai** | Agentic dev platform, more autonomous ("Droids") | Can plan + execute multi-step coding tasks with less hand-holding |
| **Claude Code** (Anthropic) | Terminal/IDE agent | Reads/writes files directly, runs shell commands, no copy-paste needed |

### Why this distinction matters for the assessment
- **Copy-paste workflow** (bad, avoid): you ask ChatGPT/Claude in a browser
  tab "write me a login test," then manually paste the code into your
  editor. Slow, error-prone, breaks the "agentic" framing they're grading.
- **Plugin/agentic workflow** (what they want): the AI tool is *inside*
  your dev environment, can see your actual files, run your actual tests,
  read the actual error output, and iterate — without you relaying text
  back and forth. This is what "agent" means in "AI-agent-driven testing."

**Practical takeaway:** before the interview, install and get comfortable
with **one** of these (Cursor is the easiest on-ramp if you're new to
this). Practice letting it edit files directly rather than pasting from
a chat window — even for 15 minutes — so the muscle memory is there.

---

## 2. Skill areas required — full breakdown

### 2.1 AI / Agentic Engineering Skills
| Skill | What it means in practice |
|---|---|
| Agent state management | Tracking what an agent has already done across a multi-step task (e.g. "generated cases → ran them → 2 failed → retrying") without losing context |
| Retry / fallback logic | When an LLM call errors, times out, or returns garbage — retry with backoff, or fall back to a simpler deterministic path |
| Safe parallelization | Running multiple agent tasks concurrently without race conditions (e.g. shared log files, shared test state) |
| Tool/function calling | Giving an agent access to real capabilities — REST calls, webhooks, custom utility functions — and having it decide when to invoke them |

### 2.2 Prompt Engineering (treated as a QA discipline)
| Skill | What it means in practice |
|---|---|
| Reusable prompt modules | Prompts stored as versioned files (`auth_v1.md`), not inline strings buried in code |
| Prompt version control | Treating prompt changes like code changes — diffable, reviewable, rollback-able |
| Determinism tuning | `temperature=0`, structured output formats (JSON schemas), explicit constraints — so the same prompt reliably produces the same *shape* of output |
| Intent-driven prompting | "Test that this RBAC boundary holds" (high-level) instead of "call endpoint X, check status is 403" (micromanaged) — let the agent reason about *how* |

### 2.3 Observability & Debugging
| Skill | What it means in practice |
|---|---|
| Structured logging | JSON/structured log lines, not `print()` — capturing agent inputs, outputs, tool calls, decisions |
| Tracing | A `trace_id` that ties together every step of one multi-step agent run, so you can reconstruct "what happened" end-to-end |
| Root cause analysis | When a test fails, can you tell *why* in under a minute — bad assertion? flaky agent output? real bug in the system under test? |

### 2.4 Core QA / SDET Fundamentals (the non-negotiable baseline)
| Skill | What it means in practice |
|---|---|
| Enterprise test design | Multi-tenant workflows, complex transactions, data validation pipelines — not just single-endpoint CRUD tests |
| Flaky vs. real failure | Distinguishing environment noise / non-determinism from a genuine regression — usually via controlled reruns + evidence |
| Integration testing | UI, REST APIs, webhooks, event-driven systems — knowing which layer to test at and why |
| Regression & CI/CD | How tests plug into a pipeline, what gates a deploy, how to prevent the same bug from recurring |

### 2.5 Technical Environment Readiness
| Skill | What it means in practice |
|---|---|
| Language fluency | Python preferred; comfortable enough to write test logic live without fighting syntax |
| Package management | `pip`/`npm` basics, virtual envs, installing a test lib mid-interview without friction |
| API testing tools | `requests`/`httpx` (Python), `axios` (JS), or Postman — hitting real endpoints and asserting on responses |
| Docker basics (plus) | Not mandatory, but knowing *why* you'd containerize a test environment shows systems thinking |

### 2.6 Human Judgment Layer (what makes this a QA role, not just prompting)
| Skill | What it means in practice |
|---|---|
| Critical review of AI output | Reading agent-generated test cases and catching what's wrong, missing, or low-value — out loud, in the interview |
| Edge case reasoning | Spotting the case the AI didn't think of (e.g. concurrent session invalidation, Unicode in a username field) |
| Systems thinking | Answering "how does this scale / fail / recover in production" — not just "does this test pass" |

---

## 3. How the skill areas map to the pre-built kit

| Skill area (above) | File in `ai-sdet-kit/` that demonstrates it |
|---|---|
| Retry / fallback logic | `core/agent_client.py`, `core/test_runner.py` |
| Structured logging & tracing | `core/logger.py` |
| Prompt version control | `prompts/*.md` + `core/prompt_manager.py` |
| Determinism tuning | `agent_client.py` → `deterministic=True` → `temperature=0` |
| Agent proposes / code executes separation | `core/test_runner.py` → `propose_test_cases()` vs `run()` |
| Flaky vs. real failure classification | `core/test_runner.py` → `FLAKY_RERUN_COUNT` logic |
| Intent-driven prompting | `prompts/auth_v1.md`, `rbac_v1.md`, `data_validation_v1.md` |

---

## 4. Quick pre-interview checklist

- [ ] Pick and install one AI-native editor/plugin (Cursor recommended for speed of setup); practice letting it edit files directly, not copy-paste
- [ ] Unzip `ai-sdet-kit`, run `examples/run_auth_example.py` once, confirm it works on your machine
- [ ] Re-read the talking-points table in the kit's `README.md`
- [ ] Have `ANTHROPIC_API_KEY` (or whatever provider they allow) set as an env var, tested once
- [ ] Skim section 2 of this doc right before the call — it's your vocabulary cheat sheet for narrating decisions out loud
- [ ] Decide your fallback plan if API access is flaky in their sandbox (canned test cases, like `examples/run_auth_example.py` already demonstrates)

---

## 5. One-line answers if they ask you to define something on the spot

- **"What's an AI agent, to you?"** — Something that can reason about a goal, choose tools/actions to pursue it, and adapt based on results — not just a single prompt→response call.
- **"Why separate proposal from execution?"** — So the LLM can't grade its own homework; assertions run in deterministic code, which is auditable and repeatable.
- **"How do you know if something's flaky?"** — Rerun it a fixed number of times under identical conditions; if the outcome is inconsistent, it's flaky — if it fails the same way every time, it's real.
- **"Why version prompts?"** — Because prompt wording changes agent behavior the same way code changes do — you need to diff, review, and roll back.
