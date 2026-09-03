import fs from "fs";
import path from "path";

const root = "src";
const files = [];
function walk(dir){
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p = path.join(dir,e.name);
    if(e.isDirectory()) walk(p);
    else if(/\.(tsx|ts)$/.test(p)) files.push(p);
  }
}
walk(root);

let changed=0;
for(const f of files){
  let t = fs.readFileSync(f,"utf8");
  const orig=t;

  // Fix text: hardcoded dark text without dark: on light backgrounds in app pages
  // Common offenders: text-zinc-900/800/700 used inside cards with bg-white
  // We add dark: counterparts globally where missing

  // Fix Card containers that use bg-white without dark variant
  // Already ui.tsx Card has dark:bg-zinc-900, safe.

  // Fix inline text that appears without dark:text - add dark:text-zinc-100 where pattern is text-zinc-900 without dark:
  // Only patch lines that have text-zinc-900/800/700 and no dark:text at all on same element
  t = t.split("\n").map(line=>{
    if(line.includes("text-zinc-900") && !line.includes("dark:text") && line.includes("className")){
      return line.replace(/text-zinc-900/g, "text-zinc-900 dark:text-zinc-100");
    }
    if(line.includes("text-zinc-800") && !line.includes("dark:text") && line.includes("className")){
      return line.replace(/text-zinc-800/g, "text-zinc-800 dark:text-zinc-200");
    }
    return line;
  }).join("\n");

  // Fix muted secondary text: text-zinc-600/500 should have dark variant
  t = t.split("\n").map(line=>{
    if(line.includes("text-zinc-600") && !line.includes("dark:text-zinc") && line.includes("className")){
      return line.replace(/text-zinc-600/g, "text-zinc-600 dark:text-zinc-400");
    }
    if(line.includes("text-zinc-500") && !line.includes("dark:text-zinc") && line.includes("className")){
      return line.replace(/text-zinc-500/g, "text-zinc-500 dark:text-zinc-400");
    }
    return line;
  }).join("\n");

  // Fix bg-zinc-50 helper cards without dark variant
  t = t.split("\n").map(line=>{
    if(line.includes("bg-zinc-50") && !line.includes("dark:bg") && line.includes("className")){
      return line.replace("bg-zinc-50", "bg-zinc-50 dark:bg-zinc-800/60");
    }
    if(line.includes("bg-white") && line.match(/className=.*bg-white/) && !line.includes("dark:bg") && f.includes("src/app") && !f.includes("components/ui")){
      // don't double patch Button etc
      if(line.includes("rounded-xl") || line.includes("rounded-lg") || line.includes("border")){
        return line.replace("bg-white", "bg-white dark:bg-zinc-900");
      }
    }
    return line;
  }).join("\n");

  if(t!==orig){ fs.writeFileSync(f,t,"utf8"); changed++; console.log("patched", f); }
}
console.log("done patched", changed);

// Also fix globals: ensure dark body text contrast
let g = fs.readFileSync("src/app/globals.css","utf8");
if(!g.includes("color: var(--foreground)")){
  g = g.replace("html { font-family:", "html { color: var(--foreground); font-family:");
  fs.writeFileSync("src/app/globals.css", g, "utf8");
  console.log("patched globals.css");
}
