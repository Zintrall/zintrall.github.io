'use strict';

const $ = id => document.getElementById(id);

// ── UI Elements ─────────────────────────────────────────────────────────────
const viewConnect = $('view-connect');
const viewLobby   = $('view-lobby');
const viewRole    = $('view-role');
const viewGame    = $('view-game');
const viewGameover= $('view-gameover');

const els = {
  ip: $('input-ip'), port: $('input-port'), name: $('input-name'),
  btnJoin: $('btn-join'), error: $('connect-error'),
  lobbyCount: $('lobby-count'), lobbyGrid: $('lobby-players'), btnReady: $('btn-ready'),
  btnRoleOk: $('btn-role-ok'), roleName: $('role-name'), roleDesc: $('role-desc'),
  roleTeamBadge: $('role-team-badge'), roleCard: $('role-card'), roleKnowledge: $('role-knowledge'),
  tbName: $('tb-name'), tbRole: $('tb-role'), eventLog: $('event-log'),
  questTrack: $('quest-track'), roster: $('player-roster'),
  panels: Array.from(document.querySelectorAll('.panel')),
  
  // Panels
  pWaiting: $('panel-waiting'), waitingMsg: $('waiting-msg'),
  pLS: $('panel-leader-select'), lsTitle: $('ls-title'), lsHint: $('ls-hint'), lsGrid: $('ls-players'),
  lsTokenRow: $('ls-token-row'), lsTokenGrid: $('ls-token-players'), btnTokenNone: $('btn-token-none'), btnConfirmTeam: $('btn-confirm-team'),
  pVoting: $('panel-voting'), voteHint: $('vote-hint'), btnVoteSuccess: $('btn-vote-success'), btnVoteFail: $('btn-vote-fail'), voteSubmitted: $('vote-submitted-msg'),
  pQuestResult: $('panel-quest-result'), qrTitle: $('qr-title'), qrTokens: $('qr-tokens'), qrCounts: $('qr-counts'),
  pNextLeader: $('panel-next-leader'), nlLeaderList: $('nl-leader-list'), btnConfirmNl: $('btn-confirm-nl'),
  pAmuletSel: $('panel-amulet-selection'), asAmuletList: $('as-amulet-list'), btnAsNoAmulet: $('btn-as-no-amulet'), btnConfirmAs: $('btn-confirm-as'),
  pAmulet: $('panel-amulet-check'), acPlayers: $('ac-players'), btnConfirmAc: $('btn-confirm-ac'), acResult: $('ac-result'),
  pTrickster: $('panel-trickster'), btnTricksterTruth: $('btn-trickster-truth'), btnTricksterLie: $('btn-trickster-lie'),
  pFinalDisc: $('panel-final-discussion'), revealerNotice: $('revealer-notice'), changelingNotice: $('changeling-notice'),
  discTimer: $('discussion-timer'), btnFinalReady: $('btn-final-ready'), finalReadyList: $('final-ready-list'),
  pHunt: $('panel-hunt'), btnHuntAct: $('btn-hunt-activate'), btnHuntSkip: $('btn-hunt-skip'),
  huntGuessSection: $('hunt-guess-section'), btnHuntConfirm: $('btn-hunt-confirm'),
  pFinalVote: $('panel-final-voting'), fvHint: $('fv-hint'), fvPlayers: $('fv-players'), btnConfirmFv: $('btn-confirm-fv'), fvSubmitted: $('fv-submitted-msg'),
  
  // Game Over
  goBanner: $('gameover-banner'), goTitle: $('gameover-title'), goReason: $('gameover-reason'),
  goQuestTrack: $('go-quest-track'),
  rolesReveal: $('roles-reveal'), btnPlayAgain: $('btn-play-again')
};

// ── State ───────────────────────────────────────────────────────────────────
let ws = null;
let myId = null;
let myName = null;
let myRole = null; // {id, name, team, description}
let gameBoard = null;
let allPlayers = []; // {id, name, ready, isVeteran, hasAmulet, amuletUsed, ...}
let currentLeaderId = null;
let currentQuestIndex = 0;
let phase = 'LOBBY';
let questResults = [];

