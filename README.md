# Toán vui mỗi ngày

Ứng dụng luyện toán cơ bản cho trẻ 4–6 tuổi. Phụ huynh tạo bộ đề, còn bé có thể làm bài gần như hoàn toàn bằng bàn phím. Backend giữ đáp án trong bộ nhớ và chỉ trả kết quả đúng/sai cho frontend.

## Cấu trúc

- `backend/`: FastAPI, Pydantic, bộ sinh câu hỏi và kho session in-memory.
- `frontend/`: React, TypeScript, Vite và CSS responsive.

## Chạy backend

Yêu cầu Python 3.11+.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API chạy tại `http://localhost:8000`; tài liệu Swagger tại `http://localhost:8000/docs`.

## Chạy frontend

Yêu cầu Node.js 20+.

```powershell
cd frontend
npm install
npm run dev
```

Mở `http://localhost:5173`. Vite proxy các request `/api` sang backend. Có thể sao chép `.env.example` thành `.env` để chỉ định API URL khác.

## Chạy bằng Docker Compose

Yêu cầu Docker Desktop (hoặc Docker Engine) có Compose plugin.

Từ thư mục gốc project:

```powershell
docker compose up --build -d
```

Mở `http://localhost`. Frontend được phục vụ bởi Nginx trên cổng HTTP 80 và các request `/api` được chuyển tiếp tới backend trong mạng Compose.

Xem log bằng `docker compose logs -f`, dừng các container bằng `docker compose down`.

## Kiểm thử

```powershell
cd backend
pytest

cd ..\frontend
npm run build
```

## Điều khiển khi làm bài

- Nhập số và nhấn `Enter` để kiểm tra.
- `←` / `→` để chuyển câu.
- Input luôn tự lấy focus khi đổi câu.
- Đáp án đã nhập được giữ lại khi quay về câu trước.

Nút `Âm thanh` bật/tắt cả lời khen và giai điệu báo hiệu. Các clip giọng nói MP3 nằm trong `frontend/public/audio`: ba clip cho câu đúng và hai clip cho câu cần thử lại; ứng dụng chọn ngẫu nhiên mỗi lần. Nhạc hiệu phân biệt hai trạng thái được tạo bằng Web Audio.
