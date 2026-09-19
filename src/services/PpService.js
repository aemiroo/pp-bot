import fs from 'node:fs/promises';import {BeatmapParser} from '../pp/BeatmapParser.js';import {ModCalculator} from '../pp/ModCalculator.js';import {PatternAnalyzer} from '../pp/patterns/PatternAnalyzer.js';import {DifficultyCalculator} from '../pp/DifficultyCalculator.js';import {PerformanceCalculator} from '../pp/PerformanceCalculator.js';

export class PpService{
  constructor(){this.parser=new BeatmapParser();this.mods=new ModCalculator();this.difficulty=new DifficultyCalculator(new PatternAnalyzer());this.performance=new PerformanceCalculator()}
  async analyzeFile(file,score={}){
    const map=this.parser.parse(await fs.readFile(file,'utf8'));if(map.mode!==0)throw new Error('Only osu!standard is supported by custom-pp-v1 right now.');
    const transformed=this.mods.apply(map,Number(score.mods??0)),difficulty=this.difficulty.calculate(transformed),modMultiplier=this.mods.multiplier(Number(score.mods??0));
    const performance=this.performance.calculate({...score,passed:score.passed!==false},difficulty,modMultiplier);
    return {version:'custom-pp-v1',map,transformed,difficulty,modMultiplier,performance,mods:this.mods.names(Number(score.mods??0))};
  }
}
