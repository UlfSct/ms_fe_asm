// cookies.js - Библиотека для работы с куками

/**
 * Установка куки
 * @param {string} name - Название куки
 * @param {string} value - Значение куки
 * @param {Object} options - Дополнительные параметры
 * @param {number} options.days - Срок жизни в днях
 * @param {number} options.hours - Срок жизни в часах
 * @param {string} options.path - Путь
 * @param {string} options.domain - Домен
 * @param {boolean} options.secure - Только через HTTPS
 * @param {string} options.sameSite - SameSite атрибут
 */
export function setCookie(name, value, options = {}) {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.days) {
    const date = new Date();
    date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }

  if (options.hours) {
    const date = new Date();
    date.setTime(date.getTime() + (options.hours * 60 * 60 * 1000));
    cookieString += `; expires=${date.toUTCString()}`;
  }

  if (options.path) cookieString += `; path=${options.path}`;
  if (options.domain) cookieString += `; domain=${options.domain}`;
  if (options.secure) cookieString += '; secure';
  if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;

  document.cookie = cookieString;
}

/**
 * Получение куки по имени
 * @param {string} name - Название куки
 * @returns {string|null} - Значение куки или null
 */
export function getCookie(name) {
  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  return null;
}

/**
 * Удаление куки
 * @param {string} name - Название куки
 * @param {Object} options - Дополнительные параметры
 * @param {string} options.path - Путь
 * @param {string} options.domain - Домен
 */
export function deleteCookie(name, options = {}) {
  // Устанавливаем cookie с прошедшей датой
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${
    options.domain ? `; domain=${options.domain}` : ''
  }${options.path ? `; path=${options.path}` : '; path=/'}${
    options.secure ? '; secure' : ''
  }${options.sameSite ? `; samesite=${options.sameSite}` : ''}`;
}

/**
 * Получение всех кук
 * @returns {Object} - Объект со всеми куками
 */
export function getAllCookies() {
  const cookies = {};
  const cookiesArray = document.cookie.split(';');

  cookiesArray.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * Проверка существования куки
 * @param {string} name - Название куки
 * @returns {boolean} - true если кука существует
 */
export function hasCookie(name) {
  return getCookie(name) !== null;
}

/**
 * Очистка всех кук (только те, к которым есть доступ)
 * @param {string} path - Путь для удаления
 */
export function clearAllCookies(path = '/') {
  const cookies = getAllCookies();

  Object.keys(cookies).forEach(cookieName => {
    deleteCookie(cookieName, { path });
  });
}

export default {
  set: setCookie,
  get: getCookie,
  delete: deleteCookie,
  getAll: getAllCookies,
  has: hasCookie,
  clearAll: clearAllCookies
};
