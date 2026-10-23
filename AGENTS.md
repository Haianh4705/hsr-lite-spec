# AGENTS.md — HSR-lite spec

Bootstrap cho mọi phiên làm việc. Đọc file này trước, rồi mở `PROGRESS.md` để biết đang ở đâu.

## Dự án là gì

Một **bản đặc tả** (không phải game đã build) cho game RPG turn-based chạy terminal bằng Python.
Đầu ra duy nhất: `docs/design.html` — trang HTML tối, mọi con số sửa được tại chỗ, tự lưu
`localStorage`, xuất `design.json`.

## Luật bất di bất dịch

1. **Không build, không chạy game** trừ khi người dùng đồng ý rõ ràng.
2. **Không viết lại prompt giao việc** trừ khi được yêu cầu.
3. Chữ trong game là **tiếng Việt**; mọi danh từ riêng (nhân vật, vũ khí, địch, Ulti, field,
   tên hiệu ứng riêng) là **tiếng Anh**.
4. Khung HUD **80×24**: dòng 1 là thanh tab, dòng 24 là prompt, hộp 22 dòng. Mọi màn hình
   (Codex/Team/Equip) cũng rộng đúng 80 cột. `padTo()` và `screenBox()` cố tình ném lỗi khi tràn —
   **không** nuốt lỗi, hãy sửa nội dung.
5. Chữ cái đơn vị là **in hoa A–Z**: địch `A–D`, ta `E–H`, theo **ô** chứ không theo tên.
6. Chỉ **Ulti** có tên riêng. Basic và Skill là hành động chung.
7. Hiệu ứng trên HUD viết: `TÊN(n)` (cộng dồn) · `STAT±(x%)` (buff/debuff) · `SHD[số]` ·
   `CHỮ CÁI(n)` (hiệu ứng riêng, chữ cái là **nguồn** gắn nó).
8. Nội dung: **9 nhân vật · 12 vũ khí · 8 bộ di vật · 16 kẻ địch (9 thường · 5 elite · 2 boss)**.
9. Hệ số sảnh tối đa **×1.50**; **SPD địch không nhân** hệ số.

## Kiểm tra trước khi nói "xong"

```bash
node docs/verify.js          # phải in "ALL CHECKS PASSED", exit 0
```

Xem nhanh bằng mắt:

```bash
cd docs && python3 -m http.server 8817   # mở http://127.0.0.1:8817/design.html
```

Không có test nào khác. Không có build step. Không có git hook.

## Quy ước sửa file

- Mọi thay đổi cấu trúc dữ liệu phải đi kèm: bump `meta.version`, bump `KEY` (localStorage),
  và cập nhật dòng `bản <b>x.y</b>` ở masthead.
- `BASE` là nguồn số liệu duy nhất; phần HTML chỉ mô tả, không chứa số cứng (trừ ví dụ minh hoạ).
- Sửa bằng nhiều `edit` nhỏ; file ~1200 dòng, một lần ghi lớn dễ vượt giới hạn output.
- Sau khi sửa dữ liệu, chạy `node docs/verify.js` ngay — harness bắt được cả tràn cột.
- Danh sách trong spec sắp xếp: **nhân vật theo bảng chữ cái**, vũ khí theo vai, di vật theo
  hướng, địch theo tier (giữ đường dạy).

## Bản đồ file

| Đường dẫn | Vai trò |
|---|---|
| `docs/design.html` | Bản đặc tả duy nhất — sửa ở đây |
| `docs/verify.js` | Harness node: stub DOM, chạy script trong spec, assert hình học + số lượng |
| `PROGRESS.md` | Trạng thái phiên, việc đang làm, việc còn mở, changelog |
| `AGENTS.md` | File này — luật và cách làm |
| `skills/ambition-booster/` | Bản sao skill OpenCode cùng tên — dùng khi muốn nâng một task/prompt lên mức tham vọng hơn. Không liên quan cú pháp spec; đừng sửa để "khớp" với game |

## Khi bắt đầu phiên mới

1. Đọc `PROGRESS.md` mục **Đang ở đâu** và **Việc tiếp theo**.
2. Chạy `node docs/verify.js` để biết baseline còn xanh không.
3. Chỉ sau đó mới sửa. Nếu harness đỏ sẵn, sửa harness trước khi thêm việc mới.
