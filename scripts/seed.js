/**
 * Seed script — creates 7 teams, 1 admin user, and sample tasks per category.
 * Run: node scripts/seed.js
 *
 * Requires the API Gateway to be running on port 3000.
 * Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to override defaults.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@tasktracker.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

const TEAM_NAMES = [
  'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta',
  'Team Epsilon', 'Team Zeta', 'Team Eta',
];

const CATEGORIES = [
  'Automation Testing Coverage',
  'DR Dry Run',
  'Active-Active Setup',
  'LEAP Framework Adherence',
  'Claude Code Adoption %',
  'Open Operational Items',
  'Security Risk Items',
];

async function request(method, path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data.data;
}

async function main() {
  console.log('Seeding Task Tracker...');

  // 1. Register admin user (ignore error if already exists)
  console.log('\n→ Creating admin user...');
  try {
    await request('POST', '/auth/register', {
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log('  Admin user created');
  } catch (err) {
    console.log('  Admin user already exists (skipping)');
  }

  // 2. Login to get token
  const { token } = await request('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  console.log('  Logged in as admin');

  // 3. Create teams
  console.log('\n→ Creating teams...');
  const teams = [];
  for (const name of TEAM_NAMES) {
    try {
      const team = await request('POST', '/teams', { name, description: `Engineering team: ${name}` }, token);
      teams.push(team);
      console.log(`  Created team: ${name}`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`  Team already exists: ${name} (skipping)`);
      } else {
        console.error(`  Failed to create team ${name}:`, err.message);
      }
    }
  }

  if (teams.length === 0) {
    console.log('\nNo new teams created. Exiting.');
    return;
  }

  // 4. Create sample tasks — one per category per team
  console.log('\n→ Creating sample tasks...');
  const now         = new Date();
  const startDate   = new Date(now.getFullYear(), now.getMonth(), 1);    // start of this month
  const dueDate     = new Date(now.getFullYear(), now.getMonth() + 3, 0); // end of next 3 months
  const nextUpdate  = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now

  let taskCount = 0;
  for (const team of teams) {
    for (const category of CATEGORIES) {
      try {
        await request('POST', '/tasks', {
          title:            `[${team.name}] ${category}`,
          description:      `Track ${category} progress for ${team.name}.`,
          category,
          assignedTeamId:   team._id,
          status:           'in_progress',
          completionPct:    Math.floor(Math.random() * 60),
          plannedStartDate: startDate.toISOString(),
          dueDate:          dueDate.toISOString(),
          nextUpdateDate:   nextUpdate.toISOString(),
        }, token);
        taskCount++;
      } catch (err) {
        console.error(`  Failed task for ${team.name}/${category}:`, err.message);
      }
    }
  }
  console.log(`  Created ${taskCount} tasks`);

  console.log('\n✓ Seed complete!');
  console.log(`  Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Frontend:    http://localhost:3005`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
