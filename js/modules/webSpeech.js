// ============================================
// WEB SPEECH MODULE
// Impromptu speaking with live speech-to-text
// and post-session feedback metrics
// ============================================

const WebSpeechModule = (function() {

  // ── Topics (used by the Web Speech Test tab's own topic loader) ──────────
  const topics = [
    "If you could have dinner with anyone in history, who would it be and why?",
    "Describe a challenge you faced and how you overcame it.",
    "What is one skill everyone should learn, and why?",
    "Talk about a place you would love to visit and what draws you to it.",
    "What does success mean to you?",
    "Describe a person who has had a big influence on your life.",
    "If you could change one thing about your city, what would it be?",
    "What is your favorite book, film, or show and what makes it special?",
    "Describe a time when you learned something unexpected.",
    "What hobby would you pick up if time and money were no object?",
    "Talk about a moment you felt proud of yourself.",
    "What is something you wish more people understood?",
    "If you could live in any time period, when would it be and why?",
    "Describe your ideal day from start to finish.",
    "What does being a good communicator mean to you?",
    "Tell a story about a time things didn't go as planned.",
    "What is something small that brings you a lot of joy?",
    "If you had to give a five-minute talk on any topic, what would you choose?",
    "Describe a place that has special meaning to you.",
    "What advice would you give your younger self?"
  ];

  // ── Filler words list ────────────────────────────────────────────────────
  const FILLER_WORDS = [
    'um', 'uh', 'er', 'like', 'basically', 'literally', 'actually',
    'you know', 'i mean', 'sort of', 'kind of', 'right', 'okay so',
    'so basically', 'you see', 'well'
  ];

  // ── Weak/vague words with replacements ──────────────────────────────────
  const WEAK_WORDS_MAP = {
    'good':      ['excellent', 'exceptional', 'remarkable', 'outstanding', 'superb'],
    'bad':       ['detrimental', 'inadequate', 'problematic', 'substandard', 'inferior'],
    'nice':      ['pleasant', 'delightful', 'agreeable', 'charming', 'refined'],
    'great':     ['extraordinary', 'magnificent', 'impressive', 'phenomenal', 'noteworthy'],
    'awesome':   ['remarkable', 'extraordinary', 'astounding', 'breathtaking', 'formidable'],
    'terrible':  ['dreadful', 'appalling', 'atrocious', 'deplorable', 'grievous'],
    'horrible':  ['horrific', 'ghastly', 'abhorrent', 'revolting', 'abysmal'],
    'very':      ['exceptionally', 'remarkably', 'considerably', 'extraordinarily', 'profoundly'],
    'really':    ['genuinely', 'truly', 'certainly', 'decidedly', 'undeniably'],
    'pretty':    ['fairly', 'moderately', 'notably', 'considerably', 'rather'],
    'thing':     ['element', 'aspect', 'factor', 'component', 'matter'],
    'stuff':     ['material', 'substance', 'content', 'elements', 'particulars'],
    'get':       ['obtain', 'acquire', 'achieve', 'attain', 'secure'],
    'got':       ['obtained', 'acquired', 'achieved', 'attained', 'secured'],
    'big':       ['substantial', 'significant', 'considerable', 'extensive', 'prominent'],
    'small':     ['modest', 'minimal', 'marginal', 'limited', 'compact'],
    'a lot':     ['considerably', 'substantially', 'extensively', 'abundantly', 'greatly'],
    'lots':      ['numerous', 'abundant', 'plentiful', 'a great deal of', 'considerable'],
    'many':      ['numerous', 'various', 'several', 'a multitude of', 'countless'],
    'some':      ['several', 'a number of', 'certain', 'various', 'particular']
  };
  const WEAK_WORDS = Object.keys(WEAK_WORDS_MAP);

  // ═══════════════════════════════════════════════════════════════════════════
  // SHARED ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════

  function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z\s']/g, '').split(/\s+/).filter(w => w.length > 0);
  }

  function calcWPM(words, seconds) {
    if (seconds < 1) return 0;
    return Math.round((words.length / seconds) * 60);
  }

  function calcFillers(text) {
    const lower = text.toLowerCase();
    const breakdown = {};
    let total = 0;
    const sorted = [...FILLER_WORDS].sort((a, b) => b.split(' ').length - a.split(' ').length);
    sorted.forEach(filler => {
      const regex = new RegExp('\\b' + filler.replace(/\s+/g, '\\s+') + '\\b', 'gi');
      const matches = lower.match(regex);
      if (matches && matches.length > 0) {
        breakdown[filler] = matches.length;
        total += matches.length;
      }
    });
    return { total, breakdown };
  }

  function calcDiversity(words) {
    if (words.length === 0) return 0;
    return Math.round((new Set(words).size / words.length) * 100);
  }

  function calcConfidence(wpm, fillerTotal, weakTotal, wordCount) {
    if (wordCount === 0) return 0;
    // WPM score: 100 at ideal range, drops off outside it
    let wpmScore;
    if (wpm >= 130 && wpm <= 160) wpmScore = 100;
    else if (wpm >= 110 && wpm < 130) wpmScore = 60 + (wpm - 110) * 2;
    else if (wpm > 160 && wpm <= 190) wpmScore = 100 - (wpm - 160) * 1.5;
    else if (wpm < 110 && wpm > 0)   wpmScore = Math.max(0, wpm - 60);
    else if (wpm > 190)              wpmScore = Math.max(0, 55 - (wpm - 190) * 2);
    else wpmScore = 0;
    // Filler score: 0 fillers = 100, degrades with rate
    const fillerRate = (fillerTotal / wordCount) * 100;
    const fillerScore = Math.max(0, 100 - fillerRate * 12);
    // Weak word score: 0 weak words = 100, degrades with rate
    const weakRate = (weakTotal / wordCount) * 100;
    const weakScore = Math.max(0, 100 - weakRate * 8);
    return Math.round(wpmScore * 0.4 + fillerScore * 0.4 + weakScore * 0.2);
  }

  function rateConfidence(score) {
    if (score === 0)  return { label: 'No speech detected', color: '#aaa' };
    if (score >= 75)  return { label: 'Sounds confident', color: '#27ae60' };
    if (score >= 50)  return { label: 'Mostly confident', color: '#27ae60' };
    if (score >= 25)  return { label: 'Building confidence', color: '#f39c12' };
    return            { label: 'Needs work', color: '#e74c3c' };
  }

  function calcWeakWords(words) {
    const breakdown = {};
    let total = 0;
    WEAK_WORDS.forEach(weak => {
      const count = words.filter(w => w === weak).length;
      if (count > 0) {
        breakdown[weak] = { count, replacements: WEAK_WORDS_MAP[weak] || [] };
        total += count;
      }
    });
    return { total, breakdown };
  }

  // ── Rating helpers ────────────────────────────────────────────────────────

  function rateWPM(wpm) {
    if (wpm === 0)   return { label: 'No speech detected', color: '#aaa' };
    if (wpm < 100)   return { label: 'Too slow', color: '#e74c3c' };
    if (wpm < 130)   return { label: 'A bit slow', color: '#f39c12' };
    if (wpm <= 160)  return { label: 'Great pace', color: '#27ae60' };
    if (wpm <= 190)  return { label: 'A bit fast', color: '#f39c12' };
    return           { label: 'Too fast', color: '#e74c3c' };
  }

  function rateFillers(total, words) {
    if (words === 0) return { label: 'No speech', color: '#aaa' };
    const rate = (total / words) * 100;
    if (rate === 0)  return { label: 'Excellent — none detected', color: '#27ae60' };
    if (rate < 3)    return { label: 'Good — very few fillers', color: '#27ae60' };
    if (rate < 7)    return { label: 'Fair — reduce filler words', color: '#f39c12' };
    return           { label: 'Needs work — too many fillers', color: '#e74c3c' };
  }

  function rateDiversity(pct) {
    if (pct === 0)  return { label: 'No speech', color: '#aaa' };
    if (pct >= 70)  return { label: 'Excellent variety', color: '#27ae60' };
    if (pct >= 55)  return { label: 'Good variety', color: '#27ae60' };
    if (pct >= 40)  return { label: 'Fair — try more varied words', color: '#f39c12' };
    return          { label: 'Low variety — expand your vocabulary', color: '#e74c3c' };
  }

  function rateSentenceLength(avg) {
    if (avg === 0)  return { label: 'No speech', color: '#aaa' };
    if (avg < 6)    return { label: 'Very short sentences', color: '#f39c12' };
    if (avg <= 20)  return { label: 'Good sentence length', color: '#27ae60' };
    if (avg <= 30)  return { label: 'Sentences are long', color: '#f39c12' };
    return          { label: 'Sentences are very long', color: '#e74c3c' };
  }

  function rateWeakWords(total, words) {
    if (words === 0) return { label: 'No speech', color: '#aaa' };
    const rate = (total / words) * 100;
    if (rate === 0)  return { label: 'Excellent — no weak words', color: '#27ae60' };
    if (rate < 5)    return { label: 'Good — few weak words', color: '#27ae60' };
    if (rate < 10)   return { label: 'Fair — replace some weak words', color: '#f39c12' };
    return           { label: 'Needs work — too many vague words', color: '#e74c3c' };
  }

  // ── Shared card renderer ─────────────────────────────────────────────────

  function buildWeakDrilldown(breakdown) {
    if (Object.keys(breakdown).length === 0) return '';
    const rows = Object.entries(breakdown).map(({ 0: word, 1: { count, replacements } }) => {
      const id = 'ws-weak-' + word.replace(/\s+/g, '-') + '-' + Date.now();
      const rList = replacements.map(r =>
        `<span style="display:inline-block; background: var(--primary-light); color: var(--text-white); border-radius: 12px; padding: 2px 10px; margin: 2px 3px 2px 0; font-size: var(--font-size-sm);">${r}</span>`
      ).join('');
      return `
        <div style="margin-bottom: var(--spacing-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; cursor:pointer; padding: 6px 8px; border-radius: var(--border-radius-sm); background: var(--bg-secondary);"
               onclick="document.getElementById('${id}').style.display = document.getElementById('${id}').style.display === 'none' ? 'block' : 'none'">
            <span style="font-weight:600;">"${word}" <span style="color:var(--text-secondary); font-weight:400;">×${count}</span></span>
            <span style="font-size: var(--font-size-sm); color: var(--primary-color);">show replacements ▾</span>
          </div>
          <div id="${id}" style="display:none; padding: 8px 8px 4px 8px;">
            <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 4px;">Try instead:</div>
            <div>${rList}</div>
          </div>
        </div>`;
    }).join('');

    const panelId = 'ws-weak-drilldown-' + Date.now();
    return `
      <div style="margin-top: var(--spacing-sm);">
        <button onclick="var p=document.getElementById('${panelId}'); p.style.display = p.style.display==='none'?'block':'none'; this.textContent = p.style.display==='none'?'▸ Show weak words used':'▾ Hide weak words used';"
                style="background:none; border:none; color:var(--primary-color); cursor:pointer; font-size:var(--font-size-sm); font-weight:600; padding:0;">
          ▸ Show weak words used
        </button>
        <div id="${panelId}" style="display:none; margin-top: var(--spacing-sm); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: var(--spacing-md);">
          ${rows}
        </div>
      </div>`;
  }

  function gradeIcon(color) {
    if (color === '#27ae60') return '<span style="color: #27ae60; font-size: 1.6em;">✓</span>';
    if (color === '#f39c12') return '<span style="color: #f39c12; font-size: 1.6em;">~</span>';
    if (color === '#e74c3c') return '<span style="color: #e74c3c; font-size: 1.6em;">✗</span>';
    return '';
  }

  function renderMetricCards(grid, metrics, weakBreakdown) {
    const isMobile = window.innerWidth < 768;
    const detailsId = 'ws-metric-details-' + Date.now();
    const startExpanded = !isMobile;

    // Summary row per metric (always visible)
    const summaryRows = metrics.map(m => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding: 7px 2px; border-bottom: 1px solid var(--border-color);">
        <span style="font-size:var(--font-size-sm); font-weight:600; color:var(--text-primary);">${m.title}</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:var(--font-size-sm); font-weight:600; color:${m.rating.color};">${m.rating.label}</span>
          ${gradeIcon(m.rating.color)}
        </div>
      </div>`).join('');

    // Full detail cards (collapsible)
    const detailCards = metrics.map(m => {
      const isVocab = m.title === 'Vocabulary Strength';
      const drilldown = isVocab ? buildWeakDrilldown(weakBreakdown) : '';
      return `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: 10px 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 600; font-size: var(--font-size-base);">${m.title}</span>
            ${gradeIcon(m.rating.color)}
          </div>
          <div style="font-size: var(--font-size-lg, 20px); font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${m.value}</div>
          <div style="font-size: var(--font-size-sm); font-weight: 600; color: ${m.rating.color}; margin-bottom: 2px;">${m.rating.label}</div>
          <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">${m.detail}</div>
          ${drilldown}
        </div>`;
    }).join('');

    grid.innerHTML = `
      <div style="margin-bottom: var(--spacing-sm);">
        ${summaryRows}
      </div>
      <button id="${detailsId}-btn"
        onclick="(function(btn){
          var panel = document.getElementById('${detailsId}');
          var open = panel.style.display !== 'none';
          panel.style.display = open ? 'none' : 'block';
          btn.textContent = open ? '▸ Show details' : '▾ Hide details';
        })(this)"
        style="background:none; border:none; color:var(--primary-color); cursor:pointer; font-size:var(--font-size-sm); font-weight:600; padding:0; margin-bottom: var(--spacing-sm);">
        ${startExpanded ? '▾ Hide details' : '▸ Show details'}
      </button>
      <div id="${detailsId}" style="display:${startExpanded ? 'block' : 'none'};">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--spacing-sm);">
          ${detailCards}
        </div>
      </div>`;
  }

  // ── Core feedback builder (shared by all instances) ──────────────────────

  function buildAndRenderFeedback(grid, section, text, promptText, elapsedSeconds, pauseChunks, isSpeech) {
    if (!section || !grid) return;

    const trimmed = text.trim();
    if (!trimmed) {
      grid.innerHTML = '<p style="color: var(--text-secondary);">No ' + (isSpeech ? 'speech was detected. Try again and speak clearly into your microphone.' : 'text entered. Please type your response before getting feedback.') + '</p>';
      section.style.display = 'block';
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const words     = tokenize(trimmed);
    const seconds   = Math.max(elapsedSeconds, 1);
    const wpm       = calcWPM(words, seconds);
    const fillers   = calcFillers(trimmed);

    // Log to progress charts if it's a speech session
    if (isSpeech && typeof ProgressChartsModule !== 'undefined') {
      ProgressChartsModule.logSpeechSession(wpm, fillers.count);
    }
    const diversity   = calcDiversity(words);
    const weakWords   = calcWeakWords(words);
    const confidence  = calcConfidence(wpm, fillers.total, weakWords.total, words.length);
    let avgSentLen, sentenceCount;
    if (isSpeech) {
      avgSentLen    = pauseChunks.length > 0 ? Math.round(words.length / pauseChunks.length) : words.length;
      sentenceCount = pauseChunks.length || 1;
    } else {
      const sentences = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
      avgSentLen    = sentences.length ? Math.round(words.length / sentences.length) : words.length;
      sentenceCount = sentences.length || 1;
    }

    const fillerBreakdown = Object.entries(fillers.breakdown).map(([w, n]) => `"${w}" ×${n}`).join(', ') || 'none';

    const metrics = [
      {
        icon: '⏱️',
        title: isSpeech ? 'Speaking Rate' : 'Writing Rate',
        value: wpm ? `${wpm} words/min` : '—',
        detail: isSpeech ? 'Ideal range: 130–160 wpm' : 'Based on timer elapsed',
        rating: rateWPM(wpm)
      },
      {
        icon: '🗣️',
        title: 'Filler Words',
        value: `${fillers.total} detected`,
        detail: fillerBreakdown + (isSpeech ? ' · Note: "um" and "uh" are filtered by the browser' : ''),
        rating: rateFillers(fillers.total, words.length)
      },
      {
        icon: '📖',
        title: 'Word Variety',
        value: `${diversity}% unique`,
        detail: `${new Set(words).size} unique of ${words.length} total words`,
        rating: rateDiversity(diversity)
      },
      {
        icon: '📏',
        title: 'Sentence Length',
        value: `~${avgSentLen} words/${isSpeech ? 'thought' : 'sentence'}`,
        detail: `${sentenceCount} ${isSpeech ? 'natural pause' : 'sentence'}${sentenceCount !== 1 ? 's' : ''} detected · Ideal range: 6–20 words`,
        rating: rateSentenceLength(avgSentLen)
      },
      {
        icon: '💬',
        title: 'Vocabulary Strength',
        value: `${weakWords.total} weak word${weakWords.total !== 1 ? 's' : ''}`,
        detail: weakWords.total === 0 ? 'No weak words detected' : 'Click below to see replacements',
        rating: rateWeakWords(weakWords.total, words.length)
      },
      {
        icon: '💪',
        title: 'Confidence Score',
        value: `${confidence}/100`,
        detail: 'Based on pace, filler words, and word strength',
        rating: rateConfidence(confidence)
      }
    ];

    renderMetricCards(grid, metrics, weakWords.breakdown);

    const titleEl = section.querySelector('h4');
    if (titleEl) titleEl.textContent = isSpeech ? 'Speech Feedback' : 'Writing Feedback';

    // Inject AI feedback button below metric cards
    renderAIFeedbackButton(section, trimmed, promptText, isSpeech);

    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── AI Feedback (Claude) ─────────────────────────────────────────────────

  const AI_CACHE_KEY = 'ai_feedback_cache';
  const AI_CACHE_MAX = 50;

  function getFeedbackCacheKey(transcript, promptText) {
    // Simple hash: length + first 80 chars of each
    return (promptText || '').slice(0, 80) + '|' + transcript.slice(0, 80) + '|' + transcript.length;
  }

  function loadAICache() {
    try { return JSON.parse(localStorage.getItem(AI_CACHE_KEY)) || {}; } catch { return {}; }
  }

  function saveAICache(cache) {
    // Evict oldest entries if over limit
    const keys = Object.keys(cache);
    if (keys.length > AI_CACHE_MAX) {
      keys.slice(0, keys.length - AI_CACHE_MAX).forEach(k => delete cache[k]);
    }
    try { localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache)); } catch {}
  }

  function renderAIFeedbackButton(section, transcript, promptText, isSpeech) {
    // Remove any existing AI feedback area for this section
    const existing = section.querySelector('.ai-feedback-area');
    if (existing) existing.remove();

    const area = document.createElement('div');
    area.className = 'ai-feedback-area';
    area.style.cssText = 'margin-top: var(--spacing-lg);';

    // Check cache first
    const cacheKey = getFeedbackCacheKey(transcript, promptText);
    const cache = loadAICache();
    if (cache[cacheKey]) {
      area.appendChild(buildAIFeedbackCard(cache[cacheKey]));
      section.appendChild(area);
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.textContent = 'Get AI Feedback';
    btn.style.cssText = 'width: 100%;';

    btn.addEventListener('click', async function() {
      btn.disabled = true;
      btn.textContent = 'Getting AI feedback...';

      try {
        const res = await fetch('/.netlify/functions/claude-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'storytelling_feedback',
            payload: { prompt: promptText || '', transcript, isSpeech }
          })
        });

        if (!res.ok) throw new Error('Server error ' + res.status);
        const data = await res.json();

        // Cache the result
        const freshCache = loadAICache();
        freshCache[cacheKey] = data;
        saveAICache(freshCache);

        // Replace button with card
        area.innerHTML = '';
        area.appendChild(buildAIFeedbackCard(data));
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Get AI Feedback';
        const errMsg = document.createElement('p');
        errMsg.style.cssText = 'color: var(--accent-color); font-size: var(--font-size-sm); margin-top: var(--spacing-sm);';
        errMsg.textContent = 'Could not reach AI feedback service. Are you on the live site?';
        area.appendChild(errMsg);
        setTimeout(() => { if (area.contains(errMsg)) area.removeChild(errMsg); }, 4000);
      }
    });

    area.appendChild(btn);
    section.appendChild(area);
  }

  function buildAIFeedbackCard(data) {
    const card = document.createElement('div');
    card.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: var(--spacing-md);';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);';
    header.innerHTML = '<span style="font-weight: 600; font-size: var(--font-size-base);">AI Feedback</span>';
    card.appendChild(header);

    const dimensions = [
      { label: 'Relevance', key: 'relevance' },
      { label: 'Structure', key: 'structure' },
      { label: 'Engagement', key: 'engagement' },
      { label: 'Vocabulary', key: 'vocabulary' }
    ];

    dimensions.forEach(({ label, key }) => {
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

  // ═══════════════════════════════════════════════════════════════════════════
  // INSTANCE FACTORY
  // Creates an independent speak/type controller for any section.
  //
  // prefix       — unique string used to namespace all element IDs, e.g. "story"
  // getPromptFn  — function() that returns the current prompt text for that section
  // ═══════════════════════════════════════════════════════════════════════════

  function create(prefix, getPromptFn, options) {
    let recognition     = null;
    let isListening     = false;
    let timer           = null;
    let totalSeconds    = 30;
    let remainingSeconds = 30;
    let elapsedSeconds  = 0;
    let finalTranscript = '';
    let pauseChunks     = [];
    let inputMode       = 'speak';
    let isTypeTimerActive = false;
    let typeTimer        = null;
    let typeRemainingSeconds = 30;
    let initialized      = false;
    let cardScope        = document;

    // Vocab word tracking
    let _vocabWord         = null;  // set externally via instance.setVocabWord()
    let _vocabWordDetected = false;
    let _vocabFlashTimeout = null;

    // Helper — look up an element by prefixed ID
    function el(id) { return document.getElementById(prefix + '-' + id); }

    function _checkForVocabWord(text) {
      if (!_vocabWord || _vocabWordDetected) return;
      // Match the word or common inflected forms (e.g. eloquent → eloquently)
      const base = _vocabWord.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp('\\b' + base, 'i');
      if (pattern.test(text)) {
        _vocabWordDetected = true;
        _showVocabFlash();
      }
    }

    function _showVocabFlash() {
      const container = el('speak-controls') || el('transcript-final')?.parentElement;
      if (!container) return;

      // Remove any existing flash
      const existing = container.querySelector('.vocab-detected-flash');
      if (existing) existing.remove();
      if (_vocabFlashTimeout) clearTimeout(_vocabFlashTimeout);

      const flash = document.createElement('div');
      flash.className = 'vocab-detected-flash';
      flash.textContent = `"${_vocabWord}" detected`;
      flash.style.cssText = [
        'position: absolute',
        'top: 8px',
        'right: 8px',
        'background: var(--primary-color)',
        'color: white',
        'padding: 4px 12px',
        'border-radius: 999px',
        'font-size: var(--font-size-sm)',
        'font-weight: 600',
        'opacity: 1',
        'transition: opacity 0.5s',
        'z-index: 10',
        'pointer-events: none'
      ].join(';');

      // Container needs position:relative for absolute child
      const prevPosition = container.style.position;
      if (!prevPosition || prevPosition === 'static') container.style.position = 'relative';

      container.appendChild(flash);

      // Fade out after 3s, remove after 3.5s
      _vocabFlashTimeout = setTimeout(() => { flash.style.opacity = '0'; }, 3000);
      setTimeout(() => { flash.remove(); }, 3500);
    }

    function init() {
      if (initialized) return;
      initialized = true;

      if (!DeepgramSTT.isSupported()) {
        const msg = el('unsupported-msg');
        const startBtn = el('start-btn');
        if (msg) msg.style.display = 'block';
        if (startBtn) startBtn.disabled = true;
        // still allow type mode
      } else {
        recognition = new DeepgramSTT();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
              if (t) {
                finalTranscript += t + ' ';
                pauseChunks.push(t);
                _checkForVocabWord(t);
              }
            } else {
              interim += t;
            }
          }
          const finalEl   = el('transcript-final');
          const interimEl = el('transcript-interim');
          if (finalEl)   finalEl.textContent   = finalTranscript;
          if (interimEl) interimEl.textContent = interim ? ' ' + interim : '';
        };

        recognition.onerror = function(event) {
          setStatus('Microphone error: ' + event.error);
        };

        recognition.onend = function() {
          if (isListening) recognition.start();
        };
      }

      // Speak-mode buttons
      const startBtn    = el('start-btn');
      const stopBtn     = el('stop-btn');
      const resetBtn    = el('reset-btn');
      const clearBtn    = el('clear-transcript-btn');

      const finishBtn   = el('finish-btn');

      if (startBtn)  startBtn.addEventListener('click', startSession);
      if (stopBtn)   stopBtn.onclick = stopSession;
      if (resetBtn)  resetBtn.addEventListener('click', resetSession);
      if (finishBtn) finishBtn.addEventListener('click', finishSession);
      if (clearBtn)  clearBtn.addEventListener('click', clearAll);

      // Time buttons (scoped to this instance via common card ancestor)
      const speakControls = el('speak-controls');
      cardScope = speakControls
        ? (speakControls.closest('.fluency-card-content') || speakControls.closest('.practice-interface') || document)
        : document;
      const timeBtns = cardScope.querySelectorAll('.ws-inst-time-btn');
      timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          if (isListening || isTypeTimerActive) return;
          timeBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          totalSeconds = parseInt(this.dataset.time);
          remainingSeconds = totalSeconds;
          typeRemainingSeconds = totalSeconds;
          updateTimerDisplay();
          updateTypeTimerDisplay();
        });
      });

      // Mode toggle
      const modeSpeakBtn = el('mode-speak');
      const modeTypeBtn  = el('mode-type');
      if (modeSpeakBtn) modeSpeakBtn.addEventListener('click', () => switchMode('speak'));
      if (modeTypeBtn)  modeTypeBtn.addEventListener('click', () => switchMode('type'));

      // Type-mode buttons
      const typeStartBtn  = el('type-start-btn');
      const typeStopBtn   = el('type-stop-btn');
      const typeResetBtn  = el('type-reset-btn');
      const typeSubmitBtn = el('type-submit-btn');
      const typeClearBtn  = el('type-clear-btn');

      if (typeStartBtn)  typeStartBtn.addEventListener('click', startTypeSession);
      if (typeStopBtn)   typeStopBtn.addEventListener('click', stopTypeSession);
      if (typeResetBtn)  typeResetBtn.addEventListener('click', resetTypeSession);
      if (typeSubmitBtn) typeSubmitBtn.addEventListener('click', submitTyped);
      if (typeClearBtn)  typeClearBtn.addEventListener('click', clearTyped);

      updateTimerDisplay();
      updateTypeTimerDisplay();
    }

    // ── Speak session ───────────────────────────────────────────────────────
    function startSession() {
      if (!recognition) { setStatus('Speech recognition not supported in this browser.'); return; }

      const countdownSeconds = (options && options.countdown) ? options.countdown : 0;

      if (countdownSeconds > 0) {
        toggleSpeakButtons(true); // hide start, show stop/reset so user can cancel
        let remaining = countdownSeconds;
        setCountdown(`Get ready… ${remaining}`);
        let countdownInterval = setInterval(() => {
          // If stop was clicked during countdown, isListening will be false
          if (!isListening) {
            clearInterval(countdownInterval);
            setCountdown('');
            return;
          }
          remaining--;
          if (remaining > 0) {
            setCountdown(`Get ready… ${remaining}`);
          } else {
            clearInterval(countdownInterval);
            setCountdown('Go!');
            setTimeout(() => { if (isListening) { setCountdown(''); _doStartSession(); } }, 600);
          }
        }, 1000);
        // Mark as "pending start" so stop button works during countdown
        isListening = true;
      } else {
        _doStartSession();
      }
    }

    function _doStartSession() {
      const activeBtn = cardScope.querySelector('.ws-inst-time-btn.active');
      if (activeBtn) totalSeconds = parseInt(activeBtn.dataset.time);
      remainingSeconds = totalSeconds;
      elapsedSeconds = 0;
      isListening = true;
      finalTranscript = '';
      pauseChunks = [];

      const transcriptSection = el('transcript-section');
      const feedbackSection   = el('feedback-section');
      if (transcriptSection) transcriptSection.style.display = 'block';
      if (feedbackSection)   feedbackSection.style.display   = 'none';

      clearTranscriptDisplay();
      toggleSpeakButtons(true);
      setStatus('Listening...');
      recognition.start();

      updateTimerDisplay();
      timer = setInterval(() => {
        remainingSeconds--;
        elapsedSeconds++;
        updateTimerDisplay();
        if (remainingSeconds <= 0) {
          stopSession();
          setStatus("Time's up! Review your feedback below.");
        }
      }, 1000);
    }

    function stopSession() {
      isListening = false;
      if (timer) { clearInterval(timer); timer = null; }
      try { recognition.stop(); } catch(e) {}
      elapsedSeconds = totalSeconds - remainingSeconds;

      if (options && options.resumable && remainingSeconds > 0) {
        // Paused — show Resume button instead of reverting to Start
        const stopBtn = el('stop-btn');
        if (stopBtn) { stopBtn.textContent = 'Resume'; stopBtn.onclick = resumeSession; }
        setStatus('Paused. Press Resume to continue.');
      } else {
        restoreStopBtn();
        toggleSpeakButtons(false);
        if (remainingSeconds > 0) setStatus('Stopped early. Review your feedback below.');
        showSpeakFeedback();
      }
    }

    function resumeSession() {
      if (!recognition) return;
      isListening = true;
      const stopBtn = el('stop-btn');
      if (stopBtn) { stopBtn.textContent = 'Stop'; stopBtn.onclick = stopSession; }
      setStatus('Listening...');
      try { recognition.start(); } catch(e) {}
      timer = setInterval(() => {
        remainingSeconds--;
        elapsedSeconds++;
        updateTimerDisplay();
        if (remainingSeconds <= 0) {
          stopSession();
          setStatus("Time's up! Review your feedback below.");
        }
      }, 1000);
    }

    function resetSession() {
      isListening = false;
      if (timer) { clearInterval(timer); timer = null; }
      try { if (recognition) recognition.stop(); } catch(e) {}

      const activeBtn = cardScope ? cardScope.querySelector('.ws-inst-time-btn.active') : null;
      if (activeBtn) totalSeconds = parseInt(activeBtn.dataset.time);
      // else keep totalSeconds as-is (set via setDuration when prompt was loaded)
      remainingSeconds = totalSeconds;
      elapsedSeconds = 0;
      finalTranscript = '';
      pauseChunks = [];

      restoreStopBtn();
      toggleSpeakButtons(false);
      updateTimerDisplay();
      setStatus('');

      const feedbackSection = el('feedback-section');
      if (feedbackSection) feedbackSection.style.display = 'none';
      clearTranscriptDisplay();

      if (prefix === 'story') {
        const markSection = document.getElementById('mark-story-complete-section');
        if (markSection) markSection.style.display = 'none';
      }
    }

    function finishSession() {
      isListening = false;
      if (timer) { clearInterval(timer); timer = null; }
      try { recognition.stop(); } catch(e) {}
      elapsedSeconds = totalSeconds - remainingSeconds;
      restoreStopBtn();
      toggleSpeakButtons(false);
      setStatus('');
      showSpeakFeedback();
      const markSection = document.getElementById(prefix + '-mark-complete-section') ||
                          document.getElementById('mark-story-complete-section');
      if (markSection && prefix === 'story') markSection.style.display = 'block';
    }

    function restoreStopBtn() {
      const stopBtn = el('stop-btn');
      if (stopBtn) { stopBtn.textContent = 'Stop'; stopBtn.onclick = stopSession; }
    }

    function clearAll() {
      finalTranscript = '';
      pauseChunks = [];
      clearTranscriptDisplay();
      const feedbackSection = el('feedback-section');
      if (feedbackSection) feedbackSection.style.display = 'none';
    }

    // ── Type session ────────────────────────────────────────────────────────
    function startTypeSession() {
      const activeBtn = cardScope.querySelector('.ws-inst-time-btn.active');
      if (activeBtn) typeRemainingSeconds = parseInt(activeBtn.dataset.time);
      else typeRemainingSeconds = totalSeconds;
      isTypeTimerActive = true;

      const feedbackSection = el('feedback-section');
      if (feedbackSection) feedbackSection.style.display = 'none';

      const startBtn = el('type-start-btn');
      const stopBtn  = el('type-stop-btn');
      const resetBtn = el('type-reset-btn');
      if (startBtn) startBtn.style.display = 'none';
      if (stopBtn)  stopBtn.style.display  = 'inline-block';
      if (resetBtn) resetBtn.style.display = 'inline-block';

      updateTypeTimerDisplay();
      typeTimer = setInterval(() => {
        typeRemainingSeconds--;
        updateTypeTimerDisplay();
        if (typeRemainingSeconds <= 0) stopTypeSession();
      }, 1000);

      const textarea = el('type-textarea');
      if (textarea) textarea.focus();
    }

    function stopTypeSession() {
      isTypeTimerActive = false;
      if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
      const startBtn = el('type-start-btn');
      const stopBtn  = el('type-stop-btn');
      const resetBtn = el('type-reset-btn');
      if (startBtn) startBtn.style.display = 'inline-block';
      if (stopBtn)  stopBtn.style.display  = 'none';
      if (resetBtn) resetBtn.style.display = 'none';
    }

    function resetTypeSession() {
      stopTypeSession();
      const activeBtn = cardScope.querySelector('.ws-inst-time-btn.active');
      typeRemainingSeconds = activeBtn ? parseInt(activeBtn.dataset.time) : 30;
      updateTypeTimerDisplay();
      const feedbackSection = el('feedback-section');
      if (feedbackSection) feedbackSection.style.display = 'none';
    }

    function submitTyped() {
      const textarea = el('type-textarea');
      const text = textarea ? textarea.value.trim() : '';
      if (!text) { alert('Please type your response before getting feedback.'); return; }
      if (isTypeTimerActive) stopTypeSession();
      const activeBtn = cardScope.querySelector('.ws-inst-time-btn.active');
      const selected = activeBtn ? parseInt(activeBtn.dataset.time) : 30;
      elapsedSeconds = Math.max(selected - typeRemainingSeconds, 1);
      showTypedFeedback(text);
    }

    function clearTyped() {
      const textarea = el('type-textarea');
      if (textarea) textarea.value = '';
      const feedbackSection = el('feedback-section');
      if (feedbackSection) feedbackSection.style.display = 'none';
    }

    // ── Mode switching ──────────────────────────────────────────────────────
    function switchMode(mode) {
      if (mode === inputMode) return;
      if (isListening) stopSession();
      if (isTypeTimerActive) stopTypeSession();
      inputMode = mode;

      const speakControls = el('speak-controls');
      const typeControls  = el('type-controls');
      const modeSpeakBtn  = el('mode-speak');
      const modeTypeBtn   = el('mode-type');
      const feedbackSection = el('feedback-section');

      if (mode === 'speak') {
        if (speakControls) speakControls.style.display = 'block';
        if (typeControls)  typeControls.style.display  = 'none';
        if (modeSpeakBtn)  modeSpeakBtn.classList.add('active');
        if (modeTypeBtn)   modeTypeBtn.classList.remove('active');
      } else {
        if (speakControls) speakControls.style.display = 'none';
        if (typeControls)  typeControls.style.display  = 'block';
        if (modeSpeakBtn)  modeSpeakBtn.classList.remove('active');
        if (modeTypeBtn)   modeTypeBtn.classList.add('active');
      }
      if (feedbackSection) feedbackSection.style.display = 'none';
    }

    // ── Display helpers ─────────────────────────────────────────────────────
    function clearTranscriptDisplay() {
      const f = el('transcript-final');
      const i = el('transcript-interim');
      if (f) f.textContent = '';
      if (i) i.textContent = '';
    }

    function updateTimerDisplay() {
      const e = el('timer-seconds');
      if (!e) return;
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      e.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTypeTimerDisplay() {
      const e = el('type-timer-seconds');
      if (!e) return;
      const mins = Math.floor(typeRemainingSeconds / 60);
      const secs = typeRemainingSeconds % 60;
      e.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function toggleSpeakButtons(active) {
      const startBtn  = el('start-btn');
      const stopBtn   = el('stop-btn');
      const resetBtn  = el('reset-btn');
      const finishBtn = el('finish-btn');
      if (startBtn)  startBtn.style.display  = active ? 'none' : 'inline-block';
      if (stopBtn)   stopBtn.style.display   = active ? 'inline-block' : 'none';
      if (resetBtn)  resetBtn.style.display  = active ? 'inline-block' : 'none';
      if (finishBtn) finishBtn.style.display = active ? 'inline-block' : 'none';
    }

    function setStatus(msg) {
      const e = el('status');
      if (e) {
        e.textContent = msg;
        e.classList.remove('countdown-active');
      }
    }

    function setCountdown(msg) {
      const e = el('status');
      if (e) {
        e.textContent = msg;
        if (msg) {
          e.classList.add('countdown-active');
        } else {
          e.classList.remove('countdown-active');
        }
      }
    }

    // ── Feedback renderers ──────────────────────────────────────────────────
    function showSpeakFeedback() {
      const section = el('feedback-section');
      const grid    = el('feedback-grid');
      const prompt  = getPromptFn ? getPromptFn() : '';
      buildAndRenderFeedback(grid, section, finalTranscript, prompt, elapsedSeconds, pauseChunks, true);
    }

    function showTypedFeedback(text) {
      const section = el('feedback-section');
      const grid    = el('feedback-grid');
      const prompt  = getPromptFn ? getPromptFn() : '';
      buildAndRenderFeedback(grid, section, text, prompt, elapsedSeconds, [], false);
    }

    // Stop and fully reset everything (used when navigating away from a prompt)
    function stopAndReset() {
      isListening = false;
      if (timer) { clearInterval(timer); timer = null; }
      try { if (recognition) recognition.stop(); } catch(e) {}
      isTypeTimerActive = false;
      if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }

      const activeBtn = cardScope ? cardScope.querySelector('.ws-inst-time-btn.active') : null;
      totalSeconds = activeBtn ? parseInt(activeBtn.dataset.time) : totalSeconds;
      remainingSeconds = totalSeconds;
      typeRemainingSeconds = totalSeconds;
      elapsedSeconds = 0;
      finalTranscript = '';
      pauseChunks = [];

      restoreStopBtn();
      toggleSpeakButtons(false);
      updateTimerDisplay();
      updateTypeTimerDisplay();
      setStatus('');

      const transcriptSection = el('transcript-section');
      const feedbackSection   = el('feedback-section');
      if (transcriptSection) transcriptSection.style.display = 'none';
      if (feedbackSection)   feedbackSection.style.display   = 'none';
      clearTranscriptDisplay();

      if (prefix === 'story') {
        const markSection = document.getElementById('mark-story-complete-section');
        if (markSection) markSection.style.display = 'none';
      }

      // Hide finish button
      const finishBtn = el('finish-btn');
      if (finishBtn) finishBtn.style.display = 'none';

      // Reset type textarea and type buttons
      const typeStartBtn = el('type-start-btn');
      const typeStopBtn  = el('type-stop-btn');
      const typeResetBtn = el('type-reset-btn');
      if (typeStartBtn) typeStartBtn.style.display = 'inline-block';
      if (typeStopBtn)  typeStopBtn.style.display  = 'none';
      if (typeResetBtn) typeResetBtn.style.display = 'none';
      const typeTextarea = el('type-textarea');
      if (typeTextarea) typeTextarea.value = '';
    }

    function setDuration(seconds) {
      if (isListening || isTypeTimerActive) return;
      totalSeconds = seconds;
      remainingSeconds = seconds;
      typeRemainingSeconds = seconds;
      // Sync the active time button if one matches, otherwise clear all active states
      if (cardScope) {
        cardScope.querySelectorAll('.ws-inst-time-btn').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.time) === seconds);
        });
      }
      updateTimerDisplay();
      updateTypeTimerDisplay();
    }

    function setVocabWord(word) {
      _vocabWord = word;
      _vocabWordDetected = false;
    }
    function wasVocabWordDetected() { return _vocabWordDetected; }
    function getTranscript() { return finalTranscript; }

    return { init, stopAndReset, setDuration, setVocabWord, wasVocabWordDetected, getTranscript };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORIGINAL WEB SPEECH TEST SINGLETON (kept intact for the dedicated tab)
  // Uses the original ws-* element IDs.
  // ═══════════════════════════════════════════════════════════════════════════

  let wsRecognition    = null;
  let wsIsListening    = false;
  let wsTimer          = null;
  let wsTotalSeconds   = 30;
  let wsRemaining      = 30;
  let wsElapsed        = 0;
  let wsFinalTranscript = '';
  let wsPauseChunks    = [];
  let wsInputMode      = 'speak';
  let wsTypeTimerActive = false;
  let wsTypeTimer      = null;
  let wsTypeRemaining  = 30;
  let wsInitialized    = false;

  function init() {
    if (wsInitialized) return;
    wsInitialized = true;

    if (!DeepgramSTT.isSupported()) {
      const msg      = document.getElementById('ws-unsupported-msg');
      const startBtn = document.getElementById('ws-impromptu-start-btn');
      if (msg)      msg.style.display = 'block';
      if (startBtn) startBtn.disabled = true;
      return;
    }

    wsRecognition = new DeepgramSTT();
    wsRecognition.continuous = true;
    wsRecognition.interimResults = true;
    wsRecognition.lang = 'en-US';

    wsRecognition.onresult = function(event) {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          if (t) { wsFinalTranscript += t + ' '; wsPauseChunks.push(t); }
        } else { interim += t; }
      }
      const finalEl   = document.getElementById('ws-transcript-final');
      const interimEl = document.getElementById('ws-transcript-interim');
      if (finalEl)   finalEl.textContent   = wsFinalTranscript;
      if (interimEl) interimEl.textContent = interim ? ' ' + interim : '';
    };

    wsRecognition.onerror = function(event) {
      const s = document.getElementById('ws-status');
      if (s) s.textContent = 'Microphone error: ' + event.error;
    };

    wsRecognition.onend = function() {
      if (wsIsListening) wsRecognition.start();
    };

    // Wire up speak-mode buttons
    const startBtn    = document.getElementById('ws-impromptu-start-btn');
    const stopBtn     = document.getElementById('ws-impromptu-stop-btn');
    const resetBtn    = document.getElementById('ws-impromptu-reset-btn');
    const newTopicBtn = document.getElementById('ws-new-impromptu-btn');
    const clearBtn    = document.getElementById('ws-clear-transcript-btn');
    const timeBtns    = document.querySelectorAll('.ws-time-btn');

    if (startBtn)    startBtn.addEventListener('click', wsStartSession);
    if (stopBtn)     stopBtn.addEventListener('click', wsStopSession);
    if (resetBtn)    resetBtn.addEventListener('click', wsResetSession);
    if (newTopicBtn) newTopicBtn.addEventListener('click', wsLoadNewTopic);
    if (clearBtn)    clearBtn.addEventListener('click', wsClearAll);

    timeBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        if (wsIsListening || wsTypeTimerActive) return;
        timeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        wsTotalSeconds  = parseInt(this.dataset.time);
        wsRemaining     = wsTotalSeconds;
        wsTypeRemaining = wsTotalSeconds;
        wsUpdateTimerDisplay();
        wsUpdateTypeTimerDisplay();
      });
    });

    const modeSpeakBtn = document.getElementById('ws-mode-speak');
    const modeTypeBtn  = document.getElementById('ws-mode-type');
    if (modeSpeakBtn) modeSpeakBtn.addEventListener('click', () => wsSwitchMode('speak'));
    if (modeTypeBtn)  modeTypeBtn.addEventListener('click', () => wsSwitchMode('type'));

    const typeStartBtn  = document.getElementById('ws-type-start-btn');
    const typeStopBtn   = document.getElementById('ws-type-stop-btn');
    const typeResetBtn  = document.getElementById('ws-type-reset-btn');
    const typeSubmitBtn = document.getElementById('ws-type-submit-btn');
    const typeClearBtn  = document.getElementById('ws-type-clear-btn');
    const newTopicTypeBtn = document.getElementById('ws-new-topic-type-btn');

    if (typeStartBtn)    typeStartBtn.addEventListener('click', wsStartTypeSession);
    if (typeStopBtn)     typeStopBtn.addEventListener('click', wsStopTypeSession);
    if (typeResetBtn)    typeResetBtn.addEventListener('click', wsResetTypeSession);
    if (typeSubmitBtn)   typeSubmitBtn.addEventListener('click', wsSubmitTyped);
    if (typeClearBtn)    typeClearBtn.addEventListener('click', wsClearTyped);
    if (newTopicTypeBtn) newTopicTypeBtn.addEventListener('click', wsLoadNewTopic);

    wsLoadNewTopic();
    wsUpdateTimerDisplay();
    wsUpdateTypeTimerDisplay();
  }

  function wsLoadNewTopic() {
    if (wsIsListening) {
      if (!confirm('Stop the current session and load a new topic?')) return;
      wsStopSession();
    }
    const prompt = topics[Math.floor(Math.random() * topics.length)];
    const el = document.getElementById('ws-impromptu-prompt');
    if (el) el.textContent = prompt;
  }

  function wsStartSession() {
    const activeBtn = document.querySelector('.ws-time-btn.active');
    wsTotalSeconds  = activeBtn ? parseInt(activeBtn.dataset.time) : 30;
    wsRemaining     = wsTotalSeconds;
    wsElapsed       = 0;
    wsIsListening   = true;
    wsFinalTranscript = '';
    wsPauseChunks   = [];

    const transcriptSection = document.getElementById('ws-transcript-section');
    const feedbackSection   = document.getElementById('ws-feedback-section');
    if (transcriptSection) transcriptSection.style.display = 'block';
    if (feedbackSection)   feedbackSection.style.display   = 'none';

    wsClearTranscriptDisplay();
    wsToggleButtons(true);
    wsSetStatus('Listening...');
    wsRecognition.start();

    wsUpdateTimerDisplay();
    wsTimer = setInterval(() => {
      wsRemaining--;
      wsElapsed++;
      wsUpdateTimerDisplay();
      if (wsRemaining <= 0) {
        wsStopSession();
        wsSetStatus("Time's up! Review your feedback below.");
      }
    }, 1000);
  }

  function wsStopSession() {
    wsIsListening = false;
    if (wsTimer) { clearInterval(wsTimer); wsTimer = null; }
    try { wsRecognition.stop(); } catch(e) {}
    wsElapsed = wsTotalSeconds - wsRemaining;
    wsToggleButtons(false);
    if (wsRemaining > 0) wsSetStatus('Stopped early. Review your feedback below.');
    wsShowFeedback();
  }

  function wsResetSession() {
    wsIsListening = false;
    if (wsTimer) { clearInterval(wsTimer); wsTimer = null; }
    try { wsRecognition.stop(); } catch(e) {}

    const activeBtn = document.querySelector('.ws-time-btn.active');
    wsTotalSeconds  = activeBtn ? parseInt(activeBtn.dataset.time) : 30;
    wsRemaining     = wsTotalSeconds;
    wsElapsed       = 0;

    wsToggleButtons(false);
    wsUpdateTimerDisplay();
    wsSetStatus('');

    const feedbackSection = document.getElementById('ws-feedback-section');
    if (feedbackSection) feedbackSection.style.display = 'none';
  }

  function wsClearAll() {
    wsFinalTranscript = '';
    wsPauseChunks = [];
    wsClearTranscriptDisplay();
    const feedbackSection = document.getElementById('ws-feedback-section');
    if (feedbackSection) feedbackSection.style.display = 'none';
  }

  function wsSwitchMode(mode) {
    if (mode === wsInputMode) return;
    if (wsIsListening) wsStopSession();
    if (wsTypeTimerActive) wsStopTypeSession();
    wsInputMode = mode;

    const speakControls   = document.getElementById('ws-speak-controls');
    const typeControls    = document.getElementById('ws-type-controls');
    const modeSpeakBtn    = document.getElementById('ws-mode-speak');
    const modeTypeBtn     = document.getElementById('ws-mode-type');
    const feedbackSection = document.getElementById('ws-feedback-section');

    if (mode === 'speak') {
      if (speakControls) speakControls.style.display = 'block';
      if (typeControls)  typeControls.style.display  = 'none';
      if (modeSpeakBtn)  modeSpeakBtn.classList.add('active');
      if (modeTypeBtn)   modeTypeBtn.classList.remove('active');
    } else {
      if (speakControls) speakControls.style.display = 'none';
      if (typeControls)  typeControls.style.display  = 'block';
      if (modeSpeakBtn)  modeSpeakBtn.classList.remove('active');
      if (modeTypeBtn)   modeTypeBtn.classList.add('active');
    }
    if (feedbackSection) feedbackSection.style.display = 'none';
  }

  function wsStartTypeSession() {
    const activeBtn = document.querySelector('.ws-time-btn.active');
    wsTypeRemaining = activeBtn ? parseInt(activeBtn.dataset.time) : 30;
    wsTypeTimerActive = true;

    const feedbackSection = document.getElementById('ws-feedback-section');
    if (feedbackSection) feedbackSection.style.display = 'none';

    const startBtn = document.getElementById('ws-type-start-btn');
    const stopBtn  = document.getElementById('ws-type-stop-btn');
    const resetBtn = document.getElementById('ws-type-reset-btn');
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn)  stopBtn.style.display  = 'inline-block';
    if (resetBtn) resetBtn.style.display = 'inline-block';

    wsUpdateTypeTimerDisplay();
    wsTypeTimer = setInterval(() => {
      wsTypeRemaining--;
      wsUpdateTypeTimerDisplay();
      if (wsTypeRemaining <= 0) wsStopTypeSession();
    }, 1000);

    const textarea = document.getElementById('ws-type-textarea');
    if (textarea) textarea.focus();
  }

  function wsStopTypeSession() {
    wsTypeTimerActive = false;
    if (wsTypeTimer) { clearInterval(wsTypeTimer); wsTypeTimer = null; }
    const startBtn = document.getElementById('ws-type-start-btn');
    const stopBtn  = document.getElementById('ws-type-stop-btn');
    const resetBtn = document.getElementById('ws-type-reset-btn');
    if (startBtn) startBtn.style.display = 'inline-block';
    if (stopBtn)  stopBtn.style.display  = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
  }

  function wsResetTypeSession() {
    wsStopTypeSession();
    const activeBtn = document.querySelector('.ws-time-btn.active');
    wsTypeRemaining = activeBtn ? parseInt(activeBtn.dataset.time) : 30;
    wsUpdateTypeTimerDisplay();
    const feedbackSection = document.getElementById('ws-feedback-section');
    if (feedbackSection) feedbackSection.style.display = 'none';
  }

  function wsSubmitTyped() {
    const textarea = document.getElementById('ws-type-textarea');
    const text = textarea ? textarea.value.trim() : '';
    if (!text) { alert('Please type your response before getting feedback.'); return; }
    if (wsTypeTimerActive) wsStopTypeSession();
    const activeBtn = document.querySelector('.ws-time-btn.active');
    const selected  = activeBtn ? parseInt(activeBtn.dataset.time) : 30;
    wsElapsed = Math.max(selected - wsTypeRemaining, 1);
    wsShowTypedFeedback(text);
  }

  function wsClearTyped() {
    const textarea = document.getElementById('ws-type-textarea');
    if (textarea) textarea.value = '';
    const feedbackSection = document.getElementById('ws-feedback-section');
    if (feedbackSection) feedbackSection.style.display = 'none';
  }

  function wsClearTranscriptDisplay() {
    const f = document.getElementById('ws-transcript-final');
    const i = document.getElementById('ws-transcript-interim');
    if (f) f.textContent = '';
    if (i) i.textContent = '';
  }

  function wsUpdateTimerDisplay() {
    const e = document.getElementById('ws-timer-seconds');
    if (!e) return;
    const mins = Math.floor(wsRemaining / 60);
    const secs = wsRemaining % 60;
    e.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function wsUpdateTypeTimerDisplay() {
    const e = document.getElementById('ws-type-timer-seconds');
    if (!e) return;
    const mins = Math.floor(wsTypeRemaining / 60);
    const secs = wsTypeRemaining % 60;
    e.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function wsToggleButtons(active) {
    const startBtn = document.getElementById('ws-impromptu-start-btn');
    const stopBtn  = document.getElementById('ws-impromptu-stop-btn');
    const resetBtn = document.getElementById('ws-impromptu-reset-btn');
    if (startBtn) startBtn.style.display = active ? 'none' : 'inline-block';
    if (stopBtn)  stopBtn.style.display  = active ? 'inline-block' : 'none';
    if (resetBtn) resetBtn.style.display = active ? 'inline-block' : 'none';
  }

  function wsSetStatus(msg) {
    const e = document.getElementById('ws-status');
    if (e) e.textContent = msg;
  }

  function wsShowFeedback() {
    const section = document.getElementById('ws-feedback-section');
    const grid    = document.getElementById('ws-feedback-grid');
    const prompt  = document.getElementById('ws-impromptu-prompt')?.textContent || '';
    buildAndRenderFeedback(grid, section, wsFinalTranscript, prompt, wsElapsed, wsPauseChunks, true);
  }

  function wsShowTypedFeedback(text) {
    const section = document.getElementById('ws-feedback-section');
    const grid    = document.getElementById('ws-feedback-grid');
    const prompt  = document.getElementById('ws-impromptu-prompt')?.textContent || '';
    buildAndRenderFeedback(grid, section, text, prompt, wsElapsed, [], false);
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return { init, create, buildAndRenderFeedback };

})();

console.log('WebSpeechModule loaded');
