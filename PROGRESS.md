# PROGRESS — HSR-lite spec

Cập nhật lần cuối: phiên v0.15.
Đọc `AGENTS.md` trước file này.

---

## Đang ở đâu

| Hạng mục | Giá trị |
|---|---|
| Bản đặc tả | `docs/design.html` — **v0.15** |
| Trạng thái | Đặc tả hoàn chỉnh, harness xanh (`ALL CHECKS PASSED`) |
| Game | **Chưa build, chưa chạy** — đúng như yêu cầu |
| localStorage key | `hsrlite-spec-v15` |
| Kiểm tra | `node docs/verify.js` |

## Vừa xong (v0.15) — cấu trúc sảnh mới

- **Tối đa 5 ô địch.** 10/16 tầng có 5 ô; HUD vẫn 80×24 bằng cách bỏ một dòng kẻ ngăn.
  Chữ cái đổi: địch **A–E**, ta **F–I**.
- **Tám bậc** thay bốn band: 1 · 2–3 · 4–5 · 6–7 · 8–9 · 10–12 · 13–15 · 16.
  HP·DEF ×1.00→×1.50; ATK ×1.00→×2.30. `bandOf()` tra theo khoảng tầng.
- **Boss ở tầng 10 (Curator), 13 (Overseer), 16 (cả hai, không đệ).**
- **Đổi đội sau tầng 5 và tầng 9** (bỏ mốc 13).
- **Vesper CRIT 18% → 35%**.
- **Kaine**: skill 1.2× → 0.7×, ult 1.5× → 0.8×; DoT thành nguồn chính (mục tiêu share 50–70%).
- **Curator mạnh lên**: ATK 105, DEF 120, SPD 102, thuế Ulti 6%, MARK tối đa 5.
  HP 1600 và Overseer 1600 để trận hai boss không vượt 24 hành động.

## Vừa xong (v0.14) — cân bằng đợt 1 (gói A + B)

- **ATK có đường cong riêng**, tách khỏi HP·DEF: HP·DEF ×1.00 / 1.15 / 1.30 / 1.50;
  **ATK ×1.00 / 1.35 / 1.75 / 2.25**. SPD vẫn không nhân. Trần 1.50 giờ chỉ áp cho HP·DEF.
- **Cắt sustain:** Mira skill 18% → 10%, Mira talent 3% → 1%, Bastion Ulti 30% → 15%,
  Bastion talent 12% → 4%, Wren Ulti 20% → 15%.
- **Tầng 16 gọn lại:** Overseer 1900, Bulwark 450, Chorister 350, Tower 300 → 4.500 HP sau hệ số
  (trước 5.970). Kéo theo tầng 11 / 14 / 15 cũng ngắn lại.
- **Lumen Ulti thành buff đội:** toàn đội +20% hồi EN 3 lượt, **không còn tạo field**. Field Grid
  biến mất → còn 2 field, đều do địch đặt (Signal · Final Protocol).
- **Wren:** đòn bị tách 15/85 tính là **hai lần nhận sát thương**; talent Mira kích hai lần.

Đo lại (`node docs/balance.js`): sustain 970 → **440/vòng**; sát thương vào tầng 16 **210 → 315**;
tỉ lệ sustain/vào **6,7× → 1,4×**; tầng 16 **25,4 → 16,5 hành động**.

## Vừa xong (v0.13)

- **Wren chốt lại công thức chuyển đòn:** damage chia **trước DEF** — 15% vào mục tiêu tính bằng
  DEF của mục tiêu, 85% vào Wren tính bằng DEF của Wren; hai lần tính độc lập, mỗi phần đi qua
  shield của người nhận. Aegis theo đúng luật này.
- **Thêm `docs/balance.js`** — mô hình throughput chỉ để đo (không phải combat sim): sàn địch theo
  tầng, sản lượng từng nhân vật, sustain/vòng, các phép kiểm tra nhanh. Chạy `node docs/balance.js`.