// Selection state
let lsSelectedTeam = new Set();
let lsSelectedToken = null;
let lsTargetSize = 0;
let nlSelectedLeader = null;
let asSelectedAmulet = null;
let acSelectedTarget = null;
let fvSelected = new Set();
let fvTargetSize = 0;
let knownEvilIds = new Set();
let clericKnowledge = null;

function resetGameState() {
  myId = null;
  myName = null;
  myRole = null;
  gameBoard = null;
  allPlayers = [];
  currentLeaderId = null;
  currentQuestIndex = 0;
  phase = 'LOBBY';
  questResults = [];

  lsSelectedTeam.clear();
  lsSelectedToken = null;
  lsTargetSize = 0;
  nlSelectedLeader = null;
  asSelectedAmulet = null;
  acSelectedTarget = null;
  fvSelected.clear();
  fvTargetSize = 0;
  knownEvilIds.clear();
  clericKnowledge = null;
}

// ── View Management ─────────────────────────────────────────────────────────
function showView(v) {
  [viewConnect, viewLobby, viewRole, viewGame, viewGameover].forEach(el => el.classList.remove('active'));
  v.classList.add('active');
}

function showPanel(p) {
  els.panels.forEach(el => el.classList.add('hidden'));
  p.classList.remove('hidden');
}

// event log removed

// ── Network ─────────────────────────────────────────────────────────────────
function connect() {
  let ip = els.ip.value.trim();
  let port = els.port.value.trim() || '3000';
  let name = els.name.value.trim();
  if (!name || !/^[A-Za-z ]{1,20}$/.test(name)) {
    els.error.textContent = "Invalid name (letters and spaces only, max 20).";
    els.error.classList.remove('hidden');
    return;
  }
  
  localStorage.setItem('quest_ip', ip);
  localStorage.setItem('quest_port', port);
  localStorage.setItem('quest_name', name);

  if (!ip) ip = location.hostname || 'localhost';

  els.btnJoin.disabled = true;
  els.error.classList.add('hidden');

  try {
    ws = new WebSocket(`ws://${ip}:${port}`);
  } catch (e) {
    showError("Connection failed.");
    return;
  }

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'join', name }));
  };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      handleMessage(msg);
    } catch(e) { console.error("Parse error:", e); }
  };

  ws.onclose = () => {
    if (ws) {
      showError("Disconnected from server.");
    }
  };
  
  ws.onerror = () => {
    if (ws) {
      showError("WebSocket error.");
    }
  };
}

function showError(msg) {
  els.error.textContent = msg;
  els.error.classList.remove('hidden');
  els.btnJoin.disabled = false;
  if(ws) {
    let tempWs = ws;
    ws = null;
    tempWs.close();
  }
  showView(viewConnect);
  resetGameState();
}

function send(msg) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

// ── Message Handlers ────────────────────────────────────────────────────────
function handleMessage(msg) {
  console.log("RECV:", msg);
  switch (msg.type) {
    case 'error':
      if (phase === 'LOBBY' && myId === null) showError(msg.message);
      else alert("Error: " + msg.message);
      break;
    case 'welcome':
      myId = msg.playerId;
      myName = msg.playerName;
      break;
    case 'lobby_update':
      if(phase === 'LOBBY') {
        showView(viewLobby);
        renderLobby(msg.players);
      }
      break;
    case 'game_start':
      handleGameStart(msg.payload);
      break;
    case 'phase':
      phase = msg.phase;
      handlePhase(msg.phase, msg.data || {});
      break;
    case 'vote_submitted':
      break;
    case 'quest_result':
      handleQuestResult(msg);
      break;
    case 'leader_changed':
      currentLeaderId = msg.newLeaderId;
      renderRoster();
      break;
    case 'amulet_result':
      showPanel(els.pAmulet);
      els.acResult.textContent = `${msg.targetName} is ${msg.reported.toUpperCase()}`;
      els.acResult.className = `amulet-result ${msg.reported}`;
      els.acPlayers.classList.add('hidden');
      els.btnConfirmAc.classList.add('hidden');
      break;
    case 'trickster_choice':
      showPanel(els.pTrickster);
      break;
    case 'role_event':
      if (msg.event.type === 'revealer_revealed') {
        els.revealerNotice.innerHTML = `<strong>${msg.event.playerName}</strong> has revealed themselves as <strong>EVIL</strong>.`;
        els.revealerNotice.classList.remove('hidden');
      }
      break;
    case 'final_ready_update':
      if(phase === 'FINAL_QUEST_DISCUSSION') renderFinalReady(msg.players);
      break;
    case 'evil_revealed':
      break;
    case 'game_over':
      phase = 'GAME_OVER';
      handleGameOver(msg);
      break;
    case 'ping':
      send({type: 'pong'});
      break;
  }
}

