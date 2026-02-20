import { pool } from "../config/index.js";
import {
  Module,
  CreateModuleDTO,
  UpdateModuleDTO,
  ModuleWithChildrenDTO,
} from "../types/index.js";

export class ModuleRepository {
  async create(data: CreateModuleDTO): Promise<Module> {
    console.log("Creating module with data:", JSON.stringify(data));
    const [result] = await pool.execute(
      `INSERT INTO modules (name, description, parent_id, active) VALUES (?, ?, ?, ?)`,
      [
        data.name,
        data.description ?? null,
        data.parent_id ?? null,
        data.active ?? true,
      ],
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
      ? `SELECT * FROM modules WHERE active = TRUE ORDER BY created_at DESC, name ASC`
      : `SELECT * FROM modules ORDER BY created_at DESC, name ASC`;

    const [rows] = await pool.execute(query);
    return rows as Module[];
  }

  async findRootModules(activeOnly = false): Promise<Module[]> {
    const query = activeOnly
      ? `SELECT * FROM modules WHERE parent_id IS NULL AND active = TRUE ORDER BY created_at DESC, name ASC`
      : `SELECT * FROM modules WHERE parent_id IS NULL ORDER BY created_at DESC, name ASC`;

    const [rows] = await pool.execute(query);
    return rows as Module[];
  }

  async findSubModules(
    parentId: number,
    activeOnly = false,
  ): Promise<Module[]> {
    const query = activeOnly
      ? `SELECT * FROM modules WHERE parent_id = ? AND active = TRUE ORDER BY created_at DESC, name ASC`
      : `SELECT * FROM modules WHERE parent_id = ? ORDER BY created_at DESC, name ASC`;

    const [rows] = await pool.execute(query, [parentId]);
    return rows as Module[];
  }

  async getModuleTree(activeOnly = false): Promise<ModuleWithChildrenDTO[]> {
    const modules = await this.findAll(activeOnly);
    return this.buildModuleTree(modules, null);
  }

  private buildModuleTree(
    modules: Module[],
    parentId: number | null,
  ): ModuleWithChildrenDTO[] {
    return modules
      .filter((m) => m.parent_id === parentId)
      .map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        parent_id: m.parent_id,
        active: m.active,
        created_at: m.created_at,
        updated_at: m.updated_at,
        children: this.buildModuleTree(modules, m.id),
      }));
  }

  async update(id: number, data: UpdateModuleDTO): Promise<Module | null> {
    const fields: string[] = [];
    const values: (string | boolean | number | null)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description ?? null);
    }
    if (data.parent_id !== undefined) {
      fields.push("parent_id = ?");
      values.push(data.parent_id ?? null);
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
