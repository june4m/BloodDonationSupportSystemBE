import sql, { ConnectionPool, config as SqlConfig } from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

class DatabaseServices {
  private static instance: DatabaseServices
  private pool: ConnectionPool

  private constructor() {
    const sqlConfig: SqlConfig = {
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_HOST ?? 'localhost',
      database: process.env.DB_NAME,
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }

    this.pool = new sql.ConnectionPool(sqlConfig)
    this.pool
      .connect()
      .then(() => console.log('Connected to SQL Server'))
      .catch((err) => console.error('Database connect error', err))
  }

  public static getInstance(): DatabaseServices {
    if (!DatabaseServices.instance) {
      DatabaseServices.instance = new DatabaseServices()
    }
    return DatabaseServices.instance
  }

  public async query(queryText: string, params?: any[]): Promise<any> {
    const request = this.pool.request()

    if (params && params.length > 0) {
      // Tự động gán input như @param1, @param2...
      params.forEach((value, index) => {
        request.input(`param${index + 1}`, value)
      })

      // Thay ? bằng @param1, @param2...
      let count = 0
      queryText = queryText.replace(/\?/g, () => `@param${++count}`)
    }

    const result = await request.query(queryText)
    return result.recordset
  }
}

export default DatabaseServices.getInstance()
