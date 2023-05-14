// Set constants
const sentence_length = 30; // number of words in generated sentence
const margin = 30; // margin for text on canvas

// Load words from txt file
function preload() {
    words = loadStrings('words.txt'); // load words from txt file
}

// Set up canvas and text properties
function setup() {
    createCanvas(windowWidth, windowHeight); // create canvas to fit window size
    background(36, 41, 46); // set background color
    textAlign(CENTER); // center text alignment
    fill(255); // set text fill color
    textSize(20); // set text size
    textFont('roboto mono'); // set text font
    textWrap(WORD); // wrap text by word
    // Initialize letiables
    userinput = "";
    sentence = "";
    time = 0;
    start = false;
    shake = false;
    // Loop through each word in the text
    total_words = 0;
    stopped = false;
    mistakes = 0;
    total_chars = 0;
}

// Handle user input
function keyPressed() {
    if (!start && userinput == "" && !stopped) { // start game
        start = true;
    }
    if (start && !stopped) { // handle input
        if ("abcdefghijklmnopqrstuvwxyz ".includes(key) && userinput.length < sentence.length) { // only allow alphanumeric characters and spaces
            userinput += key;
        }
        if (key === "Backspace") { // handle backspace
            userinput = userinput.slice(0, -1);
        }
    }
    if (keyCode === ENTER) { // reset game
        loop(); // restart animation loop
        sentence = "";
        userinput = "";
        start = false;
        stopped = false;
        time = 0;
        total_words = 0;
        total_chars = 0;
        mistakes = 0;
    }
    if (userinput !== sentence.slice(0, userinput.length) && start && !stopped) { // count mistakes for accuracy calculation
        mistakes += 1;
    }
}

// Generate a random sentence from words.txt
function generate_sentence() {
    for (let i = 0; i < sentence_length; i++) {
        sentence += random(words) + " "; // add a random word from words.txt to the sentence
    }
}

// Calculate number of words in a sentence
function word_calc(sentence_used) {
    word_count = sentence_used.split(" ").length; // split sentence by spaces and count elements
    return word_count;
}

// Calculate number of characters in a sentence
function char_calc(sentence_used) {
    char_count = sentence_used.length;
    return char_count;
}

// Calculate accuracy based on mistakes made
function accuracy_calc(total) {
    accuracy = (total - mistakes) / total * 100; // calculate percentage of correct characters
    return accuracy;
}

function updateLeaderboard(name, wpm, accuracy) {
    if (accuracy >= 75) {
        let data = {
            name: name,
            wpm: wpm,
            accuracy: accuracy
        };
        let newKey = firebase.database().ref().child('leaderboard').push().key;
        let updates = {};
        updates['/leaderboard/' + newKey] = data;
        firebase.database().ref().update(updates);
    }
}

function retrieveLeaderboard() {
    firebase.database().ref('/leaderboard').orderByChild('wpm').limitToLast(10).once('value').then(function(snapshot) {
        let leaderboard = snapshot.val();
        leaderboard = Object.values(leaderboard).sort((a, b) => {
            if (b.wpm === a.wpm) {
                return b.accuracy - a.accuracy; // if wpm is the same, settle tie based on accuracy
            } else {
                return b.wpm - a.wpm; // sort by descending order of wpm
            }
        });
        leaderboard = leaderboard.filter(entry => entry.accuracy >= 75); // filter out entries with accuracy below 75%
        let table_width = 300;
        let row_height = 30;
        let table_x = (width - table_width) / 2;
        let table_y = (height - row_height * 10) / 2 + 30;
        // Create table headers
        textAlign(CENTER);
        textSize(20);
        fill(255);
        text("Name", table_x, table_y - row_height);
        text("WPM", table_x + table_width / 2, table_y - row_height);
        text("Accuracy", table_x + table_width, table_y - row_height);
        // Create table rows
        textSize(18);
        let rank = 1;
        for (let key in leaderboard) {
            if (leaderboard.hasOwnProperty(key)) {
                let data = leaderboard[key];
                let name = data.name;
                let wpm = data.wpm;
                let accuracy = data.accuracy;
                fill(100);
                text(rank + ". " + name, table_x, table_y + (rank - 1) * row_height);
                text(wpm, table_x + table_width / 2, table_y - 2 + (rank - 1) * row_height);
                text(accuracy + "%", table_x + table_width, table_y - 2 + (rank - 1) * row_height);
                rank++;
            }
        }
    });
}



