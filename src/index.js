import './styles/style.scss';
import keysData from './js/support/keysData';
import lettersData from './js/support/lettersData';

// ============ FNs ==================================
function getUserLang() {
  return localStorage.getItem('lang') || 'en';
}

function composeBasicElement(tagString, classesArr, text = '') {
  const el = document.createElement(tagString);
  el.classList.add(...classesArr);
  el.innerHTML = text;

  if (tagString === 'textarea') {
    el.setAttribute('id', 'textarea');
    el.setAttribute('autofocus', '');
  }

  return el;
}

function composeKeyCap(keyClass, lang, caseDown, caseUp, caps, shiftCaps) {
  const keyCapClasses = [keyClass, 'keycap'];
  if (!(keyClass === lang)) {
    keyCapClasses.push('hidden');
  }

  const KEY_CAP = composeBasicElement('div', keyCapClasses);

  const basicSpan = composeBasicElement('span', ['caseDown'], caseDown);
  const shiftSpan = composeBasicElement('span', ['caseUp', 'hidden'], caseUp);
  const capsSpan = composeBasicElement('span', ['caps', 'hidden'], caps);
  const shiftCapsSpan = composeBasicElement(
    'span',
    ['shiftCaps', 'hidden'],
    shiftCaps
  );

  KEY_CAP.append(basicSpan, shiftSpan, capsSpan, shiftCapsSpan);
  return KEY_CAP;
}

function composeKey(obj, lang) {
  const {
    code,
    en,
    enShift,
    enCaps,
    enCapsShift,
    ru,
    ruShift,
    ruCaps,
    ruCapsShift,
  } = obj;

  const KEY = composeBasicElement('div', ['keyboard__key', code]);
  const EN_KEY_CAP = composeKeyCap(
    'en',
    lang,
    en,
    enShift,
    enCaps,
    enCapsShift
  );
  const RU_KEY_CAP = composeKeyCap(
    'ru',
    lang,
    ru,
    ruShift,
    ruCaps,
    ruCapsShift
  );

  KEY.append(EN_KEY_CAP, RU_KEY_CAP);
  return KEY;
}

function composeKeyboard(data, lang) {
  const KEYBOARD = composeBasicElement('div', ['keyboard']);
  const KEYBOARD_ROW = composeBasicElement('div', ['keyboard__row']);

  data.forEach((obj) => {
    const KEY = composeKey(obj, lang);
    KEYBOARD_ROW.append(KEY);
  });

  KEYBOARD.append(KEYBOARD_ROW);

  return KEYBOARD;
}

// ============ STATE =============================
let currentLang = getUserLang();

let isShift = false;
let isCaps = false;
let isAlt = false;
let isCtrl = false;

// ============ CONSTRUCTION ===========================
const WRAPPER = composeBasicElement('div', ['wrapper']);
const HEADING = composeBasicElement('h1', ['heading'], 'RSS Virtual Keyboard');
const TEXTAREA = composeBasicElement('textarea', ['textarea']);
const KEYBOARD = composeKeyboard(keysData, currentLang);
const KEYBOARD_KEYS = KEYBOARD.querySelectorAll('div.keyboard__key');
const KEY_CAPS = KEYBOARD.querySelectorAll('div.keyboard__key > div.keycap');
const KEY_CAPS_LETTERS = KEYBOARD.querySelectorAll(
  'div.keyboard__key > div.keycap > span'
);
const OS_TEXT = composeBasicElement(
  'p',
  ['info'],
  'Клавиатура создана в ОС Windows.'
);
const COMBO_TEXT = composeBasicElement(
  'p',
  ['info'],
  'Смена языка: Ctrl + Alt.'
);

WRAPPER.append(HEADING, TEXTAREA, KEYBOARD, OS_TEXT, COMBO_TEXT);
document.body.append(WRAPPER);

// ================= HANDLERS =====================

function updateStateFlags(e) {
  isShift = e.shiftKey;
  isAlt = e.altKey;
  isCtrl = e.ctrlKey;
  if (e.code === 'CapsLock') {
    isCaps = !isCaps;
  }
}

function updateLangStyles() {
  KEY_CAPS.forEach((cap) => cap.classList.toggle('hidden'));
}

function handleLangCombo() {
  if (isAlt && isCtrl) {
    currentLang = currentLang === 'en' ? 'ru' : 'en';
    updateLangStyles();
    localStorage.setItem('lang', currentLang);
  }
}

