const cityEmojiMap = {
  delhi: "🕌",
  mumbai: "🌆",
  newyork: "🗽",
  losangeles: "🎬",
  london: "🎡",
  paris: "🗼",
  tokyo: "🗾",
  sydney: "🌉",
  dubai: "🏙️",
  america: "🇺🇸",
  india: "🇮🇳",
  japan: "🇯🇵",
  france: "🇫🇷",
  uk: "🇬🇧",
  australia: "🇦🇺",
  canada: "🇨🇦",
  beijing: "🏯",
  shanghai: "🏙️",
  singapore: "🦁",
  seoul: "🏙️",
  bangkok: "🏯",
  kualalumpur: "🏙️",
  rome: "🏛️",
  berlin: "🏰",
  madrid: "🏰",
  barcelona: "🏰",
  vienna: "🎻",
  amsterdam: "🚲",
  athens: "🏛️",
  moscow: "🏰",
  chicago: "🌆",
  sanfrancisco: "🌉",
  toronto: "🏙️",
  vancouver: "🏔️",
  mexicocity: "🌆",
  lasvegas: "🎰",
  buenosaires: "🏙️",
  riodejaneiro: "🏖️",
  saopaulo: "🏙️",
  lima: "🏙️",
  bogota: "🏙️",
  cairo: "🏜️",
  capetown: "🏖️",
  johannesburg: "🏙️",
  lagos: "🏙️",
  nairobi: "🏙️",
  melbourne: "🎡",
  auckland: "🌆",
  jakarta: "🏙️",
  capeTown: "🏖️",
  hoChiMinhCity: "🏙️",
  dubai: "🏙️"
};


// Function to fetch emoji based on place name
function getEmojiForPlace(name) {
  const lowerName = name.toLowerCase();

  // Try exact match first
  if (cityEmojiMap[lowerName]) {
    return cityEmojiMap[lowerName];
  }

  // Fallback: Try matching part of the name
  for (const key in cityEmojiMap) {
    if (lowerName.includes(key)) {
      return cityEmojiMap[key];
    }
  }

  return "🌍"; // Default fallback
}

// DOM Elements
const form = document.getElementById('add-form');
const inputPlace = document.getElementById('new-place');
const inputNotes = document.getElementById('new-notes');
const list = document.getElementById('bucket-list');
const counter = document.getElementById('counter');
const filters = document.getElementById('filters');
const clearVisitedBtn = document.getElementById('clear-visited');
const clearAllBtn = document.getElementById('clear-all');

// State
let bucketList = JSON.parse(localStorage.getItem('bucketList')) || [];
let currentFilter = 'all';

// Helpers
function saveList() {
  localStorage.setItem('bucketList', JSON.stringify(bucketList));
}

function updateCounter() {
  const total = bucketList.length;
  const visited = bucketList.filter(i => i.visited).length;
  counter.textContent = total
    ? `Visited ${visited} / ${total} places`
    : 'Your bucket list is empty.';
}

function createButton(className, title, html, tabIndex, onClick) {
  const btn = document.createElement('button');
  btn.className = className;
  btn.title = title;
  btn.innerHTML = html;
  btn.tabIndex = tabIndex;
  btn.addEventListener('click', onClick);
  return btn;
}

// Render Logic
function renderList() {
  list.innerHTML = '';
  const filteredList = bucketList.filter(item => {
    if (currentFilter === 'visited') return item.visited;
    if (currentFilter === 'notvisited') return !item.visited;
    return true;
  });
  
  if (!filteredList.length) {
    const emptyMsg = document.createElement('li');
    Object.assign(emptyMsg.style, {
      fontStyle: 'italic',
      color: '#74828f',
      textAlign: 'center',
      userSelect: 'text'
    });
    emptyMsg.textContent = 'No places to show.';
    list.appendChild(emptyMsg);
    updateCounter();
    return;
  }

  const fragment = document.createDocumentFragment();

  filteredList.forEach(item => {
    const li = document.createElement('li');
    li.className = item.visited ? 'visited' : '';
    li.tabIndex = 0;

    const header = document.createElement('div');
    header.className = 'item-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-name';
    // Add the emoji in front of the place name
    nameSpan.textContent = `${getEmojiForPlace(item.name)} ${item.name}`;

    const visitBtn = createButton(
      'action-btn visit' + (item.visited ? ' visited' : ''),
      item.visited ? 'Mark as not visited' : 'Mark as visited',
      item.visited ? '✔️' : '⭕',
      0,
      e => {
        e.stopPropagation();
        item.visited = !item.visited;
        saveList();
        renderList();
      }
    );
    visitBtn.setAttribute('aria-pressed', item.visited);

    const deleteBtn = createButton(
      'action-btn delete',
      'Remove from list',
      '🗑️',
      0,
      e => {
        e.stopPropagation();
        bucketList = bucketList.filter(p => p !== item);
        saveList();
        renderList();
      }
    );

    header.append(nameSpan, visitBtn, deleteBtn);
    li.appendChild(header);

    if (item.notes?.trim()) {
      const notes = document.createElement('div');
      notes.className = 'item-notes';
      notes.textContent = item.notes.trim();
      li.appendChild(notes);
    }

    fragment.appendChild(li);
  });

  list.appendChild(fragment);
  updateCounter();
}

// Event Listeners
form.addEventListener('submit', e => {
  e.preventDefault();
  const place = inputPlace.value.trim();
  const notes = inputNotes.value.trim();
  if (!place) return;

  const exists = bucketList.some(p => p.name.toLowerCase() === place.toLowerCase());
  if (exists) {
    alert('This place is already on your bucket list!');
    inputPlace.focus();
    return;
  }

  bucketList.push({ name: place, notes, visited: false });
  saveList();
  renderList();

  inputPlace.value = '';
  inputNotes.value = '';
  inputPlace.focus();
});

filters.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', e => {
    e.preventDefault();

    filters.querySelectorAll('button').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.tabIndex = -1;
    });

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    button.tabIndex = 0;
    currentFilter = button.dataset.filter;

    renderList();
  });
});

clearVisitedBtn.addEventListener('click', () => {
  if (!bucketList.some(p => p.visited)) {
    alert('No visited places to clear!');
    return;
  }

  if (confirm('Are you sure you want to clear all visited places?')) {
    bucketList = bucketList.filter(p => !p.visited);
    saveList();
    renderList();
  }
});

clearAllBtn.addEventListener('click', () => {
  if (!bucketList.length) {
    alert('Your bucket list is already empty!');
    return;
  }

  if (confirm('Are you sure you want to clear your entire bucket list?')) {
    bucketList = [];
    saveList();
    renderList();
  }
});

// Initial call
renderList();
