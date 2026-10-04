import pg from "pg";

export const pool = new pg.Pool({
    connectionString: 
        process.env.DATABASE_URL??"postgresql://relay:relay@localhost:5432/relay"
})