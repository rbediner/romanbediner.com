/**
 * Invariant: Only the reviewed, tested revision can enter production after native owner approval.
 * Why this exists: Release callers must retain identity, concurrency and unknown-write fences.
 * What breaks if it fails: A stale approval or repeated dispatch could publish unintended bytes.
 * Purpose: Exercise reviewed publication and refusals without GitHub writes.
 * Architectural role: Verify the actual promotion caller as well as pure eligibility.
 * Dependencies: Node built-ins and the production release module.
 * Security: All Git, HTTP and receipt writes in caller tests use isolated fake state.
 * Migration: Update fixture schemas with the native GitHub approval contract.
 */
const assert=require('node:assert/strict'),{test}=require('node:test'),fs=require('fs'),path=require('path'),vm=require('vm');
const gate=require('../../scripts/release/publish-reviewed-blog');
const source='2'.repeat(40),base='1'.repeat(40),file='content/blog/example.json';
function fixture(){
 const bytes=Buffer.from(JSON.stringify({slug:'example',status:'ready',image:'/assets/blog/example.png'}));
 const packet={schemaVersion:1,articleId:'example',revision:1,sourceSha:source,baseSha:base,kind:'article',producerRun:'producer-native-run',reviewerRun:'separate-native-reviewer',reviewerVerdict:'PASS',reviewReceipt:{pullRequest:42,summaryCommentId:88},files:[{path:file,sha256:gate.hash(bytes)}]};
 const proof={post:JSON.parse(bytes),bytes:{[file]:bytes},prodSha:base,sourceOnStaging:true,fastForward:true,changes:[{status:'M',path:file}],previewHtml:`noindex site-navigation.js?v=${source.slice(0,12)}`,runs:[{id:1,name:'CI',head_sha:source,head_branch:'staging',status:'completed',conclusion:'success'},{id:2,name:'Deploy Staging',head_sha:source,head_branch:'staging',status:'completed',conclusion:'success'}]};
 return {packet,proof};
}
test('accept a frozen reviewed article and preserve already-published identity',()=>{
 const {packet,proof}=fixture();assert.equal(gate.assertEligible(packet,proof).sourceSha,source);proof.prodSha=source;assert.equal(gate.assertEligible(packet,proof).alreadyPublished,true);
});
for(const [name,change] of [
 ['changed bytes',(p,e)=>e.bytes[file]=Buffer.from('changed')],
 ['changed production base',(p,e)=>e.prodSha='3'.repeat(40)],
 ['unreviewed scope',(p,e)=>e.changes.push({status:'M',path:'styles/site.css'})],
 ['other article',(p,e)=>{p.kind='maintenance';p.files[0].path='content/blog/other.json';e.changes[0].path=p.files[0].path;}],
 ['later CI failure',(p,e)=>e.runs.push({...e.runs[0],id:3,conclusion:'failure'})],
 ['preview drift',(p,e)=>e.previewHtml='noindex site-navigation.js?v=other'],
 ['same producer and reviewer',p=>p.reviewerRun=p.producerRun],
 ['missing review',p=>p.reviewerVerdict='pending'],
 ['path traversal',p=>p.files[0].path='../private'],
 ['non fast-forward',(p,e)=>e.fastForward=false],
 ['source outside staging',(p,e)=>e.sourceOnStaging=false],
 ['deleted source',(p,e)=>e.changes[0].status='D']
])test(`refuse ${name}`,()=>{const {packet,proof}=fixture();change(packet,proof);assert.throws(()=>gate.assertEligible(packet,proof));});
test('only actual owner approval of the protected environment counts',()=>{
 const approved={state:'approved',user:{login:'rbediner'},environments:[{name:'blog-production-review'}]};
 gate.assertOwnerApproval([approved]);assert.throws(()=>gate.assertOwnerApproval([]));assert.throws(()=>gate.assertOwnerApproval([{...approved,user:{login:'bot'}}]));assert.throws(()=>gate.assertOwnerApproval([approved,{...approved,state:'rejected'}]));
});

