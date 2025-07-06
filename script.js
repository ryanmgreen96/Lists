const { doc, getDoc, setDoc } = window.firestoreFunctions;
const db = window.firestoreDB;

const firestoreDocRef = doc(db, 'notes', 'sharedNote'); // you can name the doc anything

async function loadNotesFromFirestore() {
    try {
        const docSnap = await getDoc(firestoreDocRef);
        if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            if (firestoreData.data) {
                data = firestoreData.data;
                render();
            }
        }
    } catch (e) {
        console.error('Error loading from Firestore', e);
    }
}

async function saveNotesToFirestore(dataToSave) {
    try {
        await setDoc(firestoreDocRef, { data: dataToSave });
    } catch (e) {
        console.error('Error saving to Firestore', e);
    }
}







const defaultEntries = ["Tasks", "Music", "Yoga", "Grocery", "Chores", "Work"];

let data = JSON.parse(localStorage.getItem('noteAppData')) || [];

function saveData() {
    localStorage.setItem('noteAppData', JSON.stringify(data));
    saveNotesToFirestore(data);
}
  

function applySavedBackgroundColor() {
    const savedColor = localStorage.getItem('backgroundColor');
    if (savedColor) {
        $('body').css('background-color', savedColor);
    }
}
applySavedBackgroundColor();

function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function render() {
    const container = $('#sections-container');
    container.empty();

    data.forEach((section) => {
        const sectionDiv = $('<div>').addClass('section');

        section.entries.forEach((entry) => {
            const entryDiv = $('<div>').addClass('entry');

            const entryLabel = $('<div contenteditable="true">')
                .addClass('entry-label')
                .text(entry.text)
                .on('input', () => {
                    entry.text = entryLabel.text();
                    saveData();
                });

            entryDiv.append(entryLabel);

            const isTaskList = entry.text.trim().toLowerCase() === 'tasks';
            const itemsList = $('<div>').addClass('items-list');

            if (isTaskList) itemsList.css({
                'flex-direction': 'row',
                'flex-wrap': 'wrap',
                'gap': '0.5em'
            });

            entry.items.forEach((item) => {
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

                const itemText = $('<div contenteditable="true">')
                    .addClass('item-text')
                    .text(item.text)
                    .on('input', () => {
                        item.text = itemText.text();
                        saveData();
                    })
                    .on('paste', e => {
                        e.preventDefault();
                        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                        document.execCommand('insertText', false, text);
                    });

                itemDiv.append(checkbox, itemText);
                itemsList.append(itemDiv);
            });

            const addItemBtn = $('<button>').addClass('add-item-btn').text('+');
            addItemBtn.on('click', () => {
                entry.items.push({ id: generateId(), text: '', done: false });
                saveData();
                render();
            });

            entryDiv.append(itemsList, addItemBtn);

            if (isTaskList) {
                const refreshBtn = $('<button>').addClass('add-item-btn').text('⟳');
                refreshBtn.on('click', () => {
                    entry.items = [];
                    saveData();
                    render();
                });
                entryDiv.append(refreshBtn);
            }

            sectionDiv.append(entryDiv);
        });

        const addEntryBtn = $('<button>').addClass('add-entry-btn').text('+');
        addEntryBtn.on('click', () => {
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

function createNewSection() {
    const newSection = {
        entries: defaultEntries.map(name => ({
            id: generateId(),
            text: name,
            items: name.toLowerCase() === 'tasks' ? [] : [{
                id: generateId(),
                text: '',
                done: false
            }]
        }))
    };
    data.unshift(newSection);
    saveData();
    render();
}

loadNotesFromFirestore().then(() => {
    // If no data was loaded from Firestore, fallback:
    if (data.length === 0) {
        createNewSection();
    } else {
        render();
    }
});

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
