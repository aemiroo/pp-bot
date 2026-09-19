const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const hypot=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const percentile=(a,p)=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return s[l]+(s[h]-s[l])*(i-l)};
export class PatternAnalyzer{
  analyze(map){
    const o=map.objects;if(o.length<2)return {sections:[],components:{aim:0,speed:0,precision:0,rhythm:0,control:0,reading:0,stamina:0},peak:0,p95:0,sustained:0,spikeFactor:1,objectCount:o.length,hardObjectCount:0,drainTime:0};
    const radius=54.4-4.48*map.cs,diameter=Math.max(18,radius*2),events=[];
    for(let i=1;i<o.length;i++){
      const a=o[i-1],b=o[i],dt=Math.max(25,b.time-a.time),dist=hypot(a,b),spacing=dist/diameter,speed=1000/dt;
      let angle=0;if(i>1){const q=o[i-2],u={x:a.x-q.x,y:a.y-q.y},v={x:b.x-a.x,y:b.y-a.y},den=Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y);if(den)angle=Math.acos(clamp((u.x*v.x+u.y*v.y)/den,-1,1))}
      const tight=Math.max(0,1-spacing),wide=Math.max(0,spacing-.55),precision=(.35+map.cs/10)*speed*(.45+tight*1.8),aim=speed*wide*(.8+angle/Math.PI*.7),speedSkill=speed*(.65+Math.min(1.6,spacing)),control=speed*(tight*1.4+angle/Math.PI*.65);
      const prevDt=i>1?Math.max(25,a.time-o[i-2].time):dt,rhythm=Math.abs(Math.log2(dt/prevDt))*speed*.8,reading=(map.ar/10)*speed*(.35+Math.min(1.5,spacing))+(map.cs/10)*speed*.25;
      events.push({time:b.time,aim,speed:speedSkill,precision,rhythm,control,reading});
    }
    const start=o[0].time,end=o.at(-1).time,sections=[];for(let t=start;t<=end;t+=400){const e=events.filter(x=>x.time>=t-100&&x.time<t+500);if(!e.length)continue;const avg=k=>e.reduce((s,x)=>s+x[k],0)/e.length;const c={aim:avg('aim'),speed:avg('speed'),precision:avg('precision'),rhythm:avg('rhythm'),control:avg('control'),reading:avg('reading')};const interaction=.22*Math.sqrt(c.speed*c.precision);const local=c.aim*.23+c.speed*.25+c.precision*.17+c.rhythm*.09+c.control*.14+c.reading*.12+interaction;sections.push({time:t,local,...c})}
    const vals=sections.map(s=>s.local),p95=percentile(vals,.95),peak=Math.max(...vals,0),sustained=percentile(vals,.70),hardThreshold=p95*.72;
    const components={};for(const k of ['aim','speed','precision','rhythm','control','reading'])components[k]=percentile(sections.map(s=>s[k]),.9);
    components.stamina=sustained*Math.min(1.35,.65+Math.sqrt(o.length/500)*.35);
    return {sections,components,peak,p95,sustained,spikeFactor:p95?clamp(peak/p95,1,1.5):1,objectCount:o.length,hardObjectCount:events.filter(e=>{const s=sections.reduce((best,x)=>Math.abs(x.time-e.time)<Math.abs(best.time-e.time)?x:best,sections[0]);return s?.local>=hardThreshold}).length,drainTime:Math.max(0,(end-start)/1000)};
  }
}
