/* =========================================================
   GENERASI REBAHAN — Main JavaScript
   Refactored for Solus Aesthetic Benchmark & Maximum Reliability
   1. System Helpers: Toast, Sound FX, Confetti, Theme Mode, Mobile Menu
   2. Nav & Scroll: Active links, Counter animation, Mirror card reveal
   3. Mascot Controller: Live status and emotion reactivity
   4. Quiz Engine: Core & adaptive questions, score calculations, result rendering
   5. Accordion & Facts: Expandable tips/FAQ, random facts generator
   6. Habit Tracker: Local storage persistence, 22:00 auto-reset, locked modal
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* =========================================================
     1. THEME MODE & AUDIO ENGINE
     ========================================================= */
  const savedMode = localStorage.getItem('rebahan_mode');
  const initialMode = savedMode === 'rebahan' ? 'rebahan' : 'sehat';
  document.documentElement.dataset.mode = initialMode;
  document.body.dataset.mode = initialMode;

  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    modeToggle.textContent = initialMode === 'rebahan' ? '🌙 Mode Rebahan' : '☀️ Mode Sehat';
    modeToggle.addEventListener('click', function () {
      const current = document.documentElement.dataset.mode;
      const next = current === 'sehat' ? 'rebahan' : 'sehat';
      document.documentElement.dataset.mode = next;
      document.body.dataset.mode = next;
      localStorage.setItem('rebahan_mode', next);
      modeToggle.textContent = next === 'rebahan' ? '🌙 Mode Rebahan' : '☀️ Mode Sehat';
      showToast(next === 'rebahan' ? 'Beralih ke Mode Rebahan (Gelap)' : 'Beralih ke Mode Sehat (Terang)', '🎨');
      playUiSound('pop');
    });
  }

  /* ----- Sound FX Engine (Web Audio API) ----- */
  let soundEnabled = localStorage.getItem('rebahan_sound') !== 'disabled';
  let audioCtx = null;

  function initAudioCtx() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playUiSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      initAudioCtx();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.07);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) { }
  }

  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggle.addEventListener('click', function () {
      soundEnabled = !soundEnabled;
      localStorage.setItem('rebahan_sound', soundEnabled ? 'enabled' : 'disabled');
      soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
      showToast(soundEnabled ? 'Suara efek diaktifkan' : 'Suara efek dimatikan', soundEnabled ? '🔊' : '🔇');
    });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('button, a, .mirror-card, .accordion-head, input[type="range"]')) {
      playUiSound('click');
    }
  });

  /* ----- Mobile Nav Toggle ----- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navlinks = document.getElementById('navlinks');
  if (mobileMenuBtn && navlinks) {
    mobileMenuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      navlinks.classList.toggle('show-mobile');
    });
    document.addEventListener('click', function (e) {
      if (!navlinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navlinks.classList.remove('show-mobile');
      }
    });
    navlinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navlinks.classList.remove('show-mobile'));
    });
  }

  /* ----- Toast Notifications ----- */
  function showToast(message, icon = '✨', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span style="font-size:1.15rem;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, duration);
  }

  /* ----- Confetti Particle Overlay ----- */
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f29a38', '#249988', '#e76f51', '#0d3235', '#ffffff'];
    const particles = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 160,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -10 - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 8,
        opacity: 1
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.rotation += p.rSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });
      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }
    render();
  }

  /* ----- Back to Top Button ----- */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =========================================================
     2. MASCOT SLIDER CONTROLLER
     ========================================================= */
  const mascotStages = [
    { max: 33, src: 'mascot/aset10.png', alt: 'Maskot santai di bean bag — rebahan ringan', desc: 'Santai Sehat' },
    { max: 66, src: 'mascot/aset7.png', alt: 'Maskot main HP di bean bag', desc: 'Mulai Mager' },
    { max: 100, src: 'mascot/aset6.png', alt: 'Maskot rebahan maksimal dengan tablet dan keripik', desc: 'Rebahan Maksimal' }
  ];

  function updateHeroMascot(value) {
    const img = document.getElementById('heroMascotImg');
    const badge = document.getElementById('rebahanSliderVal');
    let stage = mascotStages[mascotStages.length - 1];
    for (let i = 0; i < mascotStages.length; i++) {
      if (value <= mascotStages[i].max) {
        stage = mascotStages[i];
        break;
      }
    }
    if (badge) {
      badge.textContent = `${value}% · ${stage.desc}`;
    }
    if (img && img.getAttribute('src') !== stage.src) {
      img.style.opacity = '0.35';
      setTimeout(function () {
        img.setAttribute('src', stage.src);
        img.setAttribute('alt', stage.alt);
        img.style.opacity = '1';
      }, 120);
    }
  }

  const rebahanSlider = document.getElementById('rebahanSlider');
  if (rebahanSlider) {
    rebahanSlider.addEventListener('input', function () {
      updateHeroMascot(parseInt(this.value, 10));
    });
  }

  /* =========================================================
     3. MIRROR CARDS & COUNTER ANIMATION
     ========================================================= */
  document.querySelectorAll('.mirror-card').forEach(card => {
    card.addEventListener('click', function () {
      const wasOpen = this.classList.contains('open');
      this.classList.toggle('open');
      const indicator = this.querySelector('.mirror-indicator');
      if (indicator) {
        indicator.textContent = wasOpen ? 'Klik untuk refleksi' : 'Tutup refleksi';
      }
    });
  });

  /* Counter Animation with IntersectionObserver */
  const statNumbers = document.querySelectorAll('.stat-num');
  if (statNumbers.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target')) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          const isDecimal = target % 1 !== 0;
          let startTime = null;
          const duration = 1200;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = progress * target;
            el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
            }
          }
          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    statNumbers.forEach(num => observer.observe(num));
  }

  /* =========================================================
     4. QUIZ ENGINE
     ========================================================= */
  const CORE_QUIZ_QUESTIONS = [
    {
      id: 'screen_time',
      category: 'digital',
      question: 'Dalam sehari, kira-kira berapa lama kamu menghabiskan waktu di depan layar untuk hiburan?',
      options: [
        { label: '< 2 jam', score: 1 },
        { label: '2–4 jam', score: 2 },
        { label: '4–7 jam', score: 3 },
        { label: '> 7 jam', score: 4 }
      ]
    },
    {
      id: 'bangun_tidur',
      category: 'digital',
      question: 'Apa yang biasanya kamu lakukan dalam 15 menit pertama setelah bangun tidur?',
      options: [
        { label: 'Langsung beraktivitas tanpa HP', score: 1 },
        { label: 'Sesekali cek HP seperlunya', score: 2 },
        { label: 'Cek notifikasi & media sosial', score: 3 },
        { label: 'Langsung scrolling cukup lama', score: 4, recoKey: 'morning_detox' }
      ]
    },
    {
      id: 'lama_duduk',
      category: 'gerak',
      question: 'Kalau sedang belajar, bekerja, atau bermain, berapa lama kamu biasanya duduk tanpa berdiri?',
      options: [
        { label: '< 30 menit', score: 1 },
        { label: '30–60 menit', score: 2 },
        { label: '1–2 jam', score: 3 },
        { label: '> 2 jam tanpa gerak', score: 4, recoKey: 'stand_up_breaks' }
      ]
    },
    {
      id: 'gerak',
      category: 'gerak',
      question: 'Dalam seminggu, seberapa sering kamu sengaja melakukan aktivitas fisik atau olahraga?',
      options: [
        { label: 'Hampir setiap hari', score: 1 },
        { label: '3–4 kali', score: 2 },
        { label: '1–2 kali', score: 3 },
        { label: 'Hampir tidak pernah', score: 4, recoKey: 'regular_movement' }
      ]
    },
    {
      id: 'tidur',
      category: 'tidur',
      question: 'Pada hari biasa, bagaimana ritme dan konsistensi waktu tidurmu?',
      options: [
        { label: 'Cukup dan teratur', score: 1 },
        { label: 'Kadang tidur terlalu larut', score: 2 },
        { label: 'Sering kurang tidur', score: 3 },
        { label: 'Sangat tidak teratur / sering begadang', score: 4, recoKey: 'sleep_schedule' }
      ]
    },
    {
      id: 'hp_tidur',
      category: 'tidur',
      question: 'Apa yang paling sering kamu lakukan saat sudah di kasur hendak tidur?',
      options: [
        { label: 'Langsung meletakkan HP jauh', score: 1 },
        { label: 'Cek sebentar lalu tidur', score: 2 },
        { label: 'Scrolling/menonton video pendek', score: 3 },
        { label: 'Sering tidak sadar sudah larut malam karena HP', score: 4, recoKey: 'night_screen_detox' }
      ]
    },
    {
      id: 'makanan',
      category: 'makan',
      question: 'Seberapa sering makanan cepat saji atau camilan ultra-proses jadi santapan utamamu?',
      options: [
        { label: 'Jarang sekali', score: 1 },
        { label: '1–2 kali seminggu', score: 2 },
        { label: '3–5 kali seminggu', score: 3 },
        { label: 'Hampir setiap hari', score: 4, recoKey: 'healthy_snack' }
      ]
    },
    {
      id: 'minuman',
      category: 'makan',
      question: 'Seberapa sering kamu mengonsumsi minuman berpemanis (kopi susu, boba, soda, teh manis)?',
      options: [
        { label: 'Jarang', score: 1 },
        { label: 'Beberapa kali seminggu', score: 2 },
        { label: 'Sekitar 1 kali sehari', score: 3 },
        { label: 'Lebih dari 1 kali sehari', score: 4, recoKey: 'reduce_sweet_drinks' }
      ]
    },
    {
      id: 'makan_screen',
      category: 'makan',
      question: 'Seberapa sering kamu makan sambil menonton layar ponsel atau laptop?',
      options: [
        { label: 'Hampir tidak pernah', score: 1 },
        { label: 'Sesekali', score: 2 },
        { label: 'Sering', score: 3 },
        { label: 'Hampir setiap kali makan', score: 4, recoKey: 'mindful_eating' }
      ]
    },
    {
      id: 'kondisi_tubuh',
      category: 'wellbeing',
      question: 'Setelah seharian beraktivitas di depan layar, apa yang paling sering tubuhmu rasakan?',
      options: [
        { label: 'Tubuh terasa bugar normal', score: 1 },
        { label: 'Sedikit pegal atau mata lelah', score: 2 },
        { label: 'Sering nyeri leher/punggung dan kaku', score: 3 },
        { label: 'Sangat tidak nyaman dan mengganggu aktivitas', score: 4, recoKey: 'body_recovery' }
      ]
    }
  ];

  const ADAPTIVE_BANK = {
    screen_sit: {
      id: 'adaptive_screen_sit',
      category: 'gerak',
      question: 'Dari waktu di depan layar tersebut, berapa banyak yang kamu habiskan sambil rebahan?',
      options: [
        { label: 'Sedikit — sering berdiri atau duduk tegak', score: 1 },
        { label: 'Sekitar separuhnya', score: 2 },
        { label: 'Sebagian besar sambil duduk santai', score: 3 },
        { label: 'Hampir seluruhnya sambil rebahan penuh', score: 4, recoKey: 'stand_up_breaks' }
      ]
    },
    kontrol: {
      id: 'adaptive_kontrol',
      category: 'wellbeing',
      question: 'Seberapa sering kamu berniat membuka HP sebentar tetapi tahu-tahu bablas lebih dari 1 jam?',
      options: [
        { label: 'Hampir tidak pernah', score: 1 },
        { label: 'Sesekali', score: 2 },
        { label: 'Sering', score: 3 },
        { label: 'Hampir setiap hari', score: 4, recoKey: 'app_timers' }
      ]
    }
  };

  let activeQuestions = [];
  let currentQuestionIdx = 0;
  let userAnswers = [];
  let adaptiveCount = 0;
  let quizBusy = false;

  function initQuiz() {
    const quizCardContent = document.getElementById('quizCardContent');
    if (!quizCardContent) return;
    activeQuestions = JSON.parse(JSON.stringify(CORE_QUIZ_QUESTIONS));
    currentQuestionIdx = 0;
    userAnswers = [];
    adaptiveCount = 0;
    quizBusy = false;

    const resultView = document.getElementById('quizResultView');
    const activeView = document.getElementById('quizActiveView');
    if (resultView) resultView.style.display = 'none';
    if (activeView) activeView.style.display = 'block';

    renderQuestion();
  }

  function renderDots() {
    const dotsContainer = document.getElementById('quizDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    activeQuestions.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'quiz-progress-dot' + (i === currentQuestionIdx ? ' active' : i < currentQuestionIdx ? ' completed' : '');
      dotsContainer.appendChild(dot);
    });
  }

  function renderQuestion() {
    if (currentQuestionIdx >= activeQuestions.length) {
      showQuizResults();
      return;
    }
    const qData = activeQuestions[currentQuestionIdx];
    renderDots();

    const counter = document.getElementById('quizStepCounter');
    if (counter) counter.textContent = `${currentQuestionIdx + 1} / ${activeQuestions.length}`;

    let optsHtml = '';
    qData.options.forEach((opt, idx) => {
      optsHtml += `<button type="button" class="quiz-opt-btn" data-idx="${idx}" data-score="${opt.score}">${opt.label}</button>`;
    });

    const quizCardContent = document.getElementById('quizCardContent');
    if (quizCardContent) {
      quizCardContent.innerHTML = `
        <h3 class="quiz-question-title">${qData.question}</h3>
        <div class="quiz-options-list">${optsHtml}</div>
      `;
    }
    quizBusy = false;
  }

  const quizCardContent = document.getElementById('quizCardContent');
  if (quizCardContent) {
    quizCardContent.addEventListener('click', function (e) {
      const btn = e.target.closest('.quiz-opt-btn');
      if (!btn || quizBusy) return;
      quizBusy = true;

      quizCardContent.querySelectorAll('.quiz-opt-btn').forEach(b => {
        b.classList.remove('picked');
        b.disabled = true;
      });
      btn.classList.add('picked');

      const optIdx = parseInt(btn.getAttribute('data-idx'), 10);
      const score = parseInt(btn.getAttribute('data-score'), 10);
      const qData = activeQuestions[currentQuestionIdx];

      userAnswers[currentQuestionIdx] = {
        qId: qData.id,
        category: qData.category,
        score: score,
        recoKey: qData.options[optIdx].recoKey || null
      };

      if (adaptiveCount < 1 && score >= 3) {
        if (qData.category === 'gerak' && !activeQuestions.some(q => q.id === ADAPTIVE_BANK.screen_sit.id)) {
          activeQuestions.splice(currentQuestionIdx + 1, 0, ADAPTIVE_BANK.screen_sit);
          adaptiveCount++;
        } else if (qData.category === 'digital' && !activeQuestions.some(q => q.id === ADAPTIVE_BANK.kontrol.id)) {
          activeQuestions.splice(currentQuestionIdx + 1, 0, ADAPTIVE_BANK.kontrol);
          adaptiveCount++;
        }
      }

      setTimeout(() => {
        currentQuestionIdx++;
        renderQuestion();
      }, 260);
    });
  }

  function showQuizResults() {
    const activeView = document.getElementById('quizActiveView');
    const resultView = document.getElementById('quizResultView');
    if (activeView) activeView.style.display = 'none';
    if (resultView) {
      resultView.style.display = 'block';
      calculateAndRenderScore();
      launchConfetti();
      playUiSound('success');
    }
  }

  function calculateAndRenderScore() {
    const totalQuestions = userAnswers.length;
    const rawSum = userAnswers.reduce((acc, a) => acc + (a ? a.score : 1), 0);
    const maxRaw = totalQuestions * 4;
    const score120 = Math.round((rawSum / maxRaw) * 120);

    const scoreNum = document.getElementById('resultScoreNum');
    if (scoreNum) scoreNum.textContent = score120;

    let levelText = 'BALANCED';
    let levelClass = 'badge-balanced';
    let levelIcon = '🟢';
    let desc = '"Pola kebiasaan digitalmu cukup sehat dan seimbang. Pertahankan ritme ini!"';

    if (score120 > 90) {
      levelText = 'TIME FOR A BREAK';
      levelClass = 'badge-break';
      levelIcon = '🔴';
      desc = '"Gaya hidup digitalmu sudah berada di tingkat waspada. Sangat dianjurkan memulai langkah jeda nyata."';
    } else if (score120 > 70) {
      levelText = 'NEED A RESET';
      levelClass = 'badge-move';
      levelIcon = '🟠';
      desc = '"Beberapa kebiasaan digitalmu mulai mengganggu jam tidur dan aktivitas fisik harian."';
    } else if (score120 > 50) {
      levelText = 'NEED MORE MOVE';
      levelClass = 'badge-reset';
      levelIcon = '🟡';
      desc = '"Secara umum stabil, namun tubuhmu butuh lebih banyak gerak fisik dan waktu bebas layar."';
    }

    const badge = document.getElementById('resultStatusBadge');
    if (badge) {
      badge.className = `result-status-badge ${levelClass}`;
      document.getElementById('resultStatusIcon').textContent = levelIcon;
      document.getElementById('resultStatusText').textContent = levelText;
    }
    const descEl = document.getElementById('resultStatusDesc');
    if (descEl) descEl.textContent = desc;

    /* Render 5 Dimensions */
    const catMap = {
      digital: { label: 'Screen Time & Digital Overload', total: 0, count: 0 },
      gerak: { label: 'Aktivitas Fisik & Postur', total: 0, count: 0 },
      tidur: { label: 'Kualitas & Jadwal Tidur', total: 0, count: 0 },
      makan: { label: 'Pola Makan & Mindful Eating', total: 0, count: 0 },
      wellbeing: { label: 'Kebugaran Mental & Fisik', total: 0, count: 0 }
    };

    userAnswers.forEach(ans => {
      if (ans && catMap[ans.category]) {
        catMap[ans.category].total += ans.score;
        catMap[ans.category].count += 1;
      }
    });

    const dimContainer = document.getElementById('dimensionList');
    if (dimContainer) {
      dimContainer.innerHTML = '';
      Object.keys(catMap).forEach(key => {
        const item = catMap[key];
        const pct = item.count > 0 ? Math.round(((item.total / (item.count * 4))) * 100) : 40;
        const barClass = pct > 70 ? 'bar-danger' : pct > 45 ? 'bar-warning' : 'bar-safe';
        dimContainer.insertAdjacentHTML('beforeend', `
          <div class="dim-bar-row">
            <div class="dim-bar-header">
              <span>${item.label}</span>
              <span>${pct}%</span>
            </div>
            <div class="dim-bar-track">
              <div class="dim-bar-fill ${barClass}" style="width: ${pct}%"></div>
            </div>
          </div>
        `);
      });
    }

    /* 3 Action Recommendations */
    const recoPool = [
      { icon: '🌙', title: '1 Jam Tanpa Layar Sebelum Tidur', desc: 'Jauhkan smartphone sebelum tidur untuk mempercepat produksi melatonin alami tubuh.' },
      { icon: '🚶', title: 'Aturan Duduk 45/5 Menit', desc: 'Setiap 45 menit duduk, luangkan 5 menit berdiri dan stretching ringan leher & punggung.' },
      { icon: '🥗', title: 'Makan Bebas Gadget', desc: 'Fokus menikmati rasa makanan tanpa video pendek agar porsi makan terkontrol dengan sehat.' }
    ];

    const actionGrid = document.getElementById('actionCardsGrid');
    if (actionGrid) {
      actionGrid.innerHTML = '';
      recoPool.forEach((r, idx) => {
        actionGrid.insertAdjacentHTML('beforeend', `
          <div class="action-card-item">
            <div style="font-size: 1.8rem; margin-bottom: 0.5rem;">${r.icon}</div>
            <strong>${idx + 1}. ${r.title}</strong>
            <p>${r.desc}</p>
          </div>
        `);
      });
    }

    /* Simpan ke localStorage untuk banner Tips */
    try {
      localStorage.setItem('rebahan_quiz_result', JSON.stringify({
        score: score120,
        level: levelText,
        focusTitle: 'POLA TIDUR & GERAK',
        focusDesc: 'Aktivitas digitalmu terlihat paling sering memotong waktu istirahat dan mobilitas tubuh.'
      }));
    } catch (e) { }
  }

  const restartBtn = document.getElementById('quizRestartBtn');
  if (restartBtn) restartBtn.addEventListener('click', initQuiz);
  if (document.getElementById('quizCardContent')) initQuiz();

  /* =========================================================
     5. TIPS ACCORDION & RANDOM FACTS
     ========================================================= */
  (function showQuizRecoBanner() {
    const banner = document.getElementById('quizRecoBanner');
    if (!banner) return;
    try {
      const saved = JSON.parse(localStorage.getItem('rebahan_quiz_result'));
      if (saved) {
        document.getElementById('recoLevelText').textContent = saved.level || 'BALANCED';
        document.getElementById('recoScoreNum').textContent = saved.score || 0;
        document.getElementById('recoFocusTitle').textContent = saved.focusTitle || 'POLA TIDUR';
        document.getElementById('recoFocusDesc').textContent = saved.focusDesc || '';
        banner.style.display = 'flex';
      }
    } catch (e) { }
  })();

  document.querySelectorAll('.accordion-head').forEach(head => {
    head.addEventListener('click', function () {
      const item = this.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      item.classList.toggle('open');
      const plusEl = this.querySelector('.plus');
      if (plusEl) {
        plusEl.textContent = wasOpen ? '+' : '−';
      }
    });
  });

  const facts = [
    "Rata-rata orang Indonesia menghabiskan lebih dari 7 jam per hari di depan layar — salah satu tertinggi di dunia.",
    "66,3% responden dalam studi kesehatan memiliki gaya hidup sedentari tanpa aktivitas fisik seimbang.",
    "Cahaya biru dari layar menekan produksi melatonin hingga 2 kali lipat dibanding sumber cahaya lainnya.",
    "Kaidah 20-20-20: Tiap 20 menit menatap layar, istirahatkan mata dengan melihat objek 6 meter selama 20 detik.",
    "Gerak peregangan 5 menit per jam terbukti meningkatkan fokus kognitif dan melancarkan sirkulasi darah."
  ];

  const factBtn = document.getElementById('factBtn');
  if (factBtn) {
    factBtn.addEventListener('click', function () {
      const randomItem = facts[Math.floor(Math.random() * facts.length)];
      const factEl = document.getElementById('randomFact');
      if (factEl) {
        factEl.style.opacity = '0.4';
        setTimeout(() => {
          factEl.textContent = randomItem;
          factEl.style.opacity = '1';
        }, 150);
      }
    });
  }

  /* Contact Form Handler */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('Pesan dan masukan Anda berhasil terkirim. Terima kasih!', '💌');
      playUiSound('success');
      contactForm.reset();
    });
  }

  /* =========================================================
     6. HABIT TRACKER (LOCAL STORAGE & 22:00 RESET)
     ========================================================= */
  const habitList = document.getElementById('habitList');
  if (habitList) {
    const DEFAULT_HABITS = [
      { id: 'def_1', title: 'Minum 2 liter air putih', category: 'Nutrisi', isDefault: true },
      { id: 'def_2', title: 'Gerak / jalan minimal 15 menit', category: 'Fisik', isDefault: true },
      { id: 'def_3', title: 'Makan sehat bebas junk food', category: 'Nutrisi', isDefault: true },
      { id: 'def_4', title: 'Screen time non-tugas di bawah target', category: 'Mental', isDefault: true },
      { id: 'def_5', title: 'Digital detox 1 jam sebelum tidur', category: 'Tidur', isDefault: true },
      { id: 'def_6', title: 'Peregangan leher & perbaiki postur', category: 'Fisik', isDefault: true }
    ];

    let customHabits = [];
    try {
      customHabits = JSON.parse(localStorage.getItem('rebahan_custom_habits')) || [];
    } catch (e) { customHabits = []; }

    let trackerState = { lastResetPeriod: '', checkedMap: {}, streak: 0 };
    try {
      const savedState = JSON.parse(localStorage.getItem('rebahan_tracker_state'));
      if (savedState) trackerState = Object.assign(trackerState, savedState);
    } catch (e) { }

    function getTargetResetDate(now) {
      const target = new Date(now);
      target.setHours(22, 0, 0, 0);
      if (now.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      return target;
    }

    function getPeriodKey(targetReset) {
      const y = targetReset.getFullYear();
      const m = String(targetReset.getMonth() + 1).padStart(2, '0');
      const d = String(targetReset.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}_22:00`;
    }

    function checkAndApplyReset() {
      const now = new Date();
      const targetReset = getTargetResetDate(now);
      const currentPeriod = getPeriodKey(targetReset);

      if (trackerState.lastResetPeriod !== currentPeriod) {
        if (trackerState.lastResetPeriod) {
          const checkedCount = Object.keys(trackerState.checkedMap || {}).filter(k => trackerState.checkedMap[k] === true).length;
          if (checkedCount >= 4) {
            trackerState.streak = (trackerState.streak || 0) + 1;
          } else {
            trackerState.streak = 0;
          }
        }
        trackerState.checkedMap = {};
        trackerState.lastResetPeriod = currentPeriod;
        saveTrackerState();
      }
    }

    function saveTrackerState() {
      try { localStorage.setItem('rebahan_tracker_state', JSON.stringify(trackerState)); } catch (e) { }
    }

    function saveCustomHabits() {
      try { localStorage.setItem('rebahan_custom_habits', JSON.stringify(customHabits)); } catch (e) { }
    }

    function updateCountdownTimer() {
      const now = new Date();
      const targetReset = getTargetResetDate(now);
      const diffMs = targetReset.getTime() - now.getTime();

      if (diffMs <= 0) {
        checkAndApplyReset();
        renderAll();
        return;
      }
      const totalSec = Math.floor(diffMs / 1000);
      const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const ss = String(totalSec % 60).padStart(2, '0');

      const cd = document.getElementById('resetCountdown');
      if (cd) cd.textContent = `${hh}:${mm}:${ss}`;
    }

    setInterval(updateCountdownTimer, 1000);
    updateCountdownTimer();

    function getAllHabits() {
      return DEFAULT_HABITS.concat(customHabits);
    }

    let currentCategory = 'Semua';
    const categoryTabsContainer = document.getElementById('categoryTabs');
    if (categoryTabsContainer) {
      categoryTabsContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.filter-tab');
        if (btn) {
          categoryTabsContainer.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentCategory = btn.getAttribute('data-cat');
          renderHabitList();
          updateHabitUI();
        }
      });
    }

    function addHabit() {
      const input = document.getElementById('newHabitInput');
      const categorySelect = document.getElementById('newHabitCategory');
      const title = input.value.trim();
      const cat = categorySelect.value || 'Custom';

      if (!title) {
        input.focus();
        showToast('Tuliskan nama target kebiasaanmu dulu', '✍️');
        return;
      }

      customHabits.push({
        id: 'cust_' + Date.now(),
        title: title,
        category: cat,
        isDefault: false
      });
      saveCustomHabits();
      input.value = '';
      showToast('Target baru berhasil ditambahkan!', '🎯');
      playUiSound('success');
      renderAll();
    }

    const addHabitBtn = document.getElementById('addHabitBtn');
    if (addHabitBtn) addHabitBtn.addEventListener('click', addHabit);

    const newHabitInput = document.getElementById('newHabitInput');
    if (newHabitInput) {
      newHabitInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addHabit();
      });
    }

    /* Modal Confirmation */
    let pendingHabitId = null;
    function openConfirmModal(habitId, title) {
      pendingHabitId = habitId;
      const modalText = document.getElementById('confirmModalText');
      if (modalText) modalText.textContent = `Apakah kamu sudah benar-benar menyelesaikan "${title}" hari ini?`;
      const modal = document.getElementById('confirmModalOverlay');
      if (modal) modal.classList.add('show');
    }

    function closeConfirmModal() {
      pendingHabitId = null;
      const modal = document.getElementById('confirmModalOverlay');
      if (modal) modal.classList.remove('show');
    }

    const cancelBtn = document.getElementById('confirmCancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeConfirmModal);

    const okBtn = document.getElementById('confirmOkBtn');
    if (okBtn) {
      okBtn.addEventListener('click', function () {
        if (pendingHabitId) {
          trackerState.checkedMap[pendingHabitId] = true;
          saveTrackerState();
          showToast('Kebiasaan berhasil dicentang & terkunci!', '✅');
          playUiSound('success');
          renderAll();
        }
        closeConfirmModal();
      });
    }

    const modalOverlay = document.getElementById('confirmModalOverlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeConfirmModal();
      });
    }

    habitList.addEventListener('click', function (e) {
      const deleteBtn = e.target.closest('.btn-delete-habit');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        customHabits = customHabits.filter(h => h.id !== id);
        delete trackerState.checkedMap[id];
        saveCustomHabits();
        saveTrackerState();
        showToast('Target berhasil dihapus', '🗑️');
        renderAll();
        return;
      }

      const cb = e.target.closest('.habit-checkbox');
      if (cb) {
        const id = cb.getAttribute('data-id');
        if (trackerState.checkedMap[id]) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        const habit = getAllHabits().find(h => h.id === id);
        openConfirmModal(id, habit ? habit.title : 'kebiasaan ini');
      }
    });

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    function renderHabitList() {
      const all = getAllHabits();
      const filtered = all.filter(h => currentCategory === 'Semua' || h.category === currentCategory);
      habitList.innerHTML = '';

      if (filtered.length === 0) {
        habitList.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.92rem;">Belum ada target pada kategori "${escapeHtml(currentCategory)}".</div>`;
        return;
      }

      filtered.forEach(h => {
        const isDone = !!trackerState.checkedMap[h.id];
        const deleteBtnHtml = (!h.isDefault && !isDone) ? `<button class="btn-delete-habit" data-id="${h.id}" title="Hapus target" style="background: transparent; border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px; cursor: pointer; color: var(--text-dim);">🗑️</button>` : '';
        const lockTag = isDone ? `<span style="font-size: 0.72rem; font-weight: 700; color: var(--accent-2); background: color-mix(in srgb, var(--accent-2) 15%, transparent); padding: 3px 9px; border-radius: 9999px;">🔒 Terkunci</span>` : '';

        habitList.insertAdjacentHTML('beforeend', `
          <div class="habit-item ${isDone ? 'done' : ''}" data-id="${h.id}">
            <div class="habit-left">
              <input type="checkbox" class="habit-checkbox" data-id="${h.id}" ${isDone ? 'checked disabled' : ''}>
              <span class="habit-text">${escapeHtml(h.title)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 0.72rem; font-weight: 600; color: var(--text-dim); background: var(--surface-2); padding: 3px 9px; border-radius: 9999px; border: 1px solid var(--border);">${escapeHtml(h.category)}</span>
              ${lockTag}
              ${deleteBtnHtml}
            </div>
          </div>
        `);
      });
    }

    function updateHabitUI() {
      const all = getAllHabits();
      const total = all.length;
      let done = 0;
      all.forEach(h => {
        if (trackerState.checkedMap[h.id]) done++;
      });

      const summary = document.getElementById('completedSummary');
      if (summary) summary.textContent = `${done} dari ${total}`;

      const streakCountEl = document.getElementById('streakCount');
      const streakBadge = document.getElementById('streakBadge');
      const targetBadge = document.getElementById('targetStatusBadge');

      if (done >= 4) {
        if (streakBadge) {
          streakBadge.textContent = '🔥 Active Hari Ini';
          streakBadge.style.color = '#ff9800';
        }
        if (targetBadge) {
          targetBadge.textContent = '✅ Target Min. 4 Tercapai!';
          targetBadge.style.color = '#249988';
        }
        if (streakCountEl) streakCountEl.textContent = (trackerState.streak || 0) + 1;
      } else {
        if (streakBadge) {
          streakBadge.textContent = 'Min. 4 Centang';
          streakBadge.style.color = '';
        }
        if (targetBadge) {
          targetBadge.textContent = `Minimal 4 untuk Streak (${done}/4)`;
          targetBadge.style.color = '';
        }
        if (streakCountEl) streakCountEl.textContent = trackerState.streak || 0;
      }

      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      const progressText = document.getElementById('habitProgressText');
      const percentText = document.getElementById('habitPercentText');
      const progressFill = document.getElementById('habitProgressFill');

      if (progressText) progressText.textContent = `${done} dari ${total} selesai hari ini`;
      if (percentText) percentText.textContent = `${percent}%`;
      if (progressFill) progressFill.style.width = `${percent}%`;
    }

    function renderAll() {
      checkAndApplyReset();
      renderHabitList();
      updateHabitUI();
    }

    renderAll();
  }
});
