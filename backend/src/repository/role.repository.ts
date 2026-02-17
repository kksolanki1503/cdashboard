import { pool } from "../config/index.js";
import { Role, CreateRoleDTO, UpdateRoleDTO } from "../types/index.js";

export class RoleRepository {
  async create(data: CreateRoleDTO): Promise<Role> {
    const [result] = await pool.execute(
      `INSERT INTO roles (name, description, active) VALUES (?, ?, ?)`,
      [data.name, data.description ?? null, data.active ?? true],
    );

    const insertId = (result as { insertId: number }).insertId;
    return this.findById(insertId) as Promise<Role>;
  }

  async findById(id: number): Promise<Role | null> {
    const [rows] = await pool.execute(`SELECT * FROM roles WHERE id = ?`, [id]);

    const roles = rows as Role[];
    return roles.length > 0 ? (roles[0] ?? null) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const [rows] = await pool.execute(`SELECT * FROM roles WHERE name = ?`, [
      name,
    ]);

    const roles = rows as Role[];
    return roles.length > 0 ? (roles[0] ?? null) : null;
  }

  async findAll(activeOnly = false): Promise<Role[]> {
    const query = activeOnly
      ? `SELECT * FROM roles WHERE active = TRUE ORDER BY id ASC`
      : `SELECT * FROM roles ORDER BY id ASC`;

    const [rows] = await pool.execute(query);
    return rows as Role[];
  }

  async update(id: number, data: UpdateRoleDTO): Promise<Role | null> {
    const fields: string[] = [];
    const values: (string | boolean | null)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description ?? null);
    }
    if (data.active !== undefined) {
      fields.push("active = ?");
      values.push(data.active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id.toString());
    await pool.execute(
      `UPDATE roles SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await pool.execute(`DELETE FROM roles WHERE id = ?`, [id]);
  }

  async deactivate(id: number): Promise<Role | null> {
    return this.update(id, { active: false });
  }

  async activate(id: number): Promise<Role | null> {
    return this.update(id, { active: true });
  }
}

export default new RoleRepository();
