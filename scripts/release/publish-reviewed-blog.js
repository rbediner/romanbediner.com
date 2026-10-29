#!/usr/bin/env node
/**
 * Purpose: Publish one frozen blog revision after native owner approval.
 * Architectural role: Read-only preparation and a protected exact-source promotion.
 * Dependencies: Node 20, Git, and the existing GitHub Actions token.
 * Security/CSP considerations: No candidate code executes; hashes, scope, CI and owner are checked.
 * Migration considerations: Keep fixed repository, environment and release workflow names aligned.
 */
const fs=require('fs'),crypto=require('crypto'),{execFileSync}=require('child_process');
const REPO='rbediner/romanbediner.com',ENVIRONMENT='blog-production-review',OWNER='rbediner';
const PREVIEW='https://rbediner.github.io/romanbediner-preview';
// Observed native GitHub App account, not a caller-supplied reviewer identity.
const REVIEWER_ID=199175422,STATE_BRANCH='blog-publication-state';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const requireThat=(ok,message)=>{if(!ok)throw new Error(message);};

// These checks run before constructing paths or making any mutation.
function validatePacket(p){
 requireThat(p&&p.schemaVersion===1,'Unsupported review packet');
 requireThat(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.articleId),'Invalid article ID');
 requireThat(Number.isSafeInteger(p.revision)&&p.revision>0,'Invalid revision');
 for(const field of ['sourceSha','baseSha'])requireThat(/^[a-f0-9]{40}$/.test(p[field]),`Invalid ${field}`);
 requireThat(['article','maintenance'].includes(p.kind),'Invalid release kind');
 requireThat(p.reviewerVerdict==='PASS'&&typeof p.producerRun==='string'&&typeof p.reviewerRun==='string'&&p.producerRun.trim()&&p.reviewerRun.trim()&&p.producerRun!==p.reviewerRun,'Independent review required');
 requireThat(Number.isSafeInteger(p.reviewReceipt?.pullRequest)&&p.reviewReceipt.pullRequest>0&&Number.isSafeInteger(p.reviewReceipt.reviewId)&&p.reviewReceipt.reviewId>0,'Authenticated native review receipt required');
 requireThat(Array.isArray(p.files)&&p.files.length>0&&p.files.length<=80,'Missing or oversized reviewed file set');
 const names=new Set();
 for(const row of p.files){
  requireThat(row&&typeof row.path==='string'&&/^[a-zA-Z0-9_.\/-]+$/.test(row.path)&&!row.path.startsWith('/')&&!row.path.split('/').includes('..')&&!names.has(row.path),'Invalid or duplicate reviewed path');
  requireThat(/^[a-f0-9]{64}$/.test(row.sha256),'Invalid reviewed hash');names.add(row.path);
 }
 return p;
}

// The actual provider review must attest the frozen candidate and its complete file manifest.
function manifestDigest(p){return hash(JSON.stringify([...p.files].sort((a,b)=>a.path.localeCompare(b.path))));}
function assertNativeReview(p,pr,reviews,trees={}){
 const native=reviews.filter(r=>r.user?.id===REVIEWER_ID&&r.user?.type==='Bot').sort((a,b)=>b.id-a.id);
 const review=native.find(r=>r.id===p.reviewReceipt.reviewId);
 requireThat(review&&pr.head?.sha===review.commit_id&&['COMMENTED','APPROVED'].includes(review.state)&&review.submitted_at,'Missing, dismissed or stale native review');
 // A native PR merge can change commit identity while retaining the complete reviewed tree.
 requireThat(review.commit_id===p.sourceSha||(/^[a-f0-9]{40}$/.test(trees.source)&&trees.source===trees.review),'Native review does not cover this complete source tree');
 const marker=`BLOG_REVIEW_PASS ${review.commit_id} ${manifestDigest(p)}`;
 requireThat(review.body?.includes(marker)&&native[0]?.id===review.id,'Native review is negative or superseded');
}

// Scope comes from the actual source metadata, never from an input allowlist.
function allowedFiles(p,post){
 const allowed=new Set([`content/blog/${p.articleId}.json`,`content/blog/${p.articleId}.html.txt`,`blog/${p.articleId}/index.html`,'blog/index.html','blog/feed.xml','sitemap.xml','content/blog/generated-files.json.txt']);
 for(const asset of [post.image,post.cover,...Object.keys(post.diagrams||{}).map(n=>`/assets/blog/${n}.svg`)].filter(Boolean)){
  requireThat(/^\/assets\/blog\/[a-z0-9-]+\.(?:svg|png|webp|jpg)$/.test(asset),'Invalid article asset');allowed.add(asset.slice(1));
 }
 return allowed;
}