// ── Rendering Helpers ───────────────────────────────────────────────────────
function getPlayerName(id) {
  const p = allPlayers.find(x => x.id === id);
  return p ? p.name : 'Unknown';
}

function renderPlayerGrid(container, players, selectedSet=null, clickHandler=null, disabledCondition=null) {
  container.innerHTML = '';
  players.forEach(p => {
    const d = document.createElement('div');
    d.className = 'select-tile' + (selectedSet?.has(p.id) ? ' selected' : '') + ((disabledCondition && disabledCondition(p)) ? ' disabled' : '');
    d.textContent = p.name;
    if(p.id === myId) d.textContent += ' (You)';
    if(clickHandler) d.onclick = () => clickHandler(p.id, d);
    container.appendChild(d);
  });
}

function renderLobby(players) {
  allPlayers = players;
  els.lobbyCount.textContent = `${players.length}/10 players`;
  els.lobbyGrid.innerHTML = '';
  let meReady = false;
  players.forEach(p => {
    if(p.id === myId) meReady = p.ready;
    const card = document.createElement('div');
    card.className = 'player-card' + (p.ready ? ' ready' : '') + (p.id === myId ? ' you' : '');
    card.innerHTML = `<div class="pc-name">${p.name}</div><div class="pc-status ${p.ready?'ready':''}">${p.ready ? 'Ready ✔' : 'Not Ready ✘'}</div>`;
    els.lobbyGrid.appendChild(card);
  });
  els.btnReady.textContent = meReady ? "Not Ready" : "Ready";
  els.btnReady.className = "btn " + (meReady ? "btn-ghost" : "btn-primary");
}

function renderFinalReady(players) {
  els.finalReadyList.innerHTML = '';
  players.forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card' + (p.ready ? ' ready' : '');
    card.innerHTML = `<div class="pc-name">${p.name}</div><div class="pc-status ${p.ready?'ready':''}">${p.ready ? 'Ready ✔' : 'Wait ✘'}</div>`;
    els.finalReadyList.appendChild(card);
  });
}

// ── Game Phases ─────────────────────────────────────────────────────────────
function handleGameStart(p) {
  gameBoard = p.board;
  allPlayers = p.playerOrder.map(pl => ({...pl, isVeteran:false, hasAmulet:false, amuletUsed:false, onTeam:false}));
  myRole = p.yourRole;
  currentLeaderId = p.firstLeaderId;
  currentQuestIndex = 0;
  questResults = [];
  
  els.tbName.textContent = myName;
  els.tbRole.textContent = myRole.name;
  els.tbRole.style.color = myRole.team === 'evil' ? 'var(--evil-light)' : 'var(--good-light)';
  
  knownEvilIds = new Set((p.knownEvilPlayers || []).map(e => e.id));
  clericKnowledge = null;
  if(p.specialKnowledge) {
    const match = p.specialKnowledge.label.match(/is (GOOD|EVIL)$/i);
    if(match) clericKnowledge = { id: p.specialKnowledge.playerId, team: match[1].toLowerCase() };
  }
  
  els.roleName.textContent = myRole.name;
  els.roleDesc.textContent = myRole.description;
  els.roleTeamBadge.textContent = myRole.team.toUpperCase();
  els.roleTeamBadge.className = 'role-team-badge ' + myRole.team;
  els.roleCard.classList.remove('flipped');
  
  let khtml = '';
  if(p.knownEvilPlayers && p.knownEvilPlayers.length > 0) {
    khtml += `<p>Known Evil: <span>${p.knownEvilPlayers.map(e=>e.name).join(', ')}</span></p>`;
  }
  if(p.specialKnowledge) {
    khtml += `<p>Special: <span>${p.specialKnowledge.label}</span></p>`;
  }
  if(khtml) {
    els.roleKnowledge.innerHTML = khtml;
    els.roleKnowledge.classList.remove('hidden');
  } else {
    els.roleKnowledge.classList.add('hidden');
  }
  
  els.btnRoleOk.textContent = "Got it!";
  els.btnRoleOk.disabled = false;
  els.btnRoleOk.classList.remove('show');
  
  showView(viewRole);
  setTimeout(() => els.roleCard.classList.add('flipped'), 500);
  setTimeout(() => els.btnRoleOk.classList.add('show'), 2000);
}

