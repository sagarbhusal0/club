import fs from "fs";
import { globSync } from "fs";
import path from "path";

// find risky dark readability
const files = [];
function walk(dir){
  for(const e of fs.readdirSync(dir, {withFileTypes:true})){
    if(e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if(e.isDirectory()) walk(p);
    else if(e.isFile() && (p.endsWith(".tsx")||p.endsWith(".ts"))) files.push(p);
  }
}
walk("src");

let issues=[];
for(const f of files){
  const t = fs.readFileSync(f,"utf8");
  const lines = t.split("\n");
  lines.forEach((line,i)=>{
    // text-zinc-900/800 without dark: variant, or bg-white without dark:
    if(/text-zinc-900|text-zinc-800|text-black|text-zinc-950/.test(line) && !line.includes("dark:text") && !line.includes("dark:") && line.includes("text-")){
      // allow if it's Button with explicit dark styles already
      if(f.includes("components/ui")) return;
      issues.push(`${path.relative("L:/club",f)}:${i+1} missing dark:text -> ${line.trim().slice(0,110)}`);
    }
    if(/bg-white/.test(line) && !line.includes("dark:bg") && f.includes("src/app")){
      issues.push(`${path.relative("L:/club",f)}:${i+1} bg-white without dark:bg -> ${line.trim().slice(0,110)}`);
    }
  });
}
console.log(issues.slice(0,60).join("\n") || "no obvious hardcoded light-only text found");
console.log("scanned", files.length, "files, issues:", issues.length);
