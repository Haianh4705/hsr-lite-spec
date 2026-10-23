# PROGRESS — HSR-lite spec

Cập nhật lần cuối: phiên v0.11.
Đọc `AGENTS.md` trước file này.

---

## Đang ở đâu

| Hạng mục | Giá trị |
|---|---|
| Bản đặc tả | `docs/design.html` — **v0.11** |
| Trạng thái | Đặc tả hoàn chỉnh, harness xanh (`ALL CHECKS PASSED`) |
| Game | **Chưa build, chưa chạy** — đúng như yêu cầu |
| localStorage key | `hsrlite-spec-v11` |
| Kiểm tra | `node docs/verify.js` |

## Vừa xong (v0.11)

1. **Lumen** — Skill: đồng đội +15% SPD và +20% ATK trong 2 lượt (bỏ hồi EN). Ulti: field Grid
   +20% hồi EN cho **cả hai đội**, 3 lượt. Talent: đồng đội dùng Ulti → Lumen +5 EN (từ 10).
2. **Nyx** — Skill: −25% SPD một địch trong 2 lượt (bỏ đẩy AV). Ulti: 20% AV cả hai chiều (từ 15%).
   Talent: mỗi đánh thường của đồng đội → Nyx +1 SPD, cộng dồn.
3. **Sable** — Skill: 1 lượt, 100% đòn đơn mục tiêu của địch dồn vào một đồng đội, người đó +20%
   ATK. Ulti: toàn bộ địch −25% DEF trong 3 lượt (bỏ damage). Talent: lần đầu mỗi tầng, một đòn
   chí tử lên đồng đội gây 0 damage.

## Việc tiếp theo (theo thứ tự)

1. **Chốt `dot_rate`.** 0.45 là ước lượng: Kaine ATK 136, DEF địch 60 → ~49 mỗi stack mỗi lượt.
   Cần harness đo DoT share; mục tiêu 15–35%. Chưa có sim nên con số này còn mở.
2. **Đo lại Vesper** sau khi đổi talent: 6 stack = 2 follow-up, cộng CRIT 18% / CDmg 60% — có thể
   vượt trần damage share 45% ở §12.
3. **Rook hồi EN theo số mục tiêu trúng** — Ulti 8 lần trúng = 24 EN. Cần kiểm tra vòng EN có bị
   tự nuôi (Ulti → đầy EN → Ulti) không.
4. **Trần SPD của Nyx.** Talent cộng dồn không giới hạn; 4 người × ~10 lượt thường/tầng là +40 SPD
   mỗi tầng. Xem §13 hàng "mở".
5. **Sable taunt** — luật "100% đòn đơn mục tiêu dồn vào một người" phải chốt được với địch có
   `target: single`; địch `all`/`blast`/`bounce` vẫn đánh bình thường. Cần viết rõ trong bản build.
6. **Soát bằng mắt §10 và §12** sau khi band table tách dòng 9–11 / 12 / 13–15 / 16.
7. **Mở rộng verify.js** nếu thêm luật mới: harness hiện phủ hình học HUD, số lượng nội dung,
   thứ tự ABC, pool ngẫu nhiên, boss tầng 12/16, hai lần bấm, lệnh xám, talent/phase không tên,
   bộ chiêu mới của Vesper/Kaine/Rook/Lumen/Nyx/Sable, `dot_rate`.

## Việc còn mở (chưa chốt)

- `dot_rate` = 0.45 (xem §13).
- Có nên chặn trần cộng dồn SPD của Nyx không (xem §13).
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

- **0.11** — viết lại Lumen / Nyx / Sable; field Grid đổi sang hồi EN; Sable thành taunt + debuff.
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
