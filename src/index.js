import {Client,Collection,Events,GatewayIntentBits} from 'discord.js';
import {config} from './config.js';
import * as ppCommand from './commands/pp.js';
import {BeatmapService} from './services/BeatmapService.js';
import {PpService} from './services/PpService.js';

const client=new Client({intents:[GatewayIntentBits.Guilds]});
client.commands=new Collection([['pp',ppCommand]]);
const services={beatmaps:new BeatmapService(config.beatmapCache),pp:new PpService()};

client.once(Events.ClientReady,c=>console.log(`Logged in as ${c.user.tag}`));
client.on(Events.InteractionCreate,async interaction=>{
  if(!interaction.isChatInputCommand())return;
  const command=client.commands.get(interaction.commandName);if(!command)return;
  try{await command.execute(interaction,services)}catch(error){console.error(error);const msg={content:`❌ ${error.message||'Unknown error'}`};if(interaction.deferred||interaction.replied)await interaction.editReply(msg).catch(()=>{});else await interaction.reply({...msg,ephemeral:true}).catch(()=>{})}
});
await client.login(config.token);
