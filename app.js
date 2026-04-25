let currentPlayer = '';
let playerScores = {};  // Store player names and scores
let questionIndex = 0;  // Track current question
let questionTimer;  // Timer for question display

// Questions for the quiz
let questions = [];

// Fetch questions from online API
async function fetchQuestions() {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        const data = await response.json();
        questions = data.results.map(q => ({
            question: q.question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
            options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
            correctAnswer: q.correct_answer
        }));
    } catch (error) {
        console.error('Failed to fetch questions:', error);
        // Fallback to hardcoded questions
        questions = [
            {
                question: "What is the capital of France?",
                options: ["Berlin", "Madrid", "Paris", "Lisbon"],
                correctAnswer: "Paris"
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Earth", "Mars", "Jupiter", "Venus"],
                correctAnswer: "Mars"
            },
            {
                question: "What is the largest animal on Earth?",
                options: ["Elephant", "Blue Whale", "Shark", "Giraffe"],
                correctAnswer: "Blue Whale"
            }
        ];
    }
}

// Start the quiz after entering name
document.getElementById('start-quiz').addEventListener('click', async function () {
    currentPlayer = document.getElementById('player-name').value.trim();
    if (!currentPlayer) {
        alert("Please enter your name to start.");
        return;
    }

    // Fetch questions
    await fetchQuestions();

    // Hide player entry and show quiz container
    document.getElementById('player-entry').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    // Load the first question
    loadNextQuestion();
});

// Load the next question
function loadNextQuestion() {
    if (questionIndex < questions.length) {
        const currentQuestion = questions[questionIndex];
        document.getElementById('question').textContent = currentQuestion.question;

        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';  // Clear previous options

        currentQuestion.options.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.textContent = option;
            optionButton.addEventListener('click', function () {
                checkAnswer(option);
            });
            optionsContainer.appendChild(optionButton);
        });

        // Start countdown for the next question
        startQuestionTimer();
    } else {
        endQuiz();
    }
}

// Start a countdown timer for each question
function startQuestionTimer() {
    let timeLeft = 10;  // 10 seconds for each question
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Time left: ${timeLeft}`;

    questionTimer = setInterval(function () {
        timeLeft--;
        timerElement.textContent = `Time left: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            alert("Time's up!");
            questionIndex++;
            loadNextQuestion();
            updateScoreboard();
        }
    }, 1000);
}

// Check the answer and update the score
function checkAnswer(selectedOption) {
    const currentQuestion = questions[questionIndex];
    if (selectedOption === currentQuestion.correctAnswer) {
        alert('Correct!');
        if (playerScores[currentPlayer]) {
            playerScores[currentPlayer] += 1;
        } else {
            playerScores[currentPlayer] = 1;
        }
    } else {
        alert('Wrong answer!');
    }

    questionIndex++;
    loadNextQuestion();
    updateScoreboard();
}

// Update the scoreboard
function updateScoreboard() {
    const playersScoresContainer = document.getElementById('players-scores');
    playersScoresContainer.innerHTML = '';  // Clear previous scoreboard

    Object.keys(playerScores).forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player}: ${playerScores[player]} points`;
        playersScoresContainer.appendChild(li);
    });
}

// End the quiz and display the final scores
function endQuiz() {
    clearInterval(questionTimer); // Clear any running timer
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = `Your final score: ${playerScores[currentPlayer] || 0} out of ${questions.length}`;
}

// Restart the quiz
document.getElementById('restart-quiz').addEventListener('click', function () {
    questionIndex = 0;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('player-entry').style.display = 'block';
    // Optionally reset scores: playerScores = {};
});