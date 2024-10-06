const fs = require("fs");
const path = require("path");
const ejs = require("ejs");

// Function to convert EJS to HTML
async function ejs2html({ filePath, outPath, options }) {
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    const html = await ejs.render(data, options);
    await fs.promises.writeFile(outPath, html);
    console.log(`Generated ${outPath}`);  // Use backticks for template literals
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);  // Use backticks for template literals
  }
}

// Ensure the public directory exists
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// List of your EJS files in the 'views' folder
const files = [
  { ejsFile: "index.ejs", htmlFile: "index.html", options: { messages: { error: [] } } },
  { ejsFile: "employees.ejs", htmlFile: "employees.html", options: { employees: [] } },
  { ejsFile: "employee-dashboard.ejs", htmlFile: "employee-dashboard.html", options: { user: { username: "Guest" } } },
  { ejsFile: "add-employee.ejs", htmlFile: "add-employee.html", options: {} },
  { ejsFile: "edit-employee.ejs", htmlFile: "edit-employee.html", options: { employee: { id: "", name: "" } } }
];

// Iterate over each file to generate HTML
async function buildHTMLFiles() {
  for (const file of files) {
    const filePath = path.join(__dirname, "views", file.ejsFile);
    const outPath = path.join(publicDir, file.htmlFile);
    await ejs2html({ filePath, outPath, options: file.options });
  }
}

// Start the build process
buildHTMLFiles().then(() => {
  console.log("All HTML files generated successfully.");
}).catch(err => {
  console.error("Error generating HTML files:", err);
});