// Draw function to update canvas and handle game logic
function draw() {
    resizeCanvas(windowWidth, windowHeight); // resize canvas to fit window size
    if (shake) { // shake effect if user makes a mistake
        translate(random(-5, 5), random(-5, 5)); // randomly translate canvas position
        background(226, 95, 96); // set background color
        // Display text
        fill(226, 183, 20)
        text("time: " + (30 - time) + " seconds", width / 2, height / 2 - 200);
        textAlign(LEFT);
        fill(100);
        text(sentence, margin, height / 2 - margin, width - margin, height / 2 + margin);
        fill(255);
        if (frameCount % 60 < 30) {
            text(userinput + "_", margin, height / 2 - margin, width - margin, height / 2 + margin);
        } else {
            text(userinput, margin, height / 2 - margin, width - margin, height / 2 + margin);
        }
        textAlign(CENTER);
    }
    if (start && frameCount % 60 == 0) { // increment time every second
        time += 1;
    }
    if (time > 0 && !shake) { // display game when time is running and no shake effect is active
        background(36, 41, 46, 255); // set background color
        textAlign(CENTER);
        fill(226, 183, 20)
        text("time: " + (30 - time) + " seconds", width / 2, height / 2 - 200);
        textAlign(LEFT);
        fill(100);
        text(sentence, margin, height / 2 - margin, width - margin, height / 2 + margin);
        fill(255);
        if (frameCount % 60 < 30) {
            text(userinput + "_", margin, height / 2 - margin, width - margin, height / 2 + margin); // display user input with a blinking cursor
        } else {
            text(userinput, margin, height / 2 - margin, width - margin, height / 2 + margin); // display user input without cursor
        }
        textAlign(CENTER);
    } else if (!shake) { // display start screen when time is not running and no shake effect is active
        background(36, 41, 46, 255); // set background color
        fill(226, 183, 20)
        text("press any key to start", width / 2, height / 2 - 200);
        textAlign(LEFT);
        fill(100);
        text(sentence, margin, height / 2 - margin, width - margin, height / 2 + margin);
        fill(255);
        textAlign(CENTER);
    }
    if (userinput === sentence) { // handle correct input
        total_words += word_calc(userinput); // add words to total word count
        total_chars += char_calc(userinput); // add characters to total character count
        generate_sentence(); // generate new sentence
        userinput = ""; // reset user input
    } else if (userinput !== sentence.slice(0, userinput.length)) { // handle mistake
        shake = true; // activate shake effect
    } else {
        shake = false; // deactivate shake effect
    }
    if (time > 30 && !stopped) { // handle end of game
        total_words += word_calc(userinput); // add any remaining words to total word count
        total_chars += char_calc(userinput); // add any remaining characters to total character count
        start = false; // end game
        time = 0;
        userinput = "";
        stopped = true;
        noLoop();
        clear();
        background(36, 41, 46, 255); // set background color 
        let name = prompt("Enter your name:");
        updateLeaderboard(name, total_words * 2, constrain(accuracy_calc(total_chars).toFixed(2), 0, 100)); // call updateLeaderboard function with user's name, words per minute, and accuracy percentage
        retrieveLeaderboard(); // retrieve leaderboard data
        textAlign(CENTER);
        fill(226, 183, 20)
        text("press enter to restart", width / 2, height / 2 - 200);
        text("wpm: " + total_words * 2, width / 2, height / 2 + 200); // display words per minute
        if (accuracy >= 75) { // display accuracy percentage
            text("accuracy: " + constrain(accuracy_calc(total_chars).toFixed(2), 0, 100) + "%", width / 2, height / 2 + 230); // display accuracy percentage

        } else {
            text("accuracy: " + constrain(accuracy_calc(total_chars).toFixed(2), 0, 100) + "%" + " (test invalid: low accuracy)", width / 2, height / 2 + 230); // display accuracy percentage
        }
    }
    if (sentence === "") { // generate new sentence if none exists
        generate_sentence();
    }
}