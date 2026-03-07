import 'dotenv/config';
const prefix = process.env.PREFIX || "o!";


module.exports = {
    once:true,
    execute(client: _Client){

        const activityName = process.env.ACTIVITY_NAME || `Type ${prefix}help`;
        const activityStatus: any = process.env.ACTIVITY_STATUS || 'dnd';

        if(!activityName || !activityStatus){
            console.error("Make sure you have filled ACTIVITY_NAME and ACTIVITY_STATUS in your .env file");
            process.exit(1);
        }

        client.handlePrefixCommands();
        client.handleSlashCommands();

        if(!client.user){
            console.error("client.user is null!")
            process.exit(1);
        }
        client.user.setPresence({activities:[{name: activityName}], status: activityStatus});
        console.log(`Logged In as ${client.user.tag}`);
    }
};