function renderBoard(resultsArray = questResults, container = els.questTrack) {
  container.innerHTML = '';
  gameBoard.quests.forEach((qSize, i) => {
    const slot = document.createElement('div');
    slot.className = 'quest-slot';
    let classes = 'quest-circle';
    if(i === currentQuestIndex && container === els.questTrack) classes += ' active';
    
    if(resultsArray[i]) {
      classes += resultsArray[i].passed ? ' passed' : ' failed';
    }
    
    const circleContent = resultsArray[i] ? (resultsArray[i].passed ? '✔' : '✘') : qSize;
    slot.innerHTML = `<div class="${classes}">${circleContent}</div><div class="quest-meta">Quest ${i+1}</div>`;
    if(gameBoard.amuletAfter.includes(i+1)) slot.innerHTML += `<div class="quest-amulet">🔮</div>`;
    container.appendChild(slot);
  });
}

function renderRoster() {
  els.roster.innerHTML = '';
  allPlayers.forEach(p => {
    const d = document.createElement('div');
    d.className = 'roster-card' + (p.onTeam ? ' on-team' : '') + (p.id === myId ? ' is-you' : '');
    let html = `<div class="rc-name">${p.name}</div><div class="rc-tags">`;
    if(p.id === currentLeaderId) html += `<span class="rc-tag leader">L</span>`;
    if(p.isVeteran) html += `<span class="rc-tag veteran">🎖</span>`;
    if(p.hasAmulet && !p.amuletUsed) html += `<span class="rc-tag amulet">🔮</span>`;
    if(p.hasToken) html += `<span class="rc-tag token">✨</span>`;
    if(knownEvilIds.has(p.id)) html += `<span class="rc-tag tag-evil">Evil</span>`;
    if(clericKnowledge && clericKnowledge.id === p.id) html += `<span class="rc-tag tag-${clericKnowledge.team}">${clericKnowledge.team==='good'?'Good':'Evil'}</span>`;
    html += `</div>`;
    d.innerHTML = html;
    els.roster.appendChild(d);
  });
}

