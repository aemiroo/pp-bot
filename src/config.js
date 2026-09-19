import 'dotenv/config';

export const config = {
  token: process.env.DISCORD_TOKEN ?? '',
  clientId: process.env.DISCORD_CLIENT_ID ?? '',
  guildId: process.env.DISCORD_GUILD_ID ?? '',
  beatmapCache: process.env.BEATMAP_CACHE ?? './data/beatmaps',
};

if (!config.token) throw new Error('DISCORD_TOKEN is required');
