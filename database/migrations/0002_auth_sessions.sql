-- =========================================================
-- Migration 0002: authentication
-- =========================================================
-- Only lecturers and admins log in (rows in `users`).
-- Students are records in `students` and never authenticate.
--
-- `users.password` stores a scrypt hash produced by the API
-- (format: scrypt$N$r$p$salt$hash), never a plaintext password.
-- =========================================================


-- Roles that may log in.
ALTER TABLE users
    ADD CONSTRAINT check_users_role
        CHECK (role IN ('lecturer', 'admin'));

-- The API lowercases emails before storing them. Enforcing it here
-- makes the existing UNIQUE (email) constraint case-insensitive.
ALTER TABLE users
    ADD CONSTRAINT check_users_email_lowercase
        CHECK (email = lower(email));


-- =========================================================
-- SESSIONS
-- =========================================================
-- One row per logged-in browser. The browser holds a random
-- token in an httpOnly cookie; only its SHA-256 hash is stored,
-- so a leaked database dump cannot be used to hijack sessions.
-- Deleting a row logs that browser out immediately.

CREATE TABLE sessions (
    token_hash CHAR(64) PRIMARY KEY,
    lecturer_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (lecturer_id)
        REFERENCES users(lecturer_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT check_sessions_expiry
        CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_lecturer
    ON sessions(lecturer_id);

CREATE INDEX idx_sessions_expires
    ON sessions(expires_at);
