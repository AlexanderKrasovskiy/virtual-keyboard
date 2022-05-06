import './styles/style.scss';
import keysData from './js/support/keysData';

// ============ FNs ====================
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

// ============ Construction =================
let currentLang = getUserLang(); // make LET !!!
currentLang = 'ru';

const WRAPPER = composeBasicElement('div', ['wrapper']);
const HEADING = composeBasicElement('h1', ['heading'], 'RSS Virtual Keyboard');
const TEXTAREA = composeBasicElement('textarea', ['textarea']);
const KEYBOARD = composeKeyboard(keysData, currentLang);
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

TEXTAREA.textContent = '\tDELETE ME !!\n! pLEASE'; // DELETE !!!

WRAPPER.append(HEADING, TEXTAREA, KEYBOARD, OS_TEXT, COMBO_TEXT);
document.body.append(WRAPPER);

// =============== Listeners =================
