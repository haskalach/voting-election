# 📊 Diagram Files Organization

All architecture diagrams are now stored as both **editable Mermaid source files** and can be converted to **PNG snapshots**.

## 📁 Directory Structure

```
docs/
├── tech_design_res.md           ← Main technical design document (references all diagrams)
└── diagrams/                    ← All diagram files here
    ├── README.md                ← Instructions for generating PNG files
    ├── package.json             ← Node.js dependencies for diagram generation
    ├── generate-diagrams.bat    ← Windows batch script to generate all PNGs
    ├── generate-diagrams.sh     ← Linux/macOS shell script
    │
    ├── 01-system-architecture.mmd      ← System 4-tier architecture
    ├── 02-database-erd.mmd             ← Database entity relationships
    ├── 03-auth-flow.mmd                ← JWT authentication sequence
    ├── 04-rbac-flow.mmd                ← Role-based access control flow
    ├── 05-deployment-architecture.mmd  ← Production deployment architecture
    ├── 06-frontend-architecture.mmd    ← Angular module structure
    │
    ├── 01-system-architecture.png      ← Generated from .mmd
    ├── 02-database-erd.png             ← Generated from .mmd
    ├── 03-auth-flow.png                ← Generated from .mmd
    ├── 04-rbac-flow.png                ← Generated from .mmd
    ├── 05-deployment-architecture.png  ← Generated from .mmd
    └── 06-frontend-architecture.png    ← Generated from .mmd
```

## 🎯 Quick Start

### Option 1: Generate PNG Diagrams Automatically

**Windows (PowerShell):**

```powershell
cd docs/diagrams
./generate-diagrams.bat
```

**macOS/Linux (Bash):**

```bash
cd docs/diagrams
chmod +x generate-diagrams.sh
./generate-diagrams.sh
```

### Option 2: Manual Generation

```bash
# Install mermaid-cli globally (one-time setup)
npm install -g @mermaid-js/mermaid-cli

# Navigate to diagrams folder
cd docs/diagrams

# Generate one or all diagrams
mmdc -i 01-system-architecture.mmd -o 01-system-architecture.png -t dark
mmdc -i 02-database-erd.mmd -o 02-database-erd.png -t dark
# ... repeat for other files
```

## 📖 Using the Diagrams

### In Technical Documentation

All diagrams are referenced in `docs/tech_design_res.md` with:

- Link to editable `.mmd` source file
- Link to `.png` snapshot

### In GitHub

- `.mmd` files render automatically in GitHub as Mermaid diagrams
- `.png` snapshots can be embedded in README files

### In Presentations

- Use PNG snapshots for PowerPoint, Google Slides, etc.
- Always edit the `.mmd` source and regenerate PNG for changes

## ✏️ Editing Workflow

1. **Edit the Mermaid source** (`.mmd` file)
2. **Preview changes** on [mermaid.live](https://mermaid.live)
3. **Save the updated `.mmd` file**
4. **Regenerate PNG**: `mmdc -i filename.mmd -o filename.png -t dark`
5. **Commit both files** to version control

## 🔄 Version Control

Always commit **both** files:

- `.mmd` - Editable source (can be diffs, shows changes clearly)
- `.png` - Rendered snapshot (for quick viewing)

Example:

```
git add docs/diagrams/01-system-architecture.mmd
git add docs/diagrams/01-system-architecture.png
git commit -m "Update system architecture diagram with Redis caching"
```

## 🎨 Customization

Edit the theming and output options in `generate-diagrams.bat` or `generate-diagrams.sh`:

```bash
# Available themes: default, dark, forest, neutral
mmdc -i diagram.mmd -o diagram.png -t dark --width 1200 --height 800
```

## 📚 Diagram Index

| #   | Name                  | Type                | Purpose                             |
| --- | --------------------- | ------------------- | ----------------------------------- |
| 1   | System Architecture   | Graph/Flowchart     | 4-tier architecture overview        |
| 2   | Database ERD          | Entity-Relationship | Schema and relationships            |
| 3   | Auth Flow             | Sequence            | JWT authentication process          |
| 4   | RBAC Flow             | Flowchart           | Role-based access control decisions |
| 5   | Deployment            | Graph/Flowchart     | Production infrastructure           |
| 6   | Frontend Architecture | Graph/Flowchart     | Angular module structure            |

---

**Last Updated**: April 2, 2026  
**Status**: ✅ All diagrams created and organized
