import { json } from "@remix-run/node";
import prisma from "app/db.server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ========================
// POST /api/auth/register
// ========================
export async function action({ request }: { request: Request }) {
  try {
    const data = await request.json();
    const { name, email, password } = data;

    if (!name || !email || !password) {
      return json({ message: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return json({ message: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    return json({ message: "User registered successfully", user }, { status: 201 });
  } catch (error: any) {
    return json({ message: error.message }, { status: 500 });
  }
}

// ========================
// GET /api/auth/profile
// ========================
export async function loader({ request }: { request: Request }) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return json({ message: "You are authorized!", user: decoded });
  } catch (error: any) {
    return json({ message: "Invalid or expired token" }, { status: 401 });
  }
}
