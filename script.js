const GIST_ID = 'baa504912ab3a632923628226086f467';  // your Gist ID
const GIST_FILENAME = 'notes.json';                  // your Gist file name
const GITHUB_TOKEN = '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';    

let data = [];

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Load data from GitHub Gist
async function loadDataFromGist() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            }
        });

        if (!response.ok) throw new Error('Failed to fetch gist');

        const gist = await response.json();
        const content = gist.files[FILE_NAME]?.content;

        data = content ? JSON.parse(content) : [];
        if (data.length === 0) createNewSection();
        render();
    } catch (e) {
        console.error('Error loading from Gist:', e);
        data = [];
        createNewSection();
        render();
    }
}

// Save data to GitHub Gist
async function saveDataToGist() {
    try {
        const body = {
            files: {
                [FILE_NAME]: {
                    content: JSON.stringify(data)
                }
            }
        };

        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('Failed to save gist');
    } catch (e) {
        console.error('Error saving to Gist:', e);
    }
}

function saveData() {
    saveDataToGist();
    localStorage.setItem('noteAppData', JSON.stringify(data)); // optional backup
}

function createNewSection() {
    const defaultEntries = ["Grocery", "Work", "Music", "Yoga", "Chores"];
    const section = {
        entries: defaultEntries.map(name => ({
            id: generateId(),
            text: name,
            items: [{ id: generateId(), text: '', done: false }]
        }))
    };
    data.unshift(section);
    saveData();
    render();
}

// Example render function (simplified)
function render() {
    const container = $('#sections-container');
    container.empty();

    data.forEach((section, sectionIndex) => {
        const sectionDiv = $('<div>').addClass('section');

        section.entries.forEach((entry, entryIndex) => {
            const entryDiv = $('<div>').addClass('entry');

            const label = $('<div contenteditable="true">')
                .addClass('entry-label')
                .text(entry.text)
                .on('input', () => {
                    entry.text = label.text();
                    saveData();
                });

            const itemsList = $('<div>').addClass('items-list');

            entry.items.forEach((item, itemIndex) => {
                const itemDiv = $('<div>').addClass('item');

                const checkbox = $('<div>').addClass('item-checkbox').attr('tabindex', 0);
                if (item.done) checkbox.addClass('checked');
                checkbox.on('click', () => {
                    item.done = !item.done;
                    checkbox.toggleClass('checked');
                    saveData();
                });

                const itemText = $('<div contenteditable="true">')
                    .addClass('item-text')
                    .text(item.text)
                    .on('input', () => {
                        item.text = itemText.text();
                        saveData();
                    });

                itemDiv.append(checkbox, itemText);
                itemsList.append(itemDiv);
            });

            const addItemBtn = $('<button>').text('+').on('click', () => {
                entry.items.push({ id: generateId(), text: '', done: false });
                saveData();
                render();
            });

            entryDiv.append(label, itemsList, addItemBtn);
            sectionDiv.append(entryDiv);
        });

        const addEntryBtn = $('<button>').text('+').on('click', () => {
            section.entries.push({
                id: generateId(),
                text: 'New Entry',
                items: [{ id: generateId(), text: '', done: false }]
            });
            saveData();
            render();
        });

        sectionDiv.append(addEntryBtn);
        container.append(sectionDiv);
    });
}

// Section and background controls
$('#new-section-btn').on('click', () => {
    createNewSection();
});

$('.color-btn').on('click', function () {
    const color = $(this).data('color');
    $('body').css('background-color', color);
    localStorage.setItem('backgroundColor', color);
});

function applySavedBackgroundColor() {
    const savedColor = localStorage.getItem('backgroundColor');
    if (savedColor) {
        $('body').css('background-color', savedColor);
    }
}

// Start
$(document).ready(() => {
    applySavedBackgroundColor();
    loadDataFromGist();
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registered'));
}
