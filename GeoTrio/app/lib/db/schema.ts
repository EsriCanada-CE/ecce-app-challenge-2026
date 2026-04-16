import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().unique(),
    name: text("name").notNull(),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("users_session_id_idx").on(table.sessionId),
  ],
);

export const rides = sqliteTable(
  "rides",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode").notNull(),
    originLabel: text("origin_label"),
    destinationLabel: text("destination_label"),
    originLat: real("origin_lat").notNull(),
    originLng: real("origin_lng").notNull(),
    destinationLat: real("destination_lat").notNull(),
    destinationLng: real("destination_lng").notNull(),
    distanceMeters: integer("distance_meters").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    calories: integer("calories").notNull(),
    cardioMinutes: integer("cardio_minutes").notNull(),
    co2Kg: real("co2_kg").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("rides_user_id_created_at_idx").on(table.userId, table.createdAt),
  ],
);
