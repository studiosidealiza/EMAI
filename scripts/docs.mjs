import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const sha = text => createHash('sha256').update(text).digest('hex');
const roots=['app','components','lib','database','scripts','tests','public'];
const files=['package.json','package-lock.json','next.config.mjs','jsconfig.json','.env.example','.gitignore','README.md'];
async function walk(dir){for(const item of await fs.readdir(dir,{withFileTypes:true})){const path=dir+'/'+item.name;if(item.isDirectory())await walk(path);else files.push(path);}}
for(const dir of roots)await walk(dir);
files.sort();
const hashes={};
for(const file of files)hashes[file]=sha(await fs.readFile(file));
const manualHash=sha(await fs.readFile('docs/MANUAL-DO-ESTUDANTE.md'));
const previous=await fs.readFile('docs/revisao.json','utf8').then(JSON.parse).catch(()=>null);
const changed=files.filter(file=>previous?.files[file]!==hashes[file]);
const removed=Object.keys(previous?.files||{}).filter(file=>!hashes[file]);
if(process.argv.includes('--write')){
 if(previous && (changed.length||removed.length) && previous.manualHash===manualHash)throw new Error('Atualize o manual antes de registrar mudanças no código.');
 const rows=files.map(file=>'| '+file+' | '+file.split('.').at(-1)+' |').join('\n');
 await fs.writeFile('docs/MAPA-DE-ARQUIVOS.md','# Mapa de arquivos\n\nInventário gerado por npm run docs:update. As funções de cada arquivo são explicadas no manual.\n\n| Arquivo | Tipo |\n| --- | --- |\n'+rows+'\n');
 await fs.writeFile('docs/revisao.json',JSON.stringify({manualHash,files:hashes},null,2)+'\n');
 console.log('Manual e inventário registrados para esta versão.');
}else{
 if(!previous||changed.length||removed.length||previous.manualHash!==manualHash)throw new Error('Documentação desatualizada. Revise o manual e execute npm run docs:update. Arquivos: '+[...changed,...removed].join(', '));
 console.log('Documentação corresponde aos arquivos atuais.');
}
