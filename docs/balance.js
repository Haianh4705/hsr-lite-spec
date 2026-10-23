// Throughput model cho docs/design.html — chỉ ĐO, không sửa spec.
// Không phải combat simulator: bỏ qua AV, hàng đợi, thứ tự mục tiêu, crit từng đòn.
// Mục đích: tìm chỗ lệch lớn giữa các nhân vật và giữa các tầng.

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
const bandOf = n => BASE.bands[Math.min(3, Math.floor((n - 1) / 4))];

// sát thương một đòn, chưa tính gear
const hit = (c, mult, def) => c.atk * mult * defF(def) * critMul(c);

// ---- sàn địch, đã tính ô ngẫu nhiên (lấy trung bình pool) ----
function floorEnemies(e) {
  const list = e.enemies.flatMap(([id, n]) => Array(n).fill(enemies[id]));
  if (e.roll && e.roll.length) {
    const avg = e.roll.reduce((a, id) => a + enemies[id].hp, 0) / e.roll.length;
    const avgAtk = e.roll.reduce((a, id) => a + enemies[id].atk, 0) / e.roll.length;
    const avgDef = e.roll.reduce((a, id) => a + enemies[id].def, 0) / e.roll.length;
    list.push({ hp: avg, atk: avgAtk, def: avgDef, name: "roll", tier: "n" });
  }
  return list;
}

// ---- đội mẫu = đội trong HUD: Rook / Kaine / Lumen / Bastion ----
const TEAM = ["rook", "kaine", "lumen", "bastion"];
const GEAR = 1.25; // ước lượng di vật + vũ khí S1–S3

function teamRound(def) {
  const [rook, kaine, lumen, bastion] = TEAM.map(id => chars[id]);
  // một vòng 4 hành động: 2 skill (Rook, Kaine) + 2 basic (Lumen, Bastion)
  const dmg =
    hit(rook, rook.skill.mult, def) * 4 +
    hit(kaine, kaine.skill.mult, def) * 1.6 +
    hit(lumen, lumen.basic.mult, def) +
    hit(bastion, bastion.basic.mult, def);
  // ulti không tốn hành động: Rook ~1 ult/vòng, Kaine ~0.8
  const ults =
    (hit(rook, rook.ult.mult, def) * 4 + hit(rook, rook.ult.bounceMult, def) * rook.ult.bounces) * 0.3 +
    (hit(kaine, kaine.ult.mult, def) * 4) * 0.2;
  return (dmg + ults) * GEAR;
}

const ALlyDEF = BASE.characters.filter(c => TEAM.includes(c.id));
const avgAllyDef = ALlyDEF.reduce((a, c) => a + c.def, 0) / ALlyDEF.length;

console.log("\n== 16 FLOORS ==");
console.log("floor band  x      HP     ATKsum  DEFavg  roundsToClear  dmgIn/round");
const rows = [];
BASE.encounters.forEach(e => {
  const m = bandOf(e.n).mult;
  const list = floorEnemies(e);
  const hp = list.reduce((a, x) => a + x.hp * m, 0);
  const atk = list.reduce((a, x) => a + x.atk * m, 0);
  const def = (list.reduce((a, x) => a + x.def * m, 0) / list.length);
  const out = teamRound(def);
  const rounds = hp / out;
  const incoming = atk * defF(avgAllyDef) * 0.9; // 0.9: có đòn không phải damage
  rows.push({ n: e.n, hp, atk, def, rounds, incoming, out });
  console.log(
    String(e.n).padStart(4), " ", bandOf(e.n).label.padEnd(3), ("×" + m.toFixed(2)).padEnd(5),
    num(hp).padStart(7), num(atk).padStart(7), num(def).padStart(6),
    num(rounds).padStart(10), num(incoming).padStart(10)
  );
});

// ---- sustain mỗi vòng ----
const b = chars.bastion, mi = chars.mira, w = chars.wren;
const perRound = {
  "Bastion talent (shield)": b.hp * 0.12,
  "Bastion ult (1944 / 5 vòng)": b.hp * 0.30 * 4 / 5,
  "Mira talent (3% × 4 đòn)": mi.hp * 0.03 * 4,
  "Mira skill (1 skill/vòng)": mi.hp * 0.18,
  "Wren ult (nếu có Wren, /5 vòng)": w.hp * 0.20 * 4 / 5
};
console.log("\n== SUSTAIN PER ROUND (đội HUD có Bastion + Mira) ==");
let total = 0;
Object.entries(perRound).forEach(([k, v]) => { total += v; console.log(pad(k, 34), num(v).padStart(7)); });
console.log(pad("TỔNG", 34), num(total).padStart(7));

