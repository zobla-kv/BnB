import Fastify from "fastify";
import fs from "fs/promises";
import path from "path";

const fastify = Fastify({ logger: true });
const STORAGE_DIR = path.join(process.cwd(), "entities");

// Ensure the entities directory exists
await fs.mkdir(STORAGE_DIR, { recursive: true });

const getEntityFilePath = (uuid) => path.join(STORAGE_DIR, `${uuid}.json`);

const simulateLatency = async () => new Promise((resolve) => setTimeout(resolve, 2 ** Math.floor(Math.random() * 12)));

fastify.addHook("preHandler", (req, res, done) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");

  if (/options/i.test(req.method)) {
    return res.send();
  }

  done();
});

// create a new entity
fastify.post("/entities", async (request, reply) => {
  console.log('handler')
  await simulateLatency();

  try {
    const entity = request.body;
    if (!entity || typeof entity !== "object") {
      return reply.status(400).send({ error: "Invalid entity data" });
    }

    const uuid = crypto.randomUUID();
    const entityData = { ...entity, uuid };
    const filePath = getEntityFilePath(uuid);

    await fs.writeFile(filePath, JSON.stringify(entityData, null, 2));

    reply.status(201).send({ message: "Entity created", entity: entityData });
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to create entity" });
  }
});

// get a entity by UUID
fastify.get("/entities/:uuid", async (request, reply) => {
  console.log('handler get')

  await simulateLatency();

  const { uuid } = request.params;
  const filePath = getEntityFilePath(uuid);

  try {
    const entityData = await fs.readFile(filePath, "utf-8");
    reply.send(JSON.parse(entityData));
  } catch (error) {
    if (error.code === "ENOENT") {
      return reply.status(404).send({ error: "Entity not found" });
    }
    reply.status(500).send({ error: "Failed to retrieve entity" });
  }
});

// update a entity by UUID
fastify.patch("/entities/:uuid", async (request, reply) => {
  await simulateLatency();

  const { uuid } = request.params;
  const updatedEntityData = request.body;

  if (!updatedEntityData || typeof updatedEntityData !== "object") {
    return reply.status(400).send({ error: "Invalid entity data" });
  }

  const filePath = getEntityFilePath(uuid);

  try {
    await fs.access(filePath);
    const entityData = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const newEntityData = { ...entityData, ...updatedEntityData };

    await fs.writeFile(filePath, JSON.stringify(newEntityData, null, 2));
    reply.send({ message: "Entity updated", entity: newEntityData });
  } catch (error) {
    if (error.code === "ENOENT") {
      return reply.status(404).send({ error: "Entity not found" });
    }
    reply.status(500).send({ error: "Failed to update entity" });
  }
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    fastify.log.info("Server is running at http://localhost:3000");
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();