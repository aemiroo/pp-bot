export const Mods={NF:1,EZ:2,TD:4,HD:8,HR:16,SD:32,DT:64,RX:128,HT:256,NC:512,FL:1024,AT:2048,SO:4096,AP:8192,PF:16384};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class ModCalculator{
  apply(map,bits=0){
    let clockRate=1,cs=map.cs,ar=map.ar,od=map.od,hp=map.hp;
    if(bits&Mods.EZ){cs*=.5;ar*=.5;od*=.5;hp*=.5}
    if(bits&Mods.HR){cs*=1.3;ar*=1.4;od*=1.4;hp*=1.4}
    if(bits&(Mods.DT|Mods.NC))clockRate=1.5;else if(bits&Mods.HT)clockRate=.75;
    return {...map,cs:clamp(cs,0,10),ar:clamp(ar,0,11),od:clamp(od,0,11),hp:clamp(hp,0,10),clockRate,objects:map.objects.map(o=>({...o,time:o.time/clockRate})),timing:map.timing.map(t=>({...t,time:t.time/clockRate,beatLength:t.beatLength/clockRate}))};
  }
  multiplier(bits=0){
    if(bits&(Mods.AT|Mods.RX|Mods.AP))return 0;
    let m=1;
    if(bits&Mods.NF)m*=.90;if(bits&Mods.EZ)m*=.90;if(bits&Mods.HD)m*=1.04;if(bits&Mods.HR)m*=1.03;
    if(bits&(Mods.DT|Mods.NC))m*=1.02;if(bits&Mods.HT)m*=.92;if(bits&Mods.FL)m*=1.08;if(bits&Mods.SO)m*=.95;
    return Math.max(.5,Math.min(1.25,m));
  }
  names(bits=0){
    const names=[];for(const [name,flag] of Object.entries(Mods))if(bits&flag)names.push(name);return names.length?names:['NM'];
  }
}
