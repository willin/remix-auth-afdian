const json=require('./package.json');
const cp=require('child_process');

Object.keys(json.dependencies).forEach(key=>{
  cp.execSync(`pnpm i ${key}`)
})

Object.keys(json.devDependencies).forEach(key=>{
  cp.execSync(`pnpm i -D ${key}`)
})

Object.keys(json.peerDependencies).forEach(key=>{
  cp.execSync(`pnpm i -P ${key}`)
})