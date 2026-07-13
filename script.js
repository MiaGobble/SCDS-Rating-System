let questions = [];
let current = 0;
let answers = [];

// Ratings are ordered from lowest (Z) to highest (A+), and these IDs are
// also the values used by minRating and maxRating in questions.json.
const ratingNames = ['Z', 'Q', 'C', 'B-', 'B+', 'A-', 'A+'];
const ratingDescription = {
  'A+': 'No synthetic content was used.',
  'A-': 'Non-AI synthetic content was used, or AI was used for ideation.',
  'B+': 'AI has a very minor role in the final product, but does not appear to the user or client.',
  'B-': 'AI has been used in the final product, but only partially; it is mixed with what is otherwise still mostly human-made content. Everything generated with AI is also based on human content.',
  'C': 'AI is used for entire features or parts, while some parts remain human-made.',
  'Q': 'AI is used for most of the product, based on human-made development content.',
  'Z': 'The final product is entirely (or almost entirely) synthetic from generative AI.'
};
const ratingImages = { 'A+': 'a-plus.png', 'A-': 'a-minus.png', 'B+': 'b-plus.png', 'B-': 'b-minus.png', 'C': 'c.png', 'Q': 'q.png', 'Z': 'z.png', 'U': 'u.png' };
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
function showResult() {
  let points = 0, minRatingId = 0, maxRatingId = ratingNames.length - 1;
  answers.forEach((answer, i) => {
    const choice = questions[i].options[answer];
    points += choice.points;

    if (choice.minRating !== undefined) minRatingId = Math.max(minRatingId, choice.minRating);
    if (choice.maxRating !== undefined) maxRatingId = Math.min(maxRatingId, choice.maxRating);
  });
  const rawRatingId = points >= 12 ? 6 : points >= 10 ? 5 : points >= 7 ? 4 : points >= 3 ? 3 : points === 2 ? 2 : points === 1 ? 1 : 0;
  if (maxRatingId < minRatingId) {
    result.innerHTML = `<img class="result-rating-image" src="static/img/${ratingImages.U}" alt="U rating"><div><b>Undetermined</b><br>The maximum rating is lower than the minimum rating. Please review and retake the questionnaire.</div>`;
  } else {
    // A perfect score is the A+ result; the A- bounds on individual
    // answers must not cap that overall result.
    const finalRatingId = rawRatingId === 6
      ? rawRatingId
      : Math.min(maxRatingId, Math.max(minRatingId, rawRatingId));
    // Convert the numeric rating ID to its display rating only at the end.
    const finalRating = ratingNames[finalRatingId];
    result.innerHTML = `<img class="result-rating-image" src="static/img/${ratingImages[finalRating]}" alt="${finalRating} rating"><div><b>${ratingDescription[finalRating]}</b></div>`;
  }
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
  if (current === questions.length - 1) showResult(); else { current++; drawQuestion(); }
});
back.addEventListener('click', () => { if (current > 0) { current--; drawQuestion(); } });

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
