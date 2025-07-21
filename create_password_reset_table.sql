-- Script tạo bảng PasswordResetTokens cho chức năng forgot password
-- Chạy script này trong SQL Server để tạo bảng mới

CREATE TABLE PasswordResetTokens (
    ID int IDENTITY(1,1) PRIMARY KEY,
    Token nvarchar(255) NOT NULL UNIQUE,
    User_ID nvarchar(50) NOT NULL,
    Expires_At datetime NOT NULL,
    Created_At datetime DEFAULT GETDATE(),
    Is_Used bit DEFAULT 0,
    
    -- Foreign key constraint (nếu bảng Users đã tồn tại)
    CONSTRAINT FK_PasswordResetTokens_Users 
        FOREIGN KEY (User_ID) REFERENCES Users(User_ID)
        ON DELETE CASCADE
);

-- Tạo index để tối ưu hiệu suất truy vấn
CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(Token);
CREATE INDEX IX_PasswordResetTokens_UserID ON PasswordResetTokens(User_ID);
CREATE INDEX IX_PasswordResetTokens_Expires ON PasswordResetTokens(Expires_At);

-- Thêm comment cho bảng
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Bảng lưu trữ token để khôi phục mật khẩu', 
    @level0type = N'Schema', @level0name = dbo, 
    @level1type = N'Table', @level1name = PasswordResetTokens;

-- Thêm comment cho các cột
EXEC sp_addextendedproperty 
    @name = N'MS_Description', @value = N'ID tự động tăng', 
    @level0type = N'Schema', @level0name = dbo, 
    @level1type = N'Table', @level1name = PasswordResetTokens,
    @level2type = N'Column', @level2name = ID;

EXEC sp_addextendedproperty 
    @name = N'MS_Description', @value = N'Token đã được hash để bảo mật', 
    @level0type = N'Schema', @level0name = dbo, 
    @level1type = N'Table', @level1name = PasswordResetTokens,
    @level2type = N'Column', @level2name = Token;

EXEC sp_addextendedproperty 
    @name = N'MS_Description', @value = N'ID của user yêu cầu reset password', 
    @level0type = N'Schema', @level0name = dbo, 
    @level1type = N'Table', @level1name = PasswordResetTokens,
    @level2type = N'Column', @level2name = User_ID;

EXEC sp_addextendedproperty 
    @name = N'MS_Description', @value = N'Thời gian hết hạn của token', 
    @level0type = N'Schema', @level0name = dbo, 
    @level1type = N'Table', @level1name = PasswordResetTokens,
    @level2type = N'Column', @level2name = Expires_At;

EXEC sp_addextendedproperty 
    @name = N'MS_Description', @value = N'Thời gian tạo token', 
    @level0type = N'Schema', @level0name = dbo, 
    @level1type = N'Table', @level1name = PasswordResetTokens,
    @level2type = N'Column', @level2name = Created_At;

EXEC sp_addextendedproperty 
    @name = N'MS_Description', @value = N'Đánh dấu token đã được sử dụng hay chưa', 
    @level0type = N'Schema', @level0name = dbo, 
    @level1type = N'Table', @level1name = PasswordResetTokens,
    @level2type = N'Column', @level2name = Is_Used;
