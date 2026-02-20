-- Add parent_id column to modules table for hierarchical module structure
ALTER TABLE modules ADD COLUMN parent_id INT DEFAULT NULL;

-- Add foreign key constraint for parent module
ALTER TABLE modules ADD CONSTRAINT fk_parent_module 
  FOREIGN KEY (parent_id) REFERENCES modules(id) ON DELETE SET NULL;

-- Add index for faster queries on parent_id
CREATE INDEX idx_modules_parent_id ON modules(parent_id);