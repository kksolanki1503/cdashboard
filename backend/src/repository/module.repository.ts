import { pool } from "../config/index.js";
import { Module, CreateModuleDTO, UpdateModuleDTO } from "../types/index.js";

export class ModuleRepository {
  async create(data: CreateModuleDTO): Promise<Module> {
    const [result] = await pool.execute(
      `INSERT INTO modules (name, description, active) VALUES (?, ?, ?)`,
      [data.name, data.description ?? null, data.active ?? true],
    );

    const insertId = (result as { insertId: number }).insertId;
    return this.findById(insertId) as Promise<Module>;
  }

  async findById(id: number): Promise<Module | null> {
    const [rows] = await pool.execute(`SELECT * FROM modules WHERE id = ?`, [
      id,
    ]);

    const modules = rows as Module[];
    return modules.length > 0 ? (modules[0] ?? null) : null;
  }

  async findByName(name: string): Promise<Module | null> {
    const [rows] = await pool.execute(`SELECT * FROM modules WHERE name = ?`, [
      name,
    ]);

    const modules = rows as Module[];
    return modules.length > 0 ? (modules[0] ?? null) : null;
  }

  async findAll(activeOnly = false): Promise<Module[]> {
    const query = activeOnly
      ? `SELECT * FROM modules WHERE active = TRUE ORDER BY name ASC`
      : `SELECT * FROM modules ORDER BY name ASC`;

    const [rows] = await pool.execute(query);
    return rows as Module[];
  }

  async update(id: number, data: UpdateModuleDTO): Promise<Module | null> {
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
      `UPDATE modules SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await pool.execute(`DELETE FROM modules WHERE id = ?`, [id]);
  }

  async deactivate(id: number): Promise<Module | null> {
    return this.update(id, { active: false });
  }

  async activate(id: number): Promise<Module | null> {
    return this.update(id, { active: true });
  }
}

export default new ModuleRepository();
