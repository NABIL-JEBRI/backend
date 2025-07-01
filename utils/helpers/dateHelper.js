// backend/src/utils/helpers/dateHelper.js

/**
 * @desc Formats a Date object into a readable string (e.g., "YYYY-MM-DD HH:mm:ss").
 * @param {Date} date - The Date object to format.
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - The desired format string.
 * @returns {string} The formatted date string.
 */
exports.formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!(date instanceof Date) || isNaN(date)) {
        return null; // Or throw an error, depending on desired behavior
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    let formattedString = format;
    formattedString = formattedString.replace(/YYYY/g, year);
    formattedString = formattedString.replace(/MM/g, month);
    formattedString = formattedString.replace(/DD/g, day);
    formattedString = formattedString.replace(/HH/g, hours);
    formattedString = formattedString.replace(/mm/g, minutes);
    formattedString = formattedString.replace(/ss/g, seconds);

    return formattedString;
};

/**
 * @desc Calculates the difference in days between two dates.
 * @param {Date} date1 - The first Date object.
 * @param {Date} date2 - The second Date object.
 * @returns {number} The difference in days (absolute value).
 */
exports.getDaysDifference = (date1, date2) => {
    if (!(date1 instanceof Date) || isNaN(date1) || !(date2 instanceof Date) || isNaN(date2)) {
        return null;
    }
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * @desc Checks if a given date is today.
 * @param {Date} date - The Date object to check.
 * @returns {boolean} True if the date is today, false otherwise.
 */
exports.isToday = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
        return false;
    }
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

/**
 * @desc Adds a specified number of days to a given date.
 * @param {Date} date - The starting Date object.
 * @param {number} days - The number of days to add.
 * @returns {Date} A new Date object with the added days.
 */
exports.addDays = (date, days) => {
    if (!(date instanceof Date) || isNaN(date) || typeof days !== 'number') {
        return null;
    }
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

/**
 * @desc Determines if a given time falls within a specific time slot (HH:MM format).
 * @param {string} checkTime - The time to check (HH:MM).
 * @param {string} startTime - The start time of the slot (HH:MM).
 * @param {string} endTime - The end time of the slot (HH:MM).
 * @returns {boolean} True if checkTime is within the slot (inclusive), false otherwise.
 */
exports.isTimeWithinSlot = (checkTime, startTime, endTime) => {
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const checkMin = timeToMinutes(checkTime);
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    // Handles cases where the slot crosses midnight (e.g., 22:00 to 02:00)
    if (startMin <= endMin) {
        return checkMin >= startMin && checkMin <= endMin;
    } else {
        return checkMin >= startMin || checkMin <= endMin;
    }
};

/**
 * @desc Calculates the age in years from a birth date.
 * @param {Date} birthDate - The birth date.
 * @returns {number | null} The age in years, or null if invalid date.
 */
exports.calculateAge = (birthDate) => {
    if (!(birthDate instanceof Date) || isNaN(birthDate)) {
        return null;
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};