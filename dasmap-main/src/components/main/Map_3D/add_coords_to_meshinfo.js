// add_coords_to_meshinfo.js
// Usage: node add_coords_to_meshinfo.js
// Requires: node >= 14 (fetch is built-in in Node 18+, for older Node install node-fetch and adjust)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// If Node < 18, uncomment and install node-fetch
// import fetch from "node-fetch";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, "meshInfo.ts");
const OUTPUT_FILE = path.join(__dirname, "meshInfo.withCoords.ts");


if (!fs.existsSync(INPUT_FILE)) {
  console.error("meshInfo.ts not found in the current directory.");
  process.exit(1);
}

const raw = fs.readFileSync(INPUT_FILE, "utf8");

// Simple name extraction (assumes name: "XYZ", entries are JS objects in array)
const nameRegex = /name:\s*"(.*?)"/g;
const names = [];
let m;
while ((m = nameRegex.exec(raw)) !== null) {
  names.push(m[1]);
}

// Build a map from name -> coordinates
const results = {};

function normalizeForQuery(name) {
  // Replace underscores and excess punctuation, remove trailing (2) etc.
  let q = name.replace(/_/g, " ");
  q = q.replace(/\(.*?\)/g, ""); // remove parentheses content
  q = q.replace(/\s+/g, " ").trim();
  // tack on city/province/country to reduce ambiguity
  return `${q}, Dasmariñas, Cavite, Philippines`;
}

async function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function queryNominatim(q) {
  // Use Nominatim search API (jsonv2)
  const url = `https://nominatim.openstreetmap.org/search.php?format=jsonv2&q=${encodeURIComponent(q)}&limit=1`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "meshInfo-updater/1.0 (your-email@example.com)" }});
    if (!res.ok) {
      console.warn("Nominatim non-ok", res.status, res.statusText);
      return null;
    }
    const j = await res.json();
    if (!Array.isArray(j) || j.length === 0) return null;
    const first = j[0];
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    return [lat, lon];
  } catch (err) {
    console.warn("Nominatim error", err && err.message);
    return null;
  }
}

(async () => {
  console.log("Found", names.length, "entries. Starting queries (rate-limited)...");
  for (let i = 0; i < names.length; ++i) {
    const name = names[i];
    const q = normalizeForQuery(name);
    console.log(`(${i+1}/${names.length}) Querying:`, q);
    let coord = await queryNominatim(q);
    if (!coord) {
      // fallback: try without "Dasmariñas"
      console.log(" -> fallback try without city...");
      coord = await queryNominatim(q.replace(", Dasmariñas, Cavite, Philippines", ", Cavite, Philippines"));
    }
    if (!coord) {
      console.log(" -> no result for", name, " — will set coordinates: null");
      results[name] = null;
    } else {
      console.log(" -> got", coord);
      results[name] = coord;
    }
    // respectful rate limit: 1 request per second
    await sleep(1100);
  }

  // Now inject coordinates into file text
  // Strategy: for each occurrence of name: "X", find the next closing brace '},' for that object and insert a coordinates line before the closing brace.
  let out = raw;
  for (const name of names) {
    const coord = results[name];
    // Build insert text
    const insertText = coord ? `  coordinates: [${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}],\n` : `  coordinates: null,\n`;
    // Regex to find the object block where name: "NAME" appears. We'll insert after the line that contains pct_of_city if it exists, else before the closing } of the object.
    const objRegex = new RegExp(`(name:\\s*"${escapeRegExp(name)}"[\\s\\S]*?)(\\n\\s*\\})`, "m");
    const m2 = objRegex.exec(out);
    if (m2) {
      // insert before closing brace
      const idx = m2.index + m2[0].lastIndexOf("\n  }");
      // safer approach: replace the match with match with coordinates inserted
      const before = out.slice(0, m2.index);
      const body = m2[1]; // up to just before the closing brace
      const after = out.slice(m2.index + m2[0].length);
      const newBlock = body + "\n" + insertText + "  }";
      out = before + newBlock + after;
    } else {
      // fallback: simple name-based insertion (less robust)
      const pattern = `name: "${name}",`;
      const pos = out.indexOf(pattern);
      if (pos !== -1) {
        // find the end of the object by finding the next '},'
        const objStart = pos;
        const objEnd = out.indexOf("},", objStart);
        if (objEnd !== -1) {
          const insertPos = objEnd; // before the closing brace comma
          out = out.slice(0, insertPos) + "\n" + insertText + out.slice(insertPos);
        } else {
          // give up for this one
          console.warn("Couldn't insert for", name);
        }
      } else {
        console.warn("Name pattern not found in file for", name);
      }
    }
  }

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, out, "utf8");
  console.log("Wrote", OUTPUT_FILE, " — done.");
})();
function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
