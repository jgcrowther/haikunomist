var latest;
var button;
var wordphonemes;
var rhymephonemes;
var lexicon;

function setup(){
    // Setup document with variabls and elements
    noCanvas();
    lexicon = new RiLexicon();
    button = createButton('Create Haiku');
    button.mousePressed(processRita);
}

$.ajax({
    // Get data from api
    type: 'GET',
    url: "https://newsapi.org/v1/articles?source=the-economist&sortBy=top&apiKey=6875ac89d276477b97483a5a4c28c436",
    async: true,
    dataType: 'json',
    success: function(data) {
        latest = select('#latest');
        latest.html("Origional Article Title: <strong id='article'>" + data.articles[0].title + "</strong>");
    }
});



function sylCount(word){
    // Counts sylables found by Rita Library
    var count = word.split("/");
    return count.length;
}

function wordObj(word, syl){
    // Creates word object with the word and number of sylables
    this.word = word;
    this.syl = syl;
}

function lineCheck(l, c){
    // Accepts line and sylable count, returns remaining sylables
    if (l==1 || l==3) {
        return 5 - c;
    } else {
        return 7 - c;
    }
}

function sylCheck(s, l, c){
    // Input sylable, line and count, 
    // return sylable + sylable count against sylable limit of line
    if (l==1 || l==3) {
        return s.syl + c <= 5;
    } else {
        return s.syl + c <= 7;
    }
}

function repWord(word, syl){
    // Input word and sylable length. Used if the initial word provided is to long or short.
    // First tries to find similar word with the required sylables
    // If that fails it returns a random word with the required sylables
    var rplc = lexicon.similarBySoundAndLetter(word);
    var rplcrs;
    for (var i = 0; i < rplc.length; i++) {
        rplcrs = new RiString(rplc[i]);
        if(sylCount(rplcrs.get("syllables"))<=syl){
            return rplc[i];
        }
    }
    return lexicon.randomWord(syl);
}

function generate(wl){
    // Generates a Haiku from a list of word objects. 
    // Returns new list which seperates Haiku lines with a % symbol
    var line = 1;
    var count = 0;
    var haiku = [];

    while(line<4){
        if(wl.length>1){
            for (var i = wl.length-1; i > 0; i--) {
                if(lineCheck(line, count) <= 0){
                    line += 1;
                    count = 0;
                    haiku.push("%");
                }
                if(line > 3){
                    break;
                }
                if (sylCheck(wl[i], line, count)){
                    haiku.push(wl[i].word);
                    count += wl[i].syl
                } else {
                    var rplc = repWord(wl[i].word, lineCheck(line, count));
                    count += lineCheck(line, count);
                    haiku.push(rplc);
                }
                wl.splice(i, 1);
            }
        } else {
            var sn =Math.floor((Math.random()*lineCheck(line, count))+1);
            var ranw = lexicon.randomWord(sn);
            haiku.push(ranw);
            count += sn;
            if(lineCheck(line, count) <= 0){
                line += 1;
                count = 0;
                haiku.push("%");
            }
        }
    }

    return haiku;
}

function parse(word){
    // Removes unwanted characters from words
    var letters = word.split("");
    for (var i = letters.length; i >= 0; i--) {
        if (/[-’'"“”:]/.test(letters[i])){
            letters.splice(i, 1);
        }
    }
    return letters.join("");
}

function processRita(){
    // Takes words from latest headline, creats a word object.
    // Appends new paragraph elements containing the generated Haiku
    var article = select('#article');
    var s = article.html();
    var rs = new RiString(s);
    var wl = rs.words();
    var newwl = [];
    for (var i = 0; i < wl.length; i++) {
        var parsed = parse(wl[i]);
        var current = new RiString(parsed);
        if (/([A-Z][A-Z]+|\.|\?|!|,)/.test(current)){
            continue
        } else {
            var currentsyl = current.get("syllables");
            var word = new wordObj(parsed, sylCount(currentsyl));
            newwl.push(word);
        }
    }
    newwl.sort(function(a, b){return 0.5 - Math.random()});
    var haiku = generate(newwl);
    haiku = haiku.join(" ");
    haiku = haiku.split("%");
    createP(haiku[2]);
    createP(haiku[1]);
    createP(haiku[0]);
}
