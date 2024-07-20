document.addEventListener('DOMContentLoaded', () => {
    const hangmanImage = document.getElementById('hangman-image');
    const wordCompletionElement = document.getElementById('word-completion');
    const hintElement = document.getElementById('hint');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const guessInput = document.getElementById('guess-input');
    const guessButton = document.getElementById('guess-button');
    const startButton = document.getElementById('start-button');
    const messageElement = document.getElementById('message');
    const bodyElement = document.body;

    let timerInterval;
    let score = 0;
    let currentWordIndex = 0;
    const colors = [
        'bg-color-word-1', 'bg-color-word-2', 'bg-color-word-3',
        'bg-color-word-4', 'bg-color-word-5', 'bg-color-word-6',
        'bg-color-word-7', 'bg-color-word-8', 'bg-color-word-9',
        'bg-color-word-10'
    ];

    function updateGame(data) {
        wordCompletionElement.textContent = data.word_completion;
        hangmanImage.src = `/static/images/${6 - data.tries}.png`;
        hintElement.textContent = `Hint: ${data.hint}`;
        scoreElement.textContent = `Score: ${score}`;
        messageElement.textContent = '';
        guessInput.value = '';
        
        if (data.win) {
            bodyElement.className = colors[currentWordIndex];
            currentWordIndex = (currentWordIndex + 1) % colors.length;
        } else if (data.game_over) {
            bodyElement.className = '';
        }
    }

    function startGame() {
        fetch('/start_game', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                updateGame(data);
                startTimer();
            });
    }

    function makeGuess() {
        const letter = guessInput.value;
        if (letter) {
            fetch('/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ letter })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    messageElement.textContent = data.error;
                } else {
                    updateGame(data);
                    if (data.game_over) {
                        messageElement.textContent = data.win ? 'Congratulations, you win!' : 'Game over. Try again!';
                        if (data.win) {
                            score += 10;
                            setTimeout(startGame, 3000); // Automatically start a new game after 3 seconds
                        }
                        clearInterval(timerInterval);
                    }
                }
            });
        }
    }

    function startTimer() {
        clearInterval(timerInterval); // Ensure no duplicate timers are running
        timerElement.textContent = `Time: 0s`;
        let seconds = 0;
        timerInterval = setInterval(() => {
            fetch('/time')
                .then(response => response.json())
                .then(data => {
                    timerElement.textContent = `Time: ${data.time}s`;
                    if (data.time >= 60) {
                        clearInterval(timerInterval);
                        messageElement.textContent = 'Time is up!';
                        bodyElement.className = ''; // Revert to default color
                    }
                });
            seconds += 1;
        }, 1000);
    }

    startButton.addEventListener('click', startGame);
    guessButton.addEventListener('click', makeGuess);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            makeGuess();
        }
    });

    startGame();
});
