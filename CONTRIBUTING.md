# Contributing to BriefTube

Thanks for your interest in contributing to BriefTube! All contributions are welcome — code, documentation, bug reports, feature requests, and more.

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase account (free tier works)

### Frontend (Next.js)

```bash
# Fork and clone the repo
git clone https://github.com/<your-username>/BriefTube.git
cd BriefTube

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Fill in your Supabase credentials

# Start dev server
npm run dev
```

### Worker (Python)

```bash
cd worker

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Copy environment template
cp .env.example .env
# Fill in your credentials

# Run the worker
python main.py
```

### Database

Apply migrations from `supabase/migrations/` in order using the Supabase SQL Editor or the CLI.

## Coding Standards

- **TypeScript** for all frontend code
- Follow existing Tailwind CSS and shadcn/ui patterns
- Run `npm run lint` before submitting
- Keep components small and focused
- Use meaningful variable and function names

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run `npm run lint` and `npm run build` to verify
5. Commit with a descriptive message
6. Push to your fork and open a Pull Request

## Bug Reports & Feature Requests

Use [GitHub Issues](https://github.com/Topxl/BriefTube/issues) with the provided templates:

- **Bug Report** — for something that isn't working correctly
- **Feature Request** — for suggesting new functionality

## Need Help?

Open an issue with the "question" label or start a discussion in the repository.
