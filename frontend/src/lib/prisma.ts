import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma Client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma Client instance with configuration for Cloud SQL and local development
export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

// In development, store the instance globally to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown handler - only in Node.js runtime (not edge)
if (typeof process !== 'undefined' && process.on) {
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

// Database connection utility functions
export async function connectToDatabase(): Promise<boolean> {
  try {
    await prisma.$connect()
    console.log('✅ Connected to database')
    return true
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    return false
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    console.log('✅ Disconnected from database')
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Health check function for Cloud Run
export async function checkDatabaseHealth(): Promise<{ status: string; timestamp: Date; error?: string }> {
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`
    return {
      status: 'healthy',
      timestamp: new Date()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Transaction wrapper for complex operations
export async function withTransaction<T>(
  operation: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  return prisma.$transaction(operation)
}

export default prisma