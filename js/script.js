
/* =========================================================
   GENERASI REBAHAN — Main JavaScript
   =========================================================
   1. UI CONTROLS (mode tema, ukuran font, slider maskot)
   2. NAV & SCROLL EFFECTS (active link, counter animasi, kartu cermin)
   3. QUIZ ENGINE (bank soal, adaptif, render, hasil)
   4. QUIZ BANNER (tampilkan hasil kuis di halaman Tips)
   5. ACCORDION (Tips & Tracker expandable section)
   6. RANDOM FACT (generator fakta acak)
   7. HABIT TRACKER (streak, reset harian, CRUD habit, modal konfirmasi)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* =========================================================
     0. INTERACTIVE SYSTEM HELPERS (Toast, Sound, Confetti, Tilt, Scroll)
     ========================================================= */

  /* ----- 0.1 Toast Notification Engine ----- */
  function showToast(message, icon = '✨', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span style="font-size:1.1rem;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    void toast.offsetWidth; // force reflow
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, duration);
  }

  /* ----- 0.2 Web Audio API Sound FX Engine ----- */
  let soundEnabled = true;
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
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.07);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.07);
        osc.frequency.setValueAtTime(783.99, now + 0.14);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'fanfare') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.05);
          g.gain.setValueAtTime(0.08, now + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
          o.start(now + i * 0.05);
          o.stop(now + i * 0.05 + 0.3);
        });
      }
    } catch (e) { }
  }

  /* Sound feedback listener for interactive elements */
  document.addEventListener('click', function (e) {
    const clickable = e.target.closest('button, a, .mirror-card, .accordion-head, input[type="range"]');
    if (clickable) {
      playUiSound('click');
    }
  });

  const siteNav = document.querySelector('.site-nav');
  if (siteNav) {
    const syncNavOffset = function () {
      document.body.style.paddingTop = `${siteNav.offsetHeight}px`;
    };
    syncNavOffset();
    window.addEventListener('resize', syncNavOffset);
  }

  /* ----- 0.3 Canvas Confetti Particle System ----- */
  function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f2b84b', '#5fbdb0', '#e0684f', '#ffffff', '#ff9800', '#a855f7'];
    const particles = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.45 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.32,
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
        p.vy += p.gravity;
        p.rotation += p.rSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
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
    playUiSound('fanfare');
  }

  /* ----- 0.4 Interactive 3D Card Tilt & Mouse Spotlight ----- */
  function initTiltCards() {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const tiltCards = document.querySelectorAll('.tilt-card:not(.no-tilt), .mirror-card:not(.no-tilt)');
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.style.setProperty('--mouse-x', `${x}px`);
        this.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', function () {
        this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }
  initTiltCards();

  /* ----- 0.5 Scroll Reveal Observer ----- */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(r => r.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    reveals.forEach(r => observer.observe(r));
  }
  initScrollReveal();

  /* ----- 0.6 Back to Top Floating Button ----- */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 280) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----- 0.7 Mascot Floating Emoji Particle Generator ----- */
  let lastParticleTime = 0;
  function spawnMascotEmoji(sliderVal) {
    const now = Date.now();
    if (now - lastParticleTime < 240) return;
    lastParticleTime = now;

    const mascotContainer = document.getElementById('mascotContainer');
    if (!mascotContainer) return;

    let emojis = ['💤', '📱', '🍕', '🛋️', '🥤'];
    if (sliderVal <= 33) emojis = ['⚡', '🏃', '🥗', '🌱', '☀️'];
    else if (sliderVal <= 66) emojis = ['📱', '🎧', '🛋️', '🍿', '☕'];

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const particle = document.createElement('span');
    particle.className = 'floating-emoji-particle';
    particle.textContent = randomEmoji;

    const rect = mascotContainer.getBoundingClientRect();
    const posX = Math.random() * (rect.width * 0.7) + (rect.width * 0.15);
    const posY = Math.random() * (rect.height * 0.4) + (rect.height * 0.3);

    particle.style.left = `${posX}px`;
    particle.style.top = `${posY}px`;

    mascotContainer.appendChild(particle);

    setTimeout(() => {
      if (particle.parentNode) particle.parentNode.removeChild(particle);
    }, 1300);
  }

  /* =========================================================
     1. UI CONTROLS
     ========================================================= */

  /* ----- 1.1 Mode Toggle (Rebahan ↔ Sehat / Dark ↔ Light) ----- */
  const modeToggle = document.getElementById('modeToggle');
  if (modeToggle) {
    modeToggle.addEventListener('click', function () {
      const isSehat = document.body.getAttribute('data-mode') === 'sehat';
      if (isSehat) {
        document.body.setAttribute('data-mode', 'rebahan');
        this.innerHTML = '🌙 Mode Rebahan';
        showToast('Mode Rebahan Aktif 🌙', '🌙');
      } else {
        document.body.setAttribute('data-mode', 'sehat');
        this.innerHTML = '☀️ Mode Sehat';
        showToast('Mode Sehat Aktif ☀️', '☀️');
      }
    });
  }

  /* ----- 1.2 Hero Mascot Slider (3 stage gambar maskot + Emoji burst) ----- */
  const mascotStages = [
    { max: 33, src: 'mascot/aset10.png', alt: 'Maskot kukang santai di bean bag — rebahan ringan' },
    { max: 66, src: 'mascot/aset7.png', alt: 'Maskot kukang main HP di bean bag' },
    { max: 100, src: 'mascot/aset6.png', alt: 'Maskot kukang rebahan maksimal dengan tablet dan keripik' }
  ];
  
  function updateHeroMascot(value) {
    const img = document.getElementById('heroMascotImg');
    if (!img) return;
    let stage = mascotStages[mascotStages.length - 1];
    for (let i = 0; i < mascotStages.length; i++) {
      if (value <= mascotStages[i].max) {
        stage = mascotStages[i];
        break;
      }
    }
    if (img.getAttribute('src') !== stage.src) {
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
      const val = parseInt(this.value, 10);
      updateHeroMascot(val);
      spawnMascotEmoji(val);
    });
  }

  /* =========================================================
     2. NAV & SCROLL EFFECTS
     ========================================================= */

  /* ----- 2.1 Sticky Nav — Highlight Active Link saat scroll ----- */
  const sections = Array.from(document.querySelectorAll('section, footer')).filter(el => el.id);
  const navLinks = document.querySelectorAll('.navlinks a');
  window.addEventListener('scroll', function () {
    const scrollPos = window.scrollY + 120;
    sections.forEach(function (section) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector('.navlinks a[href="#' + section.id + '"]');
        if (activeLink) activeLink.classList.add('active');
      }
    });
  });

  /* ----- 2.2 Cermin Kebiasaan — Toggle buka/tutup refleksi ----- */
  document.querySelectorAll('.mirror-card').forEach(card => {
    card.addEventListener('click', function () {
      this.classList.toggle('open');
    });
  });

  /* ----- 2.3 Fakta & Data — Counter animasi saat section terlihat ----- */
  let counted = false;
  function animateCounters() {
    if (counted) return;
    const fakta = document.getElementById('fakta');
    if (!fakta) return;
    const statTop = fakta.offsetTop;
    if (window.scrollY + window.innerHeight > statTop + 80) {
      counted = true;
      document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = target % 1 !== 0;
        
        let startTimestamp = null;
        const duration = 1400;
        
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const currentVal = progress * target;
          
          el.textContent = (isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal)) + suffix;
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
          }
        };
        window.requestAnimationFrame(step);
      });
    }
  }
  window.addEventListener('scroll', animateCounters);
  animateCounters();

  /* =========================================================
     3. QUIZ ENGINE — Cek Kebiasaan Adaptif
     ========================================================= */

  /* ----- 3.1 Bank Soal Inti (10 soal, 5 kategori) ----- */
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
      question: 'Apa yang biasanya kamu lakukan dalam 15 menit pertama setelah bangun?',
      options: [
        { label: 'Langsung beraktivitas tanpa HP', score: 1 },
        { label: 'Sesekali cek HP', score: 2 },
        { label: 'Cek notifikasi/media sosial', score: 3 },
        { label: 'Langsung scrolling cukup lama', score: 4, recoKey: 'morning_detox' }
      ]
    },
    {
      id: 'lama_duduk',
      category: 'gerak',
      question: 'Kalau sedang belajar, bekerja, bermain, atau menonton, berapa lama kamu biasanya bisa duduk tanpa berdiri?',
      options: [
        { label: '< 30 menit', score: 1 },
        { label: '30–60 menit', score: 2 },
        { label: '1–2 jam', score: 3 },
        { label: '> 2 jam', score: 4, recoKey: 'stand_up_breaks' }
      ]
    },
    {
      id: 'gerak',
      category: 'gerak',
      question: 'Dalam seminggu, seberapa sering kamu sengaja melakukan aktivitas fisik?',
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
      question: 'Pada hari biasa, bagaimana pola tidurmu?',
      options: [
        { label: 'Cukup dan teratur', score: 1 },
        { label: 'Kadang tidur terlalu larut', score: 2 },
        { label: 'Sering kurang tidur', score: 3 },
        { label: 'Sangat tidak teratur/sering begadang', score: 4, recoKey: 'sleep_schedule' }
      ]
    },
    {
      id: 'hp_tidur',
      category: 'tidur',
      question: 'Apa yang paling sering kamu lakukan ketika sudah waktunya tidur tetapi masih memegang HP?',
      options: [
        { label: 'Langsung meletakkan HP', score: 1 },
        { label: 'Cek sebentar lalu tidur', score: 2 },
        { label: 'Scrolling/menonton cukup lama', score: 3 },
        { label: 'Sering tidak sadar sudah larut karena HP', score: 4, recoKey: 'night_screen_detox' }
      ]
    },
    {
      id: 'makanan',
      category: 'makan',
      question: 'Seberapa sering makanan cepat saji/ultra-proses menjadi pilihan utama ketika kamu lapar?',
      options: [
        { label: 'Jarang', score: 1 },
        { label: '1–2 kali seminggu', score: 2 },
        { label: '3–5 kali seminggu', score: 3 },
        { label: 'Hampir setiap hari', score: 4, recoKey: 'healthy_snack' }
      ]
    },
    {
      id: 'minuman',
      category: 'makan',
      question: 'Seberapa sering kamu mengonsumsi minuman berpemanis seperti soda, boba, teh kemasan, atau kopi susu?',
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
      question: 'Seberapa sering kamu makan sambil scrolling, menonton, atau bermain?',
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
      question: 'Setelah seharian beraktivitas di depan layar, apa yang paling sering kamu rasakan?',
      options: [
        { label: 'Tubuh terasa normal', score: 1 },
        { label: 'Sedikit pegal/lelah', score: 2 },
        { label: 'Sering pegal, mata lelah, atau kaku', score: 3 },
        { label: 'Sangat tidak nyaman dan mengganggu aktivitas', score: 4, recoKey: 'body_recovery' }
      ]
    }
  ];

  /* ----- 3.2 Bank Soal Adaptif (maks. 2 soal lanjutan, dipilih berdasarkan jawaban) ----- */
  const ADAPTIVE_BANK = {
    screen_sit: {
      id: 'adaptive_screen_sit',
      category: 'gerak',
      question: 'Dari waktu tersebut, berapa banyak yang biasanya kamu habiskan sambil duduk atau rebahan?',
      options: [
        { label: 'Sedikit — sering berdiri atau bergerak', score: 1 },
        { label: 'Sekitar separuhnya', score: 2 },
        { label: 'Sebagian besar sambil duduk', score: 3 },
        { label: 'Hampir seluruhnya sambil rebahan', score: 4, recoKey: 'stand_up_breaks' }
      ]
    },
    sit_break: {
      id: 'adaptive_sit_break',
      category: 'gerak',
      question: 'Saat harus duduk lama, seberapa sering kamu menyempatkan berdiri atau stretching?',
      options: [
        { label: 'Rutin tiap 30–60 menit', score: 1 },
        { label: 'Sesekali kalau ingat', score: 2 },
        { label: 'Jarang sekali', score: 3 },
        { label: 'Hampir tidak pernah', score: 4, recoKey: 'regular_movement' }
      ]
    },
    kontrol: {
      id: 'adaptive_kontrol',
      category: 'wellbeing',
      question: 'Seberapa sering kamu berniat menggunakan HP sebentar tetapi akhirnya jauh lebih lama?',
      options: [
        { label: 'Hampir tidak pernah', score: 1 },
        { label: 'Sesekali', score: 2 },
        { label: 'Sering', score: 3 },
        { label: 'Hampir setiap hari', score: 4, recoKey: 'app_timers' }
      ]
    },
    dampak: {
      id: 'adaptive_dampak',
      category: 'wellbeing',
      question: 'Seberapa sering kebiasaan digital membuatmu menunda hal penting seperti belajar, tidur, makan, olahraga, atau bersosialisasi?',
      options: [
        { label: 'Hampir tidak pernah', score: 1 },
        { label: 'Sesekali', score: 2 },
        { label: 'Sering', score: 3 },
        { label: 'Hampir setiap hari', score: 4, recoKey: 'focus_priority' }
      ]
    }
  };

  /* ----- 3.3 State Kuis Global ----- */
  const MAX_ADAPTIVE = 2;
  let activeQuestions = [];
  let currentQuestionIdx = 0;
  let userAnswers = [];
  let adaptiveCount = 0;
  let quizBusy = false;

  /* ----- 3.4 Helper Jawaban (cari / cek jawaban per ID) ----- */
  function answerById(id) {
    for (let i = 0; i < userAnswers.length; i++) {
      if (userAnswers[i] && userAnswers[i].qId === id) return userAnswers[i];
    }
    return null;
  }

  function questionExists(id) {
    return activeQuestions.some(item => item.id === id);
  }

  function insertAdaptive(question) {
    if (!question || adaptiveCount >= MAX_ADAPTIVE) return;
    if (questionExists(question.id)) return;
    activeQuestions.splice(currentQuestionIdx + 1, 0, question);
    adaptiveCount += 1;
  }

  /* ----- 3.5 Logic Insert Soal Adaptif (berdasarkan score jawaban) ----- */
  function pickAdaptiveFollowUp(qData, score) {
    if (qData.id === 'screen_time' && score >= 3) {
      insertAdaptive(ADAPTIVE_BANK.screen_sit);
      return;
    }
    if (qData.id === 'lama_duduk' && score >= 4) {
      insertAdaptive(ADAPTIVE_BANK.sit_break);
      return;
    }
    if ((qData.id === 'hp_tidur' || qData.id === 'tidur') && score >= 3) {
      insertAdaptive(ADAPTIVE_BANK.kontrol);
      return;
    }
    if (qData.id === 'kondisi_tubuh') {
      const screenAns = answerById('screen_time');
      const makanScreen = answerById('makan_screen');
      const highDigital = (screenAns && screenAns.score >= 3) || (makanScreen && makanScreen.score >= 3) || score >= 3;
      if (highDigital) insertAdaptive(ADAPTIVE_BANK.dampak);
    }
  }

  /* ----- 3.6 Helper Animasi Transisi Kartu Soal (fadeIn / fadeOut) ----- */
  function fadeOut(el, cb) {
    if (!el) {
      if (cb) cb();
      return;
    }
    el.style.transition = 'opacity 0.28s ease';
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.display = 'none';
      if (cb) cb();
    }, 280);
  }

  function fadeIn(el, displayType = 'block', duration = 360, cb) {
    if (!el) {
      if (cb) cb();
      return;
    }
    el.style.opacity = '0';
    el.style.display = displayType;
    el.style.transition = `opacity ${duration}ms ease`;
    setTimeout(() => {
      el.style.opacity = '1';
      setTimeout(() => {
        if (cb) cb();
      }, duration);
    }, 10);
  }

  /* ----- 3.7 Init Kuis — Reset state, kembali ke soal pertama ----- */
  function initQuiz() {
    const quizCardContent = document.getElementById('quizCardContent');
    if (!quizCardContent) return;
    activeQuestions = JSON.parse(JSON.stringify(CORE_QUIZ_QUESTIONS));
    currentQuestionIdx = 0;
    userAnswers = [];
    adaptiveCount = 0;
    quizBusy = false;
    
    document.getElementById('quizResultView').style.display = 'none';
    const activeView = document.getElementById('quizActiveView');
    activeView.style.display = 'block';
    activeView.style.opacity = '1';
    
    renderQuestion(false);
  }

  /* ----- 3.8 Render Indikator Soal (dots progress) ----- */
  function renderDots() {
    const dotsContainer = document.getElementById('quizDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = activeQuestions.length;
    for (let i = 0; i < total; i++) {
      const isCompleted = i < currentQuestionIdx;
      const isActive = i === currentQuestionIdx;
      let dotClass = 'inline-block h-[9px] w-[9px] rounded-full border-[1.5px] border-dim/55 transition-all duration-300';
      if (isActive) dotClass += ' scale-125 border-accent bg-accent';
      else if (isCompleted) dotClass += ' border-accent bg-accent/45';
      
      const span = document.createElement('span');
      span.className = dotClass;
      dotsContainer.appendChild(span);
    }
  }

  /* ----- 3.9 Render Kartu Soal Aktif ----- */
  function renderQuestion(fromSlide) {
    if (currentQuestionIdx >= activeQuestions.length) {
      showQuizResults();
      return;
    }

    const qData = activeQuestions[currentQuestionIdx];
    const total = activeQuestions.length;

    renderDots();
    const stepCounter = document.getElementById('quizStepCounter');
    if(stepCounter) stepCounter.textContent = (currentQuestionIdx + 1) + ' / ' + total;

    let optsHtml = '';
    qData.options.forEach(function (opt, idx) {
      optsHtml +=
        '<button type="button" class="quiz-opt-btn flex w-full cursor-pointer items-center justify-center rounded-xl border border-line bg-surface-2 px-[18px] py-3.5 text-center font-body text-[0.95rem] font-medium text-ink transition hover:border-accent hover:-translate-y-px" data-idx="' + idx + '" data-score="' + opt.score + '">' +
          '<span>' + opt.label + '</span>' +
        '</button>';
    });

    const enterClass = fromSlide ? 'quiz-card-animated animate-quiz-in' : 'quiz-card-animated animate-quiz-fade';
    const cardHtml =
      '<div class="' + enterClass + '">' +
        '<h3 class="mx-auto mb-[22px] max-w-[38ch] text-center font-display text-[1.18rem] leading-snug text-ink">' + qData.question + '</h3>' +
        '<div class="mx-auto flex max-w-[520px] flex-col gap-3">' + optsHtml + '</div>' +
      '</div>';

    const quizCardContent = document.getElementById('quizCardContent');
    quizCardContent.innerHTML = cardHtml;
    quizBusy = false;
  }

  /* ----- 3.10 Event Listener — Pilih Jawaban, Simpan, Lanjut ----- */
  const quizCardContent = document.getElementById('quizCardContent');
  if (quizCardContent) {
    quizCardContent.addEventListener('click', function (e) {
      const btn = e.target.closest('.quiz-opt-btn');
      if (!btn) return;
      if (quizBusy) return;
      if (btn.classList.contains('picked')) return;

      quizBusy = true;
      document.querySelectorAll('.quiz-opt-btn').forEach(b => {
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

      pickAdaptiveFollowUp(qData, score);

      const card = quizCardContent.querySelector('.quiz-card-animated');
      if (card) {
        card.classList.remove('animate-quiz-in', 'animate-quiz-fade');
        card.classList.add('animate-quiz-out');
      }

      setTimeout(function () {
        currentQuestionIdx += 1;
        renderQuestion(true);
      }, 280);
    });
  }

  /* ----- 3.11 Tampilkan Halaman Hasil Kuis ----- */
  function showQuizResults() {
    fadeOut(document.getElementById('quizActiveView'), () => {
      calculateAndRenderScore();
      fadeIn(document.getElementById('quizResultView'), 'flex', 360, () => {
        launchConfetti();
        showToast('Kuis Selesai! Hasil kamu telah dihitung 🎉', '🎉');
      });
    });
  }

  /* ----- 3.12 Kalkulasi Skor + Render Semua Elemen Hasil ----- */
  function calculateAndRenderScore() {
    /* --- Hitung total score & rata-rata per kategori --- */
    let totalRawScore = 0;
    const answered = userAnswers.length;
    const maxRawScore = answered * 4;
    const minRawScore = answered * 1;

    const catScores = {
      digital: { sum: 0, count: 0, icon: '📱', label: 'DIGITAL' },
      gerak: { sum: 0, count: 0, icon: '🪑', label: 'GERAK' },
      tidur: { sum: 0, count: 0, icon: '😴', label: 'TIDUR' },
      makan: { sum: 0, count: 0, icon: '🍔', label: 'MAKAN' },
      wellbeing: { sum: 0, count: 0, icon: '🧠', label: 'WELLBEING' }
    };

    userAnswers.forEach(function (ans) {
      totalRawScore += ans.score;
      if (catScores[ans.category]) {
        catScores[ans.category].sum += ans.score;
        catScores[ans.category].count += 1;
      }
    });

    /* --- Normalisasi ke skala 0–120 --- */
    const span = Math.max(1, maxRawScore - minRawScore);
    const score120 = Math.round(((totalRawScore - minRawScore) / span) * 120);

    /* --- Animasi hitung angka skor utama --- */
    const scoreEl = document.getElementById('resultScoreNum');
    if (scoreEl) {
      let startTimestamp = null;
      const duration = 1100;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = progress * score120;
        
        scoreEl.textContent = Math.floor(currentVal);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          scoreEl.textContent = score120;
        }
      };
      window.requestAnimationFrame(step);
    }

    /* --- Tentukan level badge (4 tier) --- */
    const levelConfig = {
      balanced: { key: 'balanced', icon: '🟢', text: 'BALANCED', badgeClass: 'badge-balanced', desc: 'Kebiasaanmu relatif seimbang.' },
      reset: { key: 'reset', icon: '🟡', text: 'NEED A RESET', badgeClass: 'badge-reset', desc: 'Bukan berarti kamu tidak sehat. Tapi beberapa kebiasaanmu mulai perlu diperhatikan.' },
      move: { key: 'move', icon: '🟠', text: 'TIME TO MOVE', badgeClass: 'badge-move', desc: 'Beberapa pola hidup digitalmu sudah cukup dominan.' },
      break: { key: 'break', icon: '🔴', text: 'BREAK THE LOOP', badgeClass: 'badge-break', desc: 'Banyak kebiasaanmu saling berkaitan dan sudah waktunya melakukan perubahan.' }
    };

    let currentLevel;
    if (score120 <= 36) currentLevel = levelConfig.balanced;
    else if (score120 <= 66) currentLevel = levelConfig.reset;
    else if (score120 <= 94) currentLevel = levelConfig.move;
    else currentLevel = levelConfig.break;

    document.getElementById('resultStatusIcon').textContent = currentLevel.icon;
    document.getElementById('resultStatusText').textContent = currentLevel.text;
    document.getElementById('resultStatusDesc').textContent = '“' + currentLevel.desc + '”';
    document.getElementById('resultStatusBadge').className = 'result-status-badge ' + currentLevel.badgeClass + ' inline-flex items-center gap-2 rounded-full border border-transparent px-[18px] py-2 font-display text-[1.05rem] font-bold tracking-wide';

    /* --- Render progress bar 5 dimensi + cari fokus utama (kategori tertinggi) --- */
    const dimList = document.getElementById('dimensionList');
    dimList.innerHTML = '';

    let maxCatKey = 'tidur';
    let maxCatRatio = -1;

    Object.keys(catScores).forEach(function (key) {
      const c = catScores[key];
      const count = c.count || 1;
      const minScore = count * 1;
      const maxScore = count * 4;
      const denom = Math.max(1, maxScore - minScore);
      const ratio = c.count ? ((c.sum - minScore) / denom) : 0;
      const catPercent = Math.round(ratio * 100);

      if (c.count && ratio > maxCatRatio) {
        maxCatRatio = ratio;
        maxCatKey = key;
      }

      const barClass = catPercent >= 70 ? 'bar-danger' : catPercent >= 40 ? 'bar-warning' : 'bar-safe';
      const dimItemHtml =
        '<div class="flex flex-col gap-1.5">' +
          '<div class="flex items-center justify-between text-[0.88rem] font-semibold">' +
            '<span>' + c.icon + ' ' + c.label + '</span>' +
            '<span class="text-[0.82rem] text-dim">' + catPercent + '%</span>' +
          '</div>' +
          '<div class="h-2.5 overflow-hidden rounded-full border border-line bg-surface-2">' +
            '<div class="dim-bar-fill h-full rounded-full transition-[width] duration-700 ' + barClass + '" style="width:0%;" data-target="' + catPercent + '"></div>' +
          '</div>' +
        '</div>';
      dimList.insertAdjacentHTML('beforeend', dimItemHtml);
    });

    /* --- Animasi fill progress bar dengan delay --- */
    setTimeout(function () {
      document.querySelectorAll('.dim-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-target') + '%';
      });
    }, 120);

    /* --- Render section "Perhatian Utama" --- */
    const focusData = {
      tidur: { title: 'POLA TIDUR', desc: 'Aktivitas digitalmu terlihat cukup sering menggeser waktu istirahat.' },
      digital: { title: 'SCREEN TIME', desc: 'Waktu di depan layar untuk hiburan sudah cukup tinggi dan mulai menggeser ritme harianmu.' },
      gerak: { title: 'LAMA DUDUK', desc: 'Kamu cenderung duduk atau rebahan terlalu lama tanpa jeda bergerak.' },
      makan: { title: 'POLA MAKAN', desc: 'Makanan cepat saji, minuman manis, atau makan sambil layar mulai jadi pola utama.' },
      wellbeing: { title: 'KONTROL DIRI', desc: 'Kebiasaan digital cenderung membuatmu kehilangan kendali waktu dan menunda hal penting.' }
    };

    const focusObj = focusData[maxCatKey] || focusData.tidur;
    document.getElementById('focusTitle').textContent = focusObj.title;
    document.getElementById('focusDesc').textContent = focusObj.desc;

    /* --- Rekomendasi Aksi (pilih 3 dari recoKey jawaban user + fallback) --- */
    const recoMap = {
      morning_detox: { icon: '🌅', title: 'Beri jeda 15 menit saat bangun', desc: 'Hirup udara atau bergerak dulu sebelum menyentuh HP.' },
      stand_up_breaks: { icon: '🚶', title: 'Bangun dan bergerak secara berkala', desc: 'Berdiri atau jalan 2 menit di tengah sesi duduk lama.' },
      regular_movement: { icon: '🏃', title: 'Jadwalkan gerak ringan 15 menit', desc: 'Pilih aktivitas fisik sederhana beberapa kali seminggu.' },
      sleep_schedule: { icon: '⏰', title: 'Jaga jam tidur yang lebih stabil', desc: 'Usahakan tidur dan bangun di jam yang relatif konstan.' },
      night_screen_detox: { icon: '📵', title: 'Beri jeda dari layar sebelum tidur', desc: 'Jauhkan HP dari kasur agar otak lebih mudah rileks.' },
      healthy_snack: { icon: '🥗', title: 'Ganti junk food dengan camilan sederhana', desc: 'Sediakan buah atau kacang sebagai pilihan saat lapar.' },
      reduce_sweet_drinks: { icon: '🥤', title: 'Kurangi frekuensi minuman berpemanis', desc: 'Ganti soda, boba, atau kopi manis dengan air putih.' },
      mindful_eating: { icon: '🥣', title: 'Makan tanpa menatap layar', desc: 'Fokus pada makanannya agar porsi dan rasa lebih terasa.' },
      body_recovery: { icon: '👁️', title: 'Istirahatkan mata tiap 20 menit', desc: 'Tatap objek jauh selama 20 detik untuk meredakan kelelahan.' },
      app_timers: { icon: '📱', title: 'Pasang batas waktu aplikasi', desc: 'Gunakan timer agar scrolling tidak berjalan tanpa sadar.' },
      focus_priority: { icon: '🎯', title: 'Selesaikan 1 hal penting dulu', desc: 'Tentukan satu prioritas sebelum membuka hiburan di HP.' }
    };

    const selectedRecos = [];
    userAnswers.forEach(function (ans) {
      if (ans.recoKey && recoMap[ans.recoKey] && selectedRecos.length < 3) {
        const already = selectedRecos.some(r => r.title === recoMap[ans.recoKey].title);
        if (!already) selectedRecos.push(recoMap[ans.recoKey]);
      }
    });

    const fallbackRecos = [
      recoMap.night_screen_detox,
      recoMap.stand_up_breaks,
      recoMap.reduce_sweet_drinks
    ];
    fallbackRecos.forEach(function (rec) {
      if (selectedRecos.length < 3 && !selectedRecos.some(r => r.title === rec.title)) {
        selectedRecos.push(rec);
      }
    });

    /* --- Render 3 kartu aksi rekomendasi --- */
    const actionGrid = document.getElementById('actionCardsGrid');
    actionGrid.innerHTML = '';
    selectedRecos.forEach(function (r, i) {
      actionGrid.insertAdjacentHTML('beforeend',
        '<div class="relative flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-4">' +
          '<div class="absolute right-3 top-2.5 font-display text-[0.8rem] font-bold text-dim/50">' + (i + 1) + '</div>' +
          '<div class="mt-0.5 text-2xl leading-none">' + r.icon + '</div>' +
          '<div><h5 class="mb-1 text-[0.92rem] font-semibold text-ink">' + r.title + '</h5><p class="m-0 text-[0.82rem] leading-snug text-dim">' + r.desc + '</p></div>' +
        '</div>'
      );
    });

    /* --- Simpan hasil ke localStorage (untuk banner di halaman Tips) --- */
    try {
      localStorage.setItem('rebahan_quiz_result', JSON.stringify({
        score: score120,
        level: currentLevel.text,
        levelKey: currentLevel.key,
        focusTitle: focusObj.title,
        focusDesc: focusObj.desc,
        recos: selectedRecos
      }));
    } catch (e) { }
  }

  /* ----- 3.13 Tombol Ulangi Kuis ----- */
  const restartBtn = document.getElementById('quizRestartBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', initQuiz);
  }

  /* --- Jalankan init kuis jika elemennya ada (halaman kuis.html) --- */
  initQuiz();

  /* =========================================================
     4. QUIZ BANNER — Tampilkan hasil kuis terakhir di Tips
     ========================================================= */
  (function showQuizRecoBanner() {
    const banner = document.getElementById('quizRecoBanner');
    if (!banner) return;
    try {
      const saved = JSON.parse(localStorage.getItem('rebahan_quiz_result'));
      if (!saved) return;
      document.getElementById('recoLevelText').textContent = saved.level || 'NEED A RESET';
      document.getElementById('recoScoreNum').textContent = saved.score != null ? saved.score : 0;
      document.getElementById('recoFocusTitle').textContent = saved.focusTitle || 'POLA TIDUR';
      document.getElementById('recoFocusDesc').textContent = saved.focusDesc || '';
      banner.style.display = 'block';
    } catch (e) { }
  })();

  /* =========================================================
     5. ACCORDION — Tips Digital Detox (expand/collapse)
     ========================================================= */
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

  /* =========================================================
     6. RANDOM FACT — Generator fakta acak seputar gaya hidup
     ========================================================= */
  const facts = [
    "Rata-rata orang Indonesia menghabiskan lebih dari 7 jam per hari di depan layar — salah satu yang tertinggi di dunia.",
    "66,3% responden dalam studi RS Insan Permata (2025) memiliki gaya hidup sedentari.",
    "Cahaya biru dari layar HP bisa menunda produksi hormon melatonin, bikin lebih susah tidur nyenyak.",
    "45% remaja Indonesia pernah mengalami cyberbullying, menurut data UNICEF.",
    "Kombinasi kurang gerak dan junk food meningkatkan risiko diabetes tipe 2 sejak usia muda.",
    "Gerak ringan 5 menit tiap jam terbukti membantu mengurangi dampak buruk duduk terlalu lama."
  ];
  const factBtn = document.getElementById('factBtn');
  if (factBtn) {
    factBtn.addEventListener('click', function () {
      const f = facts[Math.floor(Math.random() * facts.length)];
      document.getElementById('randomFact').textContent = f;
    });
  }

  /* =========================================================
     7. HABIT TRACKER — Checklist Kebiasaan Harian + Streak
     ========================================================= */

  /* ----- 7.1 Data Default & Storage Helpers ----- */
  const habitList = document.getElementById('habitList');
  if (!habitList) {
    return;
  }

  /* Daftar kebiasaan default (6 item) + custom user */
  const DEFAULT_HABITS = [
    { id: 'def_1', title: 'Minum 2 liter air putih', category: 'Nutrisi', isDefault: true },
    { id: 'def_2', title: 'Gerak / jalan minimal 15 menit', category: 'Fisik', isDefault: true },
    { id: 'def_3', title: 'Makan makanan sehat (bebas junk food)', category: 'Nutrisi', isDefault: true },
    { id: 'def_4', title: 'Screen time non-tugas di bawah target', category: 'Mental', isDefault: true },
    { id: 'def_5', title: 'Digital detox 1 jam sebelum tidur', category: 'Tidur', isDefault: true },
    { id: 'def_6', title: 'Stretching & perbaiki postur tubuh', category: 'Fisik', isDefault: true }
  ];

  let customHabits = [];
  try {
    customHabits = JSON.parse(localStorage.getItem('rebahan_custom_habits')) || [];
  } catch (e) { customHabits = []; }

  /* State tracker: periode reset terakhir, map centang, jumlah streak */
  let trackerState = {
    lastResetPeriod: '',
    checkedMap: {},
    streak: 0
  };
  try {
    const loadedState = JSON.parse(localStorage.getItem('rebahan_tracker_state'));
    if (loadedState && typeof loadedState === 'object') {
      trackerState = Object.assign(trackerState, loadedState);
    }
  } catch (e) { }

  /* ----- 7.2 Reset Harian (Jam 22:00) — Hitung tanggal target reset ----- */
  function getTargetResetDate(now) {
    const target = new Date(now);
    target.setHours(22, 0, 0, 0);
    if (now.getTime() >= target.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target;
  }

  function getPeriodKey(targetResetDate) {
    const y = targetResetDate.getFullYear();
    const m = String(targetResetDate.getMonth() + 1).padStart(2, '0');
    const d = String(targetResetDate.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d + '_22:00';
  }

  /* ----- 7.3 Logic Auto Reset + Update Streak (minimal 4 centang) ----- */
  function checkAndApplyReset() {
    const now = new Date();
    const targetReset = getTargetResetDate(now);
    const currentPeriod = getPeriodKey(targetReset);

    if (trackerState.lastResetPeriod !== currentPeriod) {
      if (trackerState.lastResetPeriod) {
        const prevCheckedCount = Object.keys(trackerState.checkedMap || {}).filter(function (k) {
          return trackerState.checkedMap[k] === true;
        }).length;

        if (prevCheckedCount >= 4) {
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
    try {
      localStorage.setItem('rebahan_tracker_state', JSON.stringify(trackerState));
    } catch (e) { }
  }

  function saveCustomHabits() {
    try {
      localStorage.setItem('rebahan_custom_habits', JSON.stringify(customHabits));
    } catch (e) { }
  }

  /* ----- 7.4 Countdown Timer Reset Harian (update setiap 1 detik) ----- */
  function updateCountdownTimer() {
    const now = new Date();
    const targetReset = getTargetResetDate(now);
    const diffMs = targetReset.getTime() - now.getTime();

    if (diffMs <= 0) {
      checkAndApplyReset();
      renderAll();
      return;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    document.getElementById('resetCountdown').textContent = hh + ':' + mm + ':' + ss;
  }

  setInterval(updateCountdownTimer, 1000);
  updateCountdownTimer();

  /* ----- 7.5 Getter Semua Kebiasaan (default + custom) ----- */
  function getAllHabits() {
    return DEFAULT_HABITS.concat(customHabits);
  }

  /* ----- 7.6 Filter Tab Kategori ----- */
  let currentCategory = 'Semua';

  const categoryTabsContainer = document.getElementById('categoryTabs');
  if (categoryTabsContainer) {
    categoryTabsContainer.addEventListener('click', function (e) {
      if (e.target.classList.contains('filter-tab')) {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.getAttribute('data-cat');
        renderHabitList();
        updateHabitUI();
      }
    });
  }

  /* ----- 7.7 Tambah Kebiasaan Custom Baru ----- */
  function addHabit() {
    const newHabitInput = document.getElementById('newHabitInput');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const title = newHabitInput.value.trim();
    const category = document.getElementById('newHabitCategory').value || 'Custom';

    /* --- ERROR: Input kosong → shake + border merah + focus (bukan silent return!) --- */
    if (!title) {
      newHabitInput.classList.remove('shake', 'input-error');
      /* trigger reflow agar animasi bisa dijalankan ulang */
      void newHabitInput.offsetWidth;
      newHabitInput.classList.add('shake', 'input-error');
      newHabitInput.focus();
      setTimeout(function () {
        newHabitInput.classList.remove('shake', 'input-error');
      }, 1100);
      return;
    }

    const newHabit = {
      id: 'cust_' + Date.now(),
      title: title,
      category: category,
      isDefault: false
    };

    customHabits.push(newHabit);
    saveCustomHabits();
    newHabitInput.value = '';
    renderAll();

    /* --- SUCCESS: Flash hijau di tombol + ganti teks sebentar "Ditambahkan!" --- */
    if (addHabitBtn) {
      addHabitBtn.classList.remove('flash-success');
      void addHabitBtn.offsetWidth;
      addHabitBtn.classList.add('flash-success');
      const originalText = addHabitBtn.textContent;
      addHabitBtn.textContent = '✅ Ditambahkan!';
      setTimeout(function () {
        addHabitBtn.textContent = originalText;
        addHabitBtn.classList.remove('flash-success');
      }, 1100);
    }
    newHabitInput.focus();
  }

  const addHabitBtn = document.getElementById('addHabitBtn');
  if (addHabitBtn) {
    addHabitBtn.addEventListener('click', addHabit);
  }
  
  const newHabitInput = document.getElementById('newHabitInput');
  if (newHabitInput) {
    /* Hapus border merah saat user mulai mengetik lagi setelah error */
    newHabitInput.addEventListener('input', function () {
      if (this.classList.contains('input-error')) {
        this.classList.remove('input-error');
      }
    });
    newHabitInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        addHabit();
      }
    });
  }

  /* ----- 7.8 Confirmation Modal (Mencegah salah centang — sekali centang tidak bisa batal hari ini) ----- */
  let pendingHabitId = null;

  function openConfirmModal(habitId, habitTitle) {
    pendingHabitId = habitId;
    document.getElementById('confirmModalText').textContent = 'Apakah benar Anda sudah melakukan kebiasaan "' + habitTitle + '"?';
    document.getElementById('confirmModalOverlay').classList.add('show');
  }

  function closeConfirmModal() {
    pendingHabitId = null;
    document.getElementById('confirmModalOverlay').classList.remove('show');
  }

  document.getElementById('confirmCancelBtn').addEventListener('click', closeConfirmModal);

  document.getElementById('confirmOkBtn').addEventListener('click', function () {
    if (pendingHabitId) {
      trackerState.checkedMap[pendingHabitId] = true;
      saveTrackerState();
      renderAll();
    }
    closeConfirmModal();
  });

  /* Klik backdrop di luar modal = tutup */
  document.getElementById('confirmModalOverlay').addEventListener('click', function (e) {
    if (e.target.classList.contains('confirm-modal-overlay')) {
      closeConfirmModal();
    }
  });

  /* ----- 7.9 Event Listener Checklist + Delete Custom Habit ----- */
  habitList.addEventListener('click', function (e) {
    /* Hapus kebiasaan custom (hanya jika belum dicentang) */
    if (e.target.closest('.btn-delete-habit')) {
      const btn = e.target.closest('.btn-delete-habit');
      e.stopPropagation();
      const habitId = btn.getAttribute('data-id');
      customHabits = customHabits.filter(h => h.id !== habitId);
      delete trackerState.checkedMap[habitId];
      saveCustomHabits();
      saveTrackerState();
      renderAll();
    /* Centang kebiasaan -> buka modal konfirmasi (tidak bisa batal) */
    } else if (e.target.closest('.habit-checkbox')) {
      const cb = e.target.closest('.habit-checkbox');
      const habitId = cb.getAttribute('data-id');
      const isAlreadyChecked = !!trackerState.checkedMap[habitId];

      if (isAlreadyChecked) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const all = getAllHabits();
      const habit = all.find(h => h.id === habitId);
      const title = habit ? habit.title : 'kebiasaan ini';

      openConfirmModal(habitId, title);
    }
  });

  /* ----- 7.10 Helper Sanitasi Output HTML (hindari XSS) ----- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ----- 7.11 Render Daftar Kebiasaan ----- */
  function renderHabitList() {
    const all = getAllHabits();
    const filtered = all.filter(h => {
      if (currentCategory === 'Semua') return true;
      return h.category === currentCategory;
    });

    habitList.innerHTML = '';

    if (filtered.length === 0) {
      habitList.insertAdjacentHTML('beforeend', '<div class="empty-habit-msg">Tidak ada kebiasaan untuk kategori "' + escapeHtml(currentCategory) + '".</div>');
      return;
    }

    filtered.forEach(h => {
      const isDone = !!trackerState.checkedMap[h.id];
      const catLabel = h.category;
      const deleteBtnHtml = (!h.isDefault && !isDone) ? '<button class="btn-delete-habit" data-id="' + h.id + '" title="Hapus kebiasaan">🗑️</button>' : '';
      const lockTagHtml = isDone ? '<span class="locked-tag">🔒 Terkunci</span>' : '';

      const itemHtml = `
        <div class="habit-item ${isDone ? 'done' : ''}" data-id="${h.id}">
          <div class="habit-left">
            <input type="checkbox" class="habit-checkbox" data-id="${h.id}" ${isDone ? 'checked disabled' : ''}>
            <span class="habit-text">${escapeHtml(h.title)}</span>
          </div>
          <div class="habit-right">
            <span class="category-tag">${escapeHtml(catLabel)}</span>
            ${lockTagHtml}
            ${deleteBtnHtml}
          </div>
        </div>
      `;
      habitList.insertAdjacentHTML('beforeend', itemHtml);
    });
  }

  /* ----- 7.12 Update UI Statistik (progress %, streak card, status badge) ----- */
  function updateHabitUI() {
    const all = getAllHabits();
    const totalCount = all.length;
    let doneCount = 0;

    all.forEach(h => {
      if (trackerState.checkedMap[h.id]) {
        doneCount++;
      }
    });

    /* Sync ulang class done / disabled (redundan, aman) */
    document.querySelectorAll('#habitList .habit-item').forEach(item => {
      const id = item.getAttribute('data-id');
      const isChecked = !!trackerState.checkedMap[id];
      if (isChecked) {
        item.classList.add('done');
      } else {
        item.classList.remove('done');
      }
      
      const cb = item.querySelector('.habit-checkbox');
      if (cb) {
        cb.checked = isChecked;
        if (isChecked) {
          cb.disabled = true;
        }
      }
    });

    const completedSummary = document.getElementById('completedSummary');
    if (completedSummary) {
      completedSummary.textContent = doneCount + ' dari ' + totalCount;
    }

    /* --- Badge Streak + Card Aktif --- */
    const isMin4Reached = doneCount >= 4;

    const targetStatusBadge = document.getElementById('targetStatusBadge');
    const streakBadge = document.getElementById('streakBadge');
    const streakCard = document.getElementById('streakCard');
    const streakCount = document.getElementById('streakCount');

    if (isMin4Reached) {
      if (!trackerState.celebratedStreakPeriod || trackerState.celebratedStreakPeriod !== trackerState.lastResetPeriod) {
        trackerState.celebratedStreakPeriod = trackerState.lastResetPeriod;
        saveTrackerState();
        setTimeout(function () {
          launchConfetti();
          showToast('Selamat! Target 4+ Harian Tercapai! Streak Hari Ini Aktif 🔥', '🔥');
        }, 300);
      }
      if(targetStatusBadge) { targetStatusBadge.textContent = '✅ Target Min. 4 Reached!'; targetStatusBadge.classList.add('active-streak'); }
      if(streakBadge) { streakBadge.textContent = '🔥 Active Hari Ini'; streakBadge.classList.add('active-streak'); }
      if(streakCard) streakCard.classList.add('active-streak-card');

      const activeStreak = (trackerState.streak || 0) + 1;
      if(streakCount) streakCount.textContent = activeStreak;
    } else {
      if(targetStatusBadge) { targetStatusBadge.textContent = 'Minimal 4 untuk Streak (' + doneCount + '/4)'; targetStatusBadge.classList.remove('active-streak'); }
      if(streakBadge) { streakBadge.textContent = 'Min. 4 Centang'; streakBadge.classList.remove('active-streak'); }
      if(streakCard) streakCard.classList.remove('active-streak-card');

      const baseStreak = trackerState.streak || 0;
      if(streakCount) streakCount.textContent = baseStreak;
    }

    /* --- Progress Bar Persentase --- */
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    
    const habitProgressText = document.getElementById('habitProgressText');
    const habitPercentText = document.getElementById('habitPercentText');
    const habitProgressFill = document.getElementById('habitProgressFill');
    
    if(habitProgressText) habitProgressText.textContent = doneCount + ' dari ' + totalCount + ' selesai hari ini';
    if(habitPercentText) habitPercentText.textContent = percent + '%';
    if(habitProgressFill) habitProgressFill.style.width = percent + '%';
  }

  /* ----- 7.13 Render Semua (shortcut untuk reset / add habit / dll) ----- */
  function renderAll() {
    checkAndApplyReset();
    renderHabitList();
    updateHabitUI();
  }

  renderAll();

});
