<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Autonomous Execution & Zero-Interruption Rules (Universal - All Chats & Sessions)

## 1. Unattended Autonomous Operation (Strict Zero-Interruption Across ALL Chats)
- **Universal Rule for ALL Chat Sessions**: In this chat, and in ANY future or separate chat session, NEVER halt, pause, or prompt the user for permissions, micro-confirmations, or approvals for routine tasks.
- **Auto-Allow All Routine & Minor Actions (100% Pre-Authorized - ZERO Prompts)**:
  - Reading, creating, editing, refactoring, and deleting files within the workspace (`src/`, `public/`, `tests/`, `scripts/`, data JSON files, configs).
  - Executing terminal commands, builds, linting, dev servers, and tests (`npm run dev`, `npm run build`, `npm test`, `npx playwright test`, `node ...`, `python ...`).
  - Standard non-destructive version control commands (`git status`, `git diff`, `git log`, `git add`, `git commit`).
  - Installing dependencies and running scripts.
- **End-to-End Autonomous Execution**: Always complete user instructions end-to-end automatically. Do NOT stop midway asking "Should I proceed?", "Kya main ye karoon?", or "Do you want me to do this?". Apply changes, verify them, and present the final results directly.

## 2. Vishwakarma Atta Chakki & Admin Panel Pre-Approval
- **Vishwakarma Atta Chakki Customer App & Vishwakarma Admin Panel** are 100% pre-authorized.
- The agent has full authority to:
  - Launch local dev servers (`localhost:3000`).
  - Open, navigate, test, and preview all Vishwakarma pages and the Vishwakarma Admin Panel (`/admin`, `/admin/orders`, `/admin/products`, `/admin/prices`, `/admin/customers`, `/admin/settings`).
  - Run Playwright automated browser tests, capture screenshots, and inspect console logs.
  - Modify orders data (`orders_data.json`), customer profiles, prices, products, and admin settings.
- **ZERO permissions required** for any of these operations.

## 3. Strict Boundary: Gmail & Personal Accounts Strictly Forbidden
- **NEVER Access Gmail**: Under NO circumstances should Gmail, Google Workspace personal email, personal messages, contacts, or personal calendar be opened, searched, or accessed.
- **Do Not Even Ask**: Do NOT ask user permission to open Gmail or personal accounts — access is permanently forbidden.
- **Credential Stores**: Never inspect private credential stores outside the workspace (`~/.ssh/`, `~/.aws/`, cloud tokens).

## 4. Safety Guardrails
- **Destructive Commands Strictly Blocked**: Never execute destructive system commands (`rm -rf /`, `rmdir /s /q C:\`, `git push --force`, `git reset --hard` to remote branches).
- Workspace files and project directories are completely safe to edit and manage autonomously.

