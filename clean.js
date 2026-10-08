import { db } from './server/src/config/turso.js';
async function clean() {
  await db.execute('DELETE FROM users');
  const res = await db.execute('SELECT * FROM users');
  console.log('Total users remaining:', res.rows.length);
}
clean();
