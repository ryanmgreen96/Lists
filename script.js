const GIST_ID = 'baa504912ab3a632923628226086f467';  // your Gist ID
const GIST_FILENAME = 'notes.json';                  // your Gist file name
const GITHUB_TOKEN = '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';       // your GitHub token — keep private!

const defaultEntries = ["Grocery", "Work", "Music", "Yoga", "Chores"];

let data = [];  // Will load from Gist on startup

// Generate a unique ID for items and entries
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Save data to your Gist via API
async function saveData() {
    try {
        const body = {
            files: {
                [GIST_FILENAME]: {
                    content: JSON.stringify(data, null, 2)
                }
            }
        };
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Failed to save gist');
    } catch (error) {
        console.error('Error saving data to gist:', error);
    }
}

// Load data from your Gist via API
async function loadData() {
    try {
        const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`
            }
        });
        if (!response.ok) throw new Error('Failed to load gist');
        const gistData = await response.json();
        const content = gistData.files[GIST_FILENAME]?.content;
        if (!content) throw new Error('Gist file not found');
        data = JSON.parse(content);

        if (!Array.isArray(data) || data.length === 0) {
            createNewSection();  // if gist empty, create initial data
        } else {
            render();
        }
    } catch (error) {
        console.error('Error loading data from gist:', error);
        // Fallback: create new section if no data or error
        createNewSection();
    }
}

function applySavedBackgroundColor() {
    const savedColor = localStorage.getItem('backgroundColor');
    if (savedColor) {
        $('body').css('background-color', savedColor);
    }
}

// Render the entire app
function render() {
    const container = $('#sections-container');
    container.empty();

    data.forEach((section, sectionIndex) => {
        const sectionDiv = $('<div>').addClass('section');

        // Render all entries inside this section
        section.entries.forEach((entry, entryIndex) => {
            const entryDiv = $('<div>').addClass('entry');

            const entryLabel = $('<div contenteditable="true">')
                .addClass('entry-label')
                .text(entry.text)
                .on('input', async () => {
                    entry.text = entryLabel.text();
                    await saveData();
                });

            entryDiv.append(entryLabel);

            // Items container
            const itemsList = $('<div>').addClass('items-list');

            // Render items
            entry.items.forEach((item, itemIndex) => {
                const itemDiv = $('<div>').addClass('item');

                const checkbox = $('<div>').addClass('item-checkbox').attr('tabindex', 0);
                if (item.done) checkbox.addClass('checked');

                checkbox.on('click keydown', async function (e) {
                    if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                        checkbox.toggleClass('checked');
                        item.done = !item.done;
                        await saveData();
                    }
                });

                // Editable text div
                const itemText = $('<div contenteditable="true">')
                    .addClass('item-text')
                    .text(item.text)
                    .on('input', async () => {
                        item.text = itemText.text();
                        await saveData();
                    })
                    .on('paste', e => {
                        e.preventDefault();
                        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                        document.execCommand('insertText', false, text);
                    });

                itemDiv.append(checkbox, itemText);
                itemsList.append(itemDiv);
            });

            // Add item button below items
            const addItemBtn = $('<button>').addClass('add-item-btn').text('+');

            addItemBtn.on('click', async () => {
                entry.items.push({
                    id: generateId(),
                    text: '',
                    done: false,
                });
                await saveData();
                render();
            });

            entryDiv.append(itemsList, addItemBtn);
            sectionDiv.append(entryDiv);
        });

        // Add entry button below all entries
        const addEntryBtn = $('<button>').addClass('add-entry-btn').text('+');

        addEntryBtn.on('click', async () => {
            section.entries.push({
                id: generateId(),
                text: 'New Entry',
                items: [{
                    id: generateId(),
                    text: '',
                    done: false,
                }]
            });
            await saveData();
            render();
        });

        sectionDiv.append(addEntryBtn);
        container.append(sectionDiv);
    });
}

// Create a new section with default entries and one blank item per entry
function createNewSection() {
    const newSection = {
        entries: defaultEntries.map(name => ({
            id: generateId(),
            text: name,
            items: [{
                id: generateId(),
                text: '',
                done: false,
            }]
        }))
    };
    data.unshift(newSection);
    saveData();
    render();
}

$(document).ready(async function () {
    applySavedBackgroundColor();

    $('#new-section-btn').on('click', async () => {
        createNewSection();
    });

    $('.color-btn').on('click', function () {
        const color = $(this).data('color');
        $('body').css('background-color', color);
        localStorage.setItem('backgroundColor', color);
    });

    // Load data from gist on startup
    await loadData();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker registered'));
    }
});
