-- Create permissions master table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_code (code),
  INDEX idx_active (active)
);

-- Insert default permissions
INSERT INTO permissions (name, code, description) VALUES 
  ('Read', 'read', 'Permission to read/view data'),
  ('Write', 'write', 'Permission to create new data'),
  ('Update', 'update', 'Permission to update existing data'),
  ('Delete', 'delete', 'Permission to delete data');

-- Add active field to roles table
ALTER TABLE roles ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER description;
ALTER TABLE roles ADD INDEX idx_active (active);

-- Add active field to modules table
ALTER TABLE modules ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER description;
ALTER TABLE modules ADD INDEX idx_active (active);

-- Add active field to role_permissions table
ALTER TABLE role_permissions ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER can_update;
ALTER TABLE role_permissions ADD INDEX idx_active (active);

-- Add active field to user_permissions table
ALTER TABLE user_permissions ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER can_update;
ALTER TABLE user_permissions ADD INDEX idx_active (active);

-- Add active field to refresh_tokens table
ALTER TABLE refresh_tokens ADD COLUMN active BOOLEAN DEFAULT TRUE AFTER revoked;
ALTER TABLE refresh_tokens ADD INDEX idx_active (active);
