function num(v,f=0){const n=Number(v);return Number.isFinite(n)?n:f}
export class BeatmapParser{
  parse(text){
    const sections={};let section='';
    for(const raw of String(text).replace(/\r/g,'').split('\n')){
      const line=raw.trim();if(!line||line.startsWith('//'))continue;
      const h=line.match(/^\[(.+)]$/);if(h){section=h[1];sections[section]??=[];continue}
      if(section)sections[section].push(line);
    }
    const kv=name=>Object.fromEntries((sections[name]??[]).map(line=>{const i=line.indexOf(':');return i<0?[line,'']:[line.slice(0,i).trim(),line.slice(i+1).trim()]}));
    const d=kv('Difficulty'),g=kv('General'),m=kv('Metadata');
    const timing=(sections.TimingPoints??[]).map(line=>{const p=line.split(',');return {time:num(p[0]),beatLength:num(p[1],500),uninherited:num(p[6],1)===1}}).sort((a,b)=>a.time-b.time);
    const objects=(sections.HitObjects??[]).map((line,index)=>{const p=line.split(','),type=num(p[3]),kind=(type&1)?'circle':(type&2)?'slider':(type&8)?'spinner':'other';return {index,x:num(p[0]),y:num(p[1]),time:num(p[2]),type,kind,repeat:kind==='slider'?Math.max(1,num(p[6],1)):1,length:kind==='slider'?Math.max(0,num(p[7])):0};}).sort((a,b)=>a.time-b.time);
    return {mode:num(g.Mode,0),title:m.Title??'',artist:m.Artist??'',creator:m.Creator??'',version:m.Version??'',hp:num(d.HPDrainRate,5),cs:num(d.CircleSize,5),od:num(d.OverallDifficulty,5),ar:num(d.ApproachRate,d.OverallDifficulty??5),sliderMultiplier:num(d.SliderMultiplier,1.4),tickRate:num(d.SliderTickRate,1),timing,objects};
  }
}
