const fs = require('fs');
const { JSDOM } = require('jsdom');

// Parse HTML string into JSON
function parseHTMLToJSON(htmlString) {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    function extractWeeks(list) {
        return Array.from(list.querySelectorAll('li > a')).map(link => {
            let href = link.href;
            const queryString = '?638578787055109372';
            if (href.includes(queryString)) {
                href = href.replace(queryString, ''); // Remove specific query string
            }
            return {
                name: `Semana ${link.textContent.split(' ')[1]}`,
                link: href
            };
        });
    }

    function extractGroups(ul) {
        return Array.from(ul.children).map(li => {
            const groupName = li.firstChild.textContent.trim();
            return {
                name: groupName,
                weeks: extractWeeks(li.querySelector('ul'))
            };
        });
    }

    function extractYears(ul) {
        return Array.from(ul.children).map(li => {
            const yearName = li.firstChild.textContent.trim();
            return {
                name: yearName,
                groups: extractGroups(li.querySelector('ul'))
            };
        });
    }

    function extractCourses(ul) {
        return Array.from(ul.children).map(li => {
            const courseName = li.firstChild.textContent.trim();
            return {
                name: courseName,
                years: extractYears(li.querySelector('ul'))
            };
        });
    }

    const coursesUL = document.querySelector('ul');
    const jsonResult = {
        courses: extractCourses(coursesUL)
    };

    return jsonResult;
}

// Read the HTML file and process it
fs.readFile('horarios.html', 'utf8', (err, htmlString) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Parse the HTML and convert it to JSON
    const jsonResult = parseHTMLToJSON(htmlString);

    // Write the JSON to a file
    fs.writeFile('data.json', JSON.stringify(jsonResult, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON to file:', err);
        } else {
            console.log('JSON data has been saved to data.json');
        }
    });
});