function handlePhase(ph, data) {
  if (ph === 'LOBBY') {
    els.goBanner.parentElement.classList.remove('active');
    showView(viewLobby);
    return;
  }

  const runPhaseLogic = () => {
    if(ph === 'LEADER_SELECTS_TEAM' || ph === 'NEXT_LEADER_SELECTION' || ph === 'AMULET_CHECK') {
      if(data.playerOrder) {
        data.playerOrder.forEach(dp => {
          const p = allPlayers.find(x => x.id === dp.id);
          if(p) Object.assign(p, dp);
        });
      }
      allPlayers.forEach(p => { p.onTeam = false; p.hasToken = false; });
    }
    
    if(ph === 'LEADER_SELECTS_TEAM') {
    currentLeaderId = data.leaderId;
    currentQuestIndex = data.questIndex;
    questResults = data.questResults || [];
    renderBoard(questResults);
    renderRoster();
    
    if(myId === data.leaderId) {
      lsTargetSize = data.teamSize;
      lsSelectedTeam.clear();
      lsSelectedToken = null;
      els.lsTitle.textContent = `Select ${lsTargetSize} Players`;
      renderPlayerGrid(els.lsGrid, allPlayers, lsSelectedTeam, (id, el) => {
        if(lsSelectedTeam.has(id)) lsSelectedTeam.delete(id);
        else if(lsSelectedTeam.size < lsTargetSize) lsSelectedTeam.add(id);
        updateLsUI(data.magicTokenAvailable);
      });
      updateLsUI(data.magicTokenAvailable);
      showPanel(els.pLS);
    } else {
      els.waitingMsg.textContent = `Waiting for leader ${getPlayerName(data.leaderId)} to select team...`;
      showPanel(els.pWaiting);
    }
  }
  else if (ph === 'QUEST_VOTING') {
    allPlayers.forEach(p => {
      p.onTeam = data.team.some(t => t.id === p.id);
      p.hasToken = p.id === data.magicTokenHolder;
    });
    renderRoster();
    
    if(allPlayers.find(p => p.id === myId)?.onTeam) {
      els.voteHint.textContent = `Vote for Quest ${data.questIndex + 1}`;
      els.voteSubmitted.classList.add('hidden');
      els.btnVoteSuccess.classList.remove('hidden');
      els.btnVoteFail.classList.remove('hidden');
      
      let canFail = myRole.team === 'evil';
      let canSuccess = true;
      const hasToken = (myId === data.magicTokenHolder);

      if (myRole.team === 'evil') {
        if (hasToken && myRole.id !== 'MorganLeFay') canFail = false;
        if (myRole.id === 'Lunatic') canSuccess = false;
      } else {
        if (myRole.id === 'Youth' && hasToken) {
          canSuccess = false;
          canFail = true;
        }
      }

      els.btnVoteSuccess.disabled = !canSuccess;
      els.btnVoteFail.disabled = !canFail;
      
      showPanel(els.pVoting);
    } else {
      els.waitingMsg.textContent = "Team is voting on the quest...";
      showPanel(els.pWaiting);
    }
  }
  else if (ph === 'NEXT_LEADER_SELECTION') {
    if(myId === data.leaderId) {
      nlSelectedLeader = null;
      const handleLeaderClick = (id, el) => {
        nlSelectedLeader = id;
        renderPlayerGrid(els.nlLeaderList, data.nonVeterans, new Set([id]), handleLeaderClick);
        updateNlUI();
      };
      renderPlayerGrid(els.nlLeaderList, data.nonVeterans, new Set(), handleLeaderClick);
      updateNlUI();
      showPanel(els.pNextLeader);
    } else {
      els.waitingMsg.textContent = `Leader ${getPlayerName(data.leaderId)} is choosing next leader...`;
      showPanel(els.pWaiting);
    }
  }
  else if (ph === 'AMULET_SELECTION') {
    if(myId === data.leaderId) {
      asSelectedAmulet = null;
      const handleAmuletClick = (id, el) => {
        asSelectedAmulet = id;
        els.btnAsNoAmulet.className = 'btn btn-ghost';
        renderPlayerGrid(els.asAmuletList, data.amuletEligible || [], new Set([id]), handleAmuletClick);
        updateAsUI();
      };
      renderPlayerGrid(els.asAmuletList, data.amuletEligible || [], new Set(), handleAmuletClick);
      els.btnAsNoAmulet.className = 'btn btn-primary';
      updateAsUI();
      showPanel(els.pAmuletSel);
    } else {
      els.waitingMsg.textContent = "Waiting for old leader to choose who to give the Amulet to...";
      showPanel(els.pWaiting);
    }
  }
  else if (ph === 'AMULET_CHECK') {
    if(myId === data.allPlayers?.find(p => p.hasAmulet && !p.amuletUsed)?.id || document.querySelector('.rc-tag.amulet')) { // Weak check, but server sends to holder specifically
        acSelectedTarget = null;
        els.acResult.classList.add('hidden');
        els.acPlayers.classList.remove('hidden');
        els.btnConfirmAc.classList.remove('hidden');
        els.btnConfirmAc.disabled = true;
        
        const handleAcClick = (id, el) => {
          acSelectedTarget = id;
          renderPlayerGrid(els.acPlayers, data.allPlayers, new Set([id]), handleAcClick, p => p.id === myId);
          els.btnConfirmAc.disabled = false;
        };
        renderPlayerGrid(els.acPlayers, data.allPlayers, new Set(), handleAcClick, p => p.id === myId);
        showPanel(els.pAmulet);
    }
  }
  else if (ph === 'AMULET_WAITING') {
    els.waitingMsg.textContent = `${data.holderName} is checking loyalties...`;
    showPanel(els.pWaiting);
  }
  else if (ph === 'FINAL_QUEST_DISCUSSION') {
    els.revealerNotice.classList.add('hidden');
    els.changelingNotice.classList.add('hidden');
    if(data.changelingInfo) {
      els.changelingNotice.innerHTML = `<strong>Changeling exposed:</strong> ${data.changelingInfo.name}`;
      els.changelingNotice.classList.remove('hidden');
    }
    
    // We don't implement full JS timer sync, just a visual countdown
    let timeLeft = 300;
    els.discTimer.textContent = '5:00';
    els.discTimer.classList.remove('urgent');
    const tid = setInterval(() => {
      if(phase !== 'FINAL_QUEST_DISCUSSION') { clearInterval(tid); return; }
      timeLeft--;
      if(timeLeft < 0) { clearInterval(tid); return; }
      const m = Math.floor(timeLeft/60);
      const s = (timeLeft%60).toString().padStart(2, '0');
      els.discTimer.textContent = `${m}:${s}`;
      if(timeLeft <= 30) els.discTimer.classList.add('urgent');
    }, 1000);
    
    els.btnFinalReady.textContent = "I'm Ready to Vote";
    els.btnFinalReady.className = "btn btn-primary";
    renderFinalReady(allPlayers);
    showPanel(els.pFinalDisc);
  }
  else if (ph === 'HUNT_PHASE') {
    if (myId === data.hunterId) {
      els.btnHuntConfirm.parentElement.classList.add('hidden');
      showPanel(els.pHunt);
    } else {
      els.waitingMsg.textContent = "The Blind Hunter is considering the Hunt...";
      showPanel(els.pWaiting);
    }
  }
  else if (ph === 'HUNT_WAITING') {
    els.waitingMsg.textContent = "The Blind Hunter is considering the Hunt...";
    showPanel(els.pWaiting);
  }
  else if (ph === 'HUNT_GUESS') {
    // Populate dropdowns
    document.querySelectorAll('.hunt-player-select').forEach(sel => {
      sel.innerHTML = '<option value="">Select Player...</option>';
      data.allPlayers.forEach(p => { if(p.id!==myId) sel.innerHTML += `<option value="${p.id}">${p.name}</option>`; });
    });
    document.querySelectorAll('.hunt-role-select').forEach(sel => {
      sel.innerHTML = '<option value="">Select Role...</option>';
      // Just hardcode good roles for simplicity or use passed data
      const goodRoles = ["LoyalServant","Cleric","Youth","Troublemaker","Duke","Arthur","Archduke","Apprentice"];
      goodRoles.forEach(r => { sel.innerHTML += `<option value="${r}">${r.replace(/([A-Z])/g, ' $1').trim()}</option>`; });
    });
    els.btnHuntConfirm.parentElement.classList.remove('hidden');
    showPanel(els.pHunt);
  }
  else if (ph === 'FINAL_VOTING') {
    const isVoter = data.goodPlayers.find(p => p.id === myId);
    if(isVoter) {
      fvTargetSize = isVoter.guessCount;
      fvSelected.clear();
      els.fvHint.textContent = `Select ${fvTargetSize} player${fvTargetSize>1?'s':''}.`;
      els.fvSubmitted.classList.add('hidden');
      els.btnConfirmFv.classList.remove('hidden');
      els.fvPlayers.classList.remove('hidden');
      const handleFvClick = (id, el) => {
        if(fvSelected.has(id)) fvSelected.delete(id);
        else if(fvSelected.size < fvTargetSize) fvSelected.add(id);
        renderPlayerGrid(els.fvPlayers, allPlayers, fvSelected, handleFvClick, p => p.id === myId);
        els.btnConfirmFv.disabled = fvSelected.size !== fvTargetSize;
      };
      renderPlayerGrid(els.fvPlayers, allPlayers, fvSelected, handleFvClick, p => p.id === myId);
      showPanel(els.pFinalVote);
    } else {
      els.waitingMsg.textContent = "Good players are casting final votes...";
      showPanel(els.pWaiting);
    }
  }
  }; // end runPhaseLogic
  
  if (ph === 'LEADER_SELECTS_TEAM' && viewRole.classList.contains('active')) {
    viewRole.classList.add('fade-out');
    setTimeout(() => {
      showView(viewGame);
      viewRole.classList.remove('fade-out');
      runPhaseLogic();
    }, 500);
  } else {
    showView(viewGame);
    runPhaseLogic();
  }
}

