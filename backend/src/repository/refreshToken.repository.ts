import { pool } from "../config/index.js";
import { RefreshToken, CreateRefreshTokenDTO } from "../types/index.js";

export class RefreshTokenRepository {
  async create(data: CreateRefreshTokenDTO): Promise<RefreshToken> {
    const [result] = await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [data.user_id, data.token, data.expires_at],
    );

    const insertId = (result as { insertId: number }).insertId;
    return this.findById(insertId) as Promise<RefreshToken>;
  }

  async findById(id: number): Promise<RefreshToken | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM refresh_tokens WHERE id = ?`,
      [id],
    );

    const tokens = rows as RefreshToken[];
    return tokens.length > 0 ? (tokens[0] ?? null) : null;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM refresh_tokens WHERE token = ?`,
      [token],
    );

    const tokens = rows as RefreshToken[];
    return tokens.length > 0 ? (tokens[0] ?? null) : null;
  }

  async findByUserId(userId: number): Promise<RefreshToken[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM refresh_tokens WHERE user_id = ? AND revoked = FALSE AND expires_at > NOW()`,
      [userId],
    );

    return rows as RefreshToken[];
  }

  async revoke(token: string): Promise<void> {
    await pool.execute(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?`,
      [token],
    );
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await pool.execute(
      `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?`,
      [userId],
    );
  }

  async deleteExpired(): Promise<void> {
    await pool.execute(
      `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = TRUE`,
    );
  }
}

export default new RefreshTokenRepository();
