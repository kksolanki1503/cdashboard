-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create role_permissions table (predefined permissions for each role)
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  module_id INT NOT NULL,
  can_read BOOLEAN DEFAULT FALSE,
  can_write BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_module (role_id, module_id)
);

-- Create user_permissions table (extra permissions granted directly to users)
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  module_id INT NOT NULL,
  can_read BOOLEAN DEFAULT FALSE,
  can_write BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_update BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_module (user_id, module_id)
);

-- Add role_id to users table
ALTER TABLE users ADD COLUMN role_id INT DEFAULT NULL;
ALTER TABLE users ADD CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL;

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
  ('admin', 'Full access to all modules and features'),
  ('operations', 'Access to operational modules'),
  ('user', 'Basic user access');

-- Insert default modules (customize based on your application)
INSERT INTO modules (name, description) VALUES 
  ('dashboard', 'Dashboard module'),
  ('users', 'User management module'),
  ('reports', 'Reports module'),
  ('settings', 'Settings module'),
  ('analytics', 'Analytics module'),
  ('campaigns', 'Campaigns module'),
  ('clicks', 'Clicks data module');

-- Insert default role permissions for admin (full access to all modules)
INSERT INTO role_permissions (role_id, module_id, can_read, can_write, can_delete, can_update)
SELECT 1, id, TRUE, TRUE, TRUE, TRUE FROM modules;

-- Insert default role permissions for operations (read/write access to specific modules)
INSERT INTO role_permissions (role_id, module_id, can_read, can_write, can_delete, can_update)
SELECT 2, id, TRUE, TRUE, FALSE, TRUE FROM modules WHERE name IN ('dashboard', 'reports', 'analytics', 'campaigns', 'clicks');

-- Insert default role permissions for user (read-only access to basic modules)
INSERT INTO role_permissions (role_id, module_id, can_read, can_write, can_delete, can_update)
SELECT 3, id, TRUE, FALSE, FALSE, FALSE FROM modules WHERE name IN ('dashboard', 'clicks');
