/* =========================================================
   GENERASI REBAHAN — BMI Calculator Logic
   Morphing: snapshot switch dengan CSS transition (no rAF lerp).
   ========================================================= */

(function () {
  'use strict';

  const state = {
    weight: 62,
    height: 168,
    gender: 'sloth',
    bmi: 22.0,
    categoryKey: 'normal'
  };

  /* ── Shape snapshots per category ─────────────────────── */
  const SHAPES = {
    underweight: {
      torso:    'M 136 142 C 126 160, 128 208, 134 225 L 166 225 C 172 208, 174 160, 164 142 Z',
      tummyRx:  12, tummyRy: 17,
      cheekR:   5,
      mouth:    'M 144 116 Q 150 110 156 116',
      eyeLA:    '132,100', eyeLB: '140,95', eyeLC: '148,100',
      eyeRA:    '152,100', eyeRB: '160,95', eyeRC: '168,100',
      shadowRx: 42
    },
    normal: {
      torso:    'M 128 142 C 116 162, 118 210, 130 225 L 170 225 C 182 210, 184 162, 172 142 Z',
      tummyRx:  20, tummyRy: 24,
      cheekR:   8,
      mouth:    'M 141 114 Q 150 125 159 114',
      eyeLA:    '133,100', eyeLB: '141,94', eyeLC: '149,100',
      eyeRA:    '151,100', eyeRB: '159,94', eyeRC: '167,100',
      shadowRx: 52
    },
    overweight: {
      torso:    'M 122 142 C 107 162, 108 212, 128 225 L 172 225 C 192 212, 193 162, 178 142 Z',
      tummyRx:  28, tummyRy: 30,
      cheekR:   11,
      mouth:    'M 142 113 Q 150 122 158 113',
      eyeLA:    '131,100', eyeLB: '139,94', eyeLC: '147,100',
      eyeRA:    '153,100', eyeRB: '161,94', eyeRC: '169,100',
      shadowRx: 62
    },
    obese: {
      torso:    'M 116 142 C 98 162, 98 214, 126 225 L 174 225 C 202 214, 202 162, 184 142 Z',
      tummyRx:  36, tummyRy: 36,
      cheekR:   14,
      mouth:    'M 141 115 Q 150 124 159 115',
      eyeLA:    '130,101', eyeLB: '139,95', eyeLC: '148,101',
      eyeRA:    '152,101', eyeRB: '161,95', eyeRC: '170,101',
      shadowRx: 74
    }
  };

  function applyShape(catKey) {
    const s = SHAPES[catKey] || SHAPES.normal;

    const torso  = document.getElementById('charTorso');
    const tummy  = document.getElementById('charTummy');
    const cheekL = document.getElementById('charCheekL');
    const cheekR = document.getElementById('charCheekR');
    const mouth  = document.getElementById('charMouth');
    const eyeL   = document.getElementById('charEyeL');
    const eyeR   = document.getElementById('charEyeR');
    const shadow = document.getElementById('charShadow');

    if (torso)  torso.setAttribute('d', s.torso);
    if (tummy)  { tummy.setAttribute('rx', s.tummyRx); tummy.setAttribute('ry', s.tummyRy); }
    if (cheekL) cheekL.setAttribute('r', s.cheekR);
    if (cheekR) cheekR.setAttribute('r', s.cheekR);
    if (mouth)  mouth.setAttribute('d', s.mouth);
    if (eyeL)   eyeL.setAttribute('d', `M ${s.eyeLA} Q ${s.eyeLB} ${s.eyeLC}`);
    if (eyeR)   eyeR.setAttribute('d', `M ${s.eyeRA} Q ${s.eyeRB} ${s.eyeRC}`);
    if (shadow) shadow.setAttribute('rx', s.shadowRx);
  }

  function applyAvatarStyle(gender) {
    const hairBoy       = document.getElementById('charHairBoy');
    const hairGirl      = document.getElementById('charHairGirl');
    const slothFeatures = document.getElementById('charSlothFeatures');
    if (!hairBoy) return;
    hairBoy.style.display       = gender === 'cowok' ? '' : 'none';
    hairGirl.style.display      = gender === 'cewek' ? '' : 'none';
    slothFeatures.style.display = gender === 'sloth' ? '' : 'none';
  }

  /* ── Category data ─────────────────────────────────────── */
  const CATS = {
    underweight: {
      key: 'underweight', label: 'Kekurangan Berat', shortLabel: 'Kurus',
      color: '#38bdf8', badgeClass: 'badge-under',
      title: 'Kurang Asupan Energi',
      insight: 'Berat badanmu berada di bawah rentang ideal. Tubuh perlu asupan kalori dan nutrisi yang cukup untuk mendukung aktivitas sehari-hari.',
      tips: [
        'Tambah frekuensi makan dengan camilan bergizi — kacang, alpukat, atau pisang.',
        'Penuhi kebutuhan protein harian dari telur, ayam, tahu, atau tempe.',
        'Hindari menunda jadwal makan karena aktivitas layar yang terlalu panjang.',
        'Olahraga beban ringan 2–3 kali per minggu membantu membangun massa otot.'
      ],
      caloric: 'Perkiraan target kalori harian: sekitar 2.100–2.400 kkal untuk surplus bertahap.'
    },
    normal: {
      key: 'normal', label: 'Berat Ideal', shortLabel: 'Ideal',
      color: '#10b981', badgeClass: 'badge-normal',
      title: 'Berat Badan Ideal',
      insight: 'Indeks massa tubuhmu berada dalam rentang sehat. Pertahankan pola makan bergizi dan aktivitas fisik yang teratur.',
      tips: [
        'Pertahankan pola makan dengan porsi sayur dan buah yang cukup.',
        'Lakukan peregangan ringan setelah duduk lama, minimal setiap 45 menit.',
        'Minum air putih minimal 2 liter per hari, lebih saat udara panas.',
        'Usahakan tidur 7–8 jam setiap malam untuk pemulihan tubuh.'
      ],
      caloric: 'Perkiraan target kalori pemeliharaan harian: sekitar 1.850–2.100 kkal.'
    },
    overweight: {
      key: 'overweight', label: 'Kelebihan Berat', shortLabel: 'Berlebih',
      color: '#f59e0b', badgeClass: 'badge-over',
      title: 'Kelebihan Berat Badan',
      insight: 'Berat badanmu melebihi rentang ideal. Perubahan kecil pada pola makan dan aktivitas sudah memberi dampak yang nyata.',
      tips: [
        'Kurangi minuman manis dan camilan tinggi kalori perlahan-lahan.',
        'Targetkan 6.000–8.000 langkah kaki per hari secara bertahap.',
        'Setiap 45 menit duduk, berdiri dan bergerak minimal 3 menit.',
        'Perbanyak serat dari sayuran dan buah untuk rasa kenyang lebih lama.'
      ],
      caloric: 'Perkiraan target kalori harian: sekitar 1.500–1.750 kkal untuk defisit ringan.'
    },
    obese: {
      key: 'obese', label: 'Obesitas', shortLabel: 'Obesitas',
      color: '#f43f5e', badgeClass: 'badge-obese',
      title: 'Kategori Obesitas',
      insight: 'Berat badan berada dalam kategori obesitas yang meningkatkan risiko penyakit metabolik dan sendi. Konsultasi dengan tenaga kesehatan sangat dianjurkan.',
      tips: [
        'Konsultasikan dengan dokter atau ahli gizi untuk program yang sesuai kondisimu.',
        'Pilih olahraga rendah beban sendi: jalan santai, renang, atau bersepeda.',
        'Hindari makan larut malam, terutama dalam posisi berbaring atau santai.',
        'Pisahkan kebiasaan mengemil dari waktu menonton atau bermain gawai.'
      ],
      caloric: 'Fokus penurunan bertahap 0.5 kg per minggu, bukan diet drastis. Selalu evaluasi rutin.'
    }
  };

  function calcBMI(w, hCm) {
    const hM = hCm / 100;
    if (hM <= 0) return 0;
    return +(w / (hM * hM)).toFixed(1);
  }

  function getCat(bmi) {
    if (bmi < 18.5)  return CATS.underweight;
    if (bmi <= 24.9) return CATS.normal;
    if (bmi <= 29.9) return CATS.overweight;
    return CATS.obese;
  }

  function getIdealRange(hCm) {
    const h = hCm / 100;
    return { min: +(18.5 * h * h).toFixed(1), max: +(24.9 * h * h).toFixed(1) };
  }

  function updateUI() {
    state.bmi = calcBMI(state.weight, state.height);
    const cat   = getCat(state.bmi);
    state.categoryKey = cat.key;
    const ideal = getIdealRange(state.height);

    /* Score */
    const scoreEl = document.getElementById('bmiScoreNum');
    if (scoreEl) { scoreEl.textContent = state.bmi.toFixed(1); scoreEl.style.color = cat.color; }

    /* Badge */
    const badge = document.getElementById('bmiCategoryBadge');
    if (badge) {
      badge.className = 'text-xs font-bold flex-shrink-0 mt-1';
      badge.style.color = cat.color;
      badge.textContent = cat.label;
    }

    /* Ideal range */
    const rangeEl = document.getElementById('bmiIdealRange');
    if (rangeEl) {
      if (state.weight < ideal.min)
        rangeEl.textContent = `+${+(ideal.min - state.weight).toFixed(1)} kg menuju batas bawah normal (${ideal.min} kg)`;
      else if (state.weight > ideal.max)
        rangeEl.textContent = `-${+(state.weight - ideal.max).toFixed(1)} kg dari batas atas normal (${ideal.max} kg)`;
      else
        rangeEl.textContent = `Dalam rentang ideal: ${ideal.min}–${ideal.max} kg`;
    }

    /* Stage label */
    const catLabel = document.getElementById('stageCatLabel');
    if (catLabel) {
      catLabel.textContent     = cat.shortLabel;
      catLabel.style.color     = cat.color;
    }

    /* Stage halo */
    const halo = document.getElementById('stageHalo');
    if (halo) {
      halo.style.background = `radial-gradient(ellipse at 50% 20%, ${cat.color}22 0%, transparent 68%)`;
      halo.style.opacity = '1';
    }

    /* Gauge needle: 15 → −90°, 40 → +90° */
    const needle = document.getElementById('gaugeNeedle');
    if (needle) {
      const clamped = Math.max(15, Math.min(40, state.bmi));
      needle.style.transform = `rotate(${-90 + ((clamped - 15) / 25) * 180}deg)`;
    }

    /* Gauge pills */
    document.querySelectorAll('.gauge-pill').forEach(pill => {
      const isActive = pill.dataset.key === cat.key;
      pill.classList.toggle('active', isActive);
      pill.style.borderColor = isActive ? cat.color : 'transparent';
      pill.style.color       = isActive ? cat.color : '';
    });

    /* Advice card */
    const advice = document.getElementById('bmiAdviceCard');
    if (advice) {
      const tipRows = cat.tips.map(t =>
        `<li class="advice-tip-item">
           <span class="advice-dot" style="background:${cat.color}"></span>
           <span>${t}</span>
         </li>`
      ).join('');

      advice.innerHTML = `
        <div class="advice-header">
          <div style="min-width:0">
            <p style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-dim);margin:0 0 4px">Refleksi Gaya Hidup</p>
            <h4 style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:1.15rem;color:var(--text);margin:0;line-height:1.3">${cat.title}</h4>
          </div>
          <span class="text-xs font-bold" style="white-space:nowrap;color:${cat.color}">BMI ${state.bmi}</span>
        </div>
        <p class="advice-insight">${cat.insight}</p>
        <p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text);margin:0 0 0.6rem">Yang bisa dilakukan</p>
        <ul class="advice-tips-list">${tipRows}</ul>
        <p class="advice-caloric">${cat.caloric}</p>
      `;
    }

    /* Mascot shape switch */
    applyShape(cat.key);
  }

  /* ── History ──────────────────────────────────────────── */
  const HISTORY_KEY = 'rebahan_bmi_history';

  function renderHistory() {
    const list = document.getElementById('bmiHistoryList');
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (!list) return;

    let data = [];
    try { data = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (e) {}

    if (data.length === 0) {
      list.innerHTML = '<p style="font-size:0.82rem;color:var(--text-dim);margin:0">Belum ada catatan. Klik "Simpan Hasil" untuk mulai merekam.</p>';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (clearBtn) clearBtn.style.display = 'inline-flex';

    list.innerHTML = '<div class="history-list">' + data.slice(0, 5).map((item, i) => {
      const cat = CATS[item.categoryKey] || CATS.normal;
      return `
        <div class="history-row">
          <div style="min-width:0;flex:1">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:2px">
              <span style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.95rem;color:var(--text)">${item.bmi}</span>
              <span style="font-size:0.68rem;font-weight:700;color:${cat.color}">${cat.shortLabel}</span>
            </div>
            <p style="font-size:0.72rem;color:var(--text-dim);margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${item.weight} kg · ${item.height} cm · ${item.date}
            </p>
          </div>
          <button class="del-btn" data-i="${i}" title="Hapus">×</button>
        </div>
      `;
    }).join('') + '</div>';

    list.querySelectorAll('.del-btn').forEach(b => {
      b.addEventListener('click', function () {
        data.splice(+this.dataset.i, 1);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
        renderHistory();
      });
    });
  }

  /* ── DOMContentLoaded ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    const heightSlider = document.getElementById('heightSlider');
    const heightInput  = document.getElementById('heightInput');
    const weightSlider = document.getElementById('weightSlider');
    const weightInput  = document.getElementById('weightInput');
    if (!heightSlider) return;

    function setHeight(v) {
      v = Math.max(100, Math.min(220, Math.round(+v || 168)));
      state.height = v;
      heightSlider.value = v;
      heightInput.value  = v;
      updateUI();
    }

    function setWeight(v) {
      v = Math.max(30, Math.min(160, Math.round(+v || 62)));
      state.weight = v;
      weightSlider.value = v;
      weightInput.value  = v;
      updateUI();
    }

    heightSlider.addEventListener('input',  e => setHeight(e.target.value));
    heightInput .addEventListener('input',  e => setHeight(e.target.value));
    heightInput .addEventListener('change', e => setHeight(e.target.value));
    weightSlider.addEventListener('input',  e => setWeight(e.target.value));
    weightInput .addEventListener('input',  e => setWeight(e.target.value));
    weightInput .addEventListener('change', e => setWeight(e.target.value));

    document.querySelectorAll('.stepper-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        if (this.dataset.target === 'height') setHeight(state.height + +this.dataset.delta);
        if (this.dataset.target === 'weight') setWeight(state.weight + +this.dataset.delta);
      });
    });

    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        setHeight(+this.dataset.height);
        setWeight(+this.dataset.weight);
      });
    });

    document.querySelectorAll('.avatar-tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.avatar-tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        state.gender = this.dataset.gender;
        applyAvatarStyle(state.gender);
      });
    });

    /* Save */
    const saveBtn = document.getElementById('saveBmiBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        let data = [];
        try { data = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (e) {}
        data.unshift({ bmi: state.bmi, categoryKey: state.categoryKey, weight: state.weight, height: state.height, date: dateStr });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(data.slice(0, 20)));
        renderHistory();
      });
    }

    /* Clear history */
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('Hapus semua riwayat pengukuran?')) {
          localStorage.removeItem(HISTORY_KEY);
          renderHistory();
        }
      });
    }

    /* Copy */
    const copyBtn = document.getElementById('copyBmiBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        const cat = CATS[state.categoryKey];
        const text = `BMI: ${state.bmi} — ${cat.label} (${state.weight} kg / ${state.height} cm) — Generasi Rebahan`;
        if (navigator.clipboard) navigator.clipboard.writeText(text);
      });
    }

    /* Init */
    applyAvatarStyle(state.gender);
    setHeight(state.height);
    setWeight(state.weight);
    renderHistory();
  });
})();