// Run the real CLI entrypoint with bounded fake transports; no live state is reachable.
async function caller({reject=false,unknownRef=false,alreadyPublished=false,attempt=1,state={intents:new Map()},unknownDispatch=false,moveBeforeDispatch=false,forgedReview=false,failFence=false,phase='publish',staleEvidence=false,advanceBeforeCAS=false,cachedLive=false,redirectedLive=false}={}){
 const {packet,proof}=fixture(),raw=JSON.stringify(packet),writes=[],receipts={};let prod=alreadyPublished?source:base;
 const fakeFs={writeFileSync:(name,body)=>receipts[name]=JSON.parse(body),appendFileSync:()=>{}};
 const fakeGit=(_command,args,options)=>{
  if(args[0]==='fetch'||args[0]==='merge-base')return '';
  if(args[0]==='diff')return `M\t${file}\n`;
  if(args[0]==='show')return options.encoding===null?proof.bytes[file]:proof.bytes[file].toString();
  throw new Error(`Unexpected Git call: ${args[0]}`);
 };
 const fetch=async(url,options={})=>{
  if(url.startsWith('https://romanbediner.com/blog/')){
   const response=new Response(`<link rel="canonical" href="https://romanbediner.com/blog/example/"> site-navigation.js?v=${(cachedLive?base:source).slice(0,12)}`);
   Object.defineProperty(response,'url',{value:redirectedLive?'https://romanbediner.com/blog/':url});return response;
  }
  if(url.startsWith('https://rbediner.github.io/')){if(staleEvidence)throw new Error('preview moved');return new Response(proof.previewHtml);}
  if(url==='https://api.github.com/repos/rbediner/romanbediner.com')return Response.json({node_id:'repository-id'});
  if(url==='https://api.github.com/graphql'){
   const body=JSON.parse(options.body);writes.push({route:'graphql',body});
   if(advanceBeforeCAS)prod='3'.repeat(40);
   if(body.variables.input.refUpdates[0].beforeOid!==prod)return Response.json({errors:[{message:'ref moved'}]});
   prod=source;if(unknownRef)throw new Error('connection closed after write');
   return Response.json({data:{updateRefs:{clientMutationId:null}}});
  }
  const route=url.split('/romanbediner.com/')[1],method=options.method||'GET';
  if(method==='PATCH'){writes.push({route,body:JSON.parse(options.body)});prod=source;if(unknownRef)throw new Error('connection closed after write');return Response.json({object:{sha:source}});}
  if(route==='git/ref/heads/blog-publication-state')return Response.json({object:{sha:source}});
  if(route.startsWith('contents/')){
   const key=route.split('?')[0];
   if(method==='GET')return state.intents.has(key)?Response.json(state.intents.get(key)):new Response(null,{status:404});
   const body=JSON.parse(options.body);
   if(failFence)return new Response(null,{status:500});
   if(!body.sha&&state.intents.has(key))return new Response(null,{status:422});
   state.intents.set(key,{sha:'saved-blob',content:body.content});
   return Response.json({content:{sha:'saved-blob'}});
  }
  if(method==='POST'){writes.push({route,body:JSON.parse(options.body)});if(unknownDispatch)throw new Error('accepted but response lost');return new Response(null,{status:204});}
  if(route==='pulls/42')return Response.json({head:{sha:source}});
  if(route==='pulls/42/reviews?per_page=100')return Response.json([]);
  if(route==='issues/42/comments?per_page=100')return Response.json([nativeSummary(source,{forged:forgedReview})]);
  if(route==='git/ref/heads/prod')return Response.json({object:{sha:moveBeforeDispatch&&state.intents.size?'3'.repeat(40):prod}});
  if(route.startsWith('actions/runs?'))return Response.json({total_count:2,workflow_runs:proof.runs});
  if(route.startsWith('environments/'))return Response.json({can_admins_bypass:false,protection_rules:[{type:'required_reviewers',reviewers:[{reviewer:{login:'rbediner'}}]}]});
  if(route.endsWith('/approvals'))return Response.json([{state:reject?'rejected':'approved',user:{login:'rbediner'},environments:[{name:'blog-production-review'}]}]);
  throw new Error(`Unexpected HTTP read: ${route}`);
 };
 const module={exports:{}};const requireFake=name=>name==='fs'?fakeFs:name==='child_process'?{execFileSync:fakeGit}:require(name);
 const sandbox={module,require:requireFake,Buffer,URL,fetch,console:{log:()=>{},error:()=>{}},process:{argv:['node','gate',phase],env:{GITHUB_REPOSITORY:'rbediner/romanbediner.com',GITHUB_REF:'refs/heads/staging',GITHUB_TOKEN:'test-token',GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:String(attempt),BLOG_REVIEW_PACKET:raw,BLOG_EXPECTED_DIGEST:gate.hash(raw)}}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../scripts/release/publish-reviewed-blog.js'),'utf8'),sandbox);
 try{await module.exports.main();return {writes,receipts};}catch(error){return {writes,receipts,error};}
}
test('actual caller approves exact bytes, fast-forwards and explicitly dispatches both normal gates',async()=>{
 const r=await caller();assert.ifError(r.error);assert.equal(r.writes.length,3);assert.deepEqual(r.writes[0].body.variables.input.refUpdates,[{name:'refs/heads/prod',beforeOid:base,afterOid:source,force:false}]);assert(r.writes.slice(1).every(w=>w.body.ref==='prod'&&w.body.inputs.source_sha===source));assert.equal(r.receipts['promotion-receipt.json'].approvedBy,'rbediner');
});
test('actual caller refuses rejected approval before any write',async()=>{const r=await caller({reject:true});assert(r.error);assert.equal(r.writes.length,0);});
test('actual caller reconciles an ambiguous successful ref write without replaying it',async()=>{const r=await caller({unknownRef:true});assert.ifError(r.error);assert.equal(r.writes.filter(w=>w.route==='graphql').length,1);});
test('actual caller does not repeat a production ref already at the selected source',async()=>{const r=await caller({alreadyPublished:true});assert.ifError(r.error);assert.equal(r.writes.filter(w=>w.route==='graphql').length,0);});
test('native reruns require reconciliation rather than repeating attempted writes',async()=>{const r=await caller({attempt:2});assert(r.error);assert.equal(r.writes.length,0);});

// These regressions retain state between fresh invocations, including an ambiguous accepted POST.
test('fresh invocation cannot repeat an accepted dispatch hidden by eventual consistency',async()=>{
 const state={intents:new Map()};const first=await caller({state,unknownDispatch:true});assert(first.error);assert.equal(first.writes.filter(w=>w.route.includes('/dispatches')).length,1);
 const second=await caller({state,alreadyPublished:true});assert(second.error);assert.equal(second.writes.length,0);
});
test('concurrent intent creation permits only one dispatch for a workflow',async()=>{
 const state={intents:new Map()};const results=await Promise.all([caller({state,alreadyPublished:true,unknownDispatch:true}),caller({state,alreadyPublished:true,unknownDispatch:true})]);
 assert.equal(results.flatMap(r=>r.writes).filter(w=>w.route.endsWith('ci.yml/dispatches')).length,1);
});
test('failed durable fence prevents every workflow dispatch',async()=>{const r=await caller({failFence:true});assert(r.error);assert.equal(r.writes.filter(w=>w.route.includes('/dispatches')).length,0);});
test('production movement refuses dispatch',async()=>{const r=await caller({moveBeforeDispatch:true});assert(r.error);assert.equal(r.writes.filter(w=>w.route.includes('/dispatches')).length,0);});
test('forged native review refuses promotion before writes',async()=>{const r=await caller({forgedReview:true});assert(r.error);assert.equal(r.writes.length,0);});
function nativeSummary(commit=source,{forged=false,app=1144995,status='completed',findings=false,unresolved=false}={}){
 return {id:88,user:{id:forged?123:199175422,type:'Bot'},performed_via_github_app:{id:app},body:'<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 '+JSON.stringify({code_review:{commit_sha:commit,status,has_any_findings:findings,has_unresolved_findings:unresolved}})+' -->'};
}
test('actual native receipt must attest current source with no pending or unresolved findings',()=>{
 const {packet}=fixture(),pr={head:{sha:source}},summary=nativeSummary();
 gate.assertNativeReview(packet,pr,[summary]);
 for(const change of [{forged:true},{app:1},{status:'running'},{findings:true},{unresolved:true},{findings:null}])assert.throws(()=>gate.assertNativeReview(packet,pr,[nativeSummary(source,change)]));
 assert.throws(()=>gate.assertNativeReview(packet,pr,[summary,{...summary,id:89}]));
 assert.throws(()=>gate.assertNativeReview(packet,pr,[summary],[{id:77,user:{id:199175422},commit_id:source,state:'DISMISSED',submitted_at:'2026-10-29T22:00:00Z'}]));
 assert.throws(()=>gate.assertNativeReview(packet,{head:{sha:base}},[summary]));
 gate.assertNativeReview(packet,{head:{sha:base}},[nativeSummary(base)],[],{source:'4'.repeat(40),review:'4'.repeat(40)});
 assert.throws(()=>gate.assertNativeReview(packet,{head:{sha:base}},[nativeSummary(base)],[],{source:'4'.repeat(40),review:'5'.repeat(40)}));
});
test('receiving CI and deployment workflows reject mutable-ref drift and gate every prod deployment',()=>{
 const {execFileSync}=require('child_process');
 for(const name of ['ci.yml','deploy-pages.yml']){
  const text=fs.readFileSync(path.join(__dirname,'../../.github/workflows',name),'utf8');
  assert(text.includes('REQUESTED_SOURCE_SHA: ${{ inputs.source_sha }}'));
  const guard=text.match(/          if \[ -n "\$REQUESTED_SOURCE_SHA" \]; then\n[\s\S]*?          fi/)[0].replace(/^          /gm,'');
  execFileSync('bash',['-c',guard],{env:{...process.env,REQUESTED_SOURCE_SHA:source,GITHUB_SHA:source}});
  assert.throws(()=>execFileSync('bash',['-c',guard],{env:{...process.env,REQUESTED_SOURCE_SHA:source,GITHUB_SHA:base},stdio:'pipe'}));
 }
 const deploy=fs.readFileSync(path.join(__dirname,'../../.github/workflows/deploy-pages.yml'),'utf8');
 assert(deploy.includes("if: ${{ github.ref_name == 'prod' }}"));
 assert(!deploy.includes("github.event_name == 'push' && github.ref_name == 'prod'"));
});

test('read-only reconciliation survives moved preview, production and stale review',async()=>{
 const r=await caller({phase:'reconcile',staleEvidence:true,moveBeforeDispatch:true,forgedReview:true});assert.ifError(r.error);assert.equal(r.writes.length,0);assert.equal(r.receipts['dispatch-reconciliation.json'].sourceSha,source);
});
test('atomic old-ref guard refuses a concurrent ancestor advance',async()=>{
 const r=await caller({advanceBeforeCAS:true});assert(r.error);assert.equal(r.writes.filter(w=>w.route.includes('/dispatches')).length,0);assert.equal(r.writes.filter(w=>w.route==='graphql').length,1);
});

test('canonical manifest ordering is bytewise, independent of locale and fixture producer',()=>{
 const files=[{path:'README.md',sha256:'a'.repeat(64)},{path:'QA/check.js',sha256:'b'.repeat(64)},{path:'.agents/skill.md',sha256:'c'.repeat(64)},{path:'assets/x.svg',sha256:'d'.repeat(64)}];
 const expected='[{"path":".agents/skill.md","sha256":"'+ 'c'.repeat(64)+'"},{"path":"QA/check.js","sha256":"'+ 'b'.repeat(64)+'"},{"path":"README.md","sha256":"'+ 'a'.repeat(64)+'"},{"path":"assets/x.svg","sha256":"'+ 'd'.repeat(64)+'"}]';
 assert.equal(gate.manifestDigest({files}),gate.hash(expected));
});
test('live article verification rejects cached releases, omitted article identity and noindex',()=>{
 const {packet}=fixture(),html=`<link rel="canonical" href="https://romanbediner.com/blog/example/"> site-navigation.js?v=${source.slice(0,12)}`;
 gate.assertLiveArticle(packet,html);
 assert.throws(()=>gate.assertLiveArticle(packet,html.replace(source.slice(0,12),base.slice(0,12))));
 assert.throws(()=>gate.assertLiveArticle(packet,'generic homepage passes HTTP smoke'));
 assert.throws(()=>gate.assertLiveArticle(packet,html.replace('<link rel="canonical"','<a')));
 assert.throws(()=>gate.assertLiveArticle(packet,html+'<meta name="robots" content="noindex">'));
});
test('actual post-deploy caller records the approved live article and refuses an older cached article',async()=>{
 const live=await caller({phase:'verify-live',alreadyPublished:true});assert.ifError(live.error);assert.equal(live.receipts['live-blog-receipt.json'].sourceSha,source);assert.equal(live.writes.length,0);
 const stale=await caller({phase:'verify-live',alreadyPublished:true,cachedLive:true});assert(stale.error);assert(!stale.receipts['live-blog-receipt.json']);
 const redirected=await caller({phase:'verify-live',alreadyPublished:true,redirectedLive:true});assert(redirected.error);assert(!redirected.receipts['live-blog-receipt.json']);
});

test('the actual first native-review manifest retains its independent frozen digest',()=>{
 const frozen=JSON.parse(fs.readFileSync(path.join(__dirname,'reviewed-blog-manifest.json'),'utf8'));
 assert.equal(frozen.sourceSha,'b49764ea6171337efbfabf121adcaf429cc5b7e6');
 assert.equal(gate.manifestDigest(frozen),'345139328209826ce05c4deb3db688549f090290cec4cbb235c8c3f1840368ea');
});
test('both native publication token scopes can read the actual PR and issue receipt',()=>{
 const workflow=fs.readFileSync(path.join(__dirname,'../../.github/workflows/publish-reviewed-blog.yml'),'utf8');
 for(const scope of ['pull-requests: read','issues: read'])assert.equal(workflow.split(scope).length-1,2,`${scope} must survive the publish job override`);
});
