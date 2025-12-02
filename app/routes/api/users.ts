import { json } from "@remix-run/node";
import prisma from "app/db.server";
import bcrypt from "bcryptjs";

// GET /api/users
export async function loader() {
  const users = await prisma.user.findMany();
  return json(users);
}

// POST /api/users
export async function action({ request }: { request: Request }) {
  const { name, email, password, } = await request.json();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return json({ message: "User already exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed,} });

  return json({ message: "User created successfully", user }, { status: 201 });
}
