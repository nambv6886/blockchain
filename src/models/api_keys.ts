import { sql } from "./mysql";

export const ApiKey = {
    get: async (pubKey: string) => {
        let query = `select * from api_keys where public_key = '${pubKey}'`;
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },
}