import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';

export class BeatmapService{
  constructor(cacheDir){this.cacheDir=cacheDir}
  async ensure(){await fs.mkdir(this.cacheDir,{recursive:true})}
  async fromAttachment(buffer,name='map.osu'){
    await this.ensure();const md5=crypto.createHash('md5').update(buffer).digest('hex'),file=path.join(this.cacheDir,`${md5}.osu`);await fs.writeFile(file,buffer);return {md5,file,name};
  }
  async getByMd5(md5){
    await this.ensure();const file=path.join(this.cacheDir,`${String(md5).toLowerCase()}.osu`);
    try{return {file,buffer:await fs.readFile(file)}}catch{return null}
  }
}
