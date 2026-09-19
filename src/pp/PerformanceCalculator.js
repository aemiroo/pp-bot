const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class PerformanceCalculator{
  basePotential(stars){return 2250*(1-Math.exp(-.00365*Math.pow(Math.max(0,stars),2.65)))}
  calculate(score,difficulty,modMultiplier=1){
    if(score.passed===false||modMultiplier<=0)return {pp:0,basePotential:0,accuracyFactor:0,comboFactor:0,mistakeFactor:0,lengthFactor:1};
    const acc=clamp(Number(score.accuracy??0)/100,0,1),base=this.basePotential(difficulty.stars);
    const spikeBonus=1+.24*Math.exp(-.055*Math.pow(difficulty.stars-8,2))*clamp((difficulty.spikeFactor-1)/.35,0,1);
    const accuracyFactor=Math.pow(acc,5.2);
    const expected=Math.max(1,difficulty.objectCount),combo=clamp(Number(score.maxCombo??0)/expected,0,1),comboFactor=.55+.45*Math.pow(combo,.8);
    const n=Math.max(1,difficulty.objectCount),t=Math.max(1,difficulty.drainTime),hard=Math.max(1,difficulty.hardObjectCount);
    const lengthFactor=Math.max(.65,.55*Math.sqrt(n/500)+.30*Math.sqrt(t/120)+.15*Math.sqrt(hard/100));
    const misses=Math.max(0,Number(score.nmiss??0)),sliderBreaks=Math.max(0,Number(score.sliderBreaks??0));
    const mistakeWeight=(misses+sliderBreaks*.60)/lengthFactor,mistakeFactor=Math.exp(-(.085*mistakeWeight+.0075*Math.pow(mistakeWeight,1.6)));
    const pp=base*spikeBonus*accuracyFactor*comboFactor*mistakeFactor*modMultiplier;
    return {pp:Math.max(0,pp),basePotential:base*spikeBonus,accuracyFactor,comboFactor,mistakeFactor,lengthFactor};
  }
}
