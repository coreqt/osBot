import { errorLog } from "./sendLog";

var client = require('../index').client;
module.exports = {
    fetchAction: async (endpoint: string): Promise<object> => {
        try {
            const response = await fetch(`https://nekos.best/api/v2/${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.results[0];
        } catch (err: any) {
            errorLog(err)
            throw new Error('Error fetching data from the API');
        }
    }
}
