export default async function triviaApiRepository() {
    const response = await fetch('https://the-trivia-api.com/v2/questions');
    return await response.json();
}