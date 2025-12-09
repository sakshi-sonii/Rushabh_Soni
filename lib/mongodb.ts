import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables")
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()

    cachedClient = client
    cachedDb = client.db(process.env.MONGODB_DB || "inventory_management")

    return { client: cachedClient, db: cachedDb }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}
