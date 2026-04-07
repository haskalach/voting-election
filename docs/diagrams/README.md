# Architecture Diagrams - Mermaid Diagram Sources

This folder contains all architecture and design diagrams for the Election-Voting Supervision System.

## 📊 Diagram Files

### Mermaid Source Files (.mmd)

Each diagram has a corresponding `.mmd` source file that can be edited and regenerated.

| File                             | Description                                                           |
| -------------------------------- | --------------------------------------------------------------------- |
| `01-system-architecture.mmd`     | 4-tier system architecture (Client → API → Business Logic → Database) |
| `02-database-erd.mmd`            | Entity-Relationship Diagram with all 8 database entities              |
| `03-auth-flow.mmd`               | JWT authentication and authorization flow sequence                    |
| `04-rbac-flow.mmd`               | Role-Based Access Control decision tree                               |
| `05-deployment-architecture.mmd` | Production deployment with load balancer, 3 servers, cache, DB        |
| `06-frontend-architecture.mmd`   | Angular module structure and component organization                   |

## 🖼️ PNG Snapshots

PNG snapshots are automatically generated from the Mermaid source files:

- `01-system-architecture.png`
- `02-database-erd.png`
- `03-auth-flow.png`
- `04-rbac-flow.png`
- `05-deployment-architecture.png`
- `06-frontend-architecture.png`

## 🔄 Generating PNG Diagrams

### Windows (PowerShell)

```bash
# Navigate to diagrams folder
cd docs/diagrams

# Run the batch file
.\generate-diagrams.bat

# Or manually install mmdc and generate
npm install
npx mmdc -i 01-system-architecture.mmd -o 01-system-architecture.png -t dark
```

### macOS / Linux

```bash
# Navigate to diagrams folder
cd docs/diagrams

# Make script executable
chmod +x generate-diagrams.sh

# Run the script
./generate-diagrams.sh
```

### Manual Generation (Any OS with Node.js)

```bash
# Install mermaid-cli globally
npm install -g @mermaid-js/mermaid-cli

# Generate all diagrams
cd docs/diagrams
mmdc -i 01-system-architecture.mmd -o 01-system-architecture.png -t dark
mmdc -i 02-database-erd.mmd -o 02-database-erd.png -t dark
mmdc -i 03-auth-flow.mmd -o 03-auth-flow.png -t dark
mmdc -i 04-rbac-flow.mmd -o 04-rbac-flow.png -t dark
mmdc -i 05-deployment-architecture.mmd -o 05-deployment-architecture.png -t dark
mmdc -i 06-frontend-architecture.mmd -o 06-frontend-architecture.png -t dark
```

## 📝 Editing Diagrams

1. Open the `.mmd` file in your text editor
2. Modify the Mermaid syntax
3. Save the file
4. Re-generate PNG: `mmdc -i filename.mmd -o filename.png -t dark`
5. Update references in `tech_design_res.md` if needed

## 🔗 Viewing Diagrams

### Online

- Paste Mermaid code to [mermaid.live](https://mermaid.live)
- View on GitHub (automatically renders `.mmd` files)

### Locally

- Open PNG files directly
- Use any Markdown viewer that supports embedded images

## 📚 Format: Mermaid Diagram Types

- **Graph/Flowchart** (`graph TB/LR/TD`) - Hierarchical flows and relationships
- **Entity-Relationship Diagram** (`erDiagram`) - Database schema and relationships
- **Sequence Diagram** (`sequenceDiagram`) - Interaction flows between components

## 🎨 Theme

All diagrams are generated with the `dark` theme using `mmdc -t dark`

Alternative themes available:

- `default` - Light background
- `dark` - Dark background
- `forest` - Forest green theme
- `neutral` - Neutral gray theme
