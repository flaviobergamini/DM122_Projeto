import registerServiceWorker from './scripts/service-worker/install-service-worker.js';
import triviaApiRepository from './scripts/trivia-api-repository.js';

//IndexedDB

let db;
const request = indexedDB.open('quizDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('questions', { keyPath: 'id' });
    objectStore.createIndex('category', 'category', { unique: false });
    objectStore.createIndex('difficulty', 'difficulty', { unique: false });
};

request.onsuccess = function(event) {
    db = event.target.result;
    getQuestionData();
};

request.onerror = function(event) {
    console.error('Erro ao abrir IndexedDB:', event.target.errorCode);
};

export function addQuestionToDB(question) {
    const transaction = db.transaction(['questions'], 'readwrite');
    const objectStore = transaction.objectStore('questions');
    objectStore.add(question);
}

export function fetchQuestionsFromDB(callback) {
    const transaction = db.transaction(['questions'], 'readonly');
    const objectStore = transaction.objectStore('questions');
    const request = objectStore.getAll();
    request.onsuccess = function(event) {
        callback(event.target.result);
    };
}

//Lógica do quiz
let currentQuestionIndex = 0;
let questions = [];

async function getQuestionData() {
    try {
        const data = await triviaApiRepository();
        data.forEach(question => addQuestionToDB(question));
        displayNextQuestion();
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
        fetchQuestionsFromDB(displayNextQuestion);
    }
}

function displayNextQuestion() {
    fetchQuestionsFromDB(loadedQuestions => {
        questions = loadedQuestions;
        if (questions.length > 0) {
            showQuestion(currentQuestionIndex);
        } else {
            alert('There are no questions available.');
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showQuestion(index) {
    const question = questions[index];
    const questionTitle = document.getElementById('question-title');
    const questionText = document.getElementById('question-text');
    const answers = document.getElementById('answers');

    questionTitle.textContent = `Question ${index + 1}`;
    questionText.textContent = question.question.text;
    answers.innerHTML = '';

    const allAnswers = [question.correctAnswer, ...question.incorrectAnswers];
    shuffleArray(allAnswers);

    allAnswers.forEach((answer, answerIndex) => {
        const label = document.createElement('label');
        const input = document.createElement('input');

        input.type = 'radio';
        input.name = 'answer';
        input.value = answer;
        input.id = `answer${answerIndex}`;

        label.htmlFor = input.id;
        label.textContent = answer;

        label.insertBefore(input, label.firstChild);
        answers.appendChild(label);
    });
}

document.getElementById('quiz-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) return;

    const question = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer.value === question.correctAnswer;

    showModal(isCorrect ? 'Correct!' : 'Wrong!', isCorrect ? 'You\'re right!' : `Right answer: ${question.correctAnswer}`);

    if (isCorrect) {
        currentQuestionIndex++;
    }
});

document.getElementById('next-question').addEventListener('click', function() {
    document.getElementById('modal').close();
    if (currentQuestionIndex < questions.length) {
        showQuestion(currentQuestionIndex);
    } else {
        alert('End of the quiz!');
    }
});

function showModal(title, text) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = text;
    modal.showModal();
}

registerServiceWorker();
