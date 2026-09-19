import {SlashCommandBuilder,AttachmentBuilder,EmbedBuilder} from 'discord.js';
import {parseReplay} from '../replay/OsrParser.js';

export const data=new SlashCommandBuilder().setName('pp').setDescription('Analyze osu! files with custom-pp-v1')
  .addSubcommand(s=>s.setName('replay').setDescription('Analyze an .osr replay').addAttachmentOption(o=>o.setName('replay').setDescription('osu! replay (.osr)').setRequired(true)).addAttachmentOption(o=>o.setName('beatmap').setDescription('Optional .osu beatmap if not cached')))
  .addSubcommand(s=>s.setName('beatmap').setDescription('Analyze an .osu beatmap').addAttachmentOption(o=>o.setName('beatmap').setDescription('osu! beatmap (.osu)').setRequired(true)));

async function download(att){const res=await fetch(att.url);if(!res.ok)throw new Error(`Download failed: ${res.status}`);return Buffer.from(await res.arrayBuffer())}
const n=v=>Number(v??0).toFixed(2);
function embed(result,title){
  const d=result.difficulty,p=result.performance,c=d.components,pc=d.percentiles;
  return new EmbedBuilder().setTitle(title).setDescription(`**${result.map.artist} - ${result.map.title} [${result.map.version}]**\n`${result.mods.join('')}` • **${n(d.stars)}★**`)
    .addFields(
      {name:'Difficulty',value:`Aim **${n(c.aim)}**\nSpeed **${n(c.speed)}**\nPrecision **${n(c.precision)}**\nRhythm **${n(c.rhythm)}**\nControl **${n(c.control)}**\nReading **${n(c.reading)}**\nStamina **${n(c.stamina)}**`,inline:true},
      {name:'Strain',value:`P50 **${n(pc.p50)}**\nP90 **${n(pc.p90)}**\nP95 **${n(pc.p95)}**\nP99 **${n(pc.p99)}**\nPeak **${n(pc.peak)}**\nSpike **${n(d.spikeFactor)}x**`,inline:true},
      {name:'Performance',value:`PP **${n(p.pp)}**\nPotential **${n(p.basePotential)}**\nMod x **${n(result.modMultiplier)}**\nAcc x **${n(p.accuracyFactor)}**\nCombo x **${n(p.comboFactor)}**\nMistake x **${n(p.mistakeFactor)}**`,inline:false},
    ).setFooter({text:'custom-pp-v1'});
}
export async function execute(interaction,{beatmaps,pp}){
  await interaction.deferReply();
  const sub=interaction.options.getSubcommand();
  if(sub==='beatmap'){
    const a=interaction.options.getAttachment('beatmap');if(!a.name?.toLowerCase().endsWith('.osu'))throw new Error('Upload a .osu beatmap.');
    const saved=await beatmaps.fromAttachment(await download(a),a.name),result=await pp.analyzeFile(saved.file,{accuracy:100,maxCombo:999999,nmiss:0,mods:0,passed:true});
    return interaction.editReply({embeds:[embed(result,'Beatmap Analysis')]});
  }
  const a=interaction.options.getAttachment('replay');if(!a.name?.toLowerCase().endsWith('.osr'))throw new Error('Upload a .osr replay.');
  const replay=await parseReplay(await download(a));
  const provided=interaction.options.getAttachment('beatmap');if(provided){if(!provided.name?.toLowerCase().endsWith('.osu'))throw new Error('The beatmap attachment must be .osu.');await beatmaps.fromAttachment(await download(provided),provided.name)}
  const found=await beatmaps.getByMd5(replay.beatmapMd5);if(!found)throw new Error(`Beatmap ${replay.beatmapMd5} is not cached. Re-run the command and attach the matching .osu file in the beatmap option.`);
  const result=await pp.analyzeFile(found.file,{...replay,sliderBreaks:0,passed:true});
  const e=embed(result,`Replay Analysis • ${replay.playerName}`).addFields({name:'Replay',value:`Accuracy **${n(replay.accuracy)}%**\nCombo **${replay.maxCombo}x**\nMisses **${replay.nmiss}**\nScore **${replay.score.toLocaleString()}**`,inline:false});
  return interaction.editReply({embeds:[e]});
}
