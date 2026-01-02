const { Client } = require('pg');

async function updateAdminRole() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Update admin user role
    const result = await client.query(
      "UPDATE users SET role = 'ADMIN' WHERE email = 'admin@prologix.com' RETURNING id, email, role"
    );

    if (result.rows.length > 0) {
      console.log('✅ Admin user updated successfully:');
      console.log(result.rows[0]);
    } else {
      console.log('❌ No user found with email: admin@prologix.com');
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error updating admin role:', error.message);
    process.exit(1);
  }
}

updateAdminRole();
