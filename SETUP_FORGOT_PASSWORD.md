# Hướng dẫn Setup Chức năng Forgot Password

## 1. Cài đặt Dependencies

Tất cả dependencies cần thiết đã có sẵn trong `package.json`:

- `crypto` (built-in Node.js module)
- `bcrypt` - để hash password
- `nodemailer` - để gửi email

## 2. Tạo bảng Database

Chạy script SQL sau trong SQL Server để tạo bảng `PasswordResetTokens`:

```sql
-- Chạy file create_password_reset_table.sql
```

Hoặc chạy trực tiếp:

```sql
CREATE TABLE PasswordResetTokens (
    ID int IDENTITY(1,1) PRIMARY KEY,
    Token nvarchar(255) NOT NULL UNIQUE,
    User_ID nvarchar(50) NOT NULL,
    Expires_At datetime NOT NULL,
    Created_At datetime DEFAULT GETDATE(),
    Is_Used bit DEFAULT 0,
    CONSTRAINT FK_PasswordResetTokens_Users
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID)
        ON DELETE CASCADE
);
```

## 3. Cấu hình Email

Đảm bảo các biến môi trường email đã được cấu hình trong `.env`:

```env
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Lưu ý:** Với Gmail, cần sử dụng App Password thay vì password thường.

## 4. Test API Endpoints

### Test 1: Gửi mã khôi phục

```bash
curl -X POST http://localhost:3000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"identifier": "test@example.com"}'
```

### Test 2: Xác thực mã

```bash
curl -X POST http://localhost:3000/api/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'
```

### Test 3: Đặt mật khẩu mới

```bash
curl -X POST http://localhost:3000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "123456", "new_password": "newpassword123"}'
```

## 5. Kiểm tra Implementation

Các file đã được tạo/cập nhật:

### Schemas:

- `src/models/schemas/passwordReset.schema.ts` - Interface cho forgot password

### Repository:

- `src/repository/user.repository.ts` - Thêm methods cho database operations

### Services:

- `src/services/user.services.ts` - Business logic cho forgot password

### Controllers:

- `src/controller/ForgotPasswordController.ts` - API handlers

### Routers:

- `src/routers/forgotPassword.routers.ts` - Route definitions

### Constants:

- `src/constant/message.ts` - Thêm error messages

### Main App:

- `src/index.ts` - Đăng ký forgot password router

## 6. Features

### Security:

- ✅ Token được hash trước khi lưu database
- ✅ Token hết hạn sau 15 phút
- ✅ Mỗi token chỉ sử dụng được 1 lần
- ✅ Password được hash với bcrypt
- ✅ Validation input đầy đủ

### User Experience:

- ✅ Mã 6 chữ số dễ nhập
- ✅ Email template đẹp mắt
- ✅ Message lỗi rõ ràng bằng tiếng Việt
- ✅ Hỗ trợ tìm kiếm bằng email hoặc phone

### Maintainability:

- ✅ Code structure rõ ràng
- ✅ Error handling đầy đủ
- ✅ Constants centralized
- ✅ Type safety với TypeScript

## 7. Chạy ứng dụng

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

## 8. Frontend Integration

Frontend có thể tích hợp theo flow:

1. **Forgot Password Page:**

   - Input field cho email/phone
   - Call API `POST /api/forgot-password`

2. **Verify Code Page:**

   - Input field cho mã 6 chữ số
   - Call API `POST /api/verify-reset-token`

3. **Reset Password Page:**
   - Input field cho password mới
   - Call API `POST /api/reset-password`

## 9. Monitoring và Maintenance

### Cleanup expired tokens:

Có thể tạo cron job để cleanup các token hết hạn:

```typescript
// Trong ScheduleCronJobController.ts
await userService.cleanupExpiredTokens()
```

### Logs:

Tất cả errors được log ra console để debug.

## 10. Troubleshooting

### Lỗi gửi email:

- Kiểm tra cấu hình EMAIL_USERNAME và EMAIL_PASSWORD
- Đảm bảo Gmail đã bật App Password
- Kiểm tra firewall/network

### Lỗi database:

- Đảm bảo bảng PasswordResetTokens đã được tạo
- Kiểm tra foreign key constraint với bảng Users

### Token không hợp lệ:

- Kiểm tra token có đúng 6 chữ số không
- Kiểm tra token chưa hết hạn (15 phút)
- Kiểm tra token chưa được sử dụng
