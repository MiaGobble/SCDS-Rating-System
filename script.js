let questions = [];
let current = 0;
let answers = [];

const ratingDescription = {
  'AAA': 'No AI usage.',
  'OIB': 'Occasional AI usage for implementation, not impacting experience.',
  'OIE': 'Occasional AI usage for implementation, impacting experience.',
  'OPB': 'Occasional AI usage for planning, not impacting experience.',
  'OPE': 'Occasional AI usage for planning, impacting experience.',
  'OEB': 'Occasional AI usage for both implementation and planning, not impacting experience.',
  'OEE': 'Occasional AI usage for both implementation and planning, impacting experience.',
  'FIB': 'Frequent AI usage for implementation, not impacting experience.',
  'FIE': 'Frequent AI usage for implementation, impacting experience.',
  'FPB': 'Frequent AI usage for planning, not impacting experience.',
  'FPE': 'Frequent AI usage for planning, impacting experience.',
  'FEB': 'Frequent AI usage for both implementation and planning, not impacting experience.',
  'FEE': 'Frequent AI usage for both implementation and planning, impacting experience.'
};
const ratingImages = {
  'AAA': 'aaa.png', 'OIB': 'oib.png', 'OIE': 'oie.png', 'OPB': 'opb.png',
  'OPE': 'ope.png', 'OEB': 'oeb.png', 'OEE': 'oee.png', 'FIB': 'fib.png',
  'FIE': 'fie.png', 'FPB': 'fpb.png', 'FPE': 'fpe.png', 'FEB': 'feb.png',
  'FEE': 'fee.png'
};
const quiz = document.querySelector('#quiz');
const next = document.querySelector('#next');
const back = document.querySelector('#back');
const result = document.querySelector('#result');

function drawQuestion() {
  const q = questions[current];
  quiz.innerHTML = `<div class="question"><h3>${q.text}</h3>${q.note ? `<p class="question-note">${q.note}</p>` : ''}<div>${q.options.map((option, i) => `<label class="option ${answers[current] === i ? 'selected' : ''}"><input type="radio" name="answer" value="${i}" ${answers[current] === i ? 'checked' : ''}>${option.text}</label>`).join('')}</div></div>`;
  quiz.querySelectorAll('input').forEach(input => input.addEventListener('change', e => { answers[current] = Number(e.target.value); drawQuestion(); }));
  document.querySelector('#progress-text').textContent = `Question ${current + 1} of ${questions.length}`;
  document.querySelector('#progress-bar').style.width = `${((current + 1) / questions.length) * 100}%`;
  back.disabled = current === 0;
  next.innerHTML = current === questions.length - 1 ? 'See my rating <span aria-hidden="true">&#8594;</span>' : 'Next question <span aria-hidden="true">&#8594;</span>';
}
function showResult(rating) {
  result.innerHTML = `<img class="result-rating-image" src="static/img/${ratingImages[rating]}" alt="${rating} rating"><div><b>${rating}</b><br>${ratingDescription[rating]}</div>`;
  result.hidden = false;
  quiz.hidden = true;
  back.hidden = true;
  next.hidden = false;
  next.dataset.retake = 'true';
  next.textContent = 'Retake the questionnaire';
}
function resetQuiz() {
  current = 0;
  answers = Array(questions.length).fill(null);
  result.innerHTML = '';
  result.hidden = true;
  quiz.hidden = false;
  back.hidden = false;
  next.hidden = false;
  next.dataset.retake = 'false';
  drawQuestion();
}
next.addEventListener('click', () => {
  if (next.dataset.retake === 'true') { resetQuiz(); return; }
  if (answers[current] === null) { quiz.classList.add('shake'); setTimeout(() => quiz.classList.remove('shake'), 400); return; }
  if (current === 0 && answers[current] === 1) showResult(questions[0].options[answers[0]].rating);
  else if (current === questions.length - 1) {
    const frequency = questions[1].options[answers[1]].rating;
    const role = questions[2].options[answers[2]].rating;
    const scope = questions[3].options[answers[3]].rating;
    showResult(`${frequency}${role}${scope}`);
  } else { current++; drawQuestion(); }
});
back.addEventListener('click', () => { if (current > 0) { current--; drawQuestion(); } });

function setupRatingCarousel() {
  const carousel = document.querySelector('.rating-carousel');
  if (!carousel) return;

  const viewport = carousel.querySelector('.rating-viewport');
  const track = carousel.querySelector('.rating-grid');
  const cards = [...track.children];
  const previous = carousel.querySelector('.carousel-previous');
  const nextRating = carousel.querySelector('.carousel-next');
  let currentRating = 0;

  function updateCarousel() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const visibleCards = Math.max(1, Math.floor((viewport.clientWidth + gap) / (cardWidth + gap)));
    const maxRating = Math.max(0, cards.length - visibleCards);
    currentRating = Math.min(currentRating, maxRating);
    track.style.transform = `translateX(-${currentRating * (cardWidth + gap)}px)`;
    previous.disabled = currentRating === 0;
    nextRating.disabled = currentRating === maxRating;
  }

  previous.addEventListener('click', () => {
    currentRating -= 1;
    updateCarousel();
  });
  nextRating.addEventListener('click', () => {
    currentRating += 1;
    updateCarousel();
  });
  window.addEventListener('resize', updateCarousel);
  updateCarousel();
}

setupRatingCarousel();

async function loadQuestions() {
  try {
    const response = await fetch('questions.json');
    if (!response.ok) throw new Error(`Could not load questions.json (${response.status})`);
    const data = await response.json();
    questions = data.questions;
    answers = Array(questions.length).fill(null);
    drawQuestion();
  } catch (error) {
    result.hidden = false;
    result.innerHTML = '<div><b>Questionnaire unavailable</b><br>Make sure the site is running through a local web server.</div>';
    console.error(error);
  }
}
loadQuestions();