function applyLetterCaseStylesOnDown(e) {
  if (
    (e.code === 'ShiftLeft' && isCaps && !e.repeat) ||
    (e.code === 'ShiftRight' && isCaps && !e.repeat)
  ) {
    KEY_CAPS_LETTERS.forEach((span) => {
      if (isCaps && isShift && span.classList.contains('shiftCaps')) {
        span.classList.remove('hidden');
      } else {
        span.classList.add('hidden');
      }
    });
  } else if (e.code === 'CapsLock' && isCaps && !e.repeat) {
    KEY_CAPS_LETTERS.forEach((span) => {
      if (isCaps && span.classList.contains('caps')) {
        span.classList.remove('hidden');
      } else {
        span.classList.add('hidden');
      }
    });
  } else if (
    (e.code === 'ShiftLeft' && !e.repeat) ||
    (e.code === 'ShiftRight' && !e.repeat)
  ) {
    KEY_CAPS_LETTERS.forEach((span) => {
      if (isShift && span.classList.contains('caseUp')) {
        span.classList.remove('hidden');
      } else {
        span.classList.add('hidden');
      }
    });
  }
}

function findLetter(keyCode) {
  if (keyCode === 'Tab') {
    return '\t';
  }

  let letterCase = 'caseDown';

  if (isShift && isCaps) {
    letterCase = 'shiftCaps';
  } else if (isShift) {
    letterCase = 'caseUp';
  } else if (isCaps) {
    letterCase = 'caps';
  }

  const letter = lettersData[keyCode][currentLang][letterCase];
  return letter;
}

function updateTextValue(letter) {
  const start = TEXTAREA.selectionStart;
  const end = TEXTAREA.selectionEnd;

  const textBeforeSelection = TEXTAREA.value.slice(0, start);
  const textAfterSelection = TEXTAREA.value.slice(end);
  const newText = textBeforeSelection.concat(letter, textAfterSelection);

  TEXTAREA.value = newText;
  TEXTAREA.selectionStart = start + 1;
  TEXTAREA.selectionEnd = start + 1;
}

// function printTextareaState() {

//   console.log(
//     'selectionStart: ',
//     TEXTAREA.selectionStart,
//     'selectionEnd: ',
//     TEXTAREA.selectionEnd,
//     'textLength: ',
//     TEXTAREA.textLength,
//     'value: ',
//     [...TEXTAREA.value]
//   );
// }

function handleKeyDown(e) {
  TEXTAREA.focus();

  updateStateFlags(e); // Alt Ctrl Caps Shift

  handleLangCombo(); // Ctrl + Alt

  // Apply pushed key style
  const pressedKey = [...KEYBOARD_KEYS].find((key) =>
    key.classList.contains(e.code)
  );
  if (!pressedKey) {
    return;
  }
  pressedKey.classList.add('pushed');

  // Apply styles on Caps / Shift / Caps + Shift
  applyLetterCaseStylesOnDown(e);

  // Pass default action for some FN keys
  if (
    e.code === 'Space' ||
    e.code === 'Backspace' ||
    e.code === 'Delete' ||
    e.code === 'Enter' ||
    e.code === 'ArrowLeft' ||
    e.code === 'ArrowUp' ||
    e.code === 'ArrowDown' ||
    e.code === 'ArrowRight'
  ) {
    return;
  }

  // Prevent text input for other FN keys
  if (
    e.code === 'ShiftLeft' ||
    e.code === 'ShiftRight' ||
    e.code === 'CapsLock' ||
    e.code === 'ControlLeft' ||
    e.code === 'ControlRight' ||
    e.code === 'AltLeft' ||
    e.code === 'AltRight'
  ) {
    e.preventDefault();
    return;
  }

  // Pass hot keys for Ctrl + C / V / X / Z / Y ...
  if (isCtrl) {
    return;
  }

  // Prevent user lang text input
  e.preventDefault();

  // Update textarea value
  const letter = findLetter(e.code);
  updateTextValue(letter);
}

function removeLetterCaseStylesOnUp(e) {
  if (
    (e.code === 'ShiftLeft' && isCaps) ||
    (e.code === 'ShiftRight' && isCaps)
  ) {
    KEY_CAPS_LETTERS.forEach((span) => {
      if (isShift && span.classList.contains('caps')) {
        span.classList.remove('hidden');
      } else {
        span.classList.add('hidden');
      }
    });
    isShift = false;
  } else if (e.code === 'CapsLock') {
    KEY_CAPS_LETTERS.forEach((span) => {
      if (!isCaps && span.classList.contains('caseDown')) {
        span.classList.remove('hidden');
      } else {
        span.classList.add('hidden');
      }
    });
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    KEY_CAPS_LETTERS.forEach((span) => {
      if (isShift && span.classList.contains('caseDown')) {
        span.classList.remove('hidden');
      } else {
        span.classList.add('hidden');
      }
    });
    isShift = false;
  }
}

function handleKeyUp(e) {
  // Prevent 1-st keyup on Caps
  if (isCaps && e.code === 'CapsLock') {
    return;
  }

  // Remove pushed key style
  const pressedKey = [...KEYBOARD_KEYS].find((key) =>
    key.classList.contains(e.code)
  );
  if (!pressedKey) {
    return;
  }
  pressedKey.classList.remove('pushed');

  // Remove styles on Caps / Shift / Caps + Shift
  removeLetterCaseStylesOnUp(e);
}

// =============== Listeners =================
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
