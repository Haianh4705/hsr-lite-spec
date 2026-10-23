# PROGRESS — HSR-lite spec

Cập nhật lần cuối: phiên v0.10.
Đọc `AGENTS.md` trước file này.

---

## Đang ở đâu

| Hạng mục | Giá trị |
|---|---|
| Bản đặc tả | `docs/design.html` — **v0.10** |
| Trạng thái | Đặc tả hoàn chỉnh, harness xanh (`ALL CHECKS PASSED`) |
| Game | **Chưa build, chưa chạy** — đúng như yêu cầu |
| localStorage key | `hsrlite-spec-v10` |
| Kiểm tra | `node docs/verify.js` |

## Vừa xong (v0.10)

1. **Curator hồi 3%** max HP mỗi Ulti của người chơi (hạ từ 5%).
2. **Bỏ tên riêng của phase boss và thiên phú.** Phase giờ đánh số 1–2–3 trong bảng
   `# / Mốc HP / Hành vi`; thiên phú chỉ còn nhãn `TALENT`. Ulti vẫn là thứ duy nhất có tên riêng.
3. **Vesper** — talent: mỗi CRIT +1 stack, tối đa 6; đủ 3 stack thì tiêu 3 và tung follow-up 60%.
   Ulti 6 lần đánh có thể nạp đủ 6 stack → 2 follow-up.
4. **Kaine** — Skill đổi sang blast 1.2× / 0.6×, +1 stack DoT mỗi mục tiêu; Ulti all 1.5×, +1
   stack mỗi mục tiêu; talent giữ nguyên (mỗi lần gây DoT, một địch ngẫu nhiên +1 stack).
5. **Rook** — Basic blast 0.8× / 0.4×; Skill all 1.0×; Ulti all 1.5× rồi 4 bounce 0.2×;
   talent: mỗi kẻ địch trúng đòn +3 EN.
6. **Công thức DoT tách biến.** Thêm `constants.dot_rate = 0.45`; tick =
   `ATK × dot_rate × stack × K/(K+DEF)`, không nhân theo mult của chiêu gắn nó. Đây là núm cân
   bằng duy nhất khi Kaine chỉ còn 1 stack mỗi mục tiêu.

## Việc tiếp theo (theo thứ tự)

1. **Chốt `dot_rate`.** 0.45 là ước lượng: Kaine ATK 136, DEF địch 60 → ~49 mỗi stack mỗi lượt.
   Cần harness đo DoT share; mục tiêu 15–35%. Chưa có sim nên con số này còn mở.
2. **Đo lại Vesper** sau khi đổi talent: 6 stack = 2 follow-up, cộng CRIT 18% / CDmg 60% — có thể
   vượt trần damage share 45% ở §12.
3. **Rook hồi EN theo số mục tiêu trúng** — Ulti 8 lần trúng = 24 EN. Cần kiểm tra vòng EN có bị
   tự nuôi (Ulti → đầy EN → Ulti) không.
4. **Soát bằng mắt §10 và §12** sau khi band table tách dòng 9–11 / 12 / 13–15 / 16.
5. **Mở rộng verify.js** nếu thêm luật mới: harness hiện phủ hình học HUD, số lượng nội dung,
   thứ tự ABC, pool ngẫu nhiên, boss tầng 12/16, hai lần bấm, lệnh xám, talent/phase không tên,
   bộ chiêu mới của Vesper/Kaine/Rook, `dot_rate`.

## Việc còn mở (chưa chốt)

- `dot_rate` = 0.45 (xem §13 hàng "mở" duy nhất còn lại).
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
