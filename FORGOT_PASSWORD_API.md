# Forgot Password API Documentation

## Tổng quan

Chức năng forgot password cho phép người dùng khôi phục mật khẩu bằng cách:

1. Nhập email hoặc số điện thoại
2. Nhận mã khôi phục 6 chữ số qua email
3. Xác thực mã và đặt mật khẩu mới

## API Endpoints

### 1. Gửi mã khôi phục mật khẩu

**Endpoint:** `POST /api/forgot-password`

**Mô tả:** Gửi mã khôi phục 6 chữ số đến email của người dùng

**Request Body:**

```json
{
  "identifier": "user@example.com" // hoặc "0123456789"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Mã khôi phục mật khẩu đã được gửi đến email của bạn",
  "data": null
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Không tìm thấy tài khoản với email hoặc số điện thoại này",
  "data": null
}
```

### 2. Xác thực mã khôi phục

**Endpoint:** `POST /api/verify-reset-token`

**Mô tả:** Xác thực mã khôi phục có hợp lệ hay không

**Request Body:**

```json
{
  "token": "123456"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Mã khôi phục hợp lệ",
  "data": {
    "user_id": "U001",
    "email": "user@example.com",
    "user_name": "Nguyen Van A"
  }
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Mã khôi phục không hợp lệ hoặc đã hết hạn",
  "data": null
}
```

### 3. Khôi phục mật khẩu

**Endpoint:** `POST /api/reset-password`

**Mô tả:** Đặt mật khẩu mới cho tài khoản

**Request Body:**

```json
{
  "token": "123456",
  "new_password": "newpassword123"
}
```

**Response Success (200):**

```json
{
  "success": true,
  "message": "Mật khẩu đã được khôi phục thành công",
  "data": null
}
```

**Response Error (400):**

```json
{
  "success": false,
  "message": "Mã khôi phục không hợp lệ hoặc đã hết hạn",
  "data": null
}
```

## Quy trình hoạt động

1. **Gửi yêu cầu khôi phục:**

   - User nhập email hoặc số điện thoại
   - Hệ thống kiểm tra tài khoản tồn tại
   - Tạo mã 6 chữ số và gửi qua email
   - Mã có hiệu lực trong 15 phút

2. **Xác thực mã:**

   - User nhập mã 6 chữ số
   - Hệ thống kiểm tra mã có hợp lệ và chưa hết hạn
   - Trả về thông tin user nếu hợp lệ

3. **Đặt mật khẩu mới:**
   - User nhập mã và mật khẩu mới
   - Hệ thống xác thực mã lần nữa
   - Cập nhật mật khẩu mới (đã được hash)
   - Đánh dấu mã đã được sử dụng

## Validation Rules

### Email/Phone Identifier:

- Email: Format standard (abc@domain.com)
- Phone: 10-11 chữ số

### Reset Token:

- Phải là 6 chữ số
- Hết hạn sau 15 phút
- Chỉ sử dụng được 1 lần

### New Password:

- Tối thiểu 6 ký tự
- Không có ký tự đặc biệt yêu cầu

## Database Schema

### Bảng PasswordResetTokens:

```sql
CREATE TABLE PasswordResetTokens (
    ID int IDENTITY(1,1) PRIMARY KEY,
    Token nvarchar(255) NOT NULL UNIQUE,
    User_ID nvarchar(50) NOT NULL,
    Expires_At datetime NOT NULL,
    Created_At datetime DEFAULT GETDATE(),
    Is_Used bit DEFAULT 0,
    FOREIGN KEY (User_ID) REFERENCES Users(User_ID)
);
```

## Security Features

1. **Token Hashing:** Mã gửi cho user được hash trước khi lưu DB
2. **Expiration:** Token tự động hết hạn sau 15 phút
3. **One-time Use:** Mỗi token chỉ được sử dụng 1 lần
4. **Password Hashing:** Mật khẩu mới được hash với bcrypt
5. **Input Validation:** Validate format email/phone và độ mạnh password

## Error Codes

- **400:** Bad Request - Lỗi validation hoặc business logic
- **500:** Internal Server Error - Lỗi hệ thống

## Email Template

Email gửi mã khôi phục sẽ có:

- Subject: "Mã khôi phục mật khẩu - Đại Việt Blood"
- Nội dung: Mã 6 chữ số, thời gian hết hạn, hướng dẫn sử dụng
- Design: HTML template với branding
