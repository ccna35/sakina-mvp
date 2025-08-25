// seeds/seed-users-profiles.ts
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DB = {
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "sakina",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

const RAW_PASSWORD = "password123";
const BCRYPT_ROUNDS = 10;
const VERIFY_ALL = true; // set to false if you want is_verified = 0

// Names
const maleFirst = [
  "Ahmed",
  "Mohamed",
  "Mahmoud",
  "Mostafa",
  "Omar",
  "Youssef",
  "Khaled",
  "Tamer",
  "Ibrahim",
  "Hassan",
  "Hussein",
  "Amr",
  "Ali",
  "Walid",
  "Karim",
  "Ramadan",
  "Ezzat",
  "Hany",
  "Alaa",
  "Sherif",
  "Tarek",
  "Nader",
  "Fadi",
  "Mina",
  "Rami",
];
const femaleFirst = [
  "Fatimah",
  "Aisha",
  "Mariam",
  "Nour",
  "Sara",
  "Hagar",
  "Reem",
  "Menna",
  "Aya",
  "Esraa",
  "Doaa",
  "Hoda",
  "Yasmin",
  "Nadine",
  "Shimaa",
  "Omnia",
  "Lamia",
  "Hanan",
  "Mona",
  "Rana",
  "Dina",
  "Mai",
  "Nesma",
  "Ghada",
  "Heba",
];
const lastNames = [
  "Hassan",
  "Khalil",
  "Abdelrahman",
  "Mostafa",
  "Mahmoud",
  "Ali",
  "Othman",
  "Ibrahim",
  "Youssef",
  "El-Sayed",
  "Fathi",
  "Saad",
  "Farouk",
  "Amer",
  "Kamel",
  "Lotfy",
  "Hegazy",
  "Nassar",
  "Fouad",
  "Amin",
];

type CityInfo = { city: string; country: string; lat: number; lng: number };
const cities: CityInfo[] = [
  { city: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { city: "Giza", country: "Egypt", lat: 30.0131, lng: 31.2089 },
  { city: "Alexandria", country: "Egypt", lat: 31.2001, lng: 29.9187 },
  { city: "Port Said", country: "Egypt", lat: 31.2653, lng: 32.3019 },
  { city: "Suez", country: "Egypt", lat: 29.9668, lng: 32.5498 },
  { city: "Luxor", country: "Egypt", lat: 25.6872, lng: 32.6396 },
  { city: "Aswan", country: "Egypt", lat: 24.0889, lng: 32.8998 },
  { city: "Mansoura", country: "Egypt", lat: 31.0409, lng: 31.3785 },
  { city: "Tanta", country: "Egypt", lat: 30.7865, lng: 31.0004 },
  { city: "Ismailia", country: "Egypt", lat: 30.5965, lng: 32.2715 },
];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]) => arr[rand(arr.length)];
const jitter = (v: number, amt: number) => v + (Math.random() - 0.5) * amt;

function randomDOB(): string {
  const start = new Date("1985-01-01").getTime();
  const end = new Date("2006-12-31").getTime();
  const t = start + Math.random() * (end - start);
  const d = new Date(t);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type Gender = "male" | "female";
function makeName(g: Gender) {
  const first = g === "male" ? pick(maleFirst) : pick(femaleFirst);
  const last = pick(lastNames);
  return { first, last, full: `${first} ${last}` };
}
function emailFromName(first: string, last: string, i: number) {
  const base = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "");
  return `${base}${i}@example.com`;
}
function randomMadhhab() {
  return pick(["Hanafi", "Shafi'i", "Maliki", "Hanbali"]);
}
function randomMarital() {
  return pick(["single", "divorced", "widowed"]);
}

async function main() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST ?? "localhost",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "root",
    database: process.env.DB_NAME ?? "sakina",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  });
  const conn = await pool.getConnection();
  try {
    const hash = await bcrypt.hash(RAW_PASSWORD, BCRYPT_ROUNDS);
    await conn.beginTransaction();

    // Optional cleanup for repeatable seeds (be careful in non-dev)
    // await conn.query("DELETE FROM profiles");
    // await conn.query("DELETE FROM users");

    const total = 100;
    for (let i = 0; i < total; i++) {
      const gender: Gender = i % 2 === 0 ? "male" : "female";
      const { first, last, full } = makeName(gender);
      const email = emailFromName(first, last, i);
      const isVerified = VERIFY_ALL ? 1 : 0;

      // Insert into users table (as per your schema)
      const [userRes] = await conn.query<mysql.ResultSetHeader>(
        `INSERT INTO users (email, password_hash, gender, role, is_verified)
         VALUES (?, ?, ?, 'user', ?)`,
        [email, hash, gender, isVerified]
      );
      const userId = userRes.insertId;

      // Build profile data
      const c = pick(cities);
      const lat = jitter(c.lat, 0.04);
      const lng = jitter(c.lng, 0.04);

      const displayName = full;
      const dob = randomDOB();
      const country = c.country;
      const city = c.city;
      const prayerLevel = rand(6); // 0..5
      const marital = randomMarital();
      const madhhab = randomMadhhab();
      const bio =
        gender === "male"
          ? "Serious about nikah."
          : "Seeking marriage upon the Sunnah.";
      const waliName =
        gender === "female"
          ? pick([
              "Omar Khalil",
              "Hassan Ali",
              "Mahmoud Farouk",
              "Ibrahim Amin",
              "Youssef Fathi",
            ])
          : null;
      const waliRelation =
        gender === "female"
          ? pick(["Father", "Brother", "Uncle", "Guardian"])
          : null;

      // Insert profile (location POINT with SRID)
      await conn.query(
        `INSERT INTO profiles (
           user_id, display_name, dob, country, city, madhhab, prayer_level, marital_status,
           wali_name, wali_relation, wali_contact_encrypted, bio, photo_url, location_visibility, location
         )
         VALUES (
           ?, ?, ?, ?, ?, ?, ?, ?,
           ?, ?, NULL, ?, NULL, 'approx_city',
           ST_SRID(POINT(?, ?), 4326)
         )`,
        [
          userId,
          displayName,
          dob,
          country,
          city,
          madhhab,
          prayerLevel,
          marital,
          waliName,
          waliRelation,
          bio,
          lng,
          lat,
        ]
      );
    }

    await conn.commit();
    console.log(`Seeded ${total} users + profiles.`);
  } catch (e) {
    await conn.rollback();
    console.error(e);
    process.exitCode = 1;
  } finally {
    conn.release();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