- **Báo cáo cân bằng v0.13** đã gửi; **chưa sửa con số nào** trong spec.

## Vừa xong (v0.12)

1. **Sable — sửa lại hiểu nhầm.** "Ưu tiên 100%" không phải taunt mà là **hành động ngay sau lượt
   của Sable** (đồng đội vừa được chọn hành động kế tiếp), kèm +20% ATK 1 lượt.
2. **Bastion** — Skill: đồng đội nhận **phản đòn 2 lượt**, mỗi lần người đó bị đánh thì Bastion gây
   6% max HP của mình lên kẻ đánh. Ulti: **shield toàn đội 30% max HP** (bỏ field). Talent: đầu
   lượt, đồng minh **ít shield nhất** nhận shield 12% max HP của Bastion.
3. **Shield vô hạn lượt.** Bỏ hằng số `shield_turns`; shield chỉ mất khi vỡ, shield mới thay shield
   cũ nếu lớn hơn. §05 có thêm bước "Chuyển sát thương" trong thứ tự giải.
4. **Mira** — Skill: hồi 18% max HP **của Mira** + xóa 1 debuff. Ulti: hồi 12% + **xóa 1 debuff mỗi
   người** (thay vì xóa mọi debuff) + +10% ATK 2 lượt. Talent: đồng đội nhận sát thương → hồi 3%
   max HP của Mira.
5. **Wren** — Skill: **shield bản thân 25% max HP**. Ulti: hồi 20% max HP toàn đội (bỏ rider 3 lượt).
   Talent: **85% sát thương đồng đội nhận chuyển sang Wren**.

## Việc tiếp theo (theo thứ tự)

0. **Đợt cân bằng 3 (chưa duyệt).** Còn lệch sau v0.15: Rook chiếm ~62% damage đội ở tầng 5 ô
   (trần 45%); Kaine tụt xuống ~28% và có thể dưới sàn 15% ở trận ngắn; tầng 1–5 vẫn ~2,6–3,0
   hành động (mục tiêu 3–6); tầng 13 và 15 nhỉnh 2–5% trên ngưỡng; đội toàn AoE chậm gấp rưỡi
   đội có single-target ở tầng 16.

1. **Chốt `dot_rate`.** 0.45 là ước lượng: Kaine ATK 136, DEF địch 60 → ~49 mỗi stack mỗi lượt.
   Cần harness đo DoT share; mục tiêu 15–35%.
2. **Đo lại Vesper** sau khi đổi talent: 6 stack = 2 follow-up, cộng CRIT 18% / CDmg 60% — có thể
   vượt trần damage share 45% ở §12.
3. **Rook hồi EN theo số mục tiêu trúng** — Ulti 8 lần trúng = 24 EN. Kiểm tra vòng EN tự nuôi.
4. **Trần SPD của Nyx** — talent cộng dồn không giới hạn (xem §13).
5. **Sustain mới có thể quá mạnh.** Wren gánh 85% + Mira hồi 3% max HP mỗi lần đồng đội nhận đòn
   + shield vô hạn lượt = một đội gần như không chết. Đây là chỗ harness phải đo đầu tiên:
   win-rate trần 65% ở §12.
6. **Sable "ưu tiên 100%"** — cần chốt thứ tự với hàng đợi: người được chọn hành động ngay, sau đó
   AV của họ reset theo SPD. Nếu người đó đang có AV 0 thì sao? Viết rõ trong bản build.
7. **Soát bằng mắt §10 và §12** sau khi band table tách dòng 9–11 / 12 / 13–15 / 16.
8. **Mở rộng verify.js** nếu thêm luật mới: harness hiện phủ hình học HUD, số lượng nội dung,
   thứ tự ABC, pool ngẫu nhiên, boss tầng 12/16, hai lần bấm, lệnh xám, talent/phase không tên,
   bộ chiêu 6 nhân vật đã sửa, `dot_rate`, shield vô hạn, 3 field.

