document.addEventListener('DOMContentLoaded', fetchQuestions);

async function fetchQuestions() {
    try {
        const response = await fetch('https://the-trivia-api.com/v2/questions');
        const data = await response.json();
        addQuestionsToForm(data);
    } catch (error) {
        console.error('Erro ao buscar perguntas:', error);
    }
}

function addQuestionsToForm(questions) {
    const questionSection = document.getElementById('quiz-questions');

    questions.forEach((question, index) => {
        const article = document.createElement('article');
        const header = document.createElement('header');
        const h2 = document.createElement('h2');
        const p = document.createElement('p');
        const fieldset = document.createElement('fieldset');

        h2.textContent = `Pergunta ${index + 1}`;
        p.textContent = question.question.text;

        header.appendChild(h2);
        article.appendChild(header);
        article.appendChild(p);

        const allAnswers = [question.correctAnswer, ...question.incorrectAnswers];

        allAnswers.forEach((answer, answerIndex) => {
            const label = document.createElement('label');
            const input = document.createElement('input');

            input.type = 'radio';
            input.name = `question${index + 1}`;
            input.value = answer;
            input.id = `q${index + 1}a${answerIndex + 1}`;

            label.htmlFor = input.id;
            label.textContent = answer;

            label.insertBefore(input, label.firstChild);
            fieldset.appendChild(label);
        });

        article.appendChild(fieldset);
        questionSection.appendChild(article);
    });
}

document.getElementById('quiz-form').addEventListener('submit', function(event) {
    event.preventDefault();
    //vazer verificação da resposta
});