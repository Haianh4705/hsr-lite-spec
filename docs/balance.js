// Throughput model cho docs/design.html — chỉ ĐO, không sửa spec.
// Bỏ qua AV chi tiết, crit từng đòn, thứ tự mục tiêu. Có tính DoT không hết hạn,
// talent SPD của Kaine, và cycle enrage. Sai số ước tính ±25–30%.

const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "design.html"), "utf8");
const start = html.indexOf("const BASE = {");
const end = html.indexOf("\n};", start);
const BASE = eval("(" + html.slice(start + "const BASE = ".length, end + 2) + ")");

const C = BASE.constants;
const K = C.def_k;
const defF = d => K / (K + d);
const critMul = c => 1 + (c.crit / 100) * (c.critdmg / 100);
const num = n => (Math.round(n * 10) / 10).toFixed(1);
const pad = (s, n) => String(s).padEnd(n);
const chars = Object.fromEntries(BASE.characters.map(c => [c.id, c]));
const enemies = Object.fromEntries(BASE.enemies.map(e => [e.id, e]));
const bandOf = n => BASE.bands.find(b => n >= b.from && n <= b.to) || BASE.bands[BASE.bands.length - 1];
const hit = (c, mult, def) => c.atk * mult * defF(def) * critMul(c);
const cycleMult = r => 1 + (C.cycle_step / 100) * Math.max(0, r - C.cycle_from + 1);

function totalMult(unit, slots) {
  const t = unit.target, m = unit.mult || 0;
  if (t === "all") return m * slots + (unit.bounces ? (unit.bounceMult || 0) * unit.bounces : 0);
  if (t === "blast") return m * (slots >= 3 ? 2 : slots === 2 ? 1.5 : 1);
  if (t === "bounce") return m * (unit.hits || 1);
  return m;
}
const GEAR = 1.25;

function floorEnemies(e) {
  const list = e.enemies.flatMap(([id, n]) => Array(n).fill(enemies[id]));
  if (e.roll && e.roll.length) {
    const avg = k => e.roll.reduce((a, id) => a + enemies[id][k], 0) / e.roll.length;
    list.push({ hp: avg("hp"), atk: avg("atk"), def: avg("def") });
  }
  if (e.eliteRoll) {
    const pool = BASE.enemies.filter(x => x.tier === "elite");
    const avg = k => pool.reduce((a, x) => a + x[k], 0) / pool.length;
    for (let i = 0; i < e.eliteRoll; i++) list.push({ hp: avg("hp"), atk: avg("atk"), def: avg("def") });
  }
  return list;
}

// đội: mỗi người một hành động/vòng; DPS dùng skill, còn lại đánh thường.
function teamBase(ids) {
  const team = ids.map(id => chars[id]);
  const avgDef = team.reduce((a, c) => a + c.def, 0) / team.length;
  const partyHP = team.reduce((a, c) => a + c.hp, 0);
  let dmg = 0, ult = 0, heal = 0, kaine = null;
  for (const c of team) {
    if (c.role === "DPS") {
      dmg += hit(c, totalMult(c.skill, 0), 0); // hệ số thô, nhân DEF sau
      ult += hit(c, totalMult(c.ult, 0), 0) * 0.25;
      if (c.id === "kaine") kaine = c;
    } else {
      dmg += hit(c, c.basic.mult, 0);
      if (c.id === "mira") heal += c.hp * 0.10 + c.hp * 0.01 * 4;
      if (c.id === "bastion") heal += c.hp * 0.04 + c.hp * 0.15 * 4 / 5;
      if (c.id === "wren") heal += c.hp * 0.15 * 4 / 5;
    }
  }
  return { team, avgDef, partyHP, dmgBase: dmg, ultBase: ult, heal, kaine };
}

function simulate(floor, ids) {
  const b = bandOf(floor.n);
  const list = floorEnemies(floor);
  const slots = list.length;
  const ehp0 = list.reduce((a, x) => a + x.hp * b.mult, 0);
  const atk = list.reduce((a, x) => a + x.atk * b.atk, 0);
  const def = list.reduce((a, x) => a + x.def * b.mult, 0) / slots;
  const t = teamBase(ids);
  const incoming = atk * defF(t.avgDef) * 0.9;
  const dmg = (t.dmgBase * defF(def) * GEAR) + (t.ultBase * defF(def) * GEAR);
  const tick = t.kaine ? t.kaine.atk * C.dot_rate * defF(def) * GEAR : 0;
  const spd = t.kaine ? 1 + 0.10 * slots : 1;
  let ehp = ehp0, php = t.partyHP, stacks = 0, r = 0, maxIn = 0;
  for (r = 1; r <= 60; r++) {
    const inc = incoming * cycleMult(r);
    maxIn = inc;
    if (t.kaine) {
      stacks = Math.min(slots * C.dot_max, stacks + slots * 2);
      ehp -= stacks * tick * spd;
    }
    ehp -= dmg;
    php = Math.min(t.partyHP, php + t.heal - inc);
    if (ehp <= 0) return { win: true, cycles: r, hpLeft: php, ehp, def, incoming, maxIn, slots, ehp0, heal: t.heal };
    if (php <= 0) return { win: false, cycles: r, hpLeft: 0, ehp, def, incoming, maxIn, slots, ehp0, heal: t.heal };
  }
  return { win: false, cycles: 60, hpLeft: php, ehp, def, incoming, maxIn, slots, ehp0, heal: t.heal };
}

