import { writable } from "svelte/store";

export const serviceWorkerUpdateWaiting = writable(false);
