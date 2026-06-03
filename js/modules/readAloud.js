// ============================================
// READ ALOUD MODULE
// Paste text, read aloud, get WPM + filler stats
// ============================================

const ReadAloudModule = (function() {

  const FILLER_WORDS = ['um','uh','er','like','you know','i mean','actually','basically',
    'literally','sort of','kind of','right','so','well','okay'];

  const SAMPLE_TEXT = `Good communication is one of the most valuable skills you can develop. Whether you are speaking to a colleague, presenting to an audience, or simply having a conversation with a friend, the ability to express yourself clearly and confidently makes a profound difference. Strong speakers choose their words deliberately, vary their pace, and pause with purpose rather than filling silence with hesitation. The good news is that eloquence is not a talent you are born with — it is a skill you can practice, refine, and master over time. Every sentence you speak is an opportunity to improve.`;

  const POEMS = [
    {
      title: 'Ode',
      author: 'Arthur O\'Shaughnessy',
      url: 'https://www.poetryfoundation.org/poems/54933/ode-',
      text: `We are the music makers,\nAnd we are the dreamers of dreams,\nWandering by lone sea-breakers,\nAnd sitting by desolate streams;\nWorld-losers and world-forsakers,\nOn whom the pale moon gleams:\nYet we are the movers and shakers\nOf the world for ever, it seems.`
    },
    {
      title: 'Invictus',
      author: 'William Ernest Henley',
      url: 'https://www.poetryfoundation.org/poems/51642/invictus',
      text: `Out of the night that covers me,\nBlack as the pit from pole to pole,\nI thank whatever gods may be\nFor my unconquerable soul.\n\nIn the fell clutch of circumstance\nI have not winced nor cried aloud.\nUnder the bludgeonings of chance\nMy head is bloody, but unbowed.\n\nBeyond this place of wrath and tears\nLooms but the Horror of the shade,\nAnd yet the menace of the years\nFinds and shall find me unafraid.\n\nIt matters not how strait the gate,\nHow charged with punishments the scroll,\nI am the master of my fate,\nI am the captain of my soul.`
    },
    {
      title: 'Still I Rise',
      author: 'Maya Angelou',
      url: 'https://www.poetryfoundation.org/poems/46446/still-i-rise',
      text: `You may write me down in history\nWith your bitter, twisted lies,\nYou may trod me in the very dirt\nBut still, like dust, I'll rise.\n\nDoes my sassiness upset you?\nWhy are you beset with gloom?\n'Cause I walk like I've got oil wells\nPumping in my living room.\n\nJust like moons and like suns,\nWith the certainty of tides,\nJust like hopes springing high,\nStill I'll rise.\n\nOut of the huts of history's shame\nI rise\nUp from a past that's rooted in pain\nI rise\nI'm a black ocean, leaping and wide,\nWelling and swelling I bear in the tide.\nLeaving behind nights of terror and fear\nI rise\nInto a daybreak that's wondrously clear\nI rise\nBringing the gifts that my ancestors gave,\nI am the dream and the hope of the slave.\nI rise\nI rise\nI rise.`
    },
    {
      title: 'If—',
      author: 'Rudyard Kipling',
      url: 'https://allpoetry.com/On-Raglan-Road',
      text: `If you can keep your head when all about you\nAre losing theirs and blaming it on you,\nIf you can trust yourself when all men doubt you,\nBut make allowance for their doubting too;\nIf you can wait and not be tired by waiting,\nOr being lied about, don't deal in lies,\nOr being hated, don't give way to hating,\nAnd yet don't look too good, nor talk too wise:\n\nIf you can dream—and not make dreams your master;\nIf you can think—and not make thoughts your aim;\nIf you can meet with Triumph and Disaster\nAnd treat those two impostors just the same;\nIf you can bear to hear the truth you've spoken\nTwisted by knaves to make a trap for fools,\nOr watch the things you gave your life to, broken,\nAnd stoop and build 'em up with worn-out tools:\n\nIf you can make one heap of all your winnings\nAnd risk it on one turn of pitch-and-toss,\nAnd lose, and start again at your beginnings\nAnd never breathe a word about your loss;\nIf you can force your heart and nerve and sinew\nTo serve your turn long after they are gone,\nAnd so hold on when there is nothing in you\nExcept the Will which says to them: 'Hold on!'\n\nIf you can talk with crowds and keep your virtue,\nOr walk with Kings—nor lose the common touch,\nIf neither foes nor loving friends can hurt you,\nIf all men count with you, but none too much;\nIf you can fill the unforgiving minute\nWith sixty seconds' worth of distance run,\nYours is the Earth and everything that's in it,\nAnd—which is more—you'll be a Man, my son!`
    },
    {
      title: 'Do Not Go Gentle into That Good Night',
      author: 'Dylan Thomas',
      url: 'https://www.poetryfoundation.org/poems/46569/do-not-go-gentle-into-that-good-night',
      text: `Do not go gentle into that good night,\nOld age should burn and rave at close of day;\nRage, rage against the dying of the light.\n\nThough wise men at their end know dark is right,\nBecause their words had forked no lightning they\nDo not go gentle into that good night.\n\nGood men, the last wave by, crying how bright\nTheir frail deeds might have danced in a green bay,\nRage, rage against the dying of the light.\n\nWild men who caught and sang the sun in flight,\nAnd learn, too late, they grieved it on its way,\nDo not go gentle into that good night.\n\nGrave men, near death, who see with blinding sight\nBlind eyes could blaze like meteors and be gay,\nRage, rage against the dying of the light.\n\nAnd you, my father, there on the sad height,\nCurse, bless, me now with your fierce tears, I pray.\nDo not go gentle into that good night.\nRage, rage against the dying of the light.`
    },
    {
      title: 'High Flight',
      author: 'John Gillespie Magee',
      url: 'https://www.poetryfoundation.org/poems/157986/high-flight-627d3cfb1e9b7',
      text: `Oh! I have slipped the surly bonds of Earth\nAnd danced the skies on laughter-silvered wings;\nSunward I've climbed, and joined the tumbling mirth\nOf sun-split clouds, — and done a hundred things\nYou have not dreamed of — wheeled and soared and swung\nHigh in the sunlit silence. Hov'ring there,\nI've chased the shouting wind along, and flung\nMy eager craft through footless halls of air....\n\nUp, up the long, delirious burning blue\nI've topped the wind-swept heights with easy grace\nWhere never lark, or ever eagle flew —\nAnd, while with silent, lifting mind I've trod\nThe high untrespassed sanctity of space,\nPut out my hand, and touched the face of God.`
    },
    {
      title: 'To Autumn',
      author: 'John Keats',
      url: 'https://www.poetryfoundation.org/poems/44484/to-autumn',
      text: `Season of mists and mellow fruitfulness,\nClose bosom-friend of the maturing sun;\nConspiring with him how to load and bless\nWith fruit the vines that round the thatch-eves run;\nTo bend with apples the moss'd cottage-trees,\nAnd fill all fruit with ripeness to the core;\nTo swell the gourd, and plump the hazel shells\nWith a sweet kernel; to set budding more,\nAnd still more, later flowers for the bees,\nUntil they think warm days will never cease,\nFor Summer has o'er-brimm'd their clammy cells.\n\nWho hath not seen thee oft amid thy store?\nSometimes whoever seeks abroad may find\nThee sitting careless on a granary floor,\nThy hair soft-lifted by the winnowing wind;\nOr on a half-reap'd furrow sound asleep,\nDrows'd with the fume of poppies, while thy hook\nSpares the next swath and all its twined flowers:\nAnd sometimes like a gleaner thou dost keep\nSteady thy laden head across a brook;\nOr by a cider-press, with patient look,\nThou watchest the last oozings hours by hours.\n\nWhere are the songs of Spring? Ay, where are they?\nThink not of them, thou hast thy music too,—\nWhile barred clouds bloom the soft-dying day,\nAnd touch the stubble-plains with rosy hue;\nThen in a wailful choir the small gnats mourn\nAmong the river sallows, borne aloft\nOr sinking as the light wind lives or dies;\nAnd full-grown lambs loud bleat from hilly bourn;\nHedge-crickets sing; and now with treble soft\nThe red-breast whistles from a garden-croft;\nAnd gathering swallows twitter in the skies.`
    },
    {
      title: 'Ode on a Grecian Urn',
      author: 'John Keats',
      url: 'https://www.poetryfoundation.org/poems/44477/ode-on-a-grecian-urn',
      text: `Thou still unravish'd bride of quietness,\nThou foster-child of silence and slow time,\nSylvan historian, who canst thus express\nA flowery tale more sweetly than our rhyme:\nWhat leaf-fring'd legend haunts about thy shape\nOf deities or mortals, or of both,\nIn Tempe or the dales of Arcady?\nWhat men or gods are these? What maidens loth?\nWhat mad pursuit? What struggle to escape?\nWhat pipes and timbrels? What wild ecstasy?\n\nHeard melodies are sweet, but those unheard\nAre sweeter; therefore, ye soft pipes, play on;\nNot to the sensual ear, but, more endear'd,\nPipe to the spirit ditties of no tone:\nFair youth, beneath the trees, thou canst not leave\nThy song, nor ever can those trees be bare;\nBold Lover, never, never canst thou kiss,\nThough winning near the goal yet, do not grieve;\nShe cannot fade, though thou hast not thy bliss,\nFor ever wilt thou love, and she be fair!\n\nBeauty is truth, truth beauty, — that is all\nYe know on earth, and all ye need to know.`
    }
  ];

  let recognition = null;
  let isRecording = false;
  let startTime = null;
  let elapsedInterval = null;
  let finalTranscript = '';
  let fillerCount = 0;
  let fillerBreakdown = {};
  let currentText = '';

  function init() {
    const startBtn = document.getElementById('readaloud-start-btn');
    const stopBtn = document.getElementById('readaloud-stop-btn');
    const sampleBtn = document.getElementById('readaloud-sample-btn');
    const retryBtn = document.getElementById('readaloud-retry-btn');
    const newBtn = document.getElementById('readaloud-new-btn');
    const textInput = document.getElementById('readaloud-text-input');
    const poemBtn = document.getElementById('readaloud-poem-btn');
    const poemPicker = document.getElementById('readaloud-poem-picker');

    if (!startBtn) return;

    if (!DeepgramSTT.isSupported()) {
      document.getElementById('readaloud-unsupported-msg').style.display = 'block';
      startBtn.disabled = true;
    }

    textInput.addEventListener('input', updateEstTime);

    sampleBtn.addEventListener('click', function() {
      textInput.value = SAMPLE_TEXT;
      updateEstTime();
      if (poemPicker) poemPicker.style.display = 'none';
    });

    if (poemBtn && poemPicker) {
      renderPoemPicker(poemPicker, textInput);
      poemBtn.addEventListener('click', function() {
        poemPicker.style.display = poemPicker.style.display === 'none' ? '' : 'none';
      });
    }

    startBtn.addEventListener('click', startSession);
    stopBtn.addEventListener('click', stopSession);
    retryBtn.addEventListener('click', retrySession);
    newBtn.addEventListener('click', newText);
  }

  function renderPoemPicker(container, textInput) {
    container.innerHTML = POEMS.map((p, i) => `
      <div class="poem-picker-item" data-idx="${i}" style="display:flex; align-items:center; justify-content:space-between; padding: 8px 10px; border-radius: 6px; cursor:pointer; gap: 8px;">
        <div>
          <div style="font-weight:600; font-size: var(--font-size-sm);">${p.title}</div>
          <div style="font-size: var(--font-size-xs, 11px); color: var(--text-secondary);">${p.author}</div>
        </div>
        <button class="btn btn-secondary btn-sm poem-load-btn" data-idx="${i}" style="flex-shrink:0; font-size:12px; padding:4px 10px;">Load</button>
      </div>
    `).join('');

    container.querySelectorAll('.poem-load-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const poem = POEMS[parseInt(btn.dataset.idx)];
        textInput.value = poem.title + ' by ' + poem.author + '\n\n' + poem.text;
        document.getElementById('readaloud-poem-picker').style.display = 'none';
        updateEstTime();
      });
    });
  }

  function updateEstTime() {
    const text = document.getElementById('readaloud-text-input').value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    const estSeconds = Math.round((wordCount / 150) * 60); // ~150 WPM average
    const estEl = document.getElementById('readaloud-est-time');
    if (!estEl) return;
    if (wordCount === 0) {
      estEl.textContent = '—';
    } else if (estSeconds < 60) {
      estEl.textContent = `~${estSeconds}s`;
    } else {
      const m = Math.floor(estSeconds / 60);
      const s = estSeconds % 60;
      estEl.textContent = `~${m}m ${s}s`;
    }
  }

  function startSession() {
    const text = document.getElementById('readaloud-text-input').value.trim();
    if (!text) {
      alert('Please paste some text first.');
      return;
    }

    currentText = text;
    finalTranscript = '';
    fillerCount = 0;
    fillerBreakdown = {};

    document.getElementById('readaloud-setup').style.display = 'none';
    document.getElementById('readaloud-results').style.display = 'none';
    document.getElementById('readaloud-active').style.display = '';

    renderScript(text);
    startTime = Date.now();
    updateElapsed();
    elapsedInterval = setInterval(updateElapsed, 1000);

    setupRecognition();
  }

  function renderScript(text) {
    const el = document.getElementById('readaloud-script-display');
    if (!el) return;
    // Wrap each word in a span for potential future highlighting
    const words = text.split(/(\s+)/);
    el.innerHTML = words.map((w, i) => {
      if (/\S/.test(w)) return `<span class="script-word" data-idx="${i}">${w}</span>`;
      return w;
    }).join('');
  }

  function setupRecognition() {
    if (!DeepgramSTT.isSupported()) return;

    recognition = new DeepgramSTT();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          countFillers(transcript);
          updateLiveStats();
        } else {
          interim = transcript;
        }
      }
      const statusEl = document.getElementById('readaloud-status');
      if (statusEl) statusEl.textContent = interim ? `Hearing: "${interim}"` : '';
    };

    recognition.onerror = function(e) {
      if (e.error !== 'no-speech') {
        const statusEl = document.getElementById('readaloud-status');
        if (statusEl) statusEl.textContent = 'Mic error: ' + e.error;
      }
    };

    recognition.onend = function() {
      if (isRecording) recognition.start();
    };

    isRecording = true;
    recognition.start();
  }

  function countFillers(text) {
    const lower = text.toLowerCase();
    FILLER_WORDS.forEach(f => {
      const regex = new RegExp('\\b' + f.replace(/\s+/g, '\\s+') + '\\b', 'gi');
      const matches = lower.match(regex);
      if (matches) {
        fillerCount += matches.length;
        fillerBreakdown[f] = (fillerBreakdown[f] || 0) + matches.length;
      }
    });
  }

  function updateLiveStats() {
    const wpmEl = document.getElementById('readaloud-wpm');
    const fillersEl = document.getElementById('readaloud-fillers');
    if (!wpmEl) return;

    const words = finalTranscript.trim().split(/\s+/).filter(Boolean).length;
    const elapsedMin = (Date.now() - startTime) / 60000;
    const wpm = elapsedMin > 0 ? Math.round(words / elapsedMin) : 0;

    wpmEl.textContent = wpm || '—';
    fillersEl.textContent = fillerCount;
  }

  function updateElapsed() {
    const el = document.getElementById('readaloud-elapsed');
    if (!el || !startTime) return;
    const sec = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    updateLiveStats();
  }

  function stopSession() {
    isRecording = false;
    if (recognition) { try { recognition.stop(); } catch(e) {} }
    clearInterval(elapsedInterval);

    document.getElementById('readaloud-active').style.display = 'none';
    showResults();
  }

  function showResults() {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const words = finalTranscript.trim().split(/\s+/).filter(Boolean).length;
    const elapsedMin = elapsedSec / 60;
    const wpm = elapsedMin > 0 ? Math.round(words / elapsedMin) : 0;
    const targetWords = currentText.trim().split(/\s+/).length;
    const coverage = targetWords > 0 ? Math.min(100, Math.round((words / targetWords) * 100)) : 0;

    let wpmRating = '';
    if (wpm < 100) wpmRating = 'Too slow — aim for 130–160 WPM';
    else if (wpm < 130) wpmRating = 'A bit slow — ideal for careful reading';
    else if (wpm <= 170) wpmRating = 'Great pace!';
    else wpmRating = 'A bit fast — try slowing down';

    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;

    const resultsGrid = document.getElementById('readaloud-results-grid');
    resultsGrid.innerHTML = [
      { label: 'Words per Minute', value: wpm || '—', note: wpmRating },
      { label: 'Filler Words', value: fillerCount, note: fillerCount === 0 ? 'Perfect!' : fillerCount <= 3 ? 'Very good' : 'Work on reducing these' },
      { label: 'Time Elapsed', value: `${m}:${s.toString().padStart(2,'0')}`, note: '' },
      { label: 'Text Coverage', value: `${coverage}%`, note: coverage >= 90 ? 'Full read-through' : 'Partial session' }
    ].map(r => `
      <div style="background: var(--bg-main); border-radius: var(--border-radius-sm); padding: var(--spacing-md); text-align: center;">
        <div style="font-size: var(--font-size-xxl); font-weight: 700; color: var(--primary-color);">${r.value}</div>
        <div style="font-weight: 600; color: var(--text-primary); margin: 4px 0;">${r.label}</div>
        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">${r.note}</div>
      </div>
    `).join('');

    const breakdownEl = document.getElementById('readaloud-filler-breakdown');
    if (fillerCount > 0) {
      const items = Object.entries(fillerBreakdown).sort((a,b) => b[1]-a[1]);
      breakdownEl.innerHTML = `
        <div style="background: var(--bg-main); border-radius: var(--border-radius-sm); padding: var(--spacing-md);">
          <strong>Filler word breakdown:</strong>
          <div style="margin-top: var(--spacing-sm); display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
            ${items.map(([w, c]) => `<span style="background: var(--accent-color); color: white; padding: 2px 10px; border-radius: 999px; font-size: var(--font-size-sm);">${w}: ${c}</span>`).join('')}
          </div>
        </div>
      `;
    } else {
      breakdownEl.innerHTML = '';
    }

    // Log to progress charts (cloud-synced)
    if (typeof ProgressChartsModule !== 'undefined') {
      ProgressChartsModule.logSpeechSession(wpm, fillerCount);
    }

    // Track Polish session count
    var _pdata = StorageManager.load();
    _pdata.stats.polishSessionsCompleted = (_pdata.stats.polishSessionsCompleted || 0) + 1;
    StorageManager.save(_pdata);

    // Nudge toward Practice after a Read Aloud session
    if (typeof NudgeModule !== 'undefined') {
      NudgeModule.show(
        'nudge-readaloud-done',
        'Nice session. Try retelling that passage in your own words — head to Storytelling.',
        'Go to Practice',
        'storytelling',
        'storytelling'
      );
    }

    renderReadAloudAIButton(currentText, finalTranscript);

    document.getElementById('readaloud-results').style.display = '';
  }

  function renderReadAloudAIButton(passage, transcript) {
    const resultsEl = document.getElementById('readaloud-results');
    if (!resultsEl) return;

    const existing = resultsEl.querySelector('.ai-feedback-area');
    if (existing) existing.remove();

    if (!transcript.trim()) return;

    const area = document.createElement('div');
    area.className = 'ai-feedback-area';
    area.style.cssText = 'margin-bottom: var(--spacing-lg);';

    // Check cache
    const cacheKey = passage.slice(0, 60) + '|' + transcript.slice(0, 60) + '|' + transcript.length;
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem('ai_feedback_cache')) || {}; } catch {}
    if (cache[cacheKey]) {
      area.appendChild(buildReadAloudCard(cache[cacheKey]));
      // Insert before the buttons
      const controls = resultsEl.querySelector('.exercise-controls');
      if (controls) resultsEl.insertBefore(area, controls);
      else resultsEl.appendChild(area);
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.style.cssText = 'width: 100%; margin-bottom: var(--spacing-md);';
    btn.textContent = 'Get AI Feedback';

    btn.addEventListener('click', async function() {
      btn.disabled = true;
      btn.textContent = 'Getting AI feedback...';
      try {
        const res = await fetch('/.netlify/functions/claude-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: 'read_aloud_feedback', payload: { passage, transcript } })
        });
        if (!res.ok) throw new Error('Server error ' + res.status);
        const data = await res.json();
        let freshCache = {};
        try { freshCache = JSON.parse(localStorage.getItem('ai_feedback_cache')) || {}; } catch {}
        freshCache[cacheKey] = data;
        try { localStorage.setItem('ai_feedback_cache', JSON.stringify(freshCache)); } catch {}
        area.innerHTML = '';
        area.appendChild(buildReadAloudCard(data));
      } catch {
        btn.disabled = false;
        btn.textContent = 'Get AI Feedback';
      }
    });

    area.appendChild(btn);
    const controls = resultsEl.querySelector('.exercise-controls');
    if (controls) resultsEl.insertBefore(area, controls);
    else resultsEl.appendChild(area);
  }

  function buildReadAloudCard(data) {
    const card = document.createElement('div');
    card.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: var(--spacing-md);';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);';
    header.innerHTML = '<span style="font-weight: 600; font-size: var(--font-size-base);">AI Feedback</span>';
    card.appendChild(header);

    [['Coverage', 'coverage'], ['Delivery', 'delivery'], ['Accuracy', 'accuracy']].forEach(([label, key]) => {
      if (!data[key]) return;
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom: var(--spacing-sm);';
      row.innerHTML = `<span style="font-weight: 600; font-size: var(--font-size-sm);">${label}:</span> <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${data[key]}</span>`;
      card.appendChild(row);
    });

    if (data.tip) {
      const tip = document.createElement('div');
      tip.style.cssText = 'margin-top: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); background: var(--bg-secondary); border-left: 3px solid var(--primary-color); border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0; font-size: var(--font-size-sm);';
      tip.innerHTML = `<strong>Tip:</strong> ${data.tip}`;
      card.appendChild(tip);
    }

    return card;
  }

  function retrySession() {
    document.getElementById('readaloud-results').style.display = 'none';
    document.getElementById('readaloud-setup').style.display = '';
    // Keep the same text
  }

  function newText() {
    document.getElementById('readaloud-results').style.display = 'none';
    document.getElementById('readaloud-text-input').value = '';
    document.getElementById('readaloud-est-time').textContent = '—';
    document.getElementById('readaloud-setup').style.display = '';
  }

  function refresh() {
    init();
  }

  return {
    init: init,
    refresh: refresh
  };
})();