function updateLsUI(tokenAvail) {
  renderPlayerGrid(els.lsGrid, allPlayers, lsSelectedTeam, (id, el) => {
    if(lsSelectedTeam.has(id)) lsSelectedTeam.delete(id);
    else if(lsSelectedTeam.size < lsTargetSize) lsSelectedTeam.add(id);
    updateLsUI(tokenAvail);
  });
  
  els.btnConfirmTeam.disabled = lsSelectedTeam.size !== lsTargetSize;
  
  if(tokenAvail && lsSelectedTeam.size > 0) {
    els.lsTokenRow.classList.remove('hidden');
    const teamPs = allPlayers.filter(p => lsSelectedTeam.has(p.id));
    renderPlayerGrid(els.lsTokenGrid, teamPs, new Set([lsSelectedToken]), (id, el) => {
      lsSelectedToken = id;
      els.btnTokenNone.className = 'btn btn-ghost';
      updateLsUI(tokenAvail);
    });
  } else {
    els.lsTokenRow.classList.add('hidden');
    lsSelectedToken = null;
  }
}

function updateNlUI() {
  els.btnConfirmNl.disabled = !nlSelectedLeader;
}

function updateAsUI() {
  els.btnConfirmAs.disabled = !asSelectedAmulet && !els.btnAsNoAmulet.classList.contains('btn-primary');
}

