-- Add phoneNumber column to users table
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "phoneNumber" VARCHAR;

-- Create notification_rules table
CREATE TABLE IF NOT EXISTS "notification_rules" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "deviceId" VARCHAR,
  "type" VARCHAR NOT NULL CHECK ("type" IN ('DEVICE_OFFLINE', 'SPEED_EXCEEDED', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'LOW_BATTERY')),
  "channel" VARCHAR NOT NULL CHECK ("channel" IN ('EMAIL', 'WHATSAPP', 'BOTH')),
  "isActive" BOOLEAN DEFAULT true,
  "config" JSONB,
  "cooldownSeconds" INTEGER DEFAULT 300,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS "notification_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL,
  "deviceId" VARCHAR,
  "deviceName" VARCHAR,
  "type" VARCHAR NOT NULL CHECK ("type" IN ('DEVICE_OFFLINE', 'SPEED_EXCEEDED', 'GEOFENCE_ENTER', 'GEOFENCE_EXIT', 'LOW_BATTERY')),
  "channel" VARCHAR NOT NULL CHECK ("channel" IN ('EMAIL', 'WHATSAPP', 'BOTH')),
  "status" VARCHAR DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'SENT', 'FAILED')),
  "message" TEXT NOT NULL,
  "recipient" VARCHAR,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT now(),
  "sentAt" TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_notification_rules_userId" ON "notification_rules" ("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_rules_deviceId" ON "notification_rules" ("deviceId");
CREATE INDEX IF NOT EXISTS "idx_notification_logs_userId" ON "notification_logs" ("userId");
CREATE INDEX IF NOT EXISTS "idx_notification_logs_createdAt" ON "notification_logs" ("createdAt");

-- Show confirmation
SELECT 'Migration completed successfully!' as result;