console.log("\n== NHÂN VẬT ==");
console.log("name       role     dmg/basic dmg/skill dmg/ult  EN/ult  note");
const dmg = (c, m, hits = 1) => hit(c, m * hits, 90);
for (const c of BASE.characters) {
  const u = (c.ult.mult || 0) * (c.ult.hits || 1);
  console.log(
    pad(c.name, 10), pad(c.role, 8),
    num(dmg(c, c.basic.mult || 0)).padStart(9),
    num(dmg(c, c.skill.mult || 0)).padStart(9),
    num(dmg(c, u)).padStart(8),
    num(100 / (BASE.constants.en_basic + (c.id === "rook" ? 9 : 0))).padStart(7),
    " " + c.style
  );
}

console.log("\n== AOE: tổng damage một hành động khi có 4 địch (DEF 90) ==");
for (const c of BASE.characters.filter(c => c.role === "DPS")) {
  const one = m => hit(c, m, 90);
  const tot = t => t === "all" ? 4 : t === "blast" ? 1.6 : 1;
  const ult = c.ult.target === "all"
    ? one(c.ult.mult) * 4 + one(c.ult.bounceMult || 0) * (c.ult.bounces || 0)
    : one((c.ult.mult || 0) * (c.ult.hits || 1));
  console.log(pad(c.name, 10), "basic", num(one(c.basic.mult) * tot(c.basic.target)).padStart(6),
    " skill", num(one(c.skill.mult) * tot(c.skill.target)).padStart(6), " ult", num(ult).padStart(6));
}

console.log("\n== VESPER: bao nhiêu đòn để đủ 3 stack ==");
for (const crit of [18, 31, 40]) {
  console.log("crit", crit + "%", "→ cần", num(3 / (crit / 100)), "lần đánh/FUA;",
    "basic 1 hit, ult 6 hit → ~", num(3 / (crit / 100) / 6), "ulti");
}

console.log("\n== CURATOR: thuế Ulti ==");
const cur = enemies.curator;
console.log("3% max HP =", num(cur.hp * 0.03), "HP/lần Ulti; boss HP", cur.hp,
  "→ 1 lần hồi đầy =", num(cur.hp / (cur.hp * 0.03)), "lượt Ulti");

console.log("\n== WREN: 85/15, mỗi phần tính DEF riêng ==");
const raw = 300;
console.log("300 raw, ally DEF", avgAllyDef, "→ không Wren:", num(raw * defF(avgAllyDef)));
console.log("có Wren: ally 15% =", num(raw * 0.15 * defF(avgAllyDef)),
  "+ Wren 85% =", num(raw * 0.85 * defF(w.def)),
  "→ tổng", num(raw * 0.15 * defF(avgAllyDef) + raw * 0.85 * defF(w.def)));

console.log("\n== ROUNDS vs §12 TARGETS ==");
rows.forEach(r => {
  const tgt = r.n === 16 ? "12–16 actions" : r.n === 12 ? "8–11 actions" : "3–7 actions";
  const acts = r.rounds * 4;
  console.log("floor", String(r.n).padStart(2), "≈", num(acts).padStart(4), "player actions (target", tgt + ")");
});

// ---- 8. chẩn đoán ----
const sustainCore = b.hp * 0.12 + b.hp * 0.30 * 4 / 5 + mi.hp * 0.03 * 4 + mi.hp * 0.18;
const partyHP = TEAM.reduce((a, id) => a + chars[id].hp, 0);
console.log("\n== CHẨN ĐOÁN ==");
console.log("HP cả đội HUD:", partyHP);
console.log("sustain/vòng (Bastion+Mira):", num(sustainCore));
rows.forEach(r => {
  if ([6, 10, 12, 14, 16].includes(r.n)) {
    console.log("floor", String(r.n).padStart(2), "vào", num(r.incoming).padStart(6),
      "ra", num(sustainCore).padStart(6), "tỉ lệ", num(sustainCore / r.incoming).padStart(5),
      "| không sustain chết sau", num(partyHP / r.incoming), "vòng");
  }
});
console.log("\nđể tầng 16 chết sau 10 vòng (không sustain): cần vào",
  num(partyHP / 10), "/vòng → gấp", num(partyHP / 10 / rows[15].incoming), "hiện tại");
console.log("tầng 16 hiện cần", num(rows[15].rounds), "vòng;", "5 vòng cần HP",
  num(rows[15].out * 5), "→ cắt", num((1 - rows[15].out * 5 / rows[15].hp) * 100) + "%");
console.log("Rook AoE/skill so Vesper:", num(401.5 / 185.8) + "×;", "single-target:",
  num(100.4 / 185.8) + "×");
const fua = 0.6 * chars.vesper.atk * defF(90) * critMul(chars.vesper);
console.log("giá trị 1 FUA của Vesper:", num(fua), "so với basic", num(hit(chars.vesper, 1.0, 90)));
