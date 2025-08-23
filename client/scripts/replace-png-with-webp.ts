import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Replace __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extensionsToCheck = [".ts", ".tsx", ".js", ".jsx"];
const projectDir = path.join(__dirname, "..", "src");

const replaceInFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, "utf-8");
  // Replace .png, .jpg, and .jpeg with .webp
  let updated = content.replace(/\.(png|jpg|jpeg)(["'])/g, ".webp$2");

  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf-8");
    console.log(`📝 Updated: ${filePath}`);
  }
};

const walkDir = (dir: string) => {
  fs.readdirSync(dir).forEach((entry) => {
    const entryPath = path.join(dir, entry);
    const stats = fs.statSync(entryPath);

    if (stats.isDirectory()) {
      walkDir(entryPath);
    } else if (extensionsToCheck.includes(path.extname(entry))) {
      replaceInFile(entryPath);
    }
  });
};

walkDir(projectDir);