const TEAM = ["rook", "kaine", "lumen", "bastion"];

console.log("\n== 16 FLOORS (đội HUD: Rook · Kaine · Lumen · Bastion) ==");
console.log("floor tier   slots  HP      DEF    vào/vòng  cycle  actions  kết quả   HP còn");
BASE.encounters.forEach(e => {
  const m = simulate(e, TEAM);
  console.log(
    String(e.n).padStart(4), pad(bandOf(e.n).label, 6), String(m.slots).padStart(5),
    num(m.ehp0).padStart(8), num(m.def).padStart(6), num(m.incoming).padStart(9),
    String(m.cycles).padStart(6), String(m.cycles * 4).padStart(8),
    pad(m.win ? "thắng" : "CHẾT", 8), num(Math.max(0, m.hpLeft)).padStart(7)
  );
});

console.log("\n== CYCLE ==");
console.log("bắt đầu phạt ở cycle", C.cycle_from, "| mỗi cycle +" + C.cycle_step + "% ATK địch");
[1, 5, 7, 8, 9, 10, 12, 14].forEach(r => console.log("cycle", String(r).padStart(2), "→ ×" + cycleMult(r).toFixed(2)));

console.log("\n== NHÂN VẬT (damage/hành động, DEF 90) ==");
console.log("name       role     basic   skill   ult    ghi chú");
for (const c of BASE.characters) {
  console.log(pad(c.name, 10), pad(c.role, 8),
    num(hit(c, c.basic.mult, 90)).padStart(6),
    num(hit(c, totalMult(c.skill, 3), 90)).padStart(7),
    num(hit(c, totalMult(c.ult, 3), 90)).padStart(7), " " + c.style);
}

console.log("\n== KAINEDoT (dot_rate " + C.dot_rate + ", max " + C.dot_max + " stack/địch, không hết hạn) ==");
const k = chars.kaine;
[60, 90, 130, 180].forEach(d => {
  const tick = k.atk * C.dot_rate * defF(d);
  console.log("DEF", String(d).padStart(3), "1 stack", num(tick).padStart(6),
    "| 5 địch ×5 stack", num(tick * 25).padStart(7), "/vòng (chưa tính +50% SPD)");
});

console.log("\n== TẦNG 16: CÁC ĐỘI ==");
const TEAMS = {
  "Rook+Kaine+Lumen+Bastion": ["rook", "kaine", "lumen", "bastion"],
  "Rook+Kaine+Vesper+Bastion": ["rook", "kaine", "vesper", "bastion"],
  "Kaine+Vesper+Mira+Bastion": ["kaine", "vesper", "mira", "bastion"],
  "Kaine+Mira+Bastion+Lumen": ["kaine", "mira", "bastion", "lumen"],
  "Kaine+Mira+Wren+Bastion": ["kaine", "mira", "wren", "bastion"],
  "Vesper+Kaine+Bastion": ["vesper", "kaine", "bastion", "lumen"]
};
for (const [name, ids] of Object.entries(TEAMS)) {
  const m = simulate(BASE.encounters[15], ids);
  console.log(pad(name, 34), pad(m.win ? "thắng" : "CHẾT", 8),
    "cycle", String(m.cycles).padStart(2), "| actions", String(m.cycles * 4).padStart(3),
    "| HP còn", num(Math.max(0, m.hpLeft)).padStart(7));
}

console.log("\n== 3 SUSTAIN CÓ CÒN BẤT TỬ? ==");
[["kaine", "mira", "wren", "bastion"], ["mira", "wren", "bastion", "lumen"]].forEach(ids => {
  const m = simulate(BASE.encounters[15], ids);
  console.log(pad(ids.join("+"), 30), m.win ? "thắng" : "CHẾT", "cycle", m.cycles,
    "| HP còn", num(Math.max(0, m.hpLeft)));
});