function handleQuestResult(msg) {
  els.qrTitle.textContent = `Quest ${msg.questIndex + 1} Result`;
  els.qrCounts.textContent = `${msg.successes} Success, ${msg.fails} Fail`;
  els.qrTokens.innerHTML = '';
  
  questResults[msg.questIndex] = { passed: msg.passed, successes: msg.successes, fails: msg.fails };
  
  msg.shuffledVotes.forEach((v, i) => {
    const t = document.createElement('div');
    t.className = `qr-token ${v}`;
    t.textContent = v === 'success' ? '✔' : '✘';
    els.qrTokens.appendChild(t);
    setTimeout(() => t.classList.add('show'), i * 800 + 200);
  });
  
  showPanel(els.pQuestResult);
  
  // Update board visually
  const slot = els.questTrack.children[msg.questIndex]?.querySelector('.quest-circle');
  if(slot) {
    slot.classList.remove('active');
    slot.classList.add(msg.passed ? 'passed' : 'failed');
    slot.textContent = msg.passed ? '✔' : '✘';
  }
}

function handleGameOver(msg) {
  els.goBanner.className = `gameover-banner ${msg.winner}`;
  els.goTitle.textContent = `${msg.winner.toUpperCase()} WINS`;
  els.goReason.textContent = msg.reason;
  
  els.rolesReveal.innerHTML = '';
  msg.allRoles.forEach(r => {
    const c = document.createElement('div');
    c.className = `reveal-card ${r.team}`;
    c.innerHTML = `<div class="rc-name">${r.name}</div><div class="rc-role">${r.roleName}</div><div class="rc-team">${r.team}</div>`;
    els.rolesReveal.appendChild(c);
  });
  
  renderBoard(questResults, els.goQuestTrack);
  showView(viewGameover);
}