## Việc còn mở (chưa chốt)

- `dot_rate` = 0.45 (xem §13).
- Có nên chặn trần cộng dồn SPD của Nyx không (xem §13).
- Field Rampart đã mất nguồn — có gắn lại vào chiêu khác hay bỏ hẳn (xem §13).
- Chưa có quyết định về việc có nên có thêm field riêng cho boss 12 hay không.

## Nhật ký quyết định (đã chốt, không mở lại)

| Chủ đề | Chốt |
|---|---|
| Độ dài run | 16 tầng, boss tầng 12 và 16 |
| Band | ×1.00 / ×1.15 / ×1.30 / ×1.50 vào HP·ATK·DEF, trần 1.50 |
| SPD địch | Không nhân hệ số |
| Chữ cái | In hoa, theo ô: địch A–D, ta E–H |
| Log | 6 dòng, cả hai đội, Ulti ghi tên riêng |
| DoT | Chịu DEF và shield, không crit |
| Field | Duy nhất, đè field cũ, áp cho cả hai đội |
| Đổi đội | Mốc 5 / 9 / 13, tháo sạch rồi lắp lại |
| Draft | 3 thẻ: 5 mảnh chọn 2 · 3 vũ khí chọn 1 · hồi 40% toàn đội |
| Codex | Mở tự do giữa trận |
| Lệnh | Xám khi không dùng được; hai lần bấm để chốt |
| Danh sách | Nhân vật theo ABC |
| Ngẫu nhiên | Một ô mỗi tầng (1–15), seed ở header, tầng 16 cố định |

## Changelog

- **0.15** — 5 ô địch, 8 bậc, boss 10/13/16, đổi đội sau 5 và 9, Vesper CRIT 35, Kaine
  DoT-first, Curator mạnh lên.
- **0.14** — cân bằng đợt 1: ATK curve riêng, cắt sustain ~55%, tầng 16 gọn lại, Lumen bỏ field,
  Wren hai lần nhận sát thương.
- **0.12** — viết lại Bastion / Mira / Wren; shield vô hạn lượt; thêm bước chuyển sát thương;
  Sable sửa thành ưu tiên hành động; bỏ field Rampart.
- **0.11** — viết lại Lumen / Nyx / Sable; field Grid đổi sang hồi EN.
- **0.10** — Curator 3%; bỏ tên phase boss và tên thiên phú; viết lại Vesper / Kaine / Rook;
  tách `dot_rate` khỏi mult chiêu.
- **0.9** — trạng thái lệnh + hai lần bấm; ABC cho nhân vật; ô ngẫu nhiên + seed; boss 12
  (The Curator); chốt 2/5; dọn mock (đội mẫu, HP quái, chữ cái Equip). Repo chuyển public,
  kèm bản sao skill `ambition-booster` trong `skills/`.
- **0.8** — 9 nhân vật / 12 vũ khí / 8 di vật / 15 địch; hệ số band hạ còn 1.50; chữ cái A–H;
  6 dòng log; draft 3 thẻ; codex tự do; đổi đội mỗi 4 tầng; harness 2.000 run.
- **0.7** — bản đầu đủ 6 / 9 / 6 / 9, band 1.00–1.90.

## Ghi chú kỹ thuật

- Repo: `github.com/Haianh4705/hsr-lite-spec` (**public**), nhánh `main`. Mỗi thay đổi spec nên là một commit có mô tả luật đã đổi.
- `skills/ambition-booster/` là bản sao skill OpenCode, không phải một phần của game. Đừng sửa nội dung skill khi đang sửa spec.
- `store['scale-N']` trong harness luôn rỗng — phần tử nằm trong `innerHTML` của cha, không phải lỗi.
- Mọi ô mô tả dài dùng `textarea.f.auto` + `autosizeAll()`; nếu thêm ô dài mới thì dùng `FAREA`,
  đừng dùng `FWIDE` (input 1 dòng sẽ cắt chữ).
