const path = require('path');
const marked = require('marked');
const fs = require('fs');
const watch = require('node-watch');
const opn = require('opn');

var renderer = new marked.Renderer();

const about = require("../content/about.json");



marked.setOptions({
    highlight: function(code) {
        return "<div class=\"code\">" + require('highlight.js').highlightAuto(code).value + "</div>";
    }
});

const buildHtml = async(templatePath = './src/template.html') => {
    renderer.heading = function(text, level) {
        var escapedText = 'head';
        return (
            '<h' +
            level +
            '><a name="' +
            escapedText +
            '" class="anchor" href="#' +
            escapedText +
            '"><span class="header-link"></span></a>' +
            text +
            '</h' +
            level +
            '>'
        );
    };

    renderer.paragraph = function(text) {
        return (
            "<p class=\"paragraph\">" + text + "</p>"
        )
    }


    var contentFiles = fs.readdirSync('./content');
    var loadedMarkdown = [];
    var loadedHtml = '';
    var template = fs.readFileSync('./src/template.html', 'UTF-8');
    var menuList = [];

    await contentFiles.forEach(file => {
        var content = fs.readFileSync(path.join('./content', file), 'UTF-8');
        if (path.extname(file) == '.md') {
            var name = path.parse(file).name.split('_')[1];
            var div_name = name.replace(' ', '-'); //'0_Introduction.md' -> 'Introduction'

            menuList.push({ text: name, href: div_name });

            var html =
                '<div class="topic" id="' + div_name + '">\n' +
                '<div class="topic-title">' + name + '</div><br><div class=\"line\"></div>' +
                marked(content, { renderer: renderer }) + '</div>';
            loadedHtml += html + '\n'; //add code to main block
        }
    });

    console.log(loadedHtml);

    var mainHtml = template.replace("$%name_%$", about.name);
    mainHtml = mainHtml.replace("$%version_%$", about.version);
    mainHtml = mainHtml.replace("$%github_%$", about.github);

    var list = '';

    console.log(menuList);

    menuList.forEach(element => {
        list += '<li classe"menu-item"><a href=#' + element.href + ">" + element.text + '</a></li>\n';
    });

    mainHtml = mainHtml.replace('$%menu_list_%$', list);

    mainHtml = mainHtml.replace('$%markdocs_content_%$', loadedHtml);

    console.log(mainHtml);

    fs.writeFileSync('./build/index.html', mainHtml);
};

buildHtml();
// Opens the url in the default browser
opn('http://localhost:6006/index.html');

//and watch files
watch('./content/', { recursive: true }, function(evt, name) {
    console.log('%s changed.', name);
    buildHtml();
});