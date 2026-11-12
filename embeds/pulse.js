/**
 * Purpose:
 * - Render the reader-controlled PULSE agency workflow illustration.
 * Architectural role:
 * - Static simulation isolated in the article iframe, not a live agency client.
 * Dependencies:
 * - Standard browser DOM, SVG, animation and timing APIs.
 * Security/CSP considerations:
 * - No network, authentication, storage or submission APIs; child CSP blocks connections.
 * Migration considerations:
 * - Preserve scenario, workload, keyboard, pause and reduced-motion behavior.
 */

(function(){
'use strict';
var NS='http://www.w3.org/2000/svg', svg=document.getElementById('board'), side=document.getElementById('side');
function el(tag,attrs,parent,text){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;(parent||svg).appendChild(e);return e;}
function h(tag,props,parent,text){var e=document.createElement(tag);for(var k in props)e[k]=props[k];if(text!=null)e.textContent=text;if(parent)parent.appendChild(e);return e;}

/* ---------- icons (24 grid, stroke) ---------- */
var IC={
 ops:'M9 4h6v3H9z M7 5H5v15h14V5h-2 M8 11h8 M8 15h5',
 strategist:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M15 9l-2 4-4 2 2-4z',
 director:'M4 10v4h3l6 4V6L7 10z M16 9a4 4 0 0 1 0 6',
 copywriter:'M4 20l1-5L16 4l4 4L9 19z M14 6l4 4',
 photo:'M4 5h16v14H4z M4 16l4-4 3 3 4-5 5 6',
 reel:'M4 5h16v14H4z M10 9l5 3-5 3z',
 researcher:'M12 21s6-6 6-11a6 6 0 0 0-12 0c0 5 6 11 6 11z M12 8a2 2 0 1 0 0 4a2 2 0 0 0 0-4z',
 preflight:'M4 6l1.5 1.5L8 5 M4 12l1.5 1.5L8 11 M4 18l1.5 1.5L8 17 M11 6h9 M11 12h9 M11 18h9',
 critic:'M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z',
 acceptance:'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-4',
 publisher:'M4 12l16-8-6 16-3-6z M11 14l3-3',
 analyst:'M4 20V4 M4 20h16 M8 16v-4 M12 16V8 M16 16v-7',
 learning:'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z',
 community:'M4 5h16v11H9l-5 4z M8 9h8 M8 12h5',
 partnerships:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
 storefront:'M4 9l1-5h14l1 5 M4 9v11h16V9 M10 20v-6h4v6',
 eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
 clock:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7v5l3 2',
 moon:'M20 14A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10z',
 tray:'M4 13l2-8h12l2 8v6H4z M4 13h5l1 3h4l1-3h5',
 lock:'M6 11h12v9H6z M8 11V8a4 4 0 0 1 8 0v3',
 db:'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3v12c0 1.7-3.1 3-7 3s-7-1.3-7-3z M5 6c0 1.7 3.1 3 7 3s7-1.3 7-3 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3',
 key:'M15.5 5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7z M13 11l-9 9 M7 17l2 2 M10 14l2 2',
 coin:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7v10 M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4',
 git:'M6 6v12 M6 4a2 2 0 1 0 0 4a2 2 0 0 0 0-4z M6 16a2 2 0 1 0 0 4a2 2 0 0 0 0-4z M18 6a2 2 0 1 0 0 4a2 2 0 0 0 0-4z M18 10c0 4-12 2-12 6',
 mail:'M3 6h18v12H3z M3 7l9 6 9-6',
 bell:'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z M10 20h4',
 insta:'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z',
 layers:'M12 3l9 5-9 5-9-5z M3 12l9 5 9-5 M3 16l9 5 9-5',
 archive:'M3 5h18v4H3z M5 9v10h14V9 M10 13h4',
 story:'M8 3h8v18H8z M11 17h2',
 wrench:'M15 5a4 4 0 0 0-4.5 5.5L4 17v3h3l6.5-6.5A4 4 0 0 0 19 9l-2.5 2.5-2-2z',
 studio:'M4 5h16v11H4z M9 20h6 M12 16v4 M9 11l2 2 4-4',
 check:'M5 12l5 5 9-10'
};
function icon(name,x,y,size,parent,cls){var g=el('g',{transform:'translate('+x+','+y+') scale('+(size/24)+')','aria-hidden':'true'},parent);el('path',{d:IC[name],class:cls||'ic'},g);return g;}

/* =====================================================================
   THE MANIFEST. Everything on the board is drawn from this one object.
   In the build it is generated from the code, so the board follows the code:
   employees <- skills/sunset-grove-cmo/roles/index.md
   inboxes   <- services/bus-worker/src/protocol.js (INBOXES)
   statuses  <- services/maya-chat/ledger.py (STATES) + live_state.py
   jobs      <- operations/maya-scheduler-jobs.json + .github/workflows (cron)
   watchers  <- services/maya-chat/watchdog.py
   services  <- operations/stack.json (components)
   ===================================================================== */
function every(n,o){var a=[];for(var m=o%n;m<1440;m+=n)a.push(m);return a;}
function hourly(list){var a=[];for(var hr=0;hr<24;hr++)list.forEach(function(m){a.push(hr*60+m);});return a;}
var ROLES='skills/sunset-grove-cmo/roles/';
var M={
 employees:[
  ['ops',['Operations'],'Agency Operations Manager','Turns the approved week into slot assignments: one maker, one reviewer, a version and a deadline for each slot. Reports blocked slots to Maya. Never makes or approves anything.','sg-agency-operations-manager'],
  ['strategist',['Strategist'],'Campaign Strategist','Picks the audience, occasion and named place for each slot, prepares the weekly strategy meeting, and writes each slot’s brief.','sg-campaign-strategist'],
  ['director',['Creative','director'],'Creative Director','Chooses the creative treatment for each brief and checks the whole week for repetition before money is spent.','sg-creative-director'],
  ['researcher',['Local','researcher'],'Local Experience Researcher','Verifies venue and event facts and clears real photos of those places.','sg-local-experience-researcher'],
  ['copywriter',['Copywriter'],'Brand Copywriter','Writes every public word: on-image hook, captions, hashtags, alt text and first comments.','sg-brand-copywriter'],
  ['photo',['Photo and','design'],'Photo and Design Producer','Makes the stills and carousels from real owner photos and cleared venue photos.','sg-photo-design-producer'],
  ['reel',['Reel','producer'],'Reel Producer','Makes the Reels and Story cuts: sequence, on-screen lines, music and render.','sg-reel-producer'],
  ['preflight',['Preflight'],'Preflight Specialist','Runs the mechanical rule checks before spend and on the final files. Pass, or the exact failures.','sg-preflight-specialist'],
  ['critic',['Critic'],'Creative Critic','A fresh, separate run that scores the finished piece and names the repairs. Gemini never reviews Gemini.','sg-creative-critic'],
  ['acceptance',['Acceptance'],'Creative Acceptance Manager','Runs the final gate. On a pass the gate writes the send receipt.','sg-creative-acceptance-manager'],
  ['analyst',['Analyst'],'Marketing Performance Analyst','One set of verified numbers for the daily report, the weekly review and Maya.','sg-marketing-performance-analyst'],
  ['learning',['Learning'],'Research and Learning Specialist','Turns rejections and numbers into lessons written into the other employees’ files, inside the nightly dreaming run and the Wednesday researcher run.','sg-research-learning-specialist'],
  ['publisher',['Publishing'],'Publishing and Distribution Manager','Puts accepted posts into Buffer with the receipt and reads the same post back, first comment included.','sg-publishing-distribution-manager'],
  ['community',['Community'],'Community and Inquiry Manager','Drafts replies to comments and messages, and routes booking questions to Anne.','sg-community-inquiry-manager'],
  ['partnerships',['Partnerships'],'Partnerships and Growth Manager','Finds local partner opportunities and drafts outreach for approval.','sg-partnerships-growth-manager'],
  ['storefront',['Storefront'],'Storefront and Conversion Manager','Keeps the bio link and profile pointing at the right live page.','sg-storefront-conversion-manager']
 ],
 ais:{
  claude:{name:'Claude',ini:'Cl',x:200,col:'var(--claude)',what:'Makes the Reels, reviews its own lane in a fresh run, and runs the scheduled routines (reviews, fixer, learning brief, researcher).',code:'operations/automations/live_schedule.json (claude_routines)'},
  codex:{name:'Codex',ini:'Cx',x:500,col:'var(--codex)',what:'Makes stills on the Mac Mini and in the cloud, with its own fresh reviewer run.',code:'scripts/bus_client.py, services/maya-chat/roster.py'},
  maya:{name:'Maya',ini:'Ma',x:800,col:'var(--maya)'},
  gemini:{name:'Gemini',ini:'G',x:1100,col:'var(--gemini)',what:'Its own Cloudflare worker reads the Gemini inbox every minute and makes stills and text. Its work is always reviewed by Claude or Codex.',code:'services/gemini-worker, services/maya-chat/gemini_production.py'},
  fixer:{name:'Fixer',ini:'Fx',x:1400,col:'var(--fixer)',what:'The inbox for things that broke. The bus files one request here when work sits untouched for 6 hours; the watchdog files alarms here. Whichever AI is on shift picks it up.',code:'services/bus-worker/src/protocol.js (POLICY.fixer_s)'}
 },
 statuses:[
  ['Planned','Not started','In the week’s plan, nobody has started. Maya seeds next week’s slots on Tuesday at 11 PM ET.','planned'],
  ['Making','Being produced','An AI has claimed the slot and is producing it.','making'],
  ['Made','Finished files','Files exist and wait for review.','made'],
  ['In review','Being scored','A fresh, separate run is scoring the piece and running the acceptance gate.','in_review'],
  ['Sent back','Needs repair','The gate or the owner refused it. It goes back to its maker with the exact repair.','rejected'],
  ['Accepted','Passed the gate','Passed at 90 or better with no hard veto. The send receipt is written.','accepted'],
  ['Scheduled','In Buffer','Illustrates a scheduled post whose provider record would need verification.','scheduled'],
  ['Published','Buffer sent it','Buffer reports it sent. Proof from Instagram or Facebook is still to come.','published'],
  ['Live','Confirmed','Instagram or Facebook confirms it is live.','confirmed_live'],
  ['Failed','Buffer failed it','Buffer failed to send it. The Buffer retry job tries again.','failed']
 ],
 gates:[
  ['pre',1,'Preflight','Preflight check','Mechanical rule checks on the finished files: captions, links, sizes, credits, music. Run by whoever is being the Preflight Specialist.','scripts/producer_preflight.py'],
  ['acc',3,'Gate','Acceptance gate','90 or better and no hard veto, judged by a different, fresh run. A pass writes the send receipt. A refusal sends the post back.','scripts/gates.py'],
  ['send',5,'Send','Send gate','Buffer takes nothing without a matching send receipt for that exact version.','scripts/send_gate.py'],
  ['live',7,'Live','Live check','Maya looks every minute for proof the post is live on Instagram or Facebook.','services/maya-chat/main.py (run_publication_confirmations)']
 ],
 jobs:[
  ['deliver','Deliver','ET',every(1,0),'Maya’s minute beat: 12 small jobs','One run does 12 small jobs: owner approvals, switchboard, dispatch, bus timing, topic backfill, slot seeding, rejection notices, publication confirmations, live state, activity feed, capacity, production wakes. Then the watchdog.','services/maya-chat/main.py (deliver)','maya'],
  ['gemini_read','Gemini read','UTC',every(1,0),'Gemini reads its inbox','Gemini’s worker reads its inbox.','services/gemini-worker','w_gemini'],
  ['buffer_retry','Buffer retry','ET',every(5,0),'Retries Buffer posts that errored','Retries Buffer posts that errored.','services/maya-chat/buffer_error_retry.py','v_buffer'],
  ['bus_sweep','Bus sweep','UTC',every(5,0),'Re-sends and hands over work','The bus’s own pulse: re-sends unanswered messages up to 3 times, hands work over after 4 hours, files a fixer request at 6.','services/bus-worker/src/index.js','rail'],
  ['production_tick','Gemini line','ET',every(10,0),'Advances Maya’s own Gemini line','Moves Maya’s own Gemini production line forward one step.','services/maya-chat/gemini_production.py','w_gemini'],
  ['coordinate','Coordinator','ET',every(15,0),'Works the pile of requests','Works the request ledger: piles, unowned blocks, unreviewed posts. Also runs the week project manager.','services/maya-chat/coordinator.py','tap_maya'],
  ['review_push','Review push','ET',hourly([6,21,36,51]),'Tells you posts are ready','Pushes posts that are ready for your review.','services/maya-chat/main.py (/review-push)','y_phone'],
  ['media_check','Media check','ET',every(30,0),'Checks hosted media is intact','Checks that the hosted copy of every media file is reachable and intact.','services/maya-chat/hosted_media.py','v_storage'],
  ['retrospective','Retrospective','ET',hourly([3]),'Checks the week’s production','Production retrospective check.','services/maya-chat/main.py (/production-retrospective)','maya'],
  ['chat_renew','Chat renew','ET',hourly([7]),'Keeps Maya’s chat connected','Renews Maya’s chat event subscription.','services/maya-chat/main.py (/chat-events-renew)','maya'],
  ['tool_mailbox','Mailbox run','UTC',hourly([7]),'Runs queued tool requests','Runs queued tool requests: host media, mirror source, Google reads as Maya.','.github/workflows/tool-mailbox.yml','v_mail'],
  ['supervise','Supervisor','ET',every(120,13),'Recovers stuck cloud workers','Recovery supervisor for cloud workers.','services/maya-chat/main.py (/supervise)','w_fixer'],
  ['drive_delivery','Drive archive','ET',every(120,37),'Copies posted media to Drive','Copies posted images and video to the Drive archive.','services/maya-chat/drive_delivery.py','v_drive'],
  ['probe','Probe','ET',[9*60+9],'Maya tests her own paths','Daily self-test of Maya’s paths.','services/maya-chat/main.py (/probe)','maya'],
  ['brief','Morning brief','ET',[8*60+33],'To your phone at 8:33 AM','Maya’s morning brief, with what was learned overnight.','services/maya-chat/main.py (/brief)','y_phone'],
  ['daily_report','Daily report','ET',[16*60+20],'The daily email','The daily report email, from Apps Script.','analytics/google-cloud-report','y_phone'],
  ['afternoon','Afternoon report','ET',[16*60+33],'To your phone at 4:33 PM','Maya’s afternoon report.','services/maya-chat/main.py (/afternoon)','y_phone'],
  ['learn','Daily learn','UTC',[21*60+47],'Maya’s daily learning step','Maya’s daily learning step and bus parity check.','services/maya-chat/main.py (/learn)','e_learning'],
  ['janitor','Branch janitor','UTC',[10*60+41],'Cleans up stale branches','Cleans up stale branches.','.github/workflows/branch-janitor.yml','v_git']
 ],
 watchers:[
  ['watchdog','Watchdog','ET',every(1,0),'24 kinds of alarm, every minute','Runs at the end of every minute beat. 24 families of alarm; watches 12 scheduled jobs and 8 GitHub workflows. Raises to the fixer inbox or to your phone.','services/maya-chat/watchdog.py','maya'],
  ['bus_check','Bus on Maya','UTC',every(5,0),'The bus checks Maya is alive','The bus checks Maya’s health and her last minute beat. Two failed checks in a row file a fixer request.','services/bus-worker/src/index.js','maya'],
  ['coord_watch','Coordinator watch','UTC',every(120,7),'Checks the coordinator runs','A separate check that the coordinator itself is still running.','.github/workflows/coordinator-watchdog.yml','tap_maya'],
  ['stall','Stall watch','ET',null,'Flags requests stuck 25 s','Inside Maya: logs any request stuck longer than 25 seconds.','services/maya-chat/stall_watch.py','maya'],
  ['live_git','Live against Git','ET',[7*60+12],'Is what runs what Git says?','Compares what is live with what Git says should be live.','.github/workflows/live-vs-git.yml','v_git']
 ],
 night:[
  ['dream','Dreaming','UTC',[5*60+30],'Turns today’s failures into lessons','Reads the day’s failures, rejections and costs, files up to 5 improvement tickets, and writes the lessons into the employees’ files.','scripts/dream.py, .github/workflows/dream.yml','e_learning'],
  ['metrics','Metrics','UTC',[7*60+17],'Collects every post’s numbers','Collects each post’s numbers from Instagram and Facebook.','.github/workflows/metrics-live-daily.yml','s8'],
  ['qa','Nightly tests','UTC',[7*60],'Runs the full test suite','The full test suite.','.github/workflows/qa.yml','v_git'],
  ['backup','Skill backup','UTC',[10*60+41],'Backs the skill library up','Backs the skill library up to Drive.','.github/workflows/skill-drive-backup.yml','v_drive'],
  ['playbook','Playbook check','UTC',[14*60+20],'Is the playbook fresh?','Checks the learning playbook was rebuilt from fresh numbers.','.github/workflows/learning-playbook-freshness.yml','e_learning']
 ],
 services:[
  ['mail','Tool mailbox','mail','Runs tools as Maya for the AIs','Where an AI asks for a tool to run as Maya: host media, read Drive, mirror source.','.github/workflows/tool-mailbox.yml'],
  ['lease','Buffer lease','lock','One Buffer writer at a time','The one-writer lock on Buffer. Only one AI may write to Buffer at a time, even for different posts.','scripts/agent_harness.py'],
  ['buffer','Buffer','layers','Schedules and publishes posts','Schedules and publishes the Instagram and Facebook posts.','services/maya-chat/buffer_requests.py'],
  ['meta','Instagram, Facebook','insta','Where the posts appear','Where the posts appear. Native receipts and insights are the proof of publication and reach.','operations/stack.json (meta_platforms)'],
  ['drive','Google Drive','archive','Skill library and post archive','The skill library, the CMO master and the archive of posted media.','services/maya-chat/drive_delivery.py'],
  ['storage','Storage','db','Maya’s saved state and media','Maya’s saved state and the hosted copy of every media file.','services/maya-chat/state_store.py'],
  ['git','GitHub','git','Code, tickets and checks','The repository, the ticket board and the Actions that run checks.','services/maya-chat/github_app.py'],
  ['key','Keys','key','Secrets, with expiry tracked','Secrets and tokens, with expiry tracked.','operations/credentials-expiry.json'],
  ['cost','Costs','coin','Month-to-date spend per part','Month-to-date spend for every part.','services/maya-chat/costs.py']
 ],
 you:[
  ['phone','Your phone','bell','Alerts, briefs, review pushes','The one actionable alert, the morning brief, the afternoon report and review pushes arrive here.','services/maya-chat/main.py (notify)'],
  ['studio','Studio','studio','Approve, Edit or Remake a post','Where the client reviews proposed creative. Approve is optional; Edit or Remake holds that version and sends it back to its maker.','services/maya-chat/cc']
 ]
};
var WORK=M.ais;
/* Real text from each role's skill file (sections 1, 3, 5, 7). In the build this comes from the manifest. */
var SKILL={};
var SRC={Employee:'skills/sunset-grove-cmo/roles/index.md','AI worker':'services/maya-chat/roster.py',Inbox:'services/bus-worker/src/protocol.js (INBOXES)','Status of a post':'services/maya-chat/assembly_line.py (stage_of), served at /api/v1/assembly',Gate:'scripts/gates.py and the gate scripts','Scheduled job':'operations/maya-scheduler-jobs.json and the workflow crons',Watcher:'services/maya-chat/watchdog.py','Night shift':'the workflow crons in .github/workflows',Service:'operations/stack.json (components)',You:'operations/stack.json (push_alerts)',Post:'the week’s slot ledger (GET /slots/<week>)','Message on the bus':'the bus event feed (services/bus-worker /v1/events)',Group:'this board’s manifest'};

/* ---------- registry ---------- */
var REG={}, selected=null, LOG=[], viewer='out';
function reg(id,o){o.id=id;REG[id]=o;return o;}
function clickable(g,id,label){g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',label);g.setAttribute('data-id',id);g.addEventListener('click',function(e){e.stopPropagation();select(id);});g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();select(id);}});}
function nodeG(id,x,y,label,cls){var g=el('g',{class:'node'+(cls?' '+cls:''),transform:'translate('+x+','+y+')'},gNodes);clickable(g,id,label);REG[id].g=g;REG[id].cx=x;REG[id].cy=y;return g;}
var gWire=el('g',{}), gLinks=el('g',{}), gNodes=el('g',{}), gChips=el('g',{}), gFx=el('g',{});

/* ---------- group headings (clickable) ---------- */
function band(id,x,y,text,what,src){reg(id,{kind:'Group',title:text,what:what,code:src,now:function(){return '';},ref:{type:'operations',id:'group:'+id.slice(2)}});var g=nodeG(id,x,y,text);el('text',{x:0,y:0,class:'band halo'},g,text);}
band('b_agency',46,30,'The agency: Maya and her 16 roles','Each role is a job with a written skill file. None of them is a separate being: an AI loads the skill file and does that job for one post. They are grouped by what the job is: plan, make, judge, reach.',ROLES+'index.md');
band('b_ais',46,322,'The AIs doing the work, and their inboxes','Claude, Codex and Gemini are the hands. Each has an inbox on the bus. Maya has one too, and so does the fixer.','services/bus-worker/src/protocol.js');
band('b_content',46,530,'The content: the status of every post, and the gates between','Rectangles are statuses: where a post is. Diamonds are gates: checks a post must pass to move on.','services/maya-chat/ledger.py');
band('b_always',46,738,'Simulated schedules, with or without content','These run on the clock whether anyone is making posts or not. Each row counts down to its next simulated run.','operations/stack.json');

/* ---------- Maya ---------- */
reg('maya',{kind:'Maya, the CMO',title:'Maya',what:'The agency lead in this design. Maya coordinates the client brief, assigns work and tracks handoffs across sixteen defined roles.',code:'services/maya-chat/main.py',src:'operations/stack.json (maya_cloud_run)',now:function(){return 'Last beat '+since(lastBeat)+' ago. '+INBOX.maya+' open in her inbox.';},talks:['The bus (her inbox and everyone else’s)','Every scheduled job','You, through Studio and chat'],ref:{type:'operations',id:'maya'}});
var mayaRing;
(function(){var g=nodeG('maya',800,160,'Maya, the CMO');
el('circle',{r:74,class:'breath'},g);el('circle',{r:74,class:'breath',style:'animation-delay:1.6s'},g);
el('circle',{r:74,class:'ringtrack'},g);mayaRing=el('circle',{r:74,class:'ring','stroke-dasharray':(2*Math.PI*74).toFixed(1)},g);
var hex=el('g',{id:'mayaHex'},g),pts=[];for(var i=0;i<6;i++){var a=Math.PI/3*i-Math.PI/2;pts.push((58*Math.cos(a)).toFixed(1)+','+(58*Math.sin(a)).toFixed(1));}
el('polygon',{points:pts.join(' '),class:'box',style:'stroke:var(--gold);stroke-width:2.2;fill:var(--surface2)'},hex);
el('text',{x:0,y:4,'text-anchor':'middle',class:'t',style:'font-family:var(--font-display);font-size:28px'},hex,'Maya');
el('text',{x:0,y:26,'text-anchor':'middle',class:'m',style:'font-size:12px;font-weight:600'},hex,'CMO');
for(var j=0;j<12;j++){var b=Math.PI*2/12*j-Math.PI/2;el('circle',{cx:(90*Math.cos(b)).toFixed(1),cy:(90*Math.sin(b)).toFixed(1),r:3.5,class:'tick',style:'fill:var(--border)'},g);}
el('text',{x:0,y:118,'text-anchor':'middle',class:'m halo',id:'beatText',style:'font-size:12px'},g,'');})();
el('path',{d:'M726 160H706 M874 160H894',class:'wire'},gWire);
el('path',{d:'M800 285V348',class:'wire'},gWire);

/* ---------- employees: card with a round holder ---------- */
var DX=[50,214,378,542,908,1072,1236,1400], DY=[52,166];
var RECORDED={photo:'the slot’s maker and format in the ledger',reel:'the slot’s maker and format in the ledger',critic:'the slot’s reviewer and reviewer run in the ledger',acceptance:'the acceptor on the send receipt',publisher:'who scheduled the slot in the ledger',learning:'the owner named on the nightly dreaming job'};
[['Plan',50,47],['Make',50,162],['Judge',908,47],['Reach',908,162]].forEach(function(d){el('text',{x:d[1],y:d[2],class:'m halo',style:'font-size:10.5px;font-weight:700'},svg,d[0]);});
M.employees.forEach(function(e,i){var col=(i<8?i%4:4+(i-8)%4), row=(i<8?Math.floor(i/4):Math.floor((i-8)/4)), x=DX[col], y=DY[row], id='e_'+e[0];
  reg(id,{kind:'Employee',title:e[2],what:e[3],code:ROLES+e[4]+'.md',who:{},now:function(){var o=REG[id],ks=Object.keys(o.who);return ks.length?ks.map(function(k){var v=o.who[k];return WORK[base(k)].name+' is doing this job'+(v.fresh?' in a fresh run':'')+': '+v.note+(v.post?' ('+v.post+')':'')+'.';}).join(' '):(RECORDED[e[0]]?'No worker is assigned in this sample. The intended source for live assignments is '+RECORDED[e[0]]+'.':'This role is part of the design. A live version would need verified assignment records before showing who is doing this job.');},skill:e[4],talks:['Reports to Maya','Filled by whichever AI is assigned the post'],ref:{type:'employee',id:e[4]}});
  var g=nodeG(id,x,y,e[2]);REG[id].cx=x+75;REG[id].cy=y+100;
  el('rect',{width:150,height:100,rx:8,class:'box'},g);
  el('circle',{cx:26,cy:26,r:16,style:'fill:var(--surface2);stroke:var(--border2);stroke-width:1.2'},g);icon(e[0],16,16,20,g);
  e[1].forEach(function(line,n){el('text',{x:50,y:(e[1].length===1?31:23)+n*15,class:'t',style:'font-size:13px;font-weight:700'},g,line);});
  el('line',{x1:12,y1:52,x2:138,y2:52,style:'stroke:var(--border)'},g);
  REG[id].occ=el('g',{transform:'translate(12,60)'},g);REG[id].empty=RECORDED[e[0]]?'Nobody on this now':'Not tracked yet';el('text',{x:0,y:20,class:'m',style:'font-size:12px'},REG[id].occ,REG[id].empty);
});

/* ---------- AIs: square badge ---------- */
['claude','codex','gemini','fixer'].forEach(function(key){var w=WORK[key], id='w_'+key, x=w.x-115, y=340;
  reg(id,{kind:key==='fixer'?'Inbox':'AI worker',title:w.name,what:w.what,code:w.code,now:function(){var s=ws(key),r=ws(key+'#r');return (key==='fixer'?'':(s.out?'Out of usage. Its open work is being handed over. ':((s.desk?'Being the '+REG['e_'+s.desk].title+': '+s.note+(s.post?' ('+s.post+')':'')+'. ':'')+(r.desk?'A second, fresh run is being the '+REG['e_'+r.desk].title+(r.post?' on '+r.post:'')+'. ':'')+(!s.desk&&!r.desk?'Idle. ':''))))+INBOX[key]+' open in its inbox.'+(key==='fixer'?'':' Assigned this week: '+assigned(key)+'.');},talks:['The bus','The employee desks it fills','The posts it holds'],ref:{type:key==='fixer'?'operations':'worker',id:key}});
  var g=nodeG(id,x,y,w.name);REG[id].cx=w.x;REG[id].cy=375;
  el('rect',{width:230,height:70,rx:8,class:'box'},g);
  if(key==='fixer'){el('rect',{x:14,y:17,width:36,height:36,rx:8,style:'fill:var(--surface2);stroke:'+w.col+';stroke-width:2'},g);icon('wrench',22,25,20,g);}
  else{el('rect',{x:14,y:17,width:36,height:36,rx:8,style:'fill:var(--surface2);stroke:'+w.col+';stroke-width:2.4'},g);el('text',{x:32,y:40,'text-anchor':'middle',class:'t',style:'font-size:14px;font-weight:700'},g,w.ini);el('circle',{cx:50,cy:17,r:4,class:'hb',style:'fill:var(--ok)'},g);}
  el('text',{x:62,y:30,class:'t',style:'font-size:15px;font-weight:700'},g,w.name);
  REG[id].status=el('text',{x:62,y:47,class:'m',style:'font-size:12px'},g,'');
  REG[id].load=el('text',{x:62,y:62,class:'m',style:'font-size:11px'},g,'');el('text',{x:166,y:27,'text-anchor':'end',class:'m',style:'font-size:11px'},g,'Inbox');
  icon('tray',170,12,20,g,'icm');REG[id].count=el('text',{x:206,y:28,'text-anchor':'middle',class:'t',style:'font-size:14px;font-weight:700'},g,'0');
  el('path',{d:'M'+w.x+' 410V432',class:'wire'},gWire);});
reg('tap_maya',{kind:'Inbox',title:'Maya’s inbox',what:'Messages addressed to Maya: done reports, blocks, questions from the AIs. She must acknowledge within one minute.',code:'services/maya-chat/bus_feed.py',now:function(){return INBOX.maya+' open.';},talks:['The bus','Maya'],ref:{type:'operations',id:'bus:inbox:maya'}});
(function(){var g=nodeG('tap_maya',800,375,'Maya’s inbox');el('rect',{x:-27,y:-27,width:54,height:54,rx:8,class:'box'},g);icon('tray',-11,-20,22,g);REG.tap_maya.count=el('text',{x:0,y:19,'text-anchor':'middle',class:'t',style:'font-size:13px;font-weight:700'},g,'0');el('path',{d:'M800 402V432',class:'wire'},gWire);el('text',{x:0,y:-36,'text-anchor':'middle',class:'m halo',style:'font-size:11px;font-weight:600'},g,'Maya’s inbox');})();

/* ---------- the bus: a rectangle ---------- */
reg('rail',{kind:'The message bus',title:'Message bus',states:1,what:'What moves the work around. Each inbox has a bay on the bus showing its open messages, coloured by state. Five inboxes: Claude, Codex, Maya, Gemini and the fixer. Every message goes received, acknowledged, started, then done, blocked or failed. Unanswered messages are re-sent up to 3 times, handed to another AI after 4 hours, and raised to the fixer at 6.',code:'services/bus-worker/src/index.js, services/bus-worker/src/protocol.js',src:'operations/stack.json (bus_worker)',now:function(){return packets.length+' in flight. '+totalOpen()+' open across all inboxes.';},talks:['Every AI','Maya','The fixer'],ref:{type:'operations',id:'bus'}});
(function(){var g=el('g',{class:'node'},gNodes);clickable(g,'rail','Message bus');REG.rail.g=g;REG.rail.cx=800;REG.rail.cy=452;
el('rect',{x:40,y:432,width:1520,height:72,rx:8,class:'box',style:'fill:var(--elevated);stroke:var(--lit)'},g);
el('path',{d:'M52 452H1548',class:'busflow'},g);el('path',{d:'M1548 458H52',class:'busflow',style:'opacity:.28;animation-duration:2.4s'},g);
['claude','codex','maya','gemini','fixer'].forEach(function(k){var x=WORK[k].x;el('rect',{x:x-92,y:468,width:184,height:28,rx:5,style:'fill:var(--bg);stroke:var(--border);stroke-width:1'},g);el('path',{d:'M'+x+' 432V468',style:'stroke:var(--lit);stroke-width:1.500'},g);el('rect',{x:x-7,y:445,width:14,height:14,rx:3,style:'fill:var(--text)'},g);});})();
(function(){var x=1232;[['received','var(--text)',50],['acknowledged','var(--accent)',82],['started','var(--pulse)',42],['blocked','var(--warn)',46]].forEach(function(c){el('rect',{x:x,y:312,width:9,height:12,rx:2,style:'fill:'+c[1]},svg);el('text',{x:x+14,y:322,class:'m',style:'font-size:11.5px'},svg,c[0]);x+=14+c[2]+14;});})();
var gBay=el('g',{});

/* ---------- content: statuses (rectangles) and gates (diamonds) ---------- */
var SX=[], GX={};
(function(){var x=46;M.statuses.forEach(function(s,i){SX.push(x);x+=116+10;M.gates.forEach(function(gt){if(gt[1]===i){GX[gt[0]]=x+25;x+=50+10;}});});})();
M.statuses.forEach(function(s,i){var id='s'+i;
  reg(id,{kind:'Status of a post',title:s[0],what:s[2],code:'services/maya-chat/assembly_line.py (stage_of: '+s[3]+')',now:function(){var n=POSTS.filter(function(p){return p.at===i;});return n.length?(n.length+' here: '+n.map(function(p){return p.id;}).join(', ')+'.'):'Nothing here right now.';},ref:{type:'operations',id:'stage:'+s[3]}});
  var g=nodeG(id,SX[i],548,s[0]);REG[id].cx=SX[i]+58;REG[id].cy=548;
  el('rect',{width:116,height:150,rx:8,class:'box'},g);
  el('text',{x:10,y:21,class:'t',style:'font-size:13px;font-weight:700'},g,s[0]);
  REG[id].n=el('text',{x:106,y:21,'text-anchor':'end',class:'m',style:'font-size:12px;font-weight:700'},g,'0');
  el('text',{x:10,y:37,class:'m',style:'font-size:11px'},g,s[1]);
  el('line',{x1:10,y1:45,x2:106,y2:45,style:'stroke:var(--border)'},g);});
M.gates.forEach(function(gt){var id='g_'+gt[0];
  reg(id,{kind:'Gate',title:gt[3],what:gt[4],code:gt[5],passes:0,refusals:0,now:function(){var o=REG[id];return o.passes+' passed and '+o.refusals+' refused in this run.';},ref:{type:'operations',id:'gate:'+gt[0]}});
  var g=nodeG(id,GX[gt[0]],623,gt[3],'gate');
  el('polygon',{points:'0,-25 25,0 0,25 -25,0',class:'box'},g);icon('check',-9,-9,18,g);
  el('text',{x:0,y:44,'text-anchor':'middle',class:'t halo',style:'font-size:11px;font-weight:600'},g,gt[2]);});

/* ---------- always running: rows ---------- */
var TICK=[];
function sub(x,y,text){el('text',{x:x,y:y,class:'t',style:'font-size:12.5px;font-weight:700'},svg,text);}
function row(id,x,y,w,ic,name,desc,o){var g=nodeG(id,x,y,name,'row');REG[id].cx=x+17;REG[id].cy=y+15;
  el('rect',{width:w,height:30,rx:6,class:'box'},g);
  el('rect',{x:5,y:4,width:22,height:22,rx:5,style:'fill:var(--surface2);stroke:var(--border2);stroke-width:1'},g);icon(ic,8,7,16,g);
  var nm=el('text',{x:35,y:20,class:'t',style:'font-size:12.5px;font-weight:700'},g,name);
  var nw=Math.max(nm.getComputedTextLength?nm.getComputedTextLength():0,name.length*6.900);
  var room=w-35-nw-12-(o?100:10), maxc=Math.floor(room/5.700);
  if(maxc>8)el('text',{x:35+nw+10,y:20,class:'m',style:'font-size:11.5px'},g,desc.length>maxc?desc.slice(0,maxc-1)+'…':desc);
  if(o){o.cd=el('text',{x:w-8,y:20,'text-anchor':'end',class:'t cdt',style:'font-size:11.5px;font-weight:600;font-variant-numeric:tabular-nums'},g,'');o.bar=el('rect',{x:0,y:27,width:0,height:3,rx:1.500,class:'bar'},g);o.w=w;}
  return g;}
function ticker(def,kind,x,y,ic){var id=(kind==='Scheduled job'?'j_':kind==='Watcher'?'x_':'n_')+def[0];
  var o=reg(id,{kind:kind,title:def[1],what:def[5],code:def[6],tz:def[2],mins:def[3],target:def[7],now:function(){return o.mins?'Next run '+fmtET(o.next)+', in '+dur(o.next-Date.now())+'.':'Always on. It is not on a schedule; it runs continuously inside Maya.';},talks:def[7]&&REG[def[7]]?['Fires at: '+REG[def[7]].title]:null,ref:{type:kind==='Watcher'?'watcher':'job',id:def[0]}});
  row(id,x,y,362,ic,def[1],def[4],o);if(o.mins){schedule(o);TICK.push(o);}else o.cd.textContent='always on';}
function service(def,pre,kind,x,y){var id=pre+def[0];reg(id,{kind:kind,title:def[1],what:def[4],code:def[5],now:function(){return id==='v_lease'?(leaseHolder?WORK[leaseHolder].name+' holds the lock right now.':'Free.'):'';},ref:{type:'operations',id:'component:'+def[0]}});row(id,x,y,362,def[2],def[1],def[3],null);}
/* services and you first, so jobs can name them as targets */
sub(1192,766,'Services everything leans on');M.services.forEach(function(d,i){service(d,'v_','Service',1192,776+i*34);});
sub(1192,776+9*34+22,'You: where Maya reaches you');M.you.forEach(function(d,i){service(d,'y_','You',1192,776+9*34+32+i*34);});
sub(46,766,'On the clock: every minute to every hour');sub(428,766,'On the clock: every two hours to daily');M.jobs.forEach(function(d,i){ticker(d,'Scheduled job',46+Math.floor(i/10)*382,776+(i%10)*34,'clock');});
sub(810,766,'Watchers: things that check other things');M.watchers.forEach(function(d,i){ticker(d,'Watcher',810,776+i*34,'eye');});
sub(810,776+5*34+22,'Night shift: learning while you sleep');M.night.forEach(function(d,i){ticker(d,'Night shift',810,776+5*34+32+i*34,'moon');});

/* ---------- time + schedules ---------- */
function parts(d,tz){var f=new Intl.DateTimeFormat('en-US',{timeZone:tz==='UTC'?'UTC':'America/New_York',hourCycle:'h23',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(d),o={};f.forEach(function(p){o[p.type]=+p.value;});return o.hour*60+o.minute+o.second/60;}
function schedule(o){var now=new Date(), m=parts(now,o.tz), list=o.mins, nxt=null, prev=null;
  for(var i=0;i<list.length;i++){if(list[i]>m+1e-6){nxt=list[i];prev=i>0?list[i-1]:list[list.length-1]-1440;break;}}
  if(nxt===null){nxt=list[0]+1440;prev=list[list.length-1];}
  o.next=now.getTime()+(nxt-m)*60000;o.period=(nxt-prev)*60000;}
function fmtET(t){return new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(t));}
function dur(ms){var s=Math.max(0,Math.round(ms/1000));if(s<100)return s+' s';var m=Math.round(s/60);if(m<100)return m+' min';var hh=Math.floor(m/60);return hh+' h '+(m%60)+' min';}
function since(t){return dur(Date.now()-t);}
var lastBeat=Date.now()-((new Date()).getSeconds()*1000);

/* ---------- state ---------- */
var WS={}, INBOX={claude:0,codex:0,maya:0,gemini:0,fixer:0}, QUEUE={claude:[],codex:[],maya:[],gemini:[],fixer:[]}, POSTS=[], packets=[], pulses=[], leaseHolder=null, gen=0, paused=false, MODE='wed', pseq=0, mseq=0;
function base(k){return k.split('#')[0];}
function ws(k){return WS[k]||(WS[k]={});}
function totalOpen(){var n=0;for(var k in INBOX)n+=INBOX[k];return n;}
var QCOL={received:'var(--text)',acknowledged:'var(--accent)',started:'var(--pulse)',blocked:'var(--warn)'};
function renderBay(k){var q=QUEUE[k];INBOX[k]=q.length;(k==='maya'?REG.tap_maya:REG['w_'+k]).count.textContent=q.length;q.forEach(function(it,i){it.t.setAttribute('x',WORK[k].x-86+i*15);it.t.style.display=i<12?'':'none';});}
function qstate(it,st){it.state=st;it.o.state=st;it.t.style.fill=QCOL[st];}
function enqueue(k,o){var g=gen,t=el('rect',{y:474,width:11,height:16,rx:2,class:'pkt'},gBay);clickable(t,o.id,o.title);o.g=t;var it={o:o,t:t};QUEUE[k].push(it);qstate(it,'received');renderBay(k);
  setTimeout(function(){if(g===gen&&it.state==='received')qstate(it,'acknowledged');},900);
  if(k==='maya')setTimeout(function(){if(g===gen)startOldest('maya',700);},1300);}
function startOldest(k,hold){var g=gen,it=QUEUE[k].filter(function(x){return x.state!=='started';})[0];if(!it)return;qstate(it,'started');
  setTimeout(function(){if(g!==gen)return;var i=QUEUE[k].indexOf(it);if(i>=0)QUEUE[k].splice(i,1);it.t.remove();it.o.g=null;it.o.state='done';renderBay(k);},hold||2600);}
var MODENAME={wed:'Wednesday launch',idle:'Idle day',night:'Overnight'};
var HEALTH={};
function setHealth(id,level,title,text){var o=REG[id];if(!o)return;clearHealth(id,true);o.health={level:level,title:title,text:text,since:Date.now()};HEALTH[id]=o.health;if(o.g)o.g.classList.add(level==='bad'?'hbad':'hwarn');renderAttn();log((level==='bad'?'Problem: ':'Warning: ')+title,id);if(selected===id)renderSide();}
function clearHealth(id,quiet){var o=REG[id];if(!o||!o.health)return;o.health=null;delete HEALTH[id];if(o.g)o.g.classList.remove('hbad','hwarn');renderAttn();if(!quiet)log('Recovered: '+o.title,id);if(selected===id)renderSide();}
function renderAttn(){var a=document.getElementById('attn');a.textContent='';var ks=Object.keys(HEALTH);
  if(!ks.length){h('span',{className:'ok'},a,'Nothing needs attention right now.');return;}
  h('span',{className:'lbl'},a,ks.length+(ks.length>1?' things need':' thing needs')+' attention:');
  ks.sort(function(x,y){return (HEALTH[x].level==='bad'?0:1)-(HEALTH[y].level==='bad'?0:1);}).forEach(function(k){var b=h('button',{type:'button',className:HEALTH[k].level==='bad'?'':'w'},a,HEALTH[k].title);b.addEventListener('click',function(){select(k);});});}
function bayOverdue(k,on){QUEUE[k].forEach(function(it){if(on){it.state='overdue';it.o.state='no reply past the 5 minute target; re-sent by the bus';it.t.style.fill='var(--bad)';it.t.classList.add('qbad');}else{it.t.classList.remove('qbad');qstate(it,'acknowledged');}});}
function log(text,id){LOG.unshift({t:Date.now(),text:'Sample: '+text,id:id});if(LOG.length>80)LOG.pop();if(!selected)renderSide();}
function Cancel(){}
function wait(sec){var g=gen;return new Promise(function(res,rej){var left=sec*1000,last=performance.now();(function tick(){if(g!==gen)return rej(new Cancel());var n=performance.now();if(!paused)left-=(n-last);last=n;if(left<=0)res();else setTimeout(tick,60);})();});}
function jw(sec){return wait(sec*(.650+Math.random()*.900));}
async function step(run,desk,p,note,sec,fresh){while(ws(base(run)).out)await wait(.400);at(run,desk,p,note,fresh);await jw(sec);}

/* messages on the bus (each one is clickable) */
var KCOL={assign:'var(--text)',done:'var(--ok)',blocked:'var(--warn)',reject:'var(--bad)',hand:'var(--gold)',alarm:'var(--bad)'};
var KNAME={assign:'An assignment',done:'A done report',blocked:'A block',reject:'A repair order',hand:'A handover',alarm:'An alarm'};
function msg(from,to,label,kind){var g=gen, fromName=from==='watch'?'Watchdog':WORK[from].name, id='m_'+(++mseq);
  var o=reg(id,{kind:'Message on the bus',title:label,what:KNAME[kind]+' from '+fromName+' to '+WORK[to].name+'.',code:'services/bus-worker/src/protocol.js (STATES)',state:'in flight',now:function(){return 'State: '+o.state+'.';},ref:{type:'operations',id:'bus:message:'+mseq}});
  log(fromName+' to '+WORK[to].name+': '+label,id);
  return new Promise(function(res,rej){var x0=from==='watch'?828:WORK[from].x, node=el('g',{class:'pkt'},gFx);clickable(node,id,label);o.g=node;
    el('rect',{x:-13,y:-9,width:26,height:18,rx:4,class:'box',style:'fill:'+KCOL[kind]+';stroke:var(--bg);stroke-width:1.500'},node);
    el('text',{x:0,y:(pseq++%2?-31:-16),'text-anchor':'middle',class:'t halo',style:'font-size:11.5px;font-weight:600;stroke:var(--bg)'},node,label.length>34?label.slice(0,33)+'…':label);
    var trail=el('line',{x1:x0,y1:452,x2:x0,y2:452,style:'stroke:'+KCOL[kind]+';stroke-width:3;stroke-linecap:round;opacity:.45','pointer-events':'none'},gFx);
    packets.push({node:node,trail:trail,to:to,o:o,x:x0,x0:x0,tx:WORK[to].x,g:g,res:res,rej:rej,phase:0,y:from==='watch'?776:418});});}
function pulse(a,b,col){if(!REG[a]||!REG[b])return;var c=col||'var(--pulse)';var p=el('circle',{r:5,style:'fill:'+c,'pointer-events':'none'},gFx);var ln=el('line',{x1:REG[a].cx,y1:REG[a].cy,x2:REG[b].cx,y2:REG[b].cy,style:'stroke:'+c+';stroke-width:1.500;stroke-dasharray:2 5;opacity:.7','pointer-events':'none'},gFx);pulses.push({p:p,ln:ln,a:REG[a],b:REG[b],t:0});}
function gate(k,ok){var o=REG['g_'+k];o[ok?'passes':'refusals']++;o.g.classList.add(ok?'pass':'refuse');setTimeout(function(){o.g.classList.remove('pass','refuse');},1300);}

/* desks */
function drawDesk(d){while(d.occ.firstChild)d.occ.removeChild(d.occ.firstChild);var ks=Object.keys(d.who);
  if(!ks.length){el('text',{x:0,y:20,class:'m',style:'font-size:12px'},d.occ,d.empty);return;}
  ks.forEach(function(k,i){var W=WORK[base(k)];el('rect',{x:i*30,y:2,width:26,height:26,rx:6,style:'fill:var(--surface2);stroke:'+W.col+';stroke-width:2.2'+(d.who[k].fresh?';stroke-dasharray:3 3':'')},d.occ);el('text',{x:i*30+13,y:20,'text-anchor':'middle',class:'t',style:'font-size:11.5px;font-weight:700'},d.occ,W.ini);});
  if(ks.length===1){var v=d.who[ks[0]];el('text',{x:34,y:14,class:'t',style:'font-size:11.5px;font-weight:600'},d.occ,v.fresh?'Fresh run':WORK[base(ks[0])].name);el('text',{x:34,y:29,class:'m',style:'font-size:11px'},d.occ,v.post?v.post:v.note.slice(0,16));}
  else el('text',{x:ks.length*30+4,y:20,class:'m',style:'font-size:11px'},d.occ,ks.length+' here');}
function at(run,desk,post,note,fresh){leave(run,true);var w=base(run),s=ws(run);s.desk=desk;s.note=note;s.post=post?post.id:null;var d=REG['e_'+desk];d.who[run]={note:note,post:s.post,fresh:fresh};drawDesk(d);
  s.link=el('path',{class:'link',style:'stroke:'+WORK[w].col,d:curve(WORK[w].x,w==='maya'?348:340,d.cx,d.cy),'pointer-events':'none'},gLinks);
  if(post){post.hist.push(WORK[w].name+(fresh?' (fresh run)':'')+' as '+d.title+': '+note);s.plink=el('path',{class:'link',style:'stroke:'+WORK[w].col+';opacity:.7',d:curve(WORK[w].x,504,SX[post.at]+58,548),'pointer-events':'none'},gLinks);}
  status(w);log(WORK[w].name+' as '+d.title+': '+note+(post?' ('+post.id+')':''),'e_'+desk);if(selected)renderSide();}
function leave(run,quiet){var w=base(run),s=ws(run);if(s.desk){var d=REG['e_'+s.desk];delete d.who[run];drawDesk(d);}
  if(s.link){s.link.remove();s.link=null;}if(s.plink){s.plink.remove();s.plink=null;}s.desk=null;s.post=null;if(!quiet)status(w);}
function curve(x1,y1,x2,y2){var my=(y1+y2)/2;return 'M'+x1+' '+y1+'C'+x1+' '+my+','+x2+' '+my+','+x2+' '+y2;}
function status(w){if(w==='maya')return;var s=ws(w),r=REG['w_'+w];if(w==='fixer'){r.status.textContent='Things that broke';r.load.textContent='Picked up by the AI on shift';return;}
  var d=s.desk||ws(w+'#r').desk;if(r.load)r.load.textContent='This week: '+assigned(w);r.status.textContent=s.out?'Out of usage':(d?'As '+M.employees.filter(function(e){return e[0]===d;})[0][1].join(' ').toLowerCase():'Idle');r.g.classList.toggle('out',!!s.out);}
function use(w,fn){var s=ws(w),run=async function(){while(ws(base(w)).out)await wait(.500);return fn();};s.q=(s.q||Promise.resolve()).then(run,run);return s.q;}

/* posts: any number per week */
function mkPost(id,kind,maker,atI){var g=el('g',{class:'chip'},gChips);var r=el('rect',{width:22,height:22,rx:4},g);var ig=icon(kind==='reel'?'reel':kind==='story'?'story':'photo',3,3,16,g,'icm');
  var p={id:id,kind:kind,maker:maker,at:atI,g:g,r:r,ig:ig,hist:[]}, rid='p_'+id;
  reg(rid,{kind:'Post',title:id,preview:1,what:(kind==='reel'?'A Reel':kind==='story'?'A Story':'A still or carousel')+', assigned to '+WORK[maker].name+'.',code:'services/maya-chat/ledger.py',g:g,post:p,now:function(){return 'Status: '+M.statuses[p.at][0]+(p.holder?'. Held by '+WORK[base(p.holder)].name:'')+'.';},ref:{type:'slot',id:id.toLowerCase().replace(/ /g,'-')}});
  clickable(g,rid,id);POSTS.push(p);return p;}
function layout(){M.statuses.forEach(function(_,i){var here=POSTS.filter(function(p){return p.at===i;}), n=here.length, sz=n<=8?22:n<=15?16:n<=28?12:9, gap=sz>12?5:3, per=Math.floor((100+gap)/(sz+gap));
  REG['s'+i].n.textContent=n;
  here.forEach(function(p,k){var x=SX[i]+8+(k%per)*(sz+gap), y=548+52+Math.floor(k/per)*(sz+gap);p.g.style.transform='translate('+x+'px,'+y+'px)';p.r.setAttribute('width',sz);p.r.setAttribute('height',sz);p.r.setAttribute('rx',sz>12?4:2);p.ig.setAttribute('transform','translate('+(sz*.140)+','+(sz*.140)+') scale('+(sz*.720/24)+')');p.ig.style.display=sz<12?'none':'';p.g.classList.toggle('live',i===8);p.g.classList.toggle('bad',i===9||i===4);});});}
function move(p,i){p.at=i;p.hist.push('Status: '+M.statuses[i][0]);layout();var w=p.holder;if(w&&ws(w).plink)ws(w).plink.setAttribute('d',curve(WORK[base(w)].x,504,SX[i]+58,548));if(selected)renderSide();}

/* ---------- scenarios (sample traffic) ---------- */
var REASONS=['headline printed twice on slide 2','same lake photo as last week','first comment has a link in it','end card held under 4 seconds'];
function reviewerFor(m){return m==='gemini'?(ws('claude').out?'codex':'claude'):m;}
function alive(w){return ws(w).out?(w==='claude'?'codex':'claude'):w;}
async function life(p,delay){
  await wait(delay);var m=alive(p.maker);
  await msg('maya',m,'Assignment: '+p.id,'assign');
  await use(m,async function(){p.holder=m;startOldest(m);
    var desk=p.kind==='still'?'photo':'reel';move(p,1);await step(m,desk,p,'Brief, concept and words',3.200);
    await step(m,desk,p,p.kind==='reel'?'Cutting the Reel':p.kind==='story'?'Cutting the Story':'Building the carousel',2.600);
    await step(m,desk,p,'Running preflight',1.100);gate('pre',true);    move(p,2);leave(m);p.holder=null;});
  await msg(m,'maya','Made: '+p.id,'done');
  for(var round=0;round<2;round++){
    var rb=reviewerFor(m), r=rb+'#r';
    await msg('maya',rb,'Review: '+p.id,'assign');
    var ok=true;
    if(p.recalled)return;
    await use(r,async function(){if(p.recalled)return;p.holder=r;startOldest(rb);
      move(p,3);await step(r,'critic',p,'Scoring in a fresh run',1.900,true);
      await step(r,'acceptance',p,'Running the gate',1.300,true);
      ok=round>0||Math.random()>.34;gate('acc',ok);leave(r);p.holder=null;});
    if(ok)break;
    var why=REASONS[Math.floor(Math.random()*REASONS.length)];
    move(p,4);log('Gate refused '+p.id+': '+why,'g_acc');
    await msg('maya',m,'Repair '+p.id+': '+why,'reject');
    await use(m,async function(){p.holder=m;startOldest(m);move(p,1);await step(m,p.kind==='still'?'photo':'reel',p,'Repairing: '+why,2.400);await step(m,p.kind==='still'?'photo':'reel',p,'Running preflight again',1.000);gate('pre',true);move(p,2);leave(m);p.holder=null;});
  }
  if(p.recalled)return;
  move(p,5);log('Gate accepted '+p.id+'. Send receipt written.','g_acc');
  var s=m==='gemini'?'maya':m;
  await use(s,async function(){if(p.recalled)return;p.holder=s;pulse(s==='maya'?'tap_maya':'w_'+s,'v_mail');log(WORK[s].name+' asked the tool mailbox to host '+p.id,'v_mail');await jw(1.100);pulse('v_mail','v_storage');
    at(s,'publisher',p,'Scheduling in Buffer');leaseHolder=s;REG.v_lease.g.classList.add('locked');await jw(1.400);
    gate('send',true);pulse('v_lease','v_buffer','var(--warn)');move(p,6);leaseHolder=null;REG.v_lease.g.classList.remove('locked');leave(s);p.holder=null;});
  if(s!=='maya')await msg(s,'maya','Scheduled: '+p.id+', read back','done');
}
function week(n){var days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],T=[['FB still','still','codex'],['IG still','still','gemini'],['Reel','reel','claude'],['FB still','still','codex'],['Reel','reel','claude'],['IG still','still','gemini'],['Story','story','codex']],out=[],count={};
  for(var i=0;i<n;i++){var t=T[i%7],name=days[i%7]+' '+t[0];count[name]=(count[name]||0)+1;out.push([name+(count[name]>1?' '+count[name]:''),t[1],t[2]]);}return out;}
function assigned(w){var c={still:0,reel:0,story:0};POSTS.forEach(function(p){if(p.maker===w)c[p.kind]++;});var parts=[];if(c.still)parts.push(c.still+(c.still>1?' stills':' still'));if(c.reel)parts.push(c.reel+(c.reel>1?' Reels':' Reel'));if(c.story)parts.push(c.story+(c.story>1?' Stories':' Story'));return parts.length?parts.join(', '):'nothing';}
function reset(){gen++;packets.forEach(function(k){k.node.remove();k.trail.remove();});packets=[];pulses.forEach(function(k){k.p.remove();k.ln.remove();});pulses=[];
  Object.keys(HEALTH).forEach(function(k){clearHealth(k,true);});Object.keys(WS).forEach(function(w){leave(w,true);});WS={};POSTS.forEach(function(p){p.g.remove();delete REG['p_'+p.id];});POSTS=[];
  Object.keys(REG).forEach(function(k){if(k.indexOf('m_')===0)delete REG[k];});
  for(var k in QUEUE){QUEUE[k].forEach(function(it){it.t.remove();});QUEUE[k]=[];renderBay(k);}leaseHolder=null;REG.v_lease.g.classList.remove('locked');
  M.employees.forEach(function(e){REG['e_'+e[0]].g.classList.remove('glow');});M.gates.forEach(function(g){REG['g_'+g[0]].passes=0;REG['g_'+g[0]].refusals=0;});['claude','codex','gemini','fixer'].forEach(status);LOG=[];}
function guard(p){p.catch(function(e){if(!(e instanceof Cancel))console.error(e);});}
function nSlots(){return +document.getElementById('slots').value;}
function startWed(){week(nSlots()).forEach(function(w){mkPost(w[0],w[1],w[2],0);});layout();['claude','codex','gemini'].forEach(status);log('Wednesday: production for next week starts. '+POSTS.length+' posts open.','s0');
  var d={claude:0,codex:.600,gemini:1.200},all=[];POSTS.forEach(function(p){var q=life(p,d[p.maker]);guard(q);all.push(q);d[p.maker]+=.900;});
  guard((async function(){await Promise.all(all);log('All '+POSTS.length+' posts are scheduled in Buffer and read back.','s6');await wait(12);start('wed');})());
  guard((async function(){await wait(11);setHealth('j_review_push','bad','Review push did not run','It was not called for twice its schedule plus 10 minutes, so nobody was told posts are ready to review. Signal: watchdog cause o:job:review_push. Owner: Claude.');await wait(38);clearHealth('j_review_push');})());
  guard((async function(){await wait(34);ws('claude').out=true;leave('claude');leave('claude#r');status('claude');
    setHealth('w_claude','warn','Claude is out of usage','It has stopped picking up work. Signal: watchdog cause q:claude_quota and the capacity record.');bayOverdue('claude',true);
    setHealth('rail','bad','Messages to Claude have no reply','Messages in Claude’s inbox passed the 5 minute acknowledge target. The bus re-sent them and is handing them to Codex. Signal: resent and handed_over events on the bus feed.');
    await msg('claude','codex','Handed over: Claude’s open work','hand');
    await wait(22);await msg('watch','fixer','Alarm: posts waiting unreviewed','alarm');pulse('x_watchdog','y_phone','var(--bad)');setHealth('g_acc','warn','Posts are waiting unreviewed','Finished posts have sat without a reviewer. Signal: watchdog cause v:unreviewed_posts.');
    await wait(12);startOldest('fixer');clearHealth('g_acc');await wait(18);ws('claude').out=false;status('claude');bayOverdue('claude',false);clearHealth('w_claude');clearHealth('rail');})());}
function startQuiet(night){var all=week(nSlots()),n=all.length;all.forEach(function(w,i){mkPost(w[0],w[1],w[2],i<n*.500?8:(i<n*.850?6:7));});layout();['claude','codex','gemini'].forEach(status);log(night?'Overnight: nobody is making content. The night shift is working.':'Idle day: nobody is making content. The machine is still running.','maya');
  var acts=night?[
    async function(){log('Dreaming: reading today’s rejections and failures','n_dream');for(var i=0;i<6;i++){var k=['photo','reel','copywriter','critic','preflight','strategist'][i];pulse('n_dream','e_'+k,'var(--gold)');REG['e_'+k].g.classList.add('glow');await wait(.700);}log('Dreaming: lessons written into 6 employee files','n_dream');await wait(4);M.employees.forEach(function(e){REG['e_'+e[0]].g.classList.remove('glow');});},
    async function(){pulse('s8','n_metrics');log('Metrics: collecting numbers for the live posts','n_metrics');await wait(1.500);pulse('n_metrics','n_playbook','var(--gold)');log('Playbook check: rebuilt from the new numbers','n_playbook');},
    async function(){await msg('maya','claude','Researcher run: next week’s prep pack','assign');await use('claude',async function(){startOldest('claude');at('claude','learning',null,'Next week’s prep pack');await wait(3.500);leave('claude');});await msg('claude','maya','Prep pack ready','done');},
    async function(){pulse('n_qa','v_git');log('Nightly tests: running the full suite','n_qa');await wait(2);setHealth('n_qa','bad','Nightly tests finished red','The newest scheduled run is red, so a broken change may be live. Signal: watchdog cause w:workflow:qa.yml.');await msg('watch','fixer','Alarm: nightly tests are red','alarm');await wait(8);startOldest('fixer');await wait(3);clearHealth('n_qa');},
    async function(){pulse('n_backup','v_drive');log('Skill backup: library copied to Drive','n_backup');}
  ]:[
    async function(){var p=POSTS.filter(function(x){return x.at===6;})[0];if(!p)return;pulse('v_buffer','v_meta','var(--ok)');move(p,7);log('Buffer sent '+p.id,'s7');},
    async function(){var p=POSTS.filter(function(x){return x.at===7;})[0];if(!p)return;gate('live',true);move(p,8);log('Maya confirmed '+p.id+' is live','g_live');},
    async function(){pulse('j_drive_delivery','v_drive');log('Drive archive: posted media filed','j_drive_delivery');},
    async function(){await msg('maya','claude','Request pickup','assign');await wait(1.500);startOldest('claude');await wait(2.800);await msg('claude','maya','Nothing waiting','done');},
    async function(){pulse('x_watchdog','j_coordinate');log('Watchdog: all 12 watched jobs ran on time','x_watchdog');},
    async function(){pulse('x_bus_check','maya');log('Bus checked Maya: healthy','x_bus_check');},
    async function(){var p=POSTS.filter(function(x){return x.at===6;})[0];if(!p)return;move(p,9);setHealth('v_buffer','bad','Buffer failed to send '+p.id,'The post is past its time and Buffer reported a failure. Signal: the post’s stage is failed, and the Buffer error record. The Buffer retry job tries again every 5 minutes.');await wait(5);pulse('j_buffer_retry','s9','var(--warn)');await wait(1.200);move(p,7);clearHealth('v_buffer');},
    async function(){setHealth('j_daily_report','bad','Daily report has not gone out','The daily report email is past due. Signal: watchdog cause h:daily_report.');await msg('watch','fixer','Alarm: daily report is late','alarm');pulse('x_watchdog','y_phone','var(--bad)');await wait(7);startOldest('fixer');await wait(3);clearHealth('j_daily_report');}
  ];
  guard((async function(){var i=0;for(;;){await wait(night?2.400:2);await acts[i%acts.length]();i++;}})());}
function start(mode){MODE=mode;reset();renderAttn();document.querySelectorAll('#modes button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.mode===mode?'true':'false');});
  if(mode==='wed')startWed();else startQuiet(mode==='night');select(null);}

/* ---------- side panel ---------- */
var ASK={Employee:['What is this employee doing right now, and for which post?','What did this employee get rejected for this week?','Who filled this job on each post this week?'],
 'AI worker':['What is it working on this second?','How much usage does it have left?','What is waiting in its inbox, oldest first?'],
 'Scheduled job':['Did the last run succeed?','What does this job do, in plain words?','What breaks if it stops?'],
 Watcher:['What is it watching right now?','What alarms has it raised today?','Is anything it watches unhealthy?'],
 'Night shift':['What did last night’s run produce?','Which lessons did it write?','When does it run next?'],
 Post:['Where is this post and who has it?','Why was it sent back?','Show me the finished files.'],
 Gate:['What did this gate refuse this week, and why?','What is the pass rate?','What exactly does it check?'],
 'Status of a post':['Which posts are stuck here longest?','Who is holding each one?','What moves a post out of this status?']};
var DEFASK=['What is happening here right now?','Is this healthy? If not, who owns the fix?','What changed here in the last hour?'];
function select(id){if(id&&document.getElementById('app').classList.contains('noside'))setSide(true);if(selected&&REG[selected]&&REG[selected].g)REG[selected].g.classList.remove('sel','selp');selected=id&&REG[id]?id:null;if(selected){var o=REG[selected];if(o.g)o.g.classList.add(o.post?'selp':'sel');}renderSide();side.scrollTop=0;}
function legendIcon(kind){var s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');var a={style:'fill:none;stroke:var(--text);stroke-width:1.600'};
  if(kind==='maya')el('polygon',{points:'12,2 21,7 21,17 12,22 3,17 3,7',style:'fill:none;stroke:var(--gold);stroke-width:1.800'},s);
  if(kind==='emp')el('circle',Object.assign({cx:12,cy:12,r:9},a),s);
  if(kind==='ai'){el('rect',Object.assign({x:3,y:3,width:18,height:18,rx:4},a),s);}
  if(kind==='status')el('rect',Object.assign({x:2,y:5,width:20,height:14,rx:2},a),s);
  if(kind==='gate')el('polygon',Object.assign({points:'12,2 22,12 12,22 2,12'},a),s);
  if(kind==='row'){el('rect',Object.assign({x:1,y:8,width:22,height:8,rx:2},a),s);el('rect',{x:1,y:14,width:12,height:2,style:'fill:var(--accent)'},s);}
  if(kind==='msg')el('rect',{x:5,y:8,width:14,height:9,rx:2,style:'fill:var(--text)'},s);
  if(kind==='post')el('rect',Object.assign({x:6,y:6,width:12,height:12,rx:2},a),s);
  if(kind==='link')el('path',{d:'M2 20C8 20 16 4 22 4',style:'fill:none;stroke:var(--claude);stroke-width:2;stroke-dasharray:4 4'},s);
  return s;}
function renderSide(){side.textContent='';
  if(!selected){document.getElementById('panelLabel').textContent='Sample activity: '+MODENAME[MODE];h('p',{className:'hint'},side,'Newest first. Click a line, or anything on the board.');
    var ul=h('ul',{className:'log'},side);LOG.forEach(function(e){var li=h('li',{},ul),b=h('button',{type:'button'},li);h('time',{},b,new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit',second:'2-digit'}).format(new Date(e.t)));b.appendChild(document.createTextNode(e.text));b.addEventListener('click',function(){select(e.id);});});
    h('h3',{},side,'One shape for each kind of thing');var lg=h('ul',{className:'legend'},side);
    [['maya','Hexagon','Maya'],['emp','Round holder on a card','An employee: a job with a skill file'],['ai','Square badge','An AI. It sits at the desk of the job it is doing'],['link','Moving dashed line','Who is doing what, to which post'],['status','Rectangle','A status: where a post is'],['gate','Diamond','A gate: a check a post must pass'],['row','Row with a filling bar','Something on the clock: job, watcher or night job'],['msg','Solid tile on the bus','A message in flight'],['post','Small square','A post']].forEach(function(r){var li=h('li',{},lg);li.appendChild(legendIcon(r[0]));var sp=h('span',{},li);h('strong',{},sp,r[1]+': ');sp.appendChild(document.createTextNode(r[2]));});
    return;}
  var o=REG[selected];document.getElementById('panelLabel').textContent='Scenario details';
  var back=h('button',{type:'button',className:'back'},side,'Back to activity');back.addEventListener('click',function(){select(null);});
  h('h2',{},side,o.title);h('p',{className:'kind'},side,o.kind);
  if(o.health){var pb=h('div',{className:'prob'+(o.health.level==='bad'?'':' w')},side);h('strong',{},pb,(o.health.level==='bad'?'Broken: ':'Warning: ')+o.health.title);pb.appendChild(document.createTextNode(o.health.text+' Started '+since(o.health.since)+' ago.'));}
  h('p',{},side,o.skill&&SKILL[o.skill]?SKILL[o.skill].purpose:o.what);
  if(o.skill&&SKILL[o.skill]){var sk=SKILL[o.skill];h('h3',{},side,'The job, from its skill file');[['Must produce',sk.produce],['Must not do',sk.mustnot],['How the job is checked',sk.checked]].forEach(function(r){var d=h('div',{className:'skill'},side);h('strong',{},d,r[0]);h('p',{},d,r[1]);});}
  var nowText=o.now();if(nowText){h('h3',{},side,'In this scenario');h('p',{id:'nowp'},side,nowText);}
  if(o.preview){var pp=o.post;h('h3',{},side,'The content');
    if(pp.at<2){h('p',{},side,'This sample post has not reached production. In the intended workflow, its approved media and copy would appear here.');}
    else{var sh=h('div',{className:'shot '+(pp.kind==='still'?'still':'tall')},side);var si=document.createElementNS(NS,'svg');si.setAttribute('viewBox','0 0 24 24');si.setAttribute('aria-hidden','true');el('path',{d:IC[pp.kind==='still'?'photo':pp.kind==='story'?'story':'reel'],class:'icm'},si);sh.appendChild(si);h('strong',{},sh,pp.kind==='still'?'Illustrative image placeholder':'Illustrative video placeholder');h('span',{},sh,'No real media is loaded in this illustration.');
      h('h3',{},side,'Caption');h('p',{},side,'In the intended workflow, this panel would contain the approved caption, hashtags and first comment. This example does not contain a real post.');
      var fl=h('ul',{className:'facts'},side);[['Format',pp.kind==='still'?'Still or carousel':pp.kind==='story'?'Story':'Reel'],['Made by',WORK[pp.maker].name],['Status',M.statuses[pp.at][0]],['Gate score',pp.at>=5&&pp.at!==9?'Shown once accepted':(pp.at===4?'Refused, with the reason':'Not scored yet')],['Buffer',pp.at>=6?'Sample scheduled state':'Not scheduled yet'],['Goes out','The slot’s day and time']].forEach(function(r){var li=h('li',{},fl);h('span',{},li,r[0]);h('span',{},li,r[1]);});
      h('p',{className:'sent'},side,'Sample media only. There is no file to open or publish.');
      h('h3',{},side,'Send it back with feedback');
      if(pp.at>=7){h('p',{},side,'This sample represents a published post. The intended workflow would require a separate client request for any later change.');}
      else if(pp.at===4||pp.holder){h('p',{},side,'It is already back with '+WORK[base(pp.holder||pp.maker)].name+' for repair.');}
      else if(viewer==='out'){h('p',{},side,'Feedback and revisions are shown as part of the workflow; this illustration does not submit changes.');}
      else{var fb=h('div',{className:'fb ask'},side);var ta=h('textarea',{placeholder:'What should change? For example: the headline is printed twice on slide 2.'},fb);ta.setAttribute('aria-label','Feedback for this post');var rb=h('div',{className:'rowb'},fb);
        [['Edit','Edit'],['Remake','Remake']].forEach(function(v){var b=h('button',{type:'button',className:v[0]==='Edit'?'go':''},rb,v[1]);b.addEventListener('click',function(){sendBack(pp,v[0],ta.value.trim());});});
        h('p',{className:'sent'},fb,'Edit asks for a change to this version. Remake asks for a new one. Either way the note goes to the AI that made it, through Maya, and the post moves to Sent back.');}}}
  if(o.post&&o.post.hist.length){h('h3',{},side,'What has happened to it');var hl=h('ul',{},side);o.post.hist.slice(-12).forEach(function(t){h('li',{},hl,t);});}
  if(o.talks){h('h3',{},side,'Connected to');var ul2=h('ul',{},side);o.talks.forEach(function(t){h('li',{},ul2,t);});}
  h('p',{className:'hint'},side,'This is a sample scenario, not a connection to the agency’s records.');
  h('h3',{},side,'Ask Maya about this');
  if(o.health&&viewer==='in'){ASK[o.kind]=ASK[o.kind]||DEFASK;}
  if(viewer==='out'){h('p',{},side,'This illustration is read only. It does not contact Maya or change any agency work.');return;}
  var box=h('div',{className:'ask'},side);var c=h('div',{className:'ctx'},box);h('code',{},c,JSON.stringify(o.ref));
  var tell=h('div',{className:'fb'},box);var tt=h('textarea',{placeholder:o.skill?'Tell Maya what to change in this role. For example: the Critic must also check the first comment.':'Tell Maya what to do about this.'},tell);tt.setAttribute('aria-label','Instruction for Maya');var tb=h('button',{type:'button',className:'go'},tell,o.skill?'Tell Maya to update this role':'Send to Maya');
  tb.addEventListener('click',function(){var t=tt.value.trim();if(!t){sent.textContent='Type what you want first.';return;}instruct(o,t);tt.value='';sent.textContent='Sent to Maya with the reference above. Watch the bus: she is assigning it now. In the build she answers in chat and the change lands as a commit.';});
  var sent=h('p',{className:'sent'},null,'');(o.health?['What broke here, and what is the fix?','Who owns this and have they been told?','Has this happened before?']:(ASK[o.kind]||DEFASK)).forEach(function(q){var b=h('button',{type:'button'},box,q);b.addEventListener('click',function(){sent.textContent='In the build, this opens Maya chat with the reference above attached and sends: “'+q+'”';});});box.appendChild(sent);}
function short(t,n){return t.length>n?t.slice(0,n-1)+'…':t;}
function sendBack(p,verb,note){if(p.holder||p.at===4)return;note=note||'change requested';p.recalled=true;p.hist.push('The client, '+verb+': '+note);move(p,4);log('The client sent '+p.id+' back ('+verb+'): '+note,'p_'+p.id);
  var m=alive(p.maker),desk=p.kind==='still'?'photo':'reel';
  guard((async function(){await msg('maya',m,verb+' '+p.id+': '+short(note,30),'reject');
    await use(m,async function(){p.holder=m;startOldest(m);move(p,1);await step(m,desk,p,'Applying The client’s '+verb.toLowerCase(),2.600);await step(m,desk,p,'Running preflight again',1.000);gate('pre',true);move(p,2);leave(m);p.holder=null;});
    await msg(m,'maya','Made again: '+p.id,'done');})());renderSide();}
function instruct(o,text){var to=o.kind==='AI worker'?o.id.slice(2):(ws('codex').out?'claude':'codex');log('The client told Maya about '+o.title+': '+text,o.id);
  guard((async function(){await wait(.800);await msg('maya',to,'Owner instruction: '+short(o.title+', '+text,30),'assign');await wait(1.500);startOldest(to);await wait(2.400);await msg(to,'maya','Done: '+short(o.title,24),'done');})());}


/* ---------- loops ---------- */
var lastT=performance.now(), tickI=-1, tickUntil=0;
function frame(t){var dt=Math.min(.050,(t-lastT)/1000);lastT=t;if(!paused){
  for(var i=packets.length-1;i>=0;i--){var k=packets[i];
    if(k.phase===0){k.y+=(452-k.y)*Math.min(1,dt*7);if(Math.abs(k.y-452)<1){k.y=452;k.phase=1;k.o.state='in flight';}}
    else if(k.phase===1){var d=k.tx-k.x,st=320*dt;if(Math.abs(d)<=st){k.x=k.tx;k.phase=2;}else k.x+=d>0?st:-st;k.trail.setAttribute('x2',k.x.toFixed(1));}
    else{k.y+=90*dt;k.trail.style.opacity=Math.max(0,.45-(k.y-452)/60);if(k.y>480){k.node.remove();k.trail.remove();packets.splice(i,1);if(k.g===gen){enqueue(k.to,k.o);k.res();}else k.rej(new Cancel());continue;}}
    k.node.setAttribute('transform','translate('+k.x.toFixed(1)+','+k.y.toFixed(1)+')');}
  for(var j=pulses.length-1;j>=0;j--){var u=pulses[j];u.t+=dt/1.100;if(u.t>=1){u.p.remove();u.ln.remove();pulses.splice(j,1);continue;}u.p.setAttribute('cx',u.a.cx+(u.b.cx-u.a.cx)*u.t);u.p.setAttribute('cy',u.a.cy+(u.b.cy-u.a.cy)*u.t);}
  if(tickI>=0&&t>tickUntil){var ticks=svg.querySelectorAll('.tick');ticks.forEach(function(c,n){c.style.fill=n<=tickI?'var(--gold)':'var(--border)';});tickI++;tickUntil=t+110;if(tickI>12){tickI=-1;setTimeout(function(){ticks.forEach(function(c){c.style.fill='var(--border)';});},900);}}
  }requestAnimationFrame(frame);}
function second(){if(paused)return;var now=Date.now();
  document.getElementById('clock').textContent=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'short',hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'}).format(new Date(now));
  TICK.forEach(function(o){var left=o.next-now;if(left<=0){fire(o);schedule(o);left=o.next-now;}o.cd.textContent=o.health&&o.health.level==='bad'?'not running':'in '+dur(left);o.bar.setAttribute('width',(o.w*Math.min(1,Math.max(0,1-left/o.period))).toFixed(1));});
  var dl=REG.j_deliver;mayaRing.setAttribute('stroke-dashoffset',(2*Math.PI*74*Math.min(1,Math.max(0,(dl.next-now)/dl.period))).toFixed(1));
  document.getElementById('beatText').textContent='Last beat '+since(lastBeat)+' ago';
  var np=document.getElementById('nowp');if(np&&selected&&REG[selected])np.textContent=REG[selected].now();}
function fire(o){o.g.classList.add('fire');setTimeout(function(){o.g.classList.remove('fire');},1300);
  if(o.id==='j_deliver'){lastBeat=Date.now();var hx=document.getElementById('mayaHex');hx.classList.remove('beat');void hx.getBoundingClientRect();hx.classList.add('beat');tickI=0;tickUntil=0;pulse('j_deliver','maya','var(--gold)');log('Maya’s minute beat triggered in this illustration','maya');}
  else{if(o.target&&REG[o.target])pulse(o.id,o.target);log(o.title+' triggered in this illustration',o.id);}}

document.querySelectorAll('#modes button').forEach(function(b){b.addEventListener('click',function(){start(b.dataset.mode);});});

document.getElementById('slots').addEventListener('change',function(){start(MODE);});
document.getElementById('pause').addEventListener('click',function(){paused=!paused;this.setAttribute('aria-pressed',paused?'true':'false');this.textContent=paused?'Resume':'Pause';document.getElementById('app').classList.toggle('paused',paused);});
svg.addEventListener('click',function(){select(null);});
function setSide(show){var a=document.getElementById('app'),b=document.getElementById('hide');a.classList.toggle('noside',!show);b.setAttribute('aria-pressed',show?'false':'true');b.textContent=show?'Hide activity':'Show activity';}
document.getElementById('hide').addEventListener('click',function(){setSide(document.getElementById('app').classList.contains('noside'));});
document.getElementById('hide2').addEventListener('click',function(){setSide(false);});
document.getElementById('showSide').addEventListener('click',function(){setSide(true);});
second();setInterval(second,1000);requestAnimationFrame(frame);start('wed');
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){document.getElementById('pause').click();}
})();

// Escape returns to the hosting article when this sandboxed illustration is expanded.
document.addEventListener("keydown",function(event){if(event.key==="Escape"&&window.parent!==window){event.preventDefault();window.parent.postMessage({type:"pulse:escape"},"*");}});
