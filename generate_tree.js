const fs = require('fs');
const path = require('path');

function generateTree(dir, prefix = '', isLeft = true, depth = 0) {
  if (depth > 4) return ''; // Limit depth to avoid massive output
  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) return '';

  let output = '';
  const files = fs.readdirSync(dir).filter(f => !['node_modules', '.git', 'dist', 'build', 'public', '.next'].includes(f));
  
  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    const filePath = path.join(dir, file);
    const fileStats = fs.statSync(filePath);
    
    output += `${prefix}${isLast ? '└── ' : '├── '}${file}\n`;
    
    if (fileStats.isDirectory()) {
      output += generateTree(filePath, prefix + (isLast ? '    ' : '│   '), false, depth + 1);
    }
  });
  
  return output;
}

const rootDir = __dirname;
let treeOutput = "HR Recruitment Platform - Project Structure\n==========================================\n\n";
treeOutput += "backend\n" + generateTree(path.join(rootDir, 'backend'));
if (fs.existsSync(path.join(rootDir, 'frontend'))) {
  treeOutput += "\nfrontend\n" + generateTree(path.join(rootDir, 'frontend'));
}

const summary = `
==========================================
Summary of Implemented Features & Modules:
==========================================
Backend (Node.js/Express):
- Architecture: Modular structure grouped by domain (src/modules/*)
- Auth Module: Login, JWT generation (access & refresh tokens), Logout functionality.
- Users Module: User management, profiles, validation.
- Candidates Module: Candidate data, workflows, candidate status progression.
- Calls Module: Logging calls, outcome tracking, timeline integration, follow-up scheduling (Today & Upcoming).
- Settings Module: Global configurations for the platform (company details, reminders, resume settings) with Admin role protection.
- Activity Module: Activity feed/audit logs (fetching candidate timelines, etc.).
- Health Module: Application health checks and uptime monitoring.
- Additional Setup: Centralized API response handlers, error handling, auth/role middleware, and Timeline/Notification integrations.

Frontend:
- Structure initialized.
`;

fs.writeFileSync(path.join(rootDir, 'project_summary.txt'), treeOutput + summary);
console.log("project_summary.txt generated successfully.");
