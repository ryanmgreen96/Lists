const defaultEntries = ["Grocery", "Work", "Music", "Yoga", "Chores"];

let data = JSON.parse(localStorage.getItem('noteAppData')) || [];

// Save data to localStorage
function saveData() {
    localStorage.setItem('noteAppData', JSON.stringify(data));
}
function applySavedBackgroundColor() {
    const savedColor = localStorage.getItem('backgroundColor');
    if (savedColor) {
        $('body').css('background-color', savedColor);
    }
}
applySavedBackgroundColor();  

// Generate a unique ID for items and entries
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
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
                .on('input', () => {
                    entry.text = entryLabel.text();
                    saveData();
                });
          
            entryDiv.append(entryLabel);

            // Items container
            const itemsList = $('<div>').addClass('items-list');

            // Render items
            entry.items.forEach((item, itemIndex) => {
                const itemDiv = $('<div>').addClass('item');

                const checkbox = $('<div>').addClass('item-checkbox').attr('tabindex', 0);
                if (item.done) checkbox.addClass('checked');

                checkbox.on('click keydown', function (e) {
                    if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                        checkbox.toggleClass('checked');
                        item.done = !item.done;
                        saveData();
                    }
                });

                // Editable text div
                const itemText = $('<div contenteditable="true">')
                    .addClass('item-text')
                    .text(item.text)
                    .on('input', () => {
                        item.text = itemText.text();
                        saveData();
                    })
                    .on('paste', e => {
                        // Prevent formatting paste
                        e.preventDefault();
                        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                        document.execCommand('insertText', false, text);
                    });

                itemDiv.append(checkbox, itemText);
                itemsList.append(itemDiv);
            });

            // Add item button below items
            const addItemBtn = $('<button>').addClass('add-item-btn').text('+');

            addItemBtn.on('click', () => {
                entry.items.push({
                    id: generateId(),
                    text: '',
                    done: false,
                });
                saveData();
                render();
            });

            entryDiv.append(itemsList, addItemBtn);
            sectionDiv.append(entryDiv);
        });

        // Add entry button below all entries
        const addEntryBtn = $('<button>').addClass('add-entry-btn').text('+');

        addEntryBtn.on('click', () => {
            section.entries.push({
                id: generateId(),
                text: 'New Entry',
                items: [{
                    id: generateId(),
                    text: '',
                    done: false,
                }]
            });
            saveData();
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

// Initial load
if (data.length === 0) {
    createNewSection();
} else {
    render();
}

$('#new-section-btn').on('click', () => {
    createNewSection();
});

$(document).ready(function () {
    $('.color-btn').on('click', function () {
        const color = $(this).data('color');
        $('body').css('background-color', color);
        localStorage.setItem('backgroundColor', color);
    });
});
  
  


    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(() => console.log('Service Worker registered'));
  }


