import { pool } from "../config/db";
import { Request, Response } from "express";

export async function nearby(req: Request, res: Response) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radius_km ?? 25); // default 25 km
  const gender = req.query.gender as "male" | "female" | undefined;
  // Age filtering
  const minAge = Number(req.query.min_age ?? 18);
  const maxAge = Number(req.query.max_age ?? 99);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng are required" });
  }

  // Params order for ST_Distance_Sphere: POINT(lng, lat)
  const params: any[] = [lng, lat];
  let genderClause = "";
  if (gender) {
    genderClause = "AND u.gender = ?";
    params.push(gender);
  }
  params.push(lat, lng, radiusKm, minAge, maxAge);

  // Accurate distance in meters (MySQL 8.0+)
  const [rows] = (await pool.query(
    `SELECT
        u.id AS user_id,
        p.display_name,
        u.gender,
        p.city, p.country,
        -- never expose exact lat/lng; return distance only
        ST_Distance_Sphere(p.location, ST_SRID(POINT(?, ?), 4326)) AS distance_m,
        FLOOR(DATEDIFF(CURDATE(), p.dob) / 365.25) AS age
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.location IS NOT NULL
       AND p.location_visibility <> 'hidden'
       ${genderClause}
       AND ST_Distance_Sphere(p.location, ST_SRID(POINT(?, ?), 4326)) <= (? * 1000)
       AND FLOOR(DATEDIFF(CURDATE(), p.dob) / 365.25) BETWEEN ? AND ?
     ORDER BY distance_m ASC
     LIMIT 100`,
    params
  )) as any;

  res.json(
    rows.map((r: any) => ({
      user_id: r.user_id,
      display_name: r.display_name,
      gender: r.gender,
      city: r.city,
      country: r.country,
      distance_km: Math.round((r.distance_m / 1000) * 10) / 10,
      age: r.age,
    }))
  );
}
