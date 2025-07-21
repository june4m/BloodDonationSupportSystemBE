# Test API Forgot Password

## 1. Test API Forgot Password - Gửi mã reset

### Endpoint: POST /api/forgot-password

#### Test với Email:

```bash
curl -X POST http://localhost:3000/api/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\": \"test@example.com\"}"
```

#### Test với Phone:

```bash
curl -X POST http://localhost:3000/api/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\": \"0123456789\"}"
```

## 2. Test API Verify Reset Token

### Endpoint: POST /api/verify-reset-token

```bash
curl -X POST http://localhost:3000/api/verify-reset-token ^
  -H "Content-Type: application/json" ^
  -d "{\"token\": \"123456\"}"
```

## 3. Test API Reset Password

### Endpoint: POST /api/reset-password

```bash
curl -X POST http://localhost:3000/api/reset-password ^
  -H "Content-Type: application/json" ^
  -d "{\"token\": \"123456\", \"new_password\": \"newpassword123\"}"
```

## Test với Postman

### 1. Forgot Password

- Method: POST
- URL: http://localhost:3000/api/forgot-password
- Headers: Content-Type: application/json
- Body (raw JSON):

```json
{
  "identifier": "test@example.com"
}
```

### 2. Verify Reset Token

- Method: POST
- URL: http://localhost:3000/api/verify-reset-token
- Headers: Content-Type: application/json
- Body (raw JSON):

```json
{
  "token": "123456"
}
```

### 3. Reset Password

- Method: POST
- URL: http://localhost:3000/api/reset-password
- Headers: Content-Type: application/json
- Body (raw JSON):

```json
{
  "token": "123456",
  "new_password": "newpassword123"
}
```

## Expected Responses

### Success Response:

```json
{
  "success": true,
  "message": "Mã khôi phục mật khẩu đã được gửi đến email của bạn",
  "data": null,
  "statusCode": 200
}
```

### Error Response:

```json
{
  "success": false,
  "message": "Email or phone number is required",
  "data": null,
  "statusCode": 400
}
```
