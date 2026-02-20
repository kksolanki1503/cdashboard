-- Drop refresh_tokens table as we now use stateless JWT refresh tokens
-- This migration removes the refresh_tokens table since refresh tokens
-- are now stored as HTTP-only cookies and verified via JWT (no database storage)

DROP TABLE IF EXISTS refresh_tokens;
