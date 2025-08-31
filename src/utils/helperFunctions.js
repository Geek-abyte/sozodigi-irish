export function removeProperty(obj, prop) {
  // Check if the property exists in the object
  if (!obj.hasOwnProperty(prop)) {
    return obj; // Return the original object if the property does not exist
  }

  // Create a shallow copy of the object
  const newObj = { ...obj };

  // Delete the specified property
  delete newObj[prop];

  // Return the modified object
  return newObj;
}

export const setTokenWithExpiry = (token, expiryInSeconds) => {
  const now = new Date();
  const item = {
    value: token,
    expiry: now.getTime() + expiryInSeconds * 1000,
  };
  localStorage.setItem("authToken", JSON.stringify(item));
};

export const getToken = () => {
  const tokenData = localStorage.getItem("authToken");
  if (tokenData) {
    try {
      const parsedData = JSON.parse(tokenData);
      const now = new Date().getTime();
      if (now < parsedData.expiry) {
        return parsedData.value;
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Error parsing token data:", error);
    }
  }
  return null;
};

/**
 * Converts a float amount to cents (for USD, EUR, etc.)
 * @param {number} amount - The amount in float (e.g., 10.99)
 * @returns {number} The amount in cents as an integer
 */
export const toCents = (amount) => Math.round(amount * 100);

/**
 * Converts a float amount to kobo (for NGN)
 * @param {number} amount - The amount in float (e.g., 1000.50)
 * @returns {number} The amount in kobo as an integer
 */
export const toKobo = (amount) => Math.round(amount * 100);

export const convertTo24Hour = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  if (modifier === 'PM' && hours !== '12') {
    hours = parseInt(hours, 10) + 12;
  }
  if (modifier === 'AM' && hours === '12') {
    hours = '00';
  }

  return `${hours}:${minutes}`; 
}

export const convertMillisecondsTo24HourFormat = (milliseconds) => {
  const date = new Date(milliseconds);  // Create a Date object using the milliseconds
  
  // Extract hours and minutes
  const hours = date.getHours().toString().padStart(2, '0'); // Ensure two digits
  const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits

  // Return in 24-hour format (HH:mm)
  return `${hours}:${minutes}`;
}

/**
 * Converts an amount to the smallest currency unit based on the currency code
 * @param {number} amount - The amount in float
 * @param {string} currencyCode - The ISO currency code (e.g., 'USD', 'NGN')
 * @returns {number} The amount in the smallest currency unit as an integer
 */
export const toSmallestUnit = (amount, currencyCode) => {
  switch (currencyCode.toUpperCase()) {
    case "NGN":
      return toKobo(amount);
    case "USD":
    case "EUR":
    case "GBP":
    default:
      return toCents(amount);
  }
};
