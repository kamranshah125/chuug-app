import 'dotenv/config'
import { defineConfig,env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: "postgresql://postgres:M0CCz3Id25jJdN8c@db.ifgzxwgiktsiozenybor.supabase.co:5432/postgres", 
  },
});
