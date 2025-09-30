const steps = Array.from(document.querySelectorAll('.step'));
const form = document.getElementById('visionForm');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const progressBar = document.getElementById('progressBar');
const resultSection = document.getElementById('resultSection');
const downloadLink = document.getElementById('downloadLink');
const restartBtn = document.getElementById('restartBtn');
const preview = document.getElementById('visionPreview');
const canvas = document.getElementById('visionCanvas');

let currentStep = 0;

const palettes = {
  sunrise: {
    gradient: ['#ff9a9e', '#fad0c4'],
    accent: '#fff0f5',
  },
  ocean: {
    gradient: ['#43cea2', '#185a9d'],
    accent: '#d6fff2',
  },
  midnight: {
    gradient: ['#1e3c72', '#2a5298'],
    accent: '#d2dcff',
  },
};

const focusGlyph = {
  career: '🚀',
  wellness: '🌿',
  relationships: '💞',
};

function showStep(index) {
  steps.forEach((step, i) => {
    step.toggleAttribute('hidden', i !== index);
  });
  backBtn.disabled = index === 0;
  nextBtn.textContent = index === steps.length - 1 ? 'Build my lock screen' : 'Next';
  const progress = ((index + 1) / steps.length) * 100;
  progressBar.style.width = `${progress}%`;
  steps[index].querySelector('input, textarea')?.focus({ preventScroll: true });
}

function validateStep(index) {
  const fields = steps[index].querySelectorAll('input, textarea');
  for (const field of fields) {
    if (!field.reportValidity()) {
      return false;
    }
  }
  return true;
}

nextBtn.addEventListener('click', () => {
  if (!validateStep(currentStep)) return;

  if (currentStep === steps.length - 1) {
    buildVision();
    return;
  }

  currentStep += 1;
  showStep(currentStep);
});

backBtn.addEventListener('click', () => {
  if (currentStep === 0) return;
  currentStep -= 1;
  showStep(currentStep);
});

restartBtn.addEventListener('click', () => {
  resultSection.hidden = true;
  form.hidden = false;
  currentStep = 0;
  form.reset();
  showStep(currentStep);
  preview.src = '';
  downloadLink.href = '';
  downloadLink.setAttribute('aria-disabled', 'true');
});

function buildVision() {
  const formData = new FormData(form);
  const guidingWord = formData.get('guidingWord');
  const focus = formData.get('focus');
  const affirmation = formData.get('affirmation');
  const paletteKey = formData.get('palette');

  const palette = palettes[paletteKey];
  if (!palette) return;

  renderCanvas({ guidingWord, focus, affirmation, paletteKey, palette });

  const dataUrl = canvas.toDataURL('image/png');
  preview.src = dataUrl;
  downloadLink.href = dataUrl;
  downloadLink.removeAttribute('aria-disabled');

  form.hidden = true;
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCanvas({ guidingWord, focus, affirmation, paletteKey, palette }) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.gradient[0]);
  gradient.addColorStop(1, palette.gradient[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Overlay arcs for texture
  drawAurora(ctx, width, height, paletteKey);

  // Guiding word at top
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 140px "Manrope", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 40;
  ctx.fillText(guidingWord.toUpperCase(), width / 2, 520);

  ctx.shadowBlur = 0;

  // Focus glyph and label
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '96px "Manrope", sans-serif';
  ctx.fillText(focusGlyph[focus] ?? '✨', width / 2, 740);

  ctx.font = 'bold 68px "Manrope", sans-serif';
  ctx.fillText(formatFocusLabel(focus), width / 2, 860);

  // Affirmation block
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = '48px "Manrope", sans-serif';
  wrapText(
    ctx,
    affirmation,
    width / 2,
    1160,
    width - 400,
    72
  );

  // Footer ribbon
  const ribbonHeight = 320;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(0, height - ribbonHeight, width, ribbonHeight);

  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 54px "Manrope", sans-serif';
  ctx.fillText('Vision in Motion', width / 2, height - 180);

  ctx.font = '36px "Manrope", sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.fillText('Swipe with intention • Hydrate • Celebrate small wins', width / 2, height - 110);
}

function drawAurora(ctx, width, height, paletteKey) {
  const curves = {
    sunrise: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.12)'],
    ocean: ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.1)'],
    midnight: ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.08)'],
  };

  const layers = curves[paletteKey] ?? ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.12)'];

  layers.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const offsetY = 600 + index * 260;
    ctx.moveTo(0, offsetY);
    ctx.bezierCurveTo(width * 0.25, offsetY - 180, width * 0.6, offsetY + 120, width, offsetY - 40);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  });
}

function formatFocusLabel(focus) {
  switch (focus) {
    case 'career':
      return 'Career Momentum';
    case 'wellness':
      return 'Wellness Rituals';
    case 'relationships':
      return 'Radiant Relationships';
    default:
      return 'Aligned Living';
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/);
  let line = '';
  let lineY = y;

  for (let n = 0; n < words.length; n += 1) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, lineY);
      line = words[n] + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, lineY);
}

showStep(currentStep);
