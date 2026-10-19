// Menulis database/schema.sql dari src/db/ddl.ts (untuk impor manual lewat phpMyAdmin).
import fs from "node:fs";
import { DDL } from "../src/db/ddl";

fs.mkdirSync("database", { recursive: true });
fs.writeFileSync("database/schema.sql", "-- Struktur tabel (MySQL/MariaDB). Impor lewat phpMyAdmin > tab Import.\n-- Opsional: aplikasi membuat tabel ini otomatis saat pertama kali dijalankan.\n\nSET NAMES utf8mb4;\n\n" + DDL.map((s) => s + ";").join("\n\n") + "\n");
console.log("database/schema.sql ditulis");
