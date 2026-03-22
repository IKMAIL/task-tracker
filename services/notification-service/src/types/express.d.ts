declare global {
  namespace Express {
    interface Request {
      user: { sub: string; email: string; role: string; teamId?: string; iat?: number; exp?: number };
    }
  }
}

export {};
