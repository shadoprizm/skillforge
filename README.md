# SkillForge

> **Describe your skill. Ship it in seconds.**

SkillForge is an AI-powered CLI that generates complete, publish-ready OpenClaw agent skills from natural language descriptions.

## Installation

```bash
npm install -g @shadoprizm/skillforge
```

## Quick Start

```bash
# Generate a skill from a description
skillforge "Monitor Hacker News for AI tool launches and email me daily summaries"

# Specify output directory
skillforge "Build a GitHub PR reviewer notifier" --output ./gh-pr-skill

# Specify scripting language
skillforge "Scan websites for security issues" --output ./sec-skill --lang python

# Pro features (requires API key)
skillforge "Build a daily weather briefing" --pro --api-key FAKE_EXAMPLE_KEY
```

## Audit Existing Skills

Evaluate any OpenClaw skill for quality, structure, completeness, and safety:

```bash
# Audit a local skill directory (default table output)
skillforge audit ./my-skill

# JSON output for CI/CD pipelines
skillforge audit ./my-skill --format json

# Markdown report for documentation
skillforge audit ./my-skill --format markdown

# Pro: AI-powered deep analysis
skillforge audit ./my-skill --pro --api-key sk_pro_xxx
```

The audit checks 5 categories and produces a scored report with a letter grade:

| Category | Weight | What It Checks |
|----------|--------|----------------|
| **Structure** | 20% | SKILL.md, skill.json, file organization |
| **Completeness** | 25% | Required sections, metadata fields |
| **Quality** | 25% | Description clarity, workflow detail, examples |
| **Safety** | 20% | Dangerous patterns, hardcoded secrets |
| **Compatibility** | 10% | Category validity, tool references, semver |

## Features

- **AI-Powered Generation** — Uses advanced language models to understand your intent
- **Skill Auditing** — Evaluate existing skills for quality, structure, completeness, and safety
- **Spec-Compliant Output** — Every skill follows the OpenClaw AgentSkills specification exactly
- **No API Key Required** — Generate complete skill scaffolds instantly, no account needed
- **Pro Tier ($9/mo)** — Script scaffolding, API references, one-click publish
- **Multi-Provider Support** — Works with ZAI, OpenAI, OpenRouter, and Qwen

## No API Key Required

SkillForge works **out of the box** with zero configuration. When no API key is detected, it uses template-based generation to create a complete, well-structured skill scaffold from your description.

The template mode generates:
- Proper OpenClaw SKILL.md with triggers, workflow, and tools sections
- Valid skill.json with correct metadata and tags
- Well-organized structure following the AgentSkills specification

This means you can start building skills immediately — no sign-ups, no API keys, no costs.

## Configure AI (Optional)

For AI-powered generation with enhanced quality and Pro features, set one environment variable before running SkillForge:

```bash
# Option 1: ZAI (Recommended - Free via OpenClaw)
export ZAI_API_KEY=your_zai_api_key

# Option 2: OpenAI
export OPENAI_API_KEY=sk-xxxx

# Option 3: OpenRouter
export OPENROUTER_API_KEY=sk-or-xxxx

# Option 4: Qwen/Alibaba
export QWEN_API_KEY=your_qwen_api_key
```

Priority order: ZAI → OpenAI → OpenRouter → Qwen

When an API key is detected, SkillForge automatically:
- Uses the appropriate provider and model
- Enables Pro tier features (scripts, references, README)
- Generates higher-quality, AI-optimized skill definitions

## How It Works

1. **Describe** — Type a natural language description of your skill
2. **Generate** — SkillForge's AI creates a complete, spec-compliant skill
3. **Ship** — Copy to your OpenClaw skills directory and start using it

## Output Structure

### Free Tier

```
my-skill/
├── SKILL.md     # Full skill definition
└── skill.json   # ClawHub metadata
```

### Pro Tier

```
my-skill/
├── SKILL.md
├── skill.json
├── README.md
├── references/
│   └── <service>-api.md   # Auto-generated API reference
└── scripts/
    ├── main.ts            # Implementation boilerplate
    └── tools.ts           # Helper utilities
```

## Configuration

```bash
# Set your API key for Pro features
skillforge config:set-api-key FAKE_EXAMPLE_KEY

# Set default language
skillforge config:set-language python

# Set default output directory
skillforge config:set-output ./my-skills

# View current config
skillforge config
```

## Requirements

- Node.js 18+
- npm or yarn

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0/mo | SKILL.md + skill.json (template mode, no API key needed) |
| Pro | $9/mo | Scripts, API references, publish (requires API key) |
| Team | $29/mo | Templates, sharing, analytics |

## Documentation

- [OpenClaw AgentSkills Spec](https://docs.openclaw.ai/skills)
- [ClawHub](https://clawhub.ai)

## License

MIT © 2026 North Star Holdings

---

Built with [Astra Web Dev](https://astrawebdev.com)
