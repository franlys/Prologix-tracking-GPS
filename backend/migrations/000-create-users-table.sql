-- ========================================
-- MIGRACIÓN: Tabla de Usuarios
-- Fecha: 28 de Diciembre 2025
-- Descripción: Crea la tabla users necesaria para el sistema
-- ========================================

-- Habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLA: users
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "email" VARCHAR UNIQUE NOT NULL,
  "password" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "role" VARCHAR DEFAULT 'USER' CHECK ("role" IN ('USER', 'INSTALLER', 'ADMIN')),
  "subscriptionPlan" VARCHAR DEFAULT 'BASIC' CHECK ("subscriptionPlan" IN ('BASIC', 'PLUS', 'PRO')),
  "gpsTraceUserId" VARCHAR,
  "phoneNumber" VARCHAR,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" ("role");
CREATE INDEX IF NOT EXISTS "idx_users_isActive" ON "users" ("isActive");

-- Verificar tabla creada
SELECT 'Tabla users creada exitosamente!' as mensaje;
