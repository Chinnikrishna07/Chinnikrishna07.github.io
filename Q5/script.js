// Initialize Mermaid.js for diagram rendering
mermaid.initialize({ startOnLoad: true });

// DOM element references
const schemaInput = document.getElementById('schema-input');
const generateBtn = document.getElementById('generate-btn');
const diagramContainer = document.getElementById('er-diagram-container');
const glossaryContainer = document.getElementById('glossary-container');
const actionsDiv = document.getElementById('actions');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const outputArea = document.getElementById('output-area');

// Example JSON to pre-fill the textarea for demonstration
const exampleJson = {
  "tables": [
    {
      "name": "users",
      "description": "Stores user account information.",
      "columns": [
        { "name": "id", "type": "INT", "constraints": "PRIMARY KEY", "description": "Unique identifier for the user." },
        { "name": "username", "type": "VARCHAR(50)", "constraints": "NOT NULL, UNIQUE", "description": "User's unique username." },
        { "name": "email", "type": "VARCHAR(100)", "constraints": "NOT NULL, UNIQUE", "description": "User's email address." },
        { "name": "created_at", "type": "TIMESTAMP", "constraints": "DEFAULT CURRENT_TIMESTAMP", "description": "Timestamp of account creation." }
      ]
    },
    {
      "name": "posts",
      "description": "Stores blog posts created by users.",
      "columns": [
        { "name": "id", "type": "INT", "constraints": "PRIMARY KEY", "description": "Unique identifier for the post." },
        { "name": "user_id", "type": "INT", "constraints": "FOREIGN KEY", "description": "References the user who created the post." },
        { "name": "title", "type": "VARCHAR(255)", "constraints": "NOT NULL", "description": "The title of the blog post." },
        { "name": "body", "type": "TEXT", "constraints": "", "description": "The main content of the post." },
        { "name": "published_at", "type": "TIMESTAMP", "constraints": "", "description": "Timestamp when the post was published." }
      ]
    }
  ],
  "relationships": [
    { "from": "users", "to": "posts", "on": "user_id", "type": "one-to-many" }
  ]
};
schemaInput.value = JSON.stringify(exampleJson, null, 2);


// Event listener for the generate button
generateBtn.addEventListener('click', () => {
    const schemaText = schemaInput.value;
    if (!schemaText) {
        alert("Please paste your schema JSON.");
        return;
    }

    try {
        const schema = JSON.parse(schemaText);
        generateERDiagram(schema);
        generateGlossary(schema);
        actionsDiv.classList.remove('hidden'); // Show the PDF download button
    } catch (error) {
        alert("Invalid JSON format. Please check your input.");
        console.error("JSON Parsing Error:", error);
    }
});

// Function to generate the ER diagram using Mermaid.js
function generateERDiagram(schema) {
    let mermaidString = 'erDiagram\n';
    
    // Add relationships to the string
    schema.relationships.forEach(rel => {
        // Mermaid syntax for relationships, e.g., users ||--o{ posts : "has"
        mermaidString += `    ${rel.from} ||--o{ ${rel.to} : "${rel.on}"\n`;
    });

    diagramContainer.innerHTML = `<div class="mermaid">${mermaidString}</div>`;
    mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
}

// Function to generate the glossary tables
function generateGlossary(schema) {
    glossaryContainer.innerHTML = '<h2>Table Glossary</h2>';

    schema.tables.forEach(table => {
        // Create container and title for each table
        const tableDiv = document.createElement('div');
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = table.name;
        const tableDescription = document.createElement('p');
        tableDescription.textContent = table.description;
        
        // Create the table element for columns
        const tableEl = document.createElement('table');
        tableEl.className = 'table-glossary';
        tableEl.innerHTML = `
            <thead>
                <tr>
                    <th>Column Name</th>
                    <th>Data Type</th>
                    <th>Constraints</th>
                    <th>Description</th>
                </tr>
            </thead>
        `;
        
        const tbody = document.createElement('tbody');
        table.columns.forEach(col => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${col.name}</td>
                <td>${col.type}</td>
                <td>${col.constraints}</td>
                <td>${col.description}</td>
            `;
            tbody.appendChild(row);
        });
        
        tableEl.appendChild(tbody);
        
        // Append all elements to the glossary container
        glossaryContainer.appendChild(tableTitle);
        glossaryContainer.appendChild(tableDescription);
        glossaryContainer.appendChild(tableEl);
    });
}


// Event listener for the PDF download button
downloadPdfBtn.addEventListener('click', () => {
    // Temporarily set a white background to ensure clean capture
    outputArea.style.backgroundColor = 'white';

    html2canvas(outputArea).then(canvas => {
        // Reset the background color after capture
        outputArea.style.backgroundColor = '';

        const imgData = canvas.toDataURL('image/png');
        // Use the jsPDF library from the global window object
        const { jsPDF } = window.jspdf;
        
        // Calculate PDF dimensions to fit the image
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('data-dictionary.pdf');
    });
});