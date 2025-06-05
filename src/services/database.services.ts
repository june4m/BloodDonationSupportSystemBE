
import sql,{ConnectionPool} from 'mssql';
import dotenv from 'dotenv'
import { error } from 'console';

dotenv.config()
class DatabaseServices{
    private pool: sql.ConnectionPool | null = null
    private config:sql.config = {
        user:process.env.DB_USERNAME as string,
        password: process.env.DB_PASSWORD as string,
        server: process.env.DB_SERVER as string,
        database: process.env.DB_NAME as string,
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    }
    async connect(): Promise<ConnectionPool>{
        if(!this.pool){
            try{
                this.pool = await sql.connect(this.config)
                console.log('Connect database successfully');
                
            }catch (error)
            {
                console.error('Database connection failed',error);
                throw error
            }
        }
        return this.pool
    }
    get connection(){
        if(!this.pool) throw new Error('DB not connected yet')
            return this.pool
    }

    async getAllMember(){
        const pool = await this.connect();
        const result= await pool.request().query('SELECT * FROM MEMBER');
        return result.recordset
    }
}
const databaseServices = new DatabaseServices
export  default databaseServices