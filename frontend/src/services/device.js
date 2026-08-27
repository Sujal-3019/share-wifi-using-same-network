const DEVICE_ID_KEY = 'localshare_device_id';
const DEVICE_NAME_KEY = 'localshare_device_name';


function generateDeviceId() {
    // Use crypto.randomUUID when available
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    // Fallback for browsers/environments
    // where crypto.randomUUID is unavailable
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        (character) => {
            const random = Math.random() * 16 | 0;

            const value =
                character === 'x'
                    ? random
                    : (random & 0x3) | 0x8;

            return value.toString(16);
        }
    );
}


export function getDeviceId() {
    let deviceId = localStorage.getItem(
        DEVICE_ID_KEY
    );

    if (!deviceId) {
        deviceId = generateDeviceId();

        localStorage.setItem(
            DEVICE_ID_KEY,
            deviceId
        );
    }

    return deviceId;
}


export function getDeviceName() {
    let deviceName = localStorage.getItem(
        DEVICE_NAME_KEY
    );

    if (!deviceName) {
        const userAgent = navigator.userAgent;

        if (/Android/i.test(userAgent)) {
            deviceName = 'Android Phone';
        } else if (/iPhone|iPad/i.test(userAgent)) {
            deviceName = 'iPhone / iPad';
        } else if (/Windows/i.test(userAgent)) {
            deviceName = 'Windows PC';
        } else if (/Mac/i.test(userAgent)) {
            deviceName = 'Mac';
        } else if (/Linux/i.test(userAgent)) {
            deviceName = 'Linux Device';
        } else {
            deviceName = 'Unknown Device';
        }

        localStorage.setItem(
            DEVICE_NAME_KEY,
            deviceName
        );
    }

    return deviceName;
}