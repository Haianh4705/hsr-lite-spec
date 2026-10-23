// Throughput model cho docs/design.html — chỉ ĐO, không sửa spec.
// Không phải combat simulator: bỏ qua AV, hàng đợi, thứ tự mục tiêu, crit từng đòn.
// Mục đích: so sánh tầng với tầng, nhân vật với nhân vật, và kiểm tra các ngưỡng ở §12.

const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "design.html"), "utf8");

const start = html.indexOf("const BASE = {");
const end = html.indexOf("\n};", start);
const BASE = eval("(" + html.slice(start + "const BASE = ".length, end + 2) + ")");

const K = BASE.constants.def_k;
const defF = d => K / (K + d);
const critMul = c => 1 + (c.crit / 100) * (c.critdmg / 100);
const num = n => (Math.round(n * 10) / 10).toFixed(1);
const pad = (s, n) => String(s).padEnd(n);
const chars = Object.fromEntries(BASE.characters.map(c => [c.id, c]));
const enemies = Object.fromEntries(BASE.enemies.map(e => [e.id, e]));
const bandOf = n => BASE.bands.find(b => n >= b.from && n <= b.to) || BASE.bands[BASE.bands.length - 1];
const hit = (c, mult, def) => c.atk * mult * defF(def) * critMul(c);

// tổng hệ số một đòn theo kiểu mục tiêu và số ô địch
function totalMult(unit, slots) {
  const t = unit.target, m = unit.mult || 0;
  if (t === "all") return m * slots + (unit.bounces ? (unit.bounceMult || 0) * unit.bounces : 0);
  if (t === "blast") return m * (slots >= 3 ? 2 : slots === 2 ? 1.5 : 1);
  if (t === "bounce") return m * (unit.hits || 1);
  return m;
}

function floorEnemies(e) {
  const list = e.enemies.flatMap(([id, n]) => Array(n).fill(enemies[id]));
  if (e.roll && e.roll.length) {
    const pick = id => enemies[id];
    const avg = k => e.roll.reduce((a, id) => a + pick(id)[k], 0) / e.roll.length;
    list.push({ hp: avg("hp"), atk: avg("atk"), def: avg("def"), tier: "normal" });
  }
  return list;
}

const TEAM = ["rook", "kaine", "lumen", "bastion"];
const GEAR = 1.25;

function teamRound(def, slots) {
  const [rook, kaine, lumen, bastion] = TEAM.map(id => chars[id]);
  const one = (c, m) => hit(c, m, def);
  const dmg =
    one(rook, totalMult(rook.skill, slots)) +
    one(kaine, totalMult(kaine.skill, slots)) +
    one(lumen, lumen.basic.mult) +
    one(bastion, bastion.basic.mult);
  const ults =
    one(rook, totalMult(rook.ult, slots)) * 0.3 +
    one(kaine, totalMult(kaine.ult, slots)) * 0.2;
  return (dmg + ults) * GEAR;
}

console.log("\n== 16 FLOORS ==");
console.log("floor tier  HP·DEF/ATK   slots  HP      ATK    DEF   actions  dmgIn/round  ratio");
const rows = [];
BASE.encounters.forEach(e => {
  const b = bandOf(e.n);
  const list = floorEnemies(e);
  const hp = list.reduce((a, x) => a + x.hp * b.mult, 0);
  const atk = list.reduce((a, x) => a + x.atk * b.atk, 0);
  const def = list.reduce((a, x) => a + x.def * b.mult, 0) / list.length;
  const out = teamRound(def, list.length);
  const rounds = hp / out;
  const incoming = atk * defF(112) * 0.9;
  rows.push({ n: e.n, hp, atk, def, rounds, incoming, out, slots: list.length });
  console.log(
    String(e.n).padStart(4), pad(b.label, 5),
    ("×" + b.mult.toFixed(2) + "/" + b.atk.toFixed(2)).padEnd(12),
    String(list.length).padStart(4), num(hp).padStart(8), num(atk).padStart(7),
    num(def).padStart(6), num(rounds * 4).padStart(8), num(incoming).padStart(12), "  —"
  );
});

