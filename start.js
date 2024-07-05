const questionElement = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const questionCounterText = document.getElementById('questionCounter');
const scoreText = document.getElementById('score');
const timerElement = document.getElementById('timer');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let timeLeft = 60; 
let timerInterval;

const CORRECT_BONUS = 1;
const MAX_QUESTIONS = 20;

fetch('Question.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); 

        console.log(jsonData); 

        availableQuestions = jsonData.map(row => {
            if (row.length !== 6 || row.some(cell => cell === undefined)) {
                console.error('Invalid question format:', row);
                return null;
            }
            return {
                question: row[0],
                choice1: row[1],
                choice2: row[2],
                choice3: row[3],
                choice4: row[4],
                answer: row[5]
            };
        }).filter(q => q !== null);
        

        startGame();
    })
    .catch(err => {
        console.error(err);
    });

function startGame() {
    questionCounter = 0;
    score = 0;
    getNewQuestion();
}

function getNewQuestion() {
    if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        return window.location.assign("/end.html");
    }
    questionCounter++;
    questionCounterText.innerText = `${questionCounter}/${MAX_QUESTIONS}`;

    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    questionElement.innerText = currentQuestion.question;

    choices.forEach(choice => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
    resetTimer();
}

choices.forEach(choice => {
    choice.addEventListener("click", e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset["number"];

        const classToApply = selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

        if (classToApply === "correct") {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});

function incrementScore(num) {
    score += num;
    scoreText.innerText = score;
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 60;
    timerElement.textContent = formatTime(timeLeft);
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            getNewQuestion();
        } else {
            timeLeft--;
            timerElement.textContent = formatTime(timeLeft);
        }
    }, 500);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
