from flask import Flask, render_template, request, jsonify, session
import random
import time

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Define the list of words with hints
words_with_hints = {
    'python': 'A popular programming language.',
    'java': 'A high-level programming language used for web and mobile apps.',
    'kotlin': 'A modern programming language for JVM and Android development.',
    'javascript': 'A language commonly used for web development.',
    'html': 'The standard markup language for creating web pages.',
    'css': 'A style sheet language used for describing the presentation of a document.',
    'ruby': 'A dynamic, open source programming language with a focus on simplicity.',
    'php': 'A popular general-purpose scripting language especially suited to web development.',
    'sql': 'A domain-specific language used in programming and designed for managing data.',
    'swift': 'A powerful programming language for iOS and macOS apps.'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start_game', methods=['POST'])
def start_game():
    word = random.choice(list(words_with_hints.keys()))
    hint = words_with_hints[word]
    session['word'] = word
    session['hint'] = hint
    session['word_completion'] = "_" * len(word)
    session['guessed_letters'] = []
    session['tries'] = 6
    if 'score' not in session:
        session['score'] = 0
    session['start_time'] = time.time()
    return jsonify({
        'word_completion': session['word_completion'],
        'hint': hint,
        'tries': session['tries'],
        'score': session['score']
    })

@app.route('/guess', methods=['POST'])
def guess():
    letter = request.json.get('letter')
    word = session['word']
    word_completion = session['word_completion']
    guessed_letters = session['guessed_letters']
    tries = session['tries']
    
    if letter in guessed_letters:
        return jsonify({'error': 'You already guessed that letter.'})
    
    guessed_letters.append(letter)
    
    if letter not in word:
        tries -= 1
        session['tries'] = tries
    else:
        word_as_list = list(word_completion)
        indices = [i for i, l in enumerate(word) if l == letter]
        for index in indices:
            word_as_list[index] = letter
        word_completion = "".join(word_as_list)
        session['word_completion'] = word_completion
    
    session['guessed_letters'] = guessed_letters
    
    game_over = tries == 0 or "_" not in word_completion
    win = "_" not in word_completion
    if win:
        session['score'] += 10
    
    return jsonify({
        'word_completion': word_completion,
        'tries': tries,
        'game_over': game_over,
        'win': win,
        'hint': session['hint']
    })

@app.route('/time', methods=['GET'])
def get_time():
    start_time = session['start_time']
    elapsed_time = int(time.time() - start_time)
    return jsonify({'time': elapsed_time})

if __name__ == '__main__':
    app.run(debug=True)
