import mysql from 'mysql2/promise';
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL missing');
export const pool = mysql.createPool(url + '?timezone=Z&dateStrings=true');
