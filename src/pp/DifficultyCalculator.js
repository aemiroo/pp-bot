const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const pct=(a,p)=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y),i=(s.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return s[l]+(s[h]-s[l])*(i-l)};
export class DifficultyCalculator{
  constructor(analyzer){this.analyzer=analyzer}
  calculate(map){
    const a=this.analyzer.analyze(map),raw=a.sections.map(s=>s.local),p50=pct(raw,.5),p90=pct(raw,.9),p95=pct(raw,.95),p99=pct(raw,.99),peak=a.peak;
    const density=a.drainTime?Math.sqrt(a.objectCount/Math.max(1,a.drainTime)*2):1;
    const strain=(p50*.10+p90*.24+p95*.31+p99*.25+peak*.10)*(.92+.08*clamp(density,.6,1.8));
    const stars=clamp(Math.pow(Math.max(0,strain)/5.25,.52),0,15);
    return {...a,stars,percentiles:{p50,p90,p95,p99,peak}};
  }
}
