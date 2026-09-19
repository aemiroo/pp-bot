import {REST,Routes} from 'discord.js';import 'dotenv/config';import {data as pp} from '../src/commands/pp.js';
const token=process.env.DISCORD_TOKEN,clientId=process.env.DISCORD_CLIENT_ID,guildId=process.env.DISCORD_GUILD_ID;if(!token||!clientId)throw new Error('DISCORD_TOKEN and DISCORD_CLIENT_ID are required');
const rest=new REST({version:'10'}).setToken(token),body=[pp.toJSON()];
if(guildId){await rest.put(Routes.applicationGuildCommands(clientId,guildId),{body});console.log('Registered guild commands')}else{await rest.put(Routes.applicationCommands(clientId),{body});console.log('Registered global commands')}
