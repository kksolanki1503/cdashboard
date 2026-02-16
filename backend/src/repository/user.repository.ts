import { pool } from "../config/index.js";
import { User, CreateUserDTO } from "../types/index.js";

export class UserRepository {
  async create(data: CreateUserDTO): Promise<User> {
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [data.name, data.email, data.password],
    );

    const insertId = (result as { insertId: number }).insertId;
    return this.findById(insertId) as Promise<User>;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    const users = rows as User[];
    return users.length > 0 ? (users[0] ?? null) : null;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [id]);

    const users = rows as User[];
    return users.length > 0 ? (users[0] ?? null) : null;
  }

  async updateApproved(id: number, approved: boolean): Promise<void> {
    await pool.execute(`UPDATE users SET approved = ? WHERE id = ?`, [
      approved,
      id,
    ]);
  }

  async updateActive(id: number, active: boolean): Promise<void> {
    await pool.execute(`UPDATE users SET active = ? WHERE id = ?`, [
      active,
      id,
    ]);
  }
}

export default new UserRepository();
