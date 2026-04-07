#!/bin/bash
# Generate PNG diagrams from Mermaid source files

cd $(dirname "$0")

# Install mmdc if not already installed
if ! command -v mmdc &> /dev/null; then
    echo "Installing @mermaid-js/mermaid-cli..."
    npm install
fi

echo "Generating diagram PNG files..."

# Generate each diagram
mmdc -i 01-system-architecture.mmd -o 01-system-architecture.png -t dark
mmdc -i 02-database-erd.mmd -o 02-database-erd.png -t dark
mmdc -i 03-auth-flow.mmd -o 03-auth-flow.png -t dark
mmdc -i 04-rbac-flow.mmd -o 04-rbac-flow.png -t dark
mmdc -i 05-deployment-architecture.mmd -o 05-deployment-architecture.png -t dark
mmdc -i 06-frontend-architecture.mmd -o 06-frontend-architecture.png -t dark

echo "✅ Diagram generation complete!"
echo "PNG files created:"
ls -lh *.png
