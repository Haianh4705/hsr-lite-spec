# PROGRESS — HSR-lite spec

Cập nhật lần cuối: phiên v0.9.
Đọc `AGENTS.md` trước file này.

---

## Đang ở đâu

| Hạng mục | Giá trị |
|---|---|
| Bản đặc tả | `docs/design.html` — **v0.9** |
| Trạng thái | Đặc tả hoàn chỉnh, harness xanh (`ALL CHECKS PASSED`) |
| Game | **Chưa build, chưa chạy** — đúng như yêu cầu |
| localStorage key | `hsrlite-spec-v9` |
| Kiểm tra | `node docs/verify.js` |

## Vừa xong (v0.9)

1. **Vùng lệnh có trạng thái.** Lệnh không dùng được (hết SP, chưa đầy EN, không có mục tiêu)
   chuyển màu xám `.off`, không bị giấu. Ví dụ trong HUD: `[3] Broadside` xám khi EN 60/100.
2. **Chọn hai lần.** Bấm lần 1: lệnh đảo màu (`.on`), mục tiêu + damage hiện trước, dòng prompt
   đổi thành `[2] chốt · [esc] huỷ`. Bấm lần 2 mới thực thi. Bấm phím khác thì đổi lựa chọn.
3. **Sắp xếp bảng chữ cái.** `DATA.characters` sort theo `name` ngay sau khi nạp, nên mọi danh
   sách (codex, team, bảng chỉ số) đều theo ABC. Vũ khí/di vật/địch giữ thứ tự theo vai/hướng/tier.
4. **Ngẫu nhiên trong sảnh.** Mỗi tầng 1–15 có đúng **một ô ngẫu nhiên** rút từ nhóm 3 con, roll
   một lần ở đầu run. Seed 4 ký tự hex in ở header HUD (`SEED 7F2A`). Tầng 16 cố định.
5. **Boss thứ hai.** `The Curator` ở **tầng 12** (HP 1700 / ATK 86 / DEF 105 / SPD 96, 3 phase).
   Tổng địch: 9 thường · 5 elite · 2 boss = 16. Không cắt elite nào.
6. **Chốt "2/5 mảnh"**: bày 5 mảnh, người chơi **chọn 2**.
7. **Dọn mock cho khớp dữ liệu.** Đội mẫu trong HUD/Team/Equip là Rook · Kaine · Lumen · Bastion
   (2 DPS · 1 Support · 1 Sustain); HP quái trong HUD lấy đúng max HP thật; chữ cái Equip đổi
   từ `a–d` sang `E–H`; dòng "đội hiện tại" giờ tính từ đội mẫu thay vì viết cứng.

## Việc tiếp theo (theo thứ tự)

1. **Soát lại §10 và §12 sau khi thêm boss 12** — bảng band đã tách dòng 9–11 / 12 / 13–15 / 16,
   nhưng chưa ai đọc lại toàn bộ bằng mắt trên trình duyệt.
2. **Cân bằng Curator.** Ngưỡng đang ghi ở §13: nếu đội nhiều Ulti thua > 70% ở tầng 12 thì hạ
   hồi máu mỗi Ulti từ 5% xuống 3%. Chưa có harness thật để đo — đây là việc của bản build.
3. **Ô ngẫu nhiên**: 16 pool đã khai báo trong `BASE.encounters[].roll`. Cần kiểm tra bằng mắt
   rằng mọi pool đều cùng vai trò/độ khó (hiện là đánh giá thủ công).
4. **Mở rộng verify.js** nếu thêm luật mới: harness hiện phủ hình học HUD, số lượng nội dung,
   thứ tự ABC, pool ngẫu nhiên, boss tầng 12/16, hai lần bấm, lệnh xám.

## Việc còn mở (chưa chốt)

- Con số 5% hồi máu mỗi Ulti của Curator (xem §13 hàng "mở").
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
