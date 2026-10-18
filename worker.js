// Cloudflare Worker + Durable Object. Deploy with wrangler.toml.
export class GameRoom {
 constructor(state,env){this.storage=state.storage;this.env=env;}
 async fetch(request){
  const u=new URL(request.url);const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store'};
  if(request.method==='OPTIONS')return new Response('',{headers});
  let data=await this.storage.get('game')||{events:[],phase:'play',revealStep:0,round:1,names:{A:'',B:''},revision:0};
  if(request.method==='GET')return Response.json(data,{headers});
  if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers});
  let body;try{body=await request.json()}catch{return Response.json({error:'Invalid JSON'},{status:400,headers})}
  const {action,team,type,name,pin}=body||{};
  if(['admin','reset','phase','step','round'].includes(action) && (!this.env.ADMIN_PIN||String(pin)!==this.env.ADMIN_PIN))return Response.json({error:'Admin PIN incorrect'},{status:403,headers});
  if(action==='name'&&['A','B'].includes(team)&&typeof name==='string'&&name.trim()&&name.length<=28&&data.phase==='play'){data.names[team]=name.trim()}
  else if(action==='point'&&['A','B'].includes(team)&&['+','-'].includes(type)&&data.phase==='play'&&data.names[team]){data.events.push({id:crypto.randomUUID(),team,type,time:Date.now()})}
  else if(action==='undo'&&['A','B'].includes(team)&&data.phase==='play'){let i=data.events.findLastIndex(e=>e.team===team);if(i>=0)data.events.splice(i,1)}
  else if(action==='reset'){data={events:[],phase:'play',revealStep:0,round:1,names:{A:'',B:''},revision:data.revision}}
  else if(action==='phase'&&['play','results','reveal'].includes(body.value)){data.phase=body.value;if(body.value==='reveal')data.revealStep=0}
  else if(action==='step'){data.phase='reveal';data.revealStep=Math.max(0,Math.min(data.events.length,data.revealStep+Math.sign(Number(body.delta)||0)))}
  else if(action==='round'){data.round=Math.max(1,Math.min(100,(data.round||1)+Math.sign(Number(body.delta)||0)))}
  else return Response.json({error:'Invalid or disallowed action'},{status:400,headers});
  data.revision++;await this.storage.put('game',data);return Response.json(data,{headers});
 }
}
export default {async fetch(request,env){let url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return new Response('Not found',{status:404});let room=url.searchParams.get('room')||'demo';if(!/^[a-zA-Z0-9_-]{1,40}$/.test(room))return new Response('Invalid room',{status:400});let id=env.GAMES.idFromName(room);return env.GAMES.get(id).fetch(request)}};
