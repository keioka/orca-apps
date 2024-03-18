import { v4 as uuid } from 'uuid';
export async function fetchDeviceId() {
  try {
    const DEVICE_ID_KEY = 'secure_deviceid';
    let storage = await chrome.storage.sync.get(DEVICE_ID_KEY);
    if (storage[DEVICE_ID_KEY]) {
      return storage[DEVICE_ID_KEY];
    }
    let uuidV4 = uuid();
    await chrome.storage.sync.set({ [DEVICE_ID_KEY]: uuidV4 });
    return uuidV4;
  } catch (error) {
    console.error(error);
    return null;
  }
}