// Pure eligibility is replayed again after the owner clicks Approve.
function assertEligible(p,proof){
 validatePacket(p);requireThat(proof.post.slug===p.articleId&&['ready','published'].includes(proof.post.status),'Article is not a staging candidate');
 requireThat(proof.sourceOnStaging&&proof.fastForward,'Source must descend from the reviewed production base and staging');
 requireThat(proof.prodSha===p.baseSha||proof.prodSha===p.sourceSha,'Production base changed; prepare a new review');
 const changes=proof.changes;requireThat(changes.length>0&&!changes.some(r=>r.status!=='A'&&r.status!=='M'),'Empty, deleted or renamed release');
 const allowed=allowedFiles(p,proof.post),names=changes.map(r=>r.path).sort();
 requireThat(JSON.stringify(names)===JSON.stringify(p.files.map(r=>r.path).sort()),'Reviewed file set differs from the release');
 for(const row of p.files){
  // Maintenance is explicit in the owner-facing summary and cannot carry another article.
  const anotherArticle=(row.path.startsWith('content/blog/')||row.path.startsWith('blog/'))&&!allowed.has(row.path);
  requireThat(!anotherArticle&&(p.kind==='maintenance'||allowed.has(row.path)),`Unreviewed release scope: ${row.path}`);
  requireThat(hash(proof.bytes[row.path])===row.sha256,`Changed reviewed bytes: ${row.path}`);
 }
 for(const name of ['CI','Deploy Staging']){
  const latest=proof.runs.filter(r=>r.name===name&&r.head_sha===p.sourceSha&&r.head_branch==='staging').sort((a,b)=>b.id-a.id)[0];
  requireThat(latest&&latest.status==='completed'&&latest.conclusion==='success',`Exact-source ${name} is not green`);
 }
 requireThat(proof.previewHtml.includes(`site-navigation.js?v=${p.sourceSha.slice(0,12)}`)&&proof.previewHtml.includes('noindex'),'Preview changed or is not protected from indexing');
 return {sourceSha:p.sourceSha,articleId:p.articleId,revision:p.revision,alreadyPublished:proof.prodSha===p.sourceSha};
}

