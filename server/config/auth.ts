const parsePositiveInt = (raw?: string, fallback = 1) => {
    if (!raw) return fallback
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const authConfig = {
    usernameMin: parsePositiveInt(process.env.AUTH_USERNAME_MIN, 3),
    passwordMin: parsePositiveInt(process.env.AUTH_PASSWORD_MIN, 6),
}
