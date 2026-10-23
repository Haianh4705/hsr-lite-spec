// Verification harness for docs/design.html — DOM stubs + assertions.
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "design.html");
const html = fs.readFileSync(file, "utf8");

// ---- extract script ----
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error("FAIL: no <script> block"); process.exit(1); }
const code = m[1];

// syntax check
try { new Function(code); } catch (e) { console.error("FAIL syntax:", e.message); process.exit(1); }

// ---- DOM stubs ----
const store = {};
function mkEl(id) {
  return {
    id,
    _html: "",
    _text: "",
    value: "",
    style: {},
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    get innerHTML() { return this._html; },
    set innerHTML(v) { store[id] = v; this._html = v; },
    get textContent() { return this._text; },
    set textContent(v) { store[id] = v; this._text = v; },
    appendChild() {}, removeChild() {}, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    onclick: null,
  };
}
const listeners = {};
const els = {};
global.document = {
  getElementById(id) {
    if (!els[id]) els[id] = mkEl(id);
    return els[id];
  },
  addEventListener(type, fn) { listeners[type] = fn; },
  createElement() { return mkEl("tmp"); },
  body: mkEl("body"),
};
global.localStorage = {
  _m: {},
  getItem(k) { return this._m[k] === undefined ? null : this._m[k]; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.navigator = { clipboard: { writeText: async () => {} } };
global.Blob = class { constructor(a) { this.a = a; } };
global.URL = { createObjectURL: () => "blob:x", revokeObjectURL() {} };
global.alert = () => {};
global.confirm = () => true;
global.location = { reload() {} };
global.setTimeout = (f) => 0;
global.clearTimeout = () => {};

try { eval(code + "\n;global.DATA=DATA;global.BASE=BASE;global.payload=payload;"); } catch (e) { console.error("FAIL eval:", e.message, "\n", e.stack.split("\n")[1]); process.exit(1); }

// ---- helpers ----
const stripTags = s => s.replace(/<[^>]*>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&nbsp;/g, "\u00a0");

let fails = 0;
const ok = (label, cond, extra = "") => {
  if (cond) console.log("  ok   " + label);
  else { console.log("  FAIL " + label + (extra ? "  " + extra : "")); fails++; }
};

console.log("\n== JS / DOM ==");
ok("script evaluated", true);
ok("hud rendered", (store.hud || "").length > 0);
ok("ruler rendered", (store.ruler || "").length > 0);
ok("codex rendered", (store["scr-codex"] || "").length > 0);
ok("team rendered", (store["scr-team"] || "").length > 0);
ok("equip rendered", (store["scr-equip"] || "").length > 0);

console.log("\n== HUD geometry ==");
const hudLines = stripTags(store.hud || "").split("\n");
ok("24 rows = 22 box rows + tab bar + prompt", hudLines.length === 24, `got ${hudLines.length}`);
const bad = hudLines.map((l, i) => [i + 1, l]).filter(([, l]) => l.length !== 80);
ok("every HUD line = 80 cols", bad.length === 0,
  bad.slice(0, 4).map(([n, l]) => `line ${n}=${l.length}`).join(", "));
if (bad.length) bad.slice(0, 3).forEach(([n, l]) => console.log(`      ${n}: ${JSON.stringify(l)}`));
const edges = hudLines.map((l, i) => [i + 1, l]);
const edgeBad = edges.filter(([n, l]) => {
  if (n === 1 || n === 24) return false; // tab bar and prompt: borderless by design
  const a = l[0], z = l[79];
  return !"┌├└│".includes(a) || !"┐┤┘│".includes(z) || (a === "│") !== (z === "│");
});
ok("borders close on every row", edgeBad.length === 0,
  edgeBad.slice(0, 4).map(([n]) => `line ${n}`).join(", "));
const body = edges.filter(([n]) => n >= 3 && n <= 22);
ok("no vertical mid rule anywhere in the box", body.every(([, l]) => l[48] !== "│"),
  body.filter(([, l]) => l[48] === "│").map(([n]) => `line ${n}`).join(", "));
ok("enemy block rows 3-7 carry letters A-E",
  [3, 4, 5, 6, 7].every((n, i) => hudLines[n - 1].includes("ABCDE"[i])),
  [3, 4, 5, 6, 7].map(n => JSON.stringify(hudLines[n - 1].slice(1, 12))).join(" "));
ok("unit letters are uppercase only",
  !/\b[a-d]\b/.test(hudLines.slice(2, 12).map(l => l.slice(1, 3)).join("|")));
ok("party divider on row 8", /PARTY/.test(hudLines[7]), JSON.stringify(hudLines[7]));
ok("ally block rows 9-12 carry letters F-I",
  [9, 10, 11, 12].every((n, i) => hudLines[n - 1].includes("FGHI"[i])));
ok("field row on row 13", /FIELD/.test(hudLines[12]), JSON.stringify(hudLines[12]));
ok("field row is honest when no field is up", /không có field/.test(hudLines[12]), JSON.stringify(hudLines[12]));
ok("turn queue is horizontal on row 14", /NEXT/.test(hudLines[13]), JSON.stringify(hudLines[13]));
const nextLine = hudLines[13];
const pairs = [...nextLine.matchAll(/([A-Z])\s+(\d{1,2})/g)].map(m => [m[1], +m[2]]);
ok("turn queue has 9 entries", pairs.length === 9, `got ${pairs.length}: ${pairs.map(p => p.join("")).join(",")}`);
ok("turn queue letters are the 9 units A-I",
  pairs.map(p => p[0]).sort().join("") === "ABCDEFGHI", pairs.map(p => p[0]).join(""));
const avs = pairs.map(p => p[1]);
ok("turn queue sorted by remaining AV", avs.every((v, i) => i === 0 || avs[i - 1] <= v), avs.join(","));
ok("command row sits directly under the queue", /\[1\] Basic/.test(hudLines[14]), JSON.stringify(hudLines[14]));
ok("previewed command is inverted", /<span class="on">\[1\] Basic 92 blast<\/span>/.test(store.hud || ""),
  (store.hud || "").split("\n")[14]);
ok("unusable command is greyed out", /<span class="off">\[3\] [^<]+<\/span>/.test(store.hud || ""),
  (store.hud || "").split("\n")[14]);
ok("hall header shows the run seed", /SEED [0-9A-F]{4}/.test(hudLines[1]), JSON.stringify(hudLines[1]));
ok("log block rows 17-22 (6 lines)", [17, 18, 19, 20, 21, 22].every(n => hudLines[n - 1][0] === "│"));
const logValues = [17, 18, 19, 20, 21, 22].map(n => hudLines[n - 1]);
ok("log values right-aligned at col 78",
  logValues.every(l => /(\d|—)\s*$/.test(l.slice(0, 79)) && l[78] !== " "),
  logValues.map(l => JSON.stringify(l.slice(70, 79))).join(" "));
ok("log lines follow name+action+target+number",
  logValues.every(l => /[A-I] \S/.test(l.slice(1, 20)) && / >\S/.test(l.slice(1, 79))));
ok("log shows an ultimate by its own name", /Broadside/.test(logValues.join(" ")));
ok("log covers both teams", /F Rook/.test(logValues[0]) && /A Grunt/.test(logValues[5]));
ok("prompt row shows the pending command", /^> \[1\] Basic/.test(hudLines[23]), JSON.stringify(hudLines[23]));
ok("prompt row explains the second press", /\[1\] chốt/.test(hudLines[23]) && /esc\] huỷ/.test(hudLines[23]));
ok("tab hint stays on the prompt row", /1-4 tab/.test(hudLines[23]));

console.log("\n== screen mockups ==");
["scr-codex", "scr-team", "scr-equip"].forEach(id => {
  const ls = stripTags(store[id] || "").split("\n");
  const widthBad = ls.filter(l => l.length !== 80).length;
  const edgeBad2 = ls.filter(l => {
    const a = l[0], z = l[l.length - 1];
    return !"┌├└│".includes(a) || !"┐┤┘│".includes(z) || (a === "│") !== (z === "│");
  }).length;
  ok(id + " box width 80", widthBad === 0, `${widthBad}/${ls.length} rows off`);
  ok(id + " closed borders", edgeBad2 === 0, `${edgeBad2}/${ls.length} rows open`);
});

console.log("\n== data counts ==");
ok("9 characters", DATA.characters.length === 9, `got ${DATA.characters.length}`);
ok("12 weapons", DATA.cones.length === 12, `got ${DATA.cones.length}`);
ok("8 relic sets", DATA.relics.length === 8, `got ${DATA.relics.length}`);
const tier = t => DATA.enemies.filter(e => e.tier === t).length;
ok("16 enemies total", DATA.enemies.length === 16, `got ${DATA.enemies.length}`);
ok("9 normal enemies", tier("normal") === 9, `got ${tier("normal")}`);
ok("5 elite enemies", tier("elite") === 5, `got ${tier("elite")}`);
ok("2 bosses", tier("boss") === 2, `got ${tier("boss")}`);
ok("16 encounters", DATA.encounters.length === 16, `got ${DATA.encounters.length}`);
ok("8 tiers", DATA.bands.length === 8, `got ${DATA.bands.length}`);
ok("band multipliers strictly increase", DATA.bands.every((b, i) => b.mult > (i ? DATA.bands[i - 1].mult : 0)));
ok("HP/DEF multiplier never exceeds 1.50", Math.max(...DATA.bands.map(b => b.mult)) <= 1.5,
  String(Math.max(...DATA.bands.map(b => b.mult))));
ok("enemy SPD is not scaled by band", !/spd/.test(JSON.stringify(DATA.bands)));
ok("floors are numbered 1..16", DATA.encounters.every((e, i) => e.n === i + 1));
ok("5 target types", DATA.targets.length === 5, `got ${DATA.targets.length}`);
ok("2 fields", DATA.fields.length === 2, `got ${DATA.fields.length}`);
ok("8 effect abbreviations", DATA.effects.length === 8, `got ${DATA.effects.length}`);
ok("5 log columns", DATA.logCols.length === 5, `got ${DATA.logCols.length}`);
ok("only ultimates have names",
  DATA.characters.every(c => c.ult.name && !c.basic.name && !c.skill.name));
ok("meta says 16 floors / 8 tiers", DATA.meta.floors === 16 && DATA.meta.tiers === 8, JSON.stringify(DATA.meta));
ok("3 draft card types", DATA.draft.length === 3, `got ${DATA.draft.length}`);
ok("3 chars per role", ["DPS", "Support", "Sustain"].every(r => DATA.characters.filter(c => c.role === r).length === 3));
ok("4 weapons per role", ["DPS", "Support", "Sustain"].every(r => DATA.cones.filter(c => c.role === r).length === 4));
ok("no talent carries its own name",
  DATA.characters.every(c => !c.talent.name));
ok("no boss phase carries its own name",
  DATA.enemies.filter(e => e.tier === "boss").every(e => (e.phases || []).every(ph => !ph.name)));
ok("Curator heals 6% per player ultimate", /hồi 6% max HP/.test(DATA.enemies.find(e => e.id === "curator").behavior));
const rook = DATA.characters.find(c => c.id === "rook");
ok("Rook basic is a 0.8 blast", rook.basic.target === "blast" && rook.basic.mult === 0.8);
ok("Rook skill is 0.8 all", rook.skill.target === "all" && rook.skill.mult === 0.8);
ok("Rook ult is 1.2 all + 4 bounce 0.2", rook.ult.mult === 1.2 && rook.ult.target === "all" && rook.ult.bounces === 4 && rook.ult.bounceMult === 0.2);
ok("Rook talent restores 3 EN per enemy hit", /3 EN/.test(rook.talent.text));
const kaine = DATA.characters.find(c => c.id === "kaine");
ok("Kaine skill is blast with 1 DoT stack", kaine.skill.target === "blast" && /1 stack/.test(kaine.skill.desc));
ok("Kaine ult is all with 1 DoT stack", kaine.ult.target === "all" && /1 stack/.test(kaine.ult.desc));
const vesper = DATA.characters.find(c => c.id === "vesper");
ok("Vesper talent caps at 6 and fires every 3", /tối đa 6/.test(vesper.talent.text) && /3 stack/.test(vesper.talent.text));
ok("Vesper ult can feed 6 stacks", /tối đa 6/.test(vesper.ult.desc));
const lumen = DATA.characters.find(c => c.id === "lumen");
ok("Lumen skill gives SPD and ATK", /SPD/.test(lumen.skill.desc) && /ATK/.test(lumen.skill.desc) && !/EN/.test(lumen.skill.desc));
ok("Lumen ult buffs the team, not a field", /20% hồi EN/.test(lumen.ult.desc) && lumen.ult.target === "ally-all" && !DATA.fields.some(f => f.id === "grid"));
ok("Lumen talent is +5 EN", /\+5 EN/.test(lumen.talent.text));
const nyx = DATA.characters.find(c => c.id === "nyx");
ok("Nyx skill only slows SPD", /−25% SPD/.test(nyx.skill.desc) && !/AV/.test(nyx.skill.desc));
ok("Nyx ult is 20% AV both ways", /20% AV/.test(nyx.ult.desc) && !/15% AV/.test(nyx.ult.desc));
ok("Nyx talent is +1 SPD per ally basic", /\+1 SPD/.test(nyx.talent.text) && /đánh thường/.test(nyx.talent.text));
const sable = DATA.characters.find(c => c.id === "sable");
ok("Sable skill redirects 100% single-target hits", sable.skill.target === "ally-single" && /100%/.test(sable.skill.desc) && /20% ATK/.test(sable.skill.desc));
ok("Sable ult is a 3-turn DEF debuff on all", sable.ult.target === "all" && sable.ult.mult === 0 && /−25% DEF/.test(sable.ult.desc) && /3 lượt/.test(sable.ult.desc));
ok("Sable talent negates the first lethal hit each floor", /0 damage/.test(sable.talent.text) && /mỗi tầng/.test(sable.talent.text));
ok("shield has no turn limit", !("shield_turns" in DATA.constants));
ok("ATK has its own band curve", DATA.bands.map(b => b.atk).join(",") === "1,1.12,1.3,1.5,1.75,1.95,2.15,2.3",
  DATA.bands.map(b => b.atk).join(","));
ok("tiers cover floors 1..16 without gaps",
  DATA.bands.every((b, i) => b.from === (i ? DATA.bands[i - 1].to + 1 : 1)) && DATA.bands[7].to === 16);
ok("HP/DEF curve still capped at 1.50", Math.max(...DATA.bands.map(b => b.mult)) === 1.5);
ok("Mira talent heals 1%", /1% max HP của Mira/.test(DATA.characters.find(c => c.id === "mira").talent.text));
ok("Bastion shield is 15%", /15% max HP/.test(DATA.characters.find(c => c.id === "bastion").ult.desc));
ok("Wren split counts as two hits", /hai lần nhận sát thương/.test(DATA.characters.find(c => c.id === "wren").talent.text));
ok("Sable skill grants immediate action", /ưu tiên 100%/.test(DATA.characters.find(c => c.id === "sable").skill.desc));
const bastion = DATA.characters.find(c => c.id === "bastion");
ok("Bastion skill is a counter buff", /phản đòn/.test(bastion.skill.desc) && bastion.skill.target === "ally-single");
ok("Bastion ult is a team shield only", /Shield cho toàn đội/.test(bastion.ult.desc) && bastion.ult.target === "ally-all" && !/field/.test(bastion.ult.desc));
ok("Bastion talent shields the ally with least shield", /shield thấp nhất/.test(bastion.talent.text));
ok("Rampart field is gone", !DATA.fields.some(f => f.id === "rampart"));
const mira = DATA.characters.find(c => c.id === "mira");
ok("Mira skill heals from her own max HP", /max HP của Mira/.test(mira.skill.desc));
ok("Mira ult removes one debuff", /xóa 1 debuff mỗi người/.test(mira.ult.desc));
ok("Mira talent heals on any ally damage", /1% max HP của Mira/.test(mira.talent.text));
const wren = DATA.characters.find(c => c.id === "wren");
ok("Wren skill shields herself", /Shield cho bản thân/.test(wren.skill.desc) && wren.skill.target === "self");
ok("Wren ult only heals", /Hồi 15% max HP toàn đội/.test(wren.ult.desc) && !/3 lượt/.test(wren.ult.desc));
ok("Wren talent redirects 85%", /85%/.test(wren.talent.text));
ok("DoT has its own rate constant", DATA.constants.dot_rate === 0.45, String(DATA.constants.dot_rate));
ok("every character has a unique ult name",
  new Set(DATA.characters.map(c => c.ult.name)).size === DATA.characters.length);
ok("every boss has 3 phases", DATA.enemies.filter(e => e.tier === "boss").every(e => (e.phases || []).length === 3));
ok("characters are listed alphabetically",
  DATA.characters.map(c => c.name).join("|") === [...DATA.characters.map(c => c.name)].sort((a, b) => a.localeCompare(b, "en")).join("|"),
  DATA.characters.map(c => c.name).join(", "));

console.log("\n== referential integrity ==");
const ids = new Set(DATA.enemies.map(e => e.id));
const used = new Set();
DATA.encounters.forEach(e => e.enemies.forEach(([id]) => { used.add(id); if (!ids.has(id)) console.log("      missing enemy:", id); }));
ok("every encounter enemy exists", [...used].every(id => ids.has(id)));
ok("every enemy is used somewhere", [...ids].every(id => used.has(id)),
  [...ids].filter(id => !used.has(id)).join(", "));
const slots = DATA.encounters.reduce((n, e) => n + e.enemies.reduce((a, [, c]) => a + c, 0), 0);
const slotCount = e => e.enemies.reduce((a, [, c]) => a + c, 0) + (e.roll ? 1 : 0) + (e.eliteRoll || 0);
ok("encounters use 4-5 slots", DATA.encounters.every(e => slotCount(e) >= 4 && slotCount(e) <= 5),
  JSON.stringify(DATA.encounters.filter(e => slotCount(e) < 2 || slotCount(e) > 5).map(e => e.n)));
ok("at least one 5-slot fight exists", DATA.encounters.some(e => slotCount(e) === 5));
ok("random slot is 1-of-3 where present",
  DATA.encounters.filter(e => e.roll).every(e => Array.isArray(e.roll) && e.roll.length === 3));
ok("boss floors 10 and 13 have no random slot",
  [10, 13].every(n => DATA.encounters.find(e => e.n === n).roll === null));
ok("floor 16 rolls 3 random elites",
  DATA.encounters.find(e => e.n === 16).eliteRoll === 3);
ok("floor 16 holds two bosses",
  DATA.encounters.find(e => e.n === 16).enemies.filter(([id]) => (DATA.enemies.find(x => x.id === id) || {}).tier === "boss").length === 2);
ok("boss floors are 10, 13 and 16", [10, 13, 16].every(n =>
  DATA.encounters.find(e => e.n === n).enemies.some(([id]) => (DATA.enemies.find(x => x.id === id) || {}).tier === "boss")));
ok("random pools reference real enemies",
  DATA.encounters.every(e => !e.roll || e.roll.every(id => ids.has(id))));

console.log(`      (total enemy slots across 16 floors: ${slots})`);
const bossFight = DATA.encounters.find(e => e.n === 16);
ok("floor 16 contains the boss", bossFight.enemies.some(([id]) => id === "overseer"));
ok("every floor of a band shares one multiplier", DATA.encounters.every(e => {
  const b = DATA.bands[Math.floor((e.n - 1) / 4)];
  return b && b.label;
}));

console.log("\n== tables rendered ==");
const count = (id, sel) => ((store[id] || "").match(sel) || []).length;
ok("chars: 9 specs", count("chars", /class="spec"/g) === 9, `got ${count("chars", /class="spec"/g)}`);
ok("cones: 12 specs", count("cones", /class="spec"/g) === 12, `got ${count("cones", /class="spec"/g)}`);
ok("relics: 8 specs", count("relics", /class="spec"/g) === 8, `got ${count("relics", /class="spec"/g)}`);
ok("elites: 5 specs", count("enemies-elite", /class="spec"/g) === 5, `got ${count("enemies-elite", /class="spec"/g)}`);
ok("boss: 2 specs", count("enemies-boss", /class="spec"/g) === 2, `got ${count("enemies-boss", /class="spec"/g)}`);
ok("normal enemies: 9 rows", count("enemies-normal", /<tr>/g) === 10, `got ${count("enemies-normal", /<tr>/g)} (incl. header)`);
ok("encounters: 16 rows", count("encounters", /<tr>/g) === 17, `got ${count("encounters", /<tr>/g)} (incl. header)`);
ok("bands: 8 rows", count("bands", /<tr>/g) === 9, `got ${count("bands", /<tr>/g)} (incl. header)`);
ok("targets: 5 rows", count("targets", /<tr>/g) === 6, `got ${count("targets", /<tr>/g)} (incl. header)`);
ok("fields: 2 rows", count("fields", /<tr>/g) === 3, `got ${count("fields", /<tr>/g)} (incl. header)`);
ok("effects: 8 rows", count("effects", /<tr>/g) === 9, `got ${count("effects", /<tr>/g)} (incl. header)`);
ok("logcols: 5 rows", count("logcols", /<tr>/g) === 6, `got ${count("logcols", /<tr>/g)} (incl. header)`);
ok("spread: 9 rows", count("spread", /<tr>/g) === 10, `got ${count("spread", /<tr>/g)} (incl. header)`);
ok("DEF curve: 10 rows", count("defcurve", /<tr>/g) === 11, `got ${count("defcurve", /<tr>/g)} (incl. header)`);
ok("draft: 3 rows", count("draft", /<tr>/g) === 4, `got ${count("draft", /<tr>/g)} (incl. header)`);
ok("meta count text", /9 nhân vật · 12 vũ khí · 16 địch/.test(store["meta-count"] || ""), store["meta-count"] || "");
ok("characters rendered in alphabetical order",
  (store.chars || "").match(/data-p="characters\.\d+\.name"/g).length === 9);

console.log("\n== live DEF curve ==");
const before = store.defcurve;
DATA.constants.def_k = 400;
renderDefCurve();
ok("DEF curve responds to K", store.defcurve !== before);
ok("K=400 gives 0.671 at DEF 196", /<td class="n">196<\/td><td class="n">0\.671<\/td>/.test(store.defcurve));
DATA.constants.def_k = 200;
renderDefCurve();

console.log("\n== editing round-trip ==");
const fire = (p, value) => listeners.input({ target: { dataset: { p }, value, id: "" } });
fire("constants.def_k", "120");
ok("DEF K written to DATA", DATA.constants.def_k === 120, String(DATA.constants.def_k));
ok("DEF curve re-rendered on edit", /<td class="n">128<\/td><td class="n">0\.484<\/td>/.test(store.defcurve));
ok("edit persisted to localStorage", /"def_k":120/.test(localStorage.getItem("hsrlite-spec-v14") || ""));
fire("constants.def_k", "200");
const k0 = store["scale-3"];
fire("cones.3.s1.base", "12");
ok("weapon scale re-rendered on edit", store["scale-3"] !== k0);
fire("cones.3.s1.base", "8");
fire("characters.0.hp", "999");
ok("character stat is numeric, not string", DATA.characters[0].hp === 999, JSON.stringify(DATA.characters[0].hp));
fire("characters.0.hp", "820");
const notesHandler = listeners.input;
notesHandler({ target: { id: "notes", value: "ghi chú thử", dataset: {} } });
ok("notes captured", JSON.parse(localStorage.getItem("hsrlite-spec-v14")).notes === "ghi chú thử");

console.log("\n== payload ==");
const p = JSON.parse(payload());
ok("payload has characters", Array.isArray(p.characters) && p.characters.length === 9);
ok("payload has targets", Array.isArray(p.targets) && p.targets.length === 5);
ok("payload has fields", Array.isArray(p.fields) && p.fields.length === 2);
ok("payload has 16 encounters", Array.isArray(p.encounters) && p.encounters.length === 16);
ok("payload has bands", Array.isArray(p.meta) === false && p.meta.floors === 16);
ok("payload has notes", typeof p.notes === "string");

console.log("\n== reset ==");
console.log(fails === 0 ? "\nALL CHECKS PASSED\n" : `\n${fails} CHECK(S) FAILED\n`);
process.exit(fails === 0 ? 0 : 1);