function assertOwnerApproval(history){
 const relevant=history.filter(r=>r.environments?.some(e=>e.name===ENVIRONMENT));
 requireThat(relevant.some(r=>r.state==='approved'&&r.user?.login===OWNER)&&!relevant.some(r=>r.state==='rejected'),'Native owner approval is missing or rejected');
}
function git(args,raw=false){return execFileSync('git',args,{encoding:raw?null:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:8*1024*1024});}
function ancestor(base,head){try{git(['merge-base','--is-ancestor',base,head]);return true;}catch{return false;}}
async function api(route,method='GET',body){
 const token=process.env.GITHUB_TOKEN;requireThat(token,'GitHub token unavailable');
 const response=await fetch(`https://api.github.com/repos/${REPO}${route?'/'+route:''}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok){const error=new Error(`GitHub ${method} ${route.split('?')[0]} returned ${response.status}`);error.status=response.status;throw error;}
 return response.status===204?null:response.json();
}

async function promoteRef(p){
 // Native atomic compare-and-swap enforces both the approved old ref and fast-forward ancestry.
 const repository=await api('');requireThat(typeof repository.node_id==='string','Repository identity unavailable');
 const query='mutation($input:UpdateRefsInput!){updateRefs(input:$input){clientMutationId}}';
 const variables={input:{repositoryId:repository.node_id,refUpdates:[{name:'refs/heads/prod',beforeOid:p.baseSha,afterOid:p.sourceSha,force:false}]}};
 const response=await fetch('https://api.github.com/graphql',{method:'POST',headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify({query,variables})});
 requireThat(response.ok,'Production compare-and-swap transport failed');
 const result=await response.json();requireThat(!result.errors?.length&&result.data?.updateRefs,'Production compare-and-swap refused');
}
async function inspect(p){
 git(['fetch','--no-tags','origin','staging','prod']);git(['fetch','--no-tags','origin',p.sourceSha]);
 const prod=await api('git/ref/heads/prod');
 const changes=git(['diff','--name-status','--no-renames',`${p.baseSha}..${p.sourceSha}`]).trim().split('\n').filter(Boolean).map(line=>{const [status,path]=line.split('\t');return{status,path};});
 const bytes=Object.fromEntries(p.files.map(row=>[row.path,git(['show',`${p.sourceSha}:${row.path}`],true)]));
 const post=JSON.parse(git(['show',`${p.sourceSha}:content/blog/${p.articleId}.json`]));
 const runs=await api(`actions/runs?head_sha=${p.sourceSha}&per_page=50`);requireThat(runs.total_count<=50,'Ambiguous run inventory');
 const pr=await api(`pulls/${p.reviewReceipt.pullRequest}`),reviews=await api(`pulls/${p.reviewReceipt.pullRequest}/reviews?per_page=100`);
 requireThat(reviews.length<100,'Review inventory requires reconciliation');
 const selected=reviews.find(r=>r.id===p.reviewReceipt.reviewId),trees={};
 if(selected&&selected.commit_id!==p.sourceSha){
  trees.source=(await api(`git/commits/${p.sourceSha}`)).tree.sha;
  trees.review=(await api(`git/commits/${selected.commit_id}`)).tree.sha;
 }
 assertNativeReview(p,pr,reviews,trees);
 const response=await fetch(`${PREVIEW}/blog/${p.articleId}/?release=${p.sourceSha.slice(0,12)}`);requireThat(response.ok,'Staging article unavailable');
 return {nativeReview:{reviewId:selected.id,reviewCommit:selected.commit_id,sourceCommit:p.sourceSha,...trees},prodSha:prod.object.sha,changes,bytes,post,runs:runs.workflow_runs,previewHtml:await response.text(),sourceOnStaging:ancestor(p.sourceSha,'origin/staging'),fastForward:ancestor(p.baseSha,p.sourceSha)};
}

async function optionalRead(route){try{return await api(route);}catch(error){if(error.status===404)return null;throw error;}}
function matchingRuns(runs,p,name){return runs.filter(r=>r.name===name&&r.head_sha===p.sourceSha&&r.head_branch==='prod'&&['push','workflow_dispatch'].includes(r.event));}

// A create-only GitHub record fences dispatch across processes, reruns and delayed run visibility.
async function dispatchGate(p,file,name,receipt,saveReceipt){
 const listed=await api(`actions/runs?head_sha=${p.sourceSha}&per_page=50`);
 requireThat(listed.total_count<=50,'Ambiguous production run inventory');
 const existing=matchingRuns(listed.workflow_runs,p,name).sort((a,b)=>b.id-a.id)[0];
 if(existing){receipt.dispatches[file]={state:'existing',runId:existing.id};saveReceipt();return;}
 const route=`contents/publication/${p.sourceSha}/${file}.json`;
 const old=await optionalRead(`${route}?ref=${STATE_BRANCH}`);
 requireThat(!old,'Prior dispatch intent exists; reconcile its native run without repeating the write');
 if(!await optionalRead(`git/ref/heads/${STATE_BRANCH}`)){
  const trusted=await api('git/ref/heads/staging');
  try{await api('git/refs','POST',{ref:`refs/heads/${STATE_BRANCH}`,sha:trusted.object.sha});}
  catch(error){if(!await optionalRead(`git/ref/heads/${STATE_BRANCH}`))throw error;}
 }
 const intent={schemaVersion:1,sourceSha:p.sourceSha,workflow:file,branch:'prod',approvalRunId:process.env.GITHUB_RUN_ID,state:'attempted',createdAt:new Date().toISOString()};
 const encoded=()=>Buffer.from(JSON.stringify(intent,null,2)+'\n').toString('base64');
 // No sha is supplied: an existing path causes a native conflict, before any dispatch.
 const saved=await api(route,'PUT',{branch:STATE_BRANCH,message:`Fence ${file} for ${p.sourceSha.slice(0,12)}`,content:encoded()});
 requireThat(saved.content?.sha,'Dispatch fence was not saved');
 receipt.dispatches[file]={state:'attempted',intentPath:route};saveReceipt();
 requireThat((await api('git/ref/heads/prod')).object.sha===p.sourceSha,'Production moved before dispatch');
 try{
  await api(`actions/workflows/${file}/dispatches`,'POST',{ref:'prod',inputs:{source_sha:p.sourceSha}});
  intent.state='accepted';receipt.dispatches[file].state='accepted';saveReceipt();
 }catch(error){receipt.dispatches[file].state='unknown';saveReceipt();throw error;}
 // A failed update leaves the stronger attempted fence intact; it never authorizes a retry.
 await api(route,'PUT',{branch:STATE_BRANCH,sha:saved.content.sha,message:`Record accepted ${file} dispatch`,content:encoded()});
}

// The only write path is called inside the protected GitHub environment job.
async function main(){
 const raw=process.env.BLOG_REVIEW_PACKET||'';requireThat(raw.length<=24000,'Review packet too large');
 const p=validatePacket(JSON.parse(raw)),digest=hash(raw),phase=process.argv[2]||'prepare';
 requireThat(process.env.GITHUB_REPOSITORY===REPO&&process.env.GITHUB_REF==='refs/heads/staging','Run the trusted staging workflow');
 if(p.kind==='maintenance')requireThat(process.env.GITHUB_ACTOR===OWNER,'Maintenance needs direct owner dispatch');
 if(phase==='reconcile'){
  // Recovery reads original custody even after preview, production or review has advanced.
  const runs=await api(`actions/runs?head_sha=${p.sourceSha}&per_page=50`);
  requireThat(runs.total_count<=50,'Ambiguous reconciliation inventory');
  const intents={};for(const file of ['ci.yml','deploy-pages.yml']){
   const saved=await optionalRead(`contents/publication/${p.sourceSha}/${file}.json?ref=${STATE_BRANCH}`);
   intents[file]=saved?JSON.parse(Buffer.from(saved.content,'base64').toString()):null;
  }
  fs.writeFileSync('dispatch-reconciliation.json',JSON.stringify({sourceSha:p.sourceSha,intents,runs:runs.workflow_runs.map(r=>({id:r.id,name:r.name,head_sha:r.head_sha,head_branch:r.head_branch,event:r.event,status:r.status,conclusion:r.conclusion}))},null,2)+'\n');
  return;
 }
 const proof=await inspect(p),result={...assertEligible(p,proof),nativeReview:proof.nativeReview};
 if(phase==='prepare'){
  fs.writeFileSync('review-packet.json',JSON.stringify(p,null,2)+'\n');
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`packet_digest=${digest}\npreview_url=${PREVIEW}/blog/${p.articleId}/\n`);
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`## ${p.kind==='maintenance'?'Maintenance + article':'Blog'} publication review\n\nArticle: **${p.articleId}**, revision **${p.revision}**.\n\nSource: \`${p.sourceSha}\`. Packet: \`${digest}\`.\n\n[Preview](${PREVIEW}/blog/${p.articleId}/) · [Exact diff](https://github.com/${REPO}/compare/${p.baseSha}...${p.sourceSha})\n\nIndependent review: PASS.\n\n${p.files.map(r=>`- ${r.path}`).join('\n')}\n\nApprove only this revision. Requesting edits cancels this run and requires a new review.\n`);
 }else if(phase==='publish'){
  requireThat(process.env.BLOG_EXPECTED_DIGEST===digest,'Review packet changed after preparation');
  const environment=await api(`environments/${ENVIRONMENT}`),rule=environment.protection_rules?.find(r=>r.type==='required_reviewers');
  requireThat(environment.can_admins_bypass===false&&rule?.reviewers?.length===1&&rule.reviewers[0].reviewer?.login===OWNER,'Owner-only environment protection is not configured');
  requireThat(/^\d+$/.test(process.env.GITHUB_RUN_ID||''),'Native run identity missing');
  assertOwnerApproval(await api(`actions/runs/${process.env.GITHUB_RUN_ID}/approvals`));
  requireThat(Number(process.env.GITHUB_RUN_ATTEMPT||1)===1,'Reconcile the prior receipt before creating a fresh approval run');
  const receipt={...result,packetDigest:digest,approvedBy:OWNER,runId:process.env.GITHUB_RUN_ID,dispatches:{}};
  const saveReceipt=()=>fs.writeFileSync('promotion-receipt.json',JSON.stringify(receipt,null,2)+'\n');
  saveReceipt();
  if(!result.alreadyPublished){
   // A concurrent ancestor update is refused too. Unknown success is read, never replayed.
   try{await promoteRef(p);}catch(error){const observed=await api('git/ref/heads/prod');if(observed.object.sha!==p.sourceSha)throw error;}
   requireThat((await api('git/ref/heads/prod')).object.sha===p.sourceSha,'Production ref readback mismatch');
  }
  // Reuse actual existing prod runs; a partial prior delivery is never blindly replayed.
  for(const [file,name] of [['ci.yml','CI'],['deploy-pages.yml','Deploy Pages']]){
   await dispatchGate(p,file,name,receipt,saveReceipt);
  }
  receipt.promotedAt=new Date().toISOString();saveReceipt();
 }else throw new Error('Unknown publication phase');
 console.log(JSON.stringify({...result,phase,packetDigest:digest}));
}
module.exports={validatePacket,allowedFiles,assertEligible,assertNativeReview,manifestDigest,assertOwnerApproval,hash,main};
if(require.main===module)main().catch(error=>{console.error(`FAIL: ${error.message}`);process.exitCode=1;});
