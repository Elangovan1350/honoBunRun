import { Hono } from "hono";
import { PrismaClient } from "../src/generated/prisma/client";
import { config } from "dotenv";

config();

const app = new Hono();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.NODE_ENV === "production"
          ? process.env.TURSO_DATABASE_URL!
          : process.env.DATABASE_URL!,
    },
  },
});
console.log(
  "Prisma is connecting to:",
  process.env.NODE_ENV === "production"
    ? process.env.TURSO_DATABASE_URL
    : process.env.DATABASE_URL
);

app.get("/", (c) => {
  return c.text("Hello Hono! js");
});

// User endpoints

// get all users with their todos

app.get("/users", async (c) => {
  const users = await prisma.user.findMany({ include: { todos: true } });
  return c.json(users);
});

// Get a user by ID

app.get("/users/:id", async (c) => {
  const { id } = c.req.param();
  const users = await prisma.user.findUnique({
    where: { id: id },
    include: { todos: true },
  });
  return c.json(users);
});

// Create a new user

app.post("/users", async (c) => {
  const { name, email } = await c.req.json();
  const newUser = await prisma.user.create({ data: { name, email } });
  return c.json(newUser, 201);
});

// Delete a user

app.delete("/users/:id", async (c) => {
  const { id } = c.req.param();
  const deletedUser = await prisma.user.delete({ where: { id } });
  return c.json(deletedUser);
});

// Todo endpoints

// post a new todo

app.post("/todos", async (c) => {
  const { title, userId } = await c.req.json();
  const newTodo = await prisma.todo.create({ data: { title, userId } });
  return c.json(newTodo, 201);
});

// Mark a todo as finished

app.put("/todos/finished", async (c) => {
  const { id, completed }: { id: string; completed: boolean } =
    await c.req.json();

  const updateTodo = await prisma.todo.update({
    where: { id },
    data: { completed: !completed },
  });
  return c.json(updateTodo);
});

// Update a todo title

app.put("/todos/updateTitle", async (c) => {
  const { id, title } = await c.req.json();
  const updateTodo = await prisma.todo.update({
    where: { id },
    data: { title },
  });
  return c.json(updateTodo);
});

// Delete a todo

app.delete("/todos/delete/:id", async (c) => {
  const { id } = c.req.param();
  const deleteTodo = await prisma.todo.delete({ where: { id } });
  return c.json(deleteTodo);
});

export default app;