// ---- sustain ----
const b = chars.bastion, mi = chars.mira;
const sustain = b.hp * 0.04 + b.hp * 0.15 * 4 / 5 + mi.hp * 0.01 * 4 + mi.hp * 0.10;
console.log("\n== SUSTAIN ==");
console.log("Bastion talent", num(b.hp * 0.04), "| Bastion ult/5", num(b.hp * 0.15 * 4 / 5),
  "| Mira talent", num(mi.hp * 0.01 * 4), "| Mira skill", num(mi.hp * 0.10));
console.log("TỔNG /vòng:", num(sustain), " | HP đội HUD:", TEAM.reduce((a, id) => a + chars[id].hp, 0));

console.log("\n== RATIO sustain / incoming (mục tiêu 1,2–1,6) ==");
rows.forEach(r => {
  const q = sustain / r.incoming;
  if ([1, 5, 8, 10, 13, 16].includes(r.n))
    console.log("floor", String(r.n).padStart(2), "vào", num(r.incoming).padStart(6),
      "ra", num(sustain).padStart(6), "→", num(q) + "×");
});

console.log("\n== NHÂN VẬT (damage/hành động, DEF 90, AoE theo 1/3/5 ô) ==");
console.log("name       role     basic   skill   ult     note");
for (const c of BASE.characters) {
  const d = (u, slots) => hit(c, totalMult(u, slots), 90);
  console.log(
    pad(c.name, 10), pad(c.role, 8),
    num(d(c.basic, 1)).padStart(6), num(d(c.skill, 3)).padStart(7), num(d(c.ult, 3)).padStart(7),
    "  " + c.style
  );
}

console.log("\n== AOE: tổng damage một hành động theo số ô (DEF 90) ==");
for (const c of BASE.characters.filter(c => c.role === "DPS")) {
  const d = (u, slots) => hit(c, totalMult(u, slots), 90);
  console.log(pad(c.name, 10), "skill 3 ô", num(d(c.skill, 3)).padStart(6),
    "5 ô", num(d(c.skill, 5)).padStart(6), "| ult 3 ô", num(d(c.ult, 3)).padStart(6),
    "5 ô", num(d(c.ult, 5)).padStart(6));
}

// ---- Kaine DoT share ----
console.log("\n== KAINEDoT ==");
const kaine = chars.kaine;
const dotTick = def => kaine.atk * BASE.constants.dot_rate * defF(def);
const stacksPerSkill = 3 + 1; // blast 3 mục tiêu + talent 1
const kDmg = hit(kaine, totalMult(kaine.skill, 5), 178);
const kDot = dotTick(178) * stacksPerSkill;
console.log("1 stack tick (DEF 178):", num(dotTick(178)), "| 4 stack:", num(kDot));
console.log("skill 5 ô:", num(kDmg), "→ DoT share 1 vòng:", num(100 * kDot / (kDot + kDmg)) + "%");

console.log("\n== VESPER ==");
const v = chars.vesper;
console.log("CRIT", v.crit + "%", "→ 3 stack cần", num(3 / (v.crit / 100)), "đòn; ult 6 hit =",
  num(6 * v.crit / 100), "crit/lần");
console.log("1 FUA:", num(hit(v, 0.6, 90)), "| basic:", num(hit(v, v.basic.mult, 90)));

console.log("\n== CURATOR ==");
const cur = enemies.curator;
console.log("6% max HP mỗi Ulti =", num(cur.hp * 0.06), "HP; HP boss", cur.hp,
  "→ 1 lần hồi đầy =", num(cur.hp / (cur.hp * 0.06)), "Ulti");

console.log("\n== TẦNG 16: 2 DPS vs 3 DPS ==");
for (const t of [TEAM, ["rook", "kaine", "vesper", "bastion"]]) {
  const [a, b2, c, d] = t.map(id => chars[id]);
  const slots = floorEnemies(BASE.encounters[15]).length;
  const def = 178;
  const one = (x, m) => hit(x, m, def);
  const dps = [a, b2, c].filter(x => x.role === "DPS");
  const out = (dps.reduce((n, x) => n + one(x, totalMult(x.skill, slots)), 0) +
    one(a, a.basic.mult) + (c.role !== "DPS" ? one(c, c.basic.mult) : 0) +
    dps.reduce((n, x) => n + one(x, totalMult(x.ult, slots)) * 0.25, 0)) * GEAR;
  console.log(pad(t.join("+"), 36), "hành động", num(rows[15].hp / out * 4));
}
