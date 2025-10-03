import { Hono } from "hono";
import { PrismaClient } from "../src/generated/prisma/client";

const app = new Hono();
const prisma = new PrismaClient();

app.get("/", (c) => {
  return c.text("Hello Hono! js");
});

app.get("/users", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});

app.get("/users/:id", async (c) => {
  const { id } = c.req.param();
  const users = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  return c.json(users);
});

app.post("/users", async (c) => {
  const data = await c.req.json();
  const newUser = await prisma.user.create({ data });
  return c.json(newUser, 201);
});

export default app;
