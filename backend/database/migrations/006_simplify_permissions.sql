-- Simplify permissions system
-- Remove granular permissions (can_read, can_write, can_delete, can_update)
-- Now just track which modules a role/user has access to

-- Drop and recreate role_permissions table with simplified schema
DROP TABLE IF EXISTS role_permissions;

CREATE TABLE IF NOT EXISTS role_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  module_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_module (role_id, module_id),
  INDEX idx_role_id (role_id),
  INDEX idx_module_id (module_id)
);

-- Drop and recreate user_permissions table with simplified schema  
DROP TABLE IF EXISTS user_permissions;

CREATE TABLE IF NOT EXISTS user_modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  module_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_module (user_id, module_id),
  INDEX idx_user_id (user_id),
  INDEX idx_module_id (module_id)
);

-- Insert default role-module mappings for admin (full access to all modules)
INSERT INTO role_modules (role_id, module_id)
SELECT 1, id FROM modules;

-- Insert default role-module mappings for operations
INSERT INTO role_modules (role_id, module_id)
SELECT 2, id FROM modules WHERE name IN ('dashboard', 'reports', 'analytics', 'campaigns', 'clicks');

-- Insert default role-module mappings for user
INSERT INTO role_modules (role_id, module_id)
SELECT 3, id FROM modules WHERE name IN ('dashboard', 'clicks');

-- Drop the old permissions table (if exists) - no longer needed
DROP TABLE IF EXISTS permissions;
