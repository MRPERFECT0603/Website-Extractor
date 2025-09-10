import fs from "fs";
import yaml from "js-yaml";

// 1. Load scraped CSS
const cssData = JSON.parse(fs.readFileSync("youtube-css.json", "utf8"));
const allCss = cssData.map(c => c.text).join("\n");

// 2. Regex helpers
const colorRegex = /#[0-9a-f]{3,8}\b/gi;
const rgbaRegex = /rgba?\([^)]+\)/gi;
const weightRegex = /font-weight:\s*(\d+)/gi;
const radiusRegex = /border-radius:\s*([^;]+)/gi;
const durationRegex = /(animation-duration|transition-duration):\s*([^;]+)/gi;

// Extract values
const colors = [...new Set((allCss.match(colorRegex) || []).concat(allCss.match(rgbaRegex) || []))];
const weights = [...new Set([...allCss.matchAll(weightRegex)].map(m => m[1]))];
const radii = [...new Set([...allCss.matchAll(radiusRegex)].map(m => m[1].trim()))];
const durations = [...new Set([...allCss.matchAll(durationRegex)].map(m => m[2].trim()))];

// 3. Define all expected keys
const keys = [
  "cx-color-primary", "cx-color-primary-accent", "cx-color-secondary",
  "cx-color-success", "cx-color-success-accent", "cx-color-info",
  "cx-color-info-accent", "cx-color-warning", "cx-color-warning-accent",
  "cx-color-danger", "cx-color-danger-accent", "cx-color-text",
  "cx-color-background", "cx-color-background-dark", "cx-color-light",
  "cx-color-medium", "cx-color-dark", "cx-color-inverse",
  "cx-color-visual-focus", "cx-color-ghost", "cx-color-ghost-animation",
  "cx-font-weight-light", "cx-font-weight-normal", "cx-font-weight-semi",
  "cx-font-weight-bold", "btf-delay", "cx-animation-duration",
  "cx-buttons-border-radius", "cx-buttons-border-width", "cx-ghost-radius",
  "cx-page-width-max", "cx-popover-max-width", "cx-popover-min-width",
  "cx-spatial-base", "cx-spinner-animation-time", "cx-spinner-border-width",
  "cx-spinner-primary-color", "cx-spinner-radius",
  "cx-spinner-secondary-color", "cx-spinner-size",
  "cx-transition-duration", "cx-visual-focus-width"
];

// 4. Fill values (heuristics or defaults)
function fallback(key) {
  if (key.includes("danger")) return "#aa0808";
  if (key.includes("warning")) return "#b44f00";
  if (key.includes("success")) return "#256f3a";
  if (key.includes("info")) return "#0064d8";
  if (key.includes("primary")) return "#055f9f";
  if (key.includes("secondary")) return "#556b82";
  if (key.includes("background-dark")) return "#212738";
  if (key.includes("background")) return "#f4f4f4";
  if (key.includes("inverse")) return "#ffffff";
  if (key.includes("ghost-animation")) return "rgba(255, 255, 255, 0.2)";
  if (key.includes("font-weight-light")) return "300";
  if (key.includes("font-weight-normal")) return "400";
  if (key.includes("font-weight-semi")) return "600";
  if (key.includes("font-weight-bold")) return weights.includes("700") ? "700" : "700";
  if (key.includes("border-radius")) return radii[0] || "2rem";
  if (key.includes("animation-duration")) return durations[0] || "1s";
  if (key.includes("transition-duration")) return "0.5s";
  if (key.includes("btf-delay")) return "300ms";
  return "#cccccc"; // generic fallback
}

// 5. Build defaults with anchors
const defaults = {};
keys.forEach(k => {
  defaults[k] = { [`&${k}`]: fallback(k) };
});

// 6. Build variablesMapping with aliases
const variablesMapping = {};
keys.forEach(k => {
  variablesMapping[`--${k}`] = `*${k}`;
});

// 7. Build final YAML structure
const yamlOutput = {
  type: "initializr-project-feature-set",
  defaults,
  features: [
    {
      id: "ui-boilerplate",
      variablesMapping
    }
  ]
};

// 8. Dump YAML with anchors
function dumpWithAnchors(obj) {
  let text = yaml.dump(obj, { lineWidth: -1 });
  // Convert '{'&cx-color-primary':'#fff'} → '&cx-color-primary "#fff"'
  text = text.replace(/'(&[^']+)':\s*'([^']+)'/g, '$1 "$2"');
  return text;
}

fs.writeFileSync("design-language.yml", dumpWithAnchors(yamlOutput));

console.log("✅ Generated design-language.yml exactly like your template");