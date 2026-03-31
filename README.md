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
skillforge "Build a daily weather briefing" --pro --api-key sk_live_xxx
```

## Features

- **AI-Powered Generation** — Uses advanced language models to understand your intent
- **Spec-Compliant Output** — Every skill follows the OpenClaw AgentSkills specification exactly
- **Free Tier** — Generate SKILL.md and skill.json at no cost
- **Pro Tier ($9/mo)** — Script scaffolding, API references, one-click publish

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
skillforge config:set-api-key sk_live_xxx

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
| Free | $0/mo | SKILL.md + skill.json generation |
| Pro | $9/mo | Scripts, API references, publish |
| Team | $29/mo | Templates, sharing, analytics |

## Documentation

- [OpenClaw AgentSkills Spec](https://docs.openclaw.ai/skills)
- [ClawHub](https://clawhub.ai)

## License

MIT © 2026 North Star Holdings

---

Built with [Astra Web Dev](https://astrawebdev.com)
