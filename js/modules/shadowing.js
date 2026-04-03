// ============================================
// SHADOWING MODULE
// Read-along exercises with stress/pause markup
// ============================================

const ShadowingModule = (function() {

  // Markup legend:
  //  **word** = stressed word (bold)
  //  /        = short pause
  //  ~        = slow down here
  //  (...)    = lower voice / aside

  const passages = [
    {
      id: 1,
      title: 'JFK Inaugural Address (1961)',
      author: 'John F. Kennedy',
      difficulty: 'Intermediate',
      raw: `**Ask** not / what your **country** can do for you — / **ask** what **you** can do for your ~country.`,
      notes: 'Classic chiasmus. Stress "Ask" and "you" for maximum impact. Pause at the dash.'
    },
    {
      id: 2,
      title: 'Martin Luther King Jr. — "I Have a Dream"',
      author: 'Martin Luther King Jr.',
      difficulty: 'Intermediate',
      raw: `I have a **dream** / that one day / this **nation** will rise up / and live out the true **meaning** of its ~creed.`,
      notes: 'Slow, deliberate pace. Each phrase is a unit. "Dream", "nation", and "meaning" carry the emotion.'
    },
    {
      id: 3,
      title: 'Winston Churchill — "We Shall Fight"',
      author: 'Winston Churchill',
      difficulty: 'Advanced',
      raw: `We shall **fight** on the beaches, / we shall fight on the landing ~grounds, / we shall fight in the **fields** and in the streets, / we shall fight in the **hills**; / we shall **never** ~surrender.`,
      notes: 'Anaphora — "we shall fight" repeats. Build intensity with each phrase. "Never" is the climax.'
    },
    {
      id: 4,
      title: 'Steve Jobs Stanford Commencement (2005)',
      author: 'Steve Jobs',
      difficulty: 'Beginner',
      raw: `~Stay **hungry**. / ~Stay **foolish**.`,
      notes: 'Simple but powerful. Slow down each word. The pauses carry the meaning.'
    },
    {
      id: 5,
      title: 'Maya Angelou — "Still I Rise"',
      author: 'Maya Angelou',
      difficulty: 'Intermediate',
      raw: `You may **write** me down in ~history / with your bitter, twisted ~lies. / You may **trod** me in the very **dirt**, / but ~still, like **dust**, I'll **rise**.`,
      notes: 'Slow down "still" and "rise" for dramatic effect. "Dust" and "rise" are the heart of the image.'
    },
    {
      id: 6,
      title: 'Barack Obama — "Yes We Can"',
      author: 'Barack Obama',
      difficulty: 'Beginner',
      raw: `It was a **creed** written into the founding documents / that declared the ~destiny of a nation: / **Yes** we ~can.`,
      notes: 'Measured, presidential pace. Build toward "Yes we can" — the words should feel inevitable.'
    },
    {
      id: 7,
      title: 'Oprah Winfrey — Golden Globes Speech',
      author: 'Oprah Winfrey',
      difficulty: 'Intermediate',
      raw: `For too ~long, / **women** have not been heard or ~believed / if they dared to speak their **truth** / to the **power** of those men.`,
      notes: 'Heavy pauses after "long" and "truth". "Women" and "power" are the emotional anchors.'
    },
    {
      id: 8,
      title: 'Effective Introduction (Practice)',
      author: 'Template',
      difficulty: 'Beginner',
      raw: `**Hello**. / My name is ~[your name], / and today I want to talk to you about something that truly **matters** to me. / I believe that when we **speak clearly**, / we **connect** more ~deeply.`,
      notes: 'Great for practicing self-introductions. Fill in your own name. Slow down "clearly" and "deeply".'
    }
  ];

  let currentPassage = null;

  function init() {
    renderPassageList();

    const backBtn = document.getElementById('shadowing-back-btn');
    if (backBtn) backBtn.addEventListener('click', showSelector);

    const ttsBtn = document.getElementById('shadowing-tts-btn');
    const ttsStopBtn = document.getElementById('shadowing-tts-stop-btn');
    if (ttsBtn) ttsBtn.addEventListener('click', speakPassage);
    if (ttsStopBtn) ttsStopBtn.addEventListener('click', stopSpeaking);
  }

  function renderPassageList() {
    const listEl = document.getElementById('shadowing-passage-list');
    if (!listEl) return;

    listEl.innerHTML = passages.map(p => `
      <div class="shadowing-passage-card" onclick="ShadowingModule.selectPassage(${p.id})">
        <div class="shadowing-passage-card-title">${p.title}</div>
        <div class="shadowing-passage-card-meta">
          <span>${p.author}</span>
          <span class="shadowing-difficulty-badge difficulty-${p.difficulty.toLowerCase()}">${p.difficulty}</span>
        </div>
      </div>
    `).join('');
  }

  function selectPassage(id) {
    currentPassage = passages.find(p => p.id === id);
    if (!currentPassage) return;

    const titleEl = document.getElementById('shadowing-passage-title');
    const scriptEl = document.getElementById('shadowing-script');

    if (titleEl) titleEl.textContent = currentPassage.title;
    if (scriptEl) scriptEl.innerHTML = renderMarkup(currentPassage.raw) +
      `<div class="shadowing-notes">💡 <em>${currentPassage.notes}</em></div>`;

    document.getElementById('shadowing-selector').style.display = 'none';
    document.getElementById('shadowing-active').style.display = '';
  }

  function renderMarkup(raw) {
    // **word** → <strong class="shadow-stress">word</strong>
    // /        → <span class="shadow-pause"> / </span>
    // ~        → <span class="shadow-slow">~</span> (visual cue before next word)
    let html = raw
      .replace(/\*\*(.+?)\*\*/g, '<strong class="shadow-stress">$1</strong>')
      .replace(/\//g, '<span class="shadow-pause"> / </span>')
      .replace(/~/g, '<span class="shadow-slow">↓</span>');

    return `<p class="shadowing-text">${html}</p>`;
  }

  function speakPassage() {
    if (!currentPassage || !window.speechSynthesis) return;
    // Strip markup for TTS
    const plainText = currentPassage.raw
      .replace(/\*\*/g, '')
      .replace(/\//g, ', ')
      .replace(/~/g, '');

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(plainText);
    u.rate = 0.78; // Slightly slower for modeling
    u.pitch = 1.05;

    u.onend = () => {
      const ttsBtn = document.getElementById('shadowing-tts-btn');
      const ttsStopBtn = document.getElementById('shadowing-tts-stop-btn');
      if (ttsBtn) ttsBtn.style.display = '';
      if (ttsStopBtn) ttsStopBtn.style.display = 'none';
    };

    window.speechSynthesis.speak(u);
    document.getElementById('shadowing-tts-btn').style.display = 'none';
    document.getElementById('shadowing-tts-stop-btn').style.display = '';
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    document.getElementById('shadowing-tts-btn').style.display = '';
    document.getElementById('shadowing-tts-stop-btn').style.display = 'none';
  }

  function showSelector() {
    stopSpeaking();
    document.getElementById('shadowing-selector').style.display = '';
    document.getElementById('shadowing-active').style.display = 'none';
  }

  function refresh() {
    renderPassageList();
  }

  return {
    init: init,
    refresh: refresh,
    selectPassage: selectPassage
  };
})();

console.log('ShadowingModule loaded');
