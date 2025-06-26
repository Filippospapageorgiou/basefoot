-- Δημιουργία extensions που χρειάζονται
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Δημιουργία schema
CREATE SCHEMA "data";

-- Δημιουργία tables
CREATE TABLE "data"."users" (
  "id" SERIAL PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "hash_password" text NOT NULL,
  "name" text NOT NULL,
  "location" text NOT NULL,
  "occupation" text NOT NULL,
  "avatar_path" text NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "data"."sessions" (
  "gui_id" uuid DEFAULT uuid_generate_v4(),
  "user_id" integer,
  "expires" timestamp NOT NULL DEFAULT (now() + interval '8 hour'),
  "completed" boolean NOT NULL DEFAULT false,
  PRIMARY KEY ("gui_id", "user_id")
);

CREATE TABLE "data"."password_resets" (
  "gui_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "user_id" integer NOT NULL,
  "expires" timestamp NOT NULL DEFAULT (now() + interval '7 day'),
  "completed" boolean NOT NULL DEFAULT false
);

CREATE TABLE "data"."posts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer NOT NULL,
  "text" text NOT NULL,
  "created" timestamp NOT NULL DEFAULT (now()),
  "visibility" text NOT NULL DEFAULT 'public'
);

CREATE TABLE "data"."post_attachments" (
  "id" SERIAL PRIMARY KEY,
  "post_id" integer NOT NULL,
  "path" text NOT NULL,
  "mime_type" text NOT NULL
);

CREATE TABLE "data"."post_comments" (
  "id" SERIAL PRIMARY KEY,
  "user_id" integer NOT NULL,
  "post_id" integer NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "text" text NOT NULL
);

CREATE TABLE "data"."post_tags" (
  "post_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  PRIMARY KEY ("post_id", "user_id")
);

CREATE TABLE "data"."friends" (
  "friend_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  PRIMARY KEY ("user_id", "friend_id")
);

CREATE TABLE "data"."notifications" (
  "id" SERIAL PRIMARY KEY,
  "created" timestamp NOT NULL DEFAULT (now()),
  "user_id" integer NOT NULL,
  "friend_id" integer NOT NULL,
  "text" text NOT NULL,
  "viewed" boolean NOT NULL DEFAULT false,
  "post_id" integer
);

-- Δημιουργία Foreign Keys
ALTER TABLE "data"."sessions" ADD FOREIGN KEY ("user_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."password_resets" ADD FOREIGN KEY ("user_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."posts" ADD FOREIGN KEY ("user_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."post_attachments" ADD FOREIGN KEY ("post_id") REFERENCES "data"."posts" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."post_comments" ADD FOREIGN KEY ("user_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."post_comments" ADD FOREIGN KEY ("post_id") REFERENCES "data"."posts" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."post_tags" ADD FOREIGN KEY ("user_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."post_tags" ADD FOREIGN KEY ("post_id") REFERENCES "data"."posts" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."friends" ADD FOREIGN KEY ("user_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."friends" ADD FOREIGN KEY ("friend_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."notifications" ADD FOREIGN KEY ("user_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."notifications" ADD FOREIGN KEY ("friend_id") REFERENCES "data"."users" ("id") ON DELETE CASCADE;

ALTER TABLE "data"."notifications" ADD FOREIGN KEY ("post_id") REFERENCES "data"."posts" ("id") ON DELETE SET NULL;

-- Δημιουργία indexes για καλύτερη απόδοση
CREATE INDEX idx_users_email ON "data"."users" ("email");
CREATE INDEX idx_sessions_user_id ON "data"."sessions" ("user_id");
CREATE INDEX idx_posts_user_id ON "data"."posts" ("user_id");
CREATE INDEX idx_posts_created ON "data"."posts" ("created");
CREATE INDEX idx_post_comments_post_id ON "data"."post_comments" ("post_id");
CREATE INDEX idx_notifications_user_id ON "data"."notifications" ("user_id");
CREATE INDEX idx_notifications_viewed ON "data"."notifications" ("viewed");

-- ===============================================
-- ΔΗΜΙΟΥΡΓΙΑ USER ΚΑΙ PERMISSIONS
-- ===============================================

-- Δημιουργία application user
CREATE USER root WITH PASSWORD 'Admin12345678!';

-- Δικαιώματα στη database (αλλάξτε το 'your_database_name' με το πραγματικό όνομα της database σας)
GRANT CONNECT ON DATABASE basefoot TO root;

-- Δικαιώματα στο schema
GRANT USAGE ON SCHEMA data TO root;
GRANT CREATE ON SCHEMA data TO root;
GRANT ALL PRIVILEGES ON SCHEMA data TO root;

-- Δικαιώματα σε όλα τα υπάρχοντα tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA data TO root;

-- Δικαιώματα σε μελλοντικά tables που θα δημιουργηθούν
ALTER DEFAULT PRIVILEGES IN SCHEMA data GRANT ALL PRIVILEGES ON TABLES TO root;

-- Δικαιώματα στις sequences (για SERIAL columns)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA data TO root;
ALTER DEFAULT PRIVILEGES IN SCHEMA data GRANT ALL PRIVILEGES ON SEQUENCES TO root;

-- Δικαιώματα στις functions
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA data TO root;
ALTER DEFAULT PRIVILEGES IN SCHEMA data GRANT ALL PRIVILEGES ON FUNCTIONS TO root;

-- Αν θέλετε να δώσετε superuser privileges (προσοχή!)
-- ALTER USER myapp_user WITH SUPERUSER;

-- Για να δείτε τα permissions που έχει ο user:
-- \du myapp_user
-- \l
-- \dn+ data