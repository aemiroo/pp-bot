import lzma from 'lzma-native';

class Reader{
  constructor(buf){this.buf=buf;this.o=0}
  u8(){return this.buf.readUInt8(this.o++)}
  u16(){const v=this.buf.readUInt16LE(this.o);this.o+=2;return v}
  u32(){const v=this.buf.readUInt32LE(this.o);this.o+=4;return v}
  i64(){const v=this.buf.readBigInt64LE(this.o);this.o+=8;return v}
  bytes(n){const v=this.buf.subarray(this.o,this.o+n);this.o+=n;return v}
  uleb(){let r=0,s=0;while(true){const b=this.u8();r|=(b&0x7f)<<s;if(!(b&0x80))return r;s+=7}}
  str(){const flag=this.u8();if(flag===0)return '';if(flag!==0x0b)throw new Error('Invalid osu string');const len=this.uleb();return this.bytes(len).toString('utf8')}
}
export async function parseReplay(buffer){
  const r=new Reader(buffer);
  const mode=r.u8(),version=r.u32(),beatmapMd5=r.str(),playerName=r.str(),replayMd5=r.str();
  const n300=r.u16(),n100=r.u16(),n50=r.u16(),ngeki=r.u16(),nkatu=r.u16(),nmiss=r.u16(),score=r.u32(),maxCombo=r.u16(),perfect=!!r.u8(),mods=r.u32();
  const lifeBarGraph=r.str();r.i64();const compressedLength=r.u32();const compressed=r.bytes(compressedLength);
  const frames=compressed.length?await new Promise((resolve,reject)=>lzma.decompress(compressed,(out,err)=>err?reject(err):resolve(Buffer.isBuffer(out)?out.toString('utf8'):String(out)))):'';
  const total=n300+n100+n50+nmiss;const accuracy=total?((n300*300+n100*100+n50*50)/(total*300))*100:0;
  return {mode,version,beatmapMd5,playerName,replayMd5,n300,n100,n50,ngeki,nkatu,nmiss,score,maxCombo,perfect,mods,lifeBarGraph,frames,accuracy};
}
