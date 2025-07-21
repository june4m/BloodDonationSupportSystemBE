interface TokenData {
    userId: string
    email: string
    userName: string
    expiresAt: Date
    isUsed: boolean
}

class InMemoryTokenStorage {
    private tokens: Map<string, TokenData> = new Map()

    storeToken(token: string, userId: string, email: string, userName: string, expiresAt: Date): void {
        this.tokens.set(token, {
            userId,
            email,
            userName,
            expiresAt,
            isUsed: false
        })
    }

    getValidToken(token: string): TokenData | null {
        const tokenData = this.tokens.get(token)

        if (!tokenData) {
            return null
        }

        // Kiểm tra token đã hết hạn chưa
        if (tokenData.expiresAt < new Date()) {
            this.tokens.delete(token)
            return null
        }

        // Kiểm tra token đã được sử dụng chưa
        if (tokenData.isUsed) {
            return null
        }

        return tokenData
    }

    markTokenAsUsed(token: string): boolean {
        const tokenData = this.tokens.get(token)

        if (!tokenData) {
            return false
        }

        tokenData.isUsed = true
        this.tokens.set(token, tokenData)
        return true
    }

    cleanupExpiredTokens(): void {
        const now = new Date()

        for (const [token, tokenData] of this.tokens.entries()) {
            if (tokenData.expiresAt < now) {
                this.tokens.delete(token)
            }
        }
    }

    // Method để xóa token sau khi sử dụng
    deleteToken(token: string): void {
        this.tokens.delete(token)
    }

    // Method để debug - xem có bao nhiêu token đang lưu
    getTokenCount(): number {
        return this.tokens.size
    }
}

// Singleton instance
export const tokenStorage = new InMemoryTokenStorage()

// Cleanup expired tokens mỗi 5 phút
setInterval(() => {
    tokenStorage.cleanupExpiredTokens()
}, 5 * 60 * 1000) // 5 minutes
