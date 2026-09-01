import fs from "fs";
let t = fs.readFileSync("src/components/ui.tsx","utf8");
t = t.replace(/focus:bg-white/g, "focus:bg-white dark:focus:bg-zinc-900");
t = t.replace(/focus:border-zinc-900/g, "focus:border-zinc-900 dark:focus:border-zinc-300");
fs.writeFileSync("src/components/ui.tsx", t, "utf8");
console.log("fixed ui.tsx inputs for dark focus");

// Fix autofill white bg in dark mode
let g = fs.readFileSync("src/app/globals.css","utf8");
if(!g.includes("autofill")){
  g += `
/* fix Chrome autofill white flash in dark */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
select:-webkit-autofill {
  -webkit-text-fill-color: var(--foreground);
  transition: background-color 5000s ease-in-out 0s;
}
.dark input:-webkit-autofill,
.dark textarea:-webkit-autofill,
.dark select:-webkit-autofill {
  caret-color: #f5f5f4;
  -webkit-text-fill-color: #f5f5f4;
  box-shadow: 0 0 0px 1000px #27272a inset;
}
`;
  fs.writeFileSync("src/app/globals.css", g, "utf8");
  console.log("fixed globals autofill");
}
console.log("done");
