# 🧠 AI Code Reviewer (Local-First)

A **diff-aware code review engine** that analyzes git changes to detect **security vulnerabilities, performance issues, and code quality problems** — built with a **local-first rule engine** and optional AI augmentation.

Designed for engineers who care about **speed, determinism, and production-grade reliability**.

---

## 🚀 Features

* 🔍 **Diff-based analysis** (no full repo scan required)
* 🛡️ Detects **security issues** (SQL Injection, unsafe patterns)
* ⚡ Identifies **performance risks** (N+1, blocking patterns)
* 🧹 Flags **code quality issues** (debug logs, bad practices)
* 🧠 Modular **rule engine (extensible)**
* 🤖 Optional **AI integration (LLM fallback)**
* 💨 **Fast & deterministic** (no external dependency required)
* 🔌 Ready for **CI/CD & PR integration**

---

## 🏗️ Architecture

```
Git Diff → Parser → Rule Engine → Issues Output
                 ↘ (optional AI analysis)
```

---

## 📦 Tech Stack

* Node.js (ES Modules)
* Express
* Rule-based analysis engine
* Optional: OpenAI API (for AI augmentation)

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/ai-code-reviewer.git
cd ai-code-reviewer
npm install
```

---

## 🔐 Environment Setup

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
PORT=3000
```

> ⚠️ AI features are optional. The system works fully in local mode without API access.

---

## ▶️ Run the Server

```bash
node src/index.js
```

---

## 🧪 Usage

### API Endpoint

```
POST /review
```

### Example Request

```bash
curl -X POST http://localhost:3000/review \
-H "Content-Type: application/json" \
-d '{
  "diff": "diff --git a/app.js b/app.js\n+ console.log(user)\n+ const q = \"SELECT * FROM users WHERE id=\" + userId;"
}'
```

---

## 📤 Example Response

```json
{
  "totalIssues": 2,
  "issues": [
    {
      "type": "quality",
      "severity": "low",
      "file": "app.js",
      "description": "Debug log in code",
      "fix": "Remove before production"
    },
    {
      "type": "security",
      "severity": "critical",
      "file": "app.js",
      "description": "SQL Injection via string concatenation",
      "fix": "Use parameterized queries"
    }
  ]
}
```

---

## 🧠 Rule Engine

Rules are modular and extensible.

### Example Rules:

* SQL Injection detection
* Debug logs in production
* N+1 query patterns
* Unsafe string concatenation

### Add your own rule:

```js
export function customRule(change, file) {
  if (change.content.includes("eval(")) {
    return {
      type: "security",
      severity: "high",
      file,
      description: "Use of eval is unsafe",
      fix: "Avoid eval and use safer alternatives"
    };
  }
}
```

---

## ⚡ Local-First Philosophy

This project prioritizes:

* ✅ Deterministic output
* ✅ Zero API dependency
* ✅ Sub-10ms execution
* ✅ Full control over logic

AI is used as an **augmentation layer**, not a dependency.

---

## 🤖 AI Integration (Optional)

When enabled:

* Enhances detection beyond rule-based limits
* Adds contextual reasoning
* Can suggest fixes

Fallback mode ensures:

* No crashes on API failure
* System continues to operate locally

---

## 🛡️ Security Considerations

* No secrets are sent externally (unless AI enabled)
* Input size limits recommended
* Designed to avoid prompt injection risks

---

## 📈 Roadmap

* [ ] AST-based parsing (tree-sitter)
* [ ] Language-specific analyzers (JS, PHP)
* [ ] GitHub / GitLab PR integration
* [ ] Multi-agent AI system
* [ ] Caching & cost optimization
* [ ] SaaS deployment layer

---

## 🧩 Use Cases

* Pre-commit hooks
* CI/CD pipelines
* PR automated reviews
* Security scanning layer
* Developer productivity tooling

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

This means:

* If you modify and distribute this code, you must open-source your changes.
* If you run this as a service (e.g., SaaS), you must also make the source code available.

See the `LICENSE` file for details.

---

## ⚔️ Philosophy

> Good engineers write code.
> Great engineers build systems that prevent bad code.

---

## 🤝 Contributing

PRs, ideas, and rule contributions are welcome.

---

## ⭐ Support

If you find this useful, give it a star — it helps visibility and future development.
Commercial licensing is available for organizations that wish to use this project without AGPL obligations.

---
