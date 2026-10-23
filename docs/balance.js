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
  if (e.eliteRoll) {
    const pool = BASE.enemies.filter(x => x.tier === "elite");
    const avg = k => pool.reduce((a, x) => a + x[k], 0) / pool.length;
    for (let i = 0; i < e.eliteRoll; i++) list.push({ hp: avg("hp"), atk: avg("atk"), def: avg("def"), tier: "elite" });
  }
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

// ---- 10. test chiến thuật ở tầng 16 ----
const f16 = BASE.encounters[15];
const list16 = floorEnemies(f16);
const slots16 = list16.length;
const def16 = list16.reduce((a, x) => a + x.def * bandOf(16).mult, 0) / slots16;
const hp16 = list16.reduce((a, x) => a + x.hp * bandOf(16).mult, 0);
const atk16 = list16.reduce((a, x) => a + x.atk * bandOf(16).atk, 0);

function model(ids) {
  const team = ids.map(id => chars[id]);
  const avgDef = team.reduce((a, c) => a + c.def, 0) / team.length;
  const incoming = atk16 * defF(avgDef) * 0.9;
  const partyHP = team.reduce((a, c) => a + c.hp, 0);
  let dmg = 0, ult = 0, heal = 0, dot = 0;
  for (const c of team) {
    if (c.role === "DPS") {
      dmg += hit(c, totalMult(c.skill, slots16), def16);
      ult += hit(c, totalMult(c.ult, slots16), def16) * 0.25;
      if (c.id === "kaine") {
        const stacks = Math.min(3, slots16) + 1;
        dot += stacks * c.atk * BASE.constants.dot_rate * defF(def16);
      }
    } else {
      dmg += hit(c, c.basic.mult, def16);
      if (c.id === "mira") heal += c.hp * 0.10 + c.hp * 0.01 * slots16;
      if (c.id === "bastion") heal += c.hp * 0.04 + c.hp * 0.15 * 4 / 5;
      if (c.id === "wren") heal += c.hp * 0.15 * 4 / 5;
    }
  }
  const out = (dmg + ult + dot) * GEAR;
  const rounds = hp16 / out;
  const net = heal - incoming;
  return { out, rounds, actions: rounds * 4, heal, incoming, net, partyHP,
    dieIn: net < 0 ? partyHP / -net : Infinity, avgDef };
}

console.log("\n== CHIẾN THUẬT TẦNG 16 (5 ô: 2 boss + 3 elite, DEF", num(def16), "HP", num(hp16), ") ==");
console.log("team                              out/vòng  rounds  actions  heal  incoming  net   chết sau");
const TEAMS = {
  "Rook+Kaine+Lumen+Bastion": ["rook", "kaine", "lumen", "bastion"],
  "Kaine+Vesper+Mira+Bastion": ["kaine", "vesper", "mira", "bastion"],
  "Kaine+Mira+Bastion+Lumen": ["kaine", "mira", "bastion", "lumen"],
  "Kaine+Mira+Wren+Bastion": ["kaine", "mira", "wren", "bastion"],
  "Vesper+Kaine+Mira+Bastion": ["vesper", "kaine", "mira", "bastion"]
};
for (const [name, ids] of Object.entries(TEAMS)) {
  const m = model(ids);
  console.log(
    pad(name, 33), num(m.out).padStart(8), num(m.rounds).padStart(7), num(m.actions).padStart(8),
    num(m.heal).padStart(6), num(m.incoming).padStart(9), num(m.net).padStart(6),
    (m.net < 0 ? num(m.dieIn) + " vòng" : "không chết").padStart(11)
  );
}