// ── Event Listeners ─────────────────────────────────────────────────────────
els.btnJoin.onclick = connect;
els.ip.onkeypress = (e) => { if(e.key==='Enter') connect(); };
els.name.onkeypress = (e) => { if(e.key==='Enter') connect(); };

els.btnReady.onclick = () => {
  const ready = els.btnReady.textContent === "Ready";
  send({type: 'ready', ready});
};

els.btnRoleOk.onclick = () => {
  els.btnRoleOk.textContent = "Waiting for others...";
  els.btnRoleOk.disabled = true;
  send({type: 'role_ready'});
};

// Leader Select
els.btnTokenNone.onclick = () => {
  lsSelectedToken = null;
  els.btnTokenNone.className = 'btn btn-primary';
  document.querySelectorAll('#ls-token-players .select-tile').forEach(c => c.classList.remove('selected'));
};
els.btnConfirmTeam.onclick = () => send({type:'select_team', team: Array.from(lsSelectedTeam), magicTokenTo: lsSelectedToken});

// Voting
els.btnVoteSuccess.onclick = () => {
  send({type:'vote', vote:'success'});
  els.btnVoteSuccess.classList.add('hidden'); els.btnVoteFail.classList.add('hidden'); els.voteSubmitted.classList.remove('hidden');
};
els.btnVoteFail.onclick = () => {
  send({type:'vote', vote:'fail'});
  els.btnVoteSuccess.classList.add('hidden'); els.btnVoteFail.classList.add('hidden'); els.voteSubmitted.classList.remove('hidden');
};

// Next Leader
els.btnConfirmNl.onclick = () => send({type:'select_next_leader', leaderId: nlSelectedLeader});

// Amulet Selection
els.btnAsNoAmulet.onclick = () => {
  asSelectedAmulet = null;
  els.btnAsNoAmulet.className = 'btn btn-primary';
  document.querySelectorAll('#as-amulet-list .select-tile').forEach(c => c.classList.remove('selected'));
  updateAsUI();
};
els.btnConfirmAs.onclick = () => send({type:'select_amulet', amuletTo: asSelectedAmulet});

// Amulet Check
els.btnConfirmAc.onclick = () => send({type:'amulet_check', targetId: acSelectedTarget});

// Trickster
els.btnTricksterTruth.onclick = () => { send({type:'trickster_choice', lie: false}); showPanel(els.pWaiting); };
els.btnTricksterLie.onclick = () => { send({type:'trickster_choice', lie: true}); showPanel(els.pWaiting); };

// Final Disc
els.btnFinalReady.onclick = () => {
  const r = els.btnFinalReady.textContent.includes("Ready to Vote");
  send({type:'final_ready', ready: r});
  els.btnFinalReady.textContent = r ? "Wait, not ready" : "I'm Ready to Vote";
  els.btnFinalReady.className = "btn " + (r ? "btn-ghost" : "btn-primary");
};

// Hunt
els.btnHuntSkip.onclick = () => send({type:'hunt_activate', activate: false});
els.btnHuntAct.onclick = () => send({type:'hunt_activate', activate: true});
els.btnHuntConfirm.onclick = () => {
  const guesses = [];
  document.querySelectorAll('.hunt-guess-row').forEach(row => {
    const p = row.querySelector('.hunt-player-select').value;
    const r = row.querySelector('.hunt-role-select').value;
    if(p && r) guesses.push({playerId: p, roleId: r});
  });
  if(guesses.length === 2) send({type:'hunt_guess', guesses});
  else alert('Please make 2 complete guesses.');
};

// Final Vote
els.btnConfirmFv.onclick = () => {
  send({type:'final_vote', guesses: Array.from(fvSelected)});
  els.btnConfirmFv.classList.add('hidden'); els.fvPlayers.classList.add('hidden'); els.fvSubmitted.classList.remove('hidden');
};

// Game Over
els.btnPlayAgain.onclick = () => {
  send({type:'play_again'});
  showView(viewLobby);
};

// Start
els.ip.value = localStorage.getItem('quest_ip') || '';
els.port.value = localStorage.getItem('quest_port') || '3000';
els.name.value = localStorage.getItem('quest_name') || '';
showView(viewConnect);
