/**
 * The top‑level response – contains a `header` and a `payload`.
 */
export interface MerossMessageEvent<T> {
  header: Header;
  payload: T;
}
export type MerossApplianceEvent = MerossMessageEvent<AppliancePayload>;
export type MerossAbilitiesEvent = MerossMessageEvent<AbilitiesPayload>;

/* -------------------------------------------------------------------------- */
/*                               HEADER SECTION                               */
/* -------------------------------------------------------------------------- */

interface Header {
  messageId: string;
  namespace: string;
  method: string;
  payloadVersion: number;
  from: string;
  timestamp: number;
  timestampMs: number;
  sign: string;
}

/* -------------------------------------------------------------------------- */
/*                               PAYLOAD SECTION                              */
/* -------------------------------------------------------------------------- */

interface AppliancePayload {
  system: System;
  digest: Digest;
}
interface AbilitiesPayload {
  payloadVersion: number;
  ability: {
    [key: string]: any; // This can be more specific based on known abilities
  };
}

/* -------------------------------------------------------------------------- */
/*                               SYSTEM SECTION                               */
/* -------------------------------------------------------------------------- */

interface System {
  hardware: Hardware;
  firmware: Firmware;
  time: Time;
  online: Online;
}

interface Hardware {
  type: string;          // e.g. "msg200"
  subType: string;       // e.g. "us"
  version: string;       // e.g. "2.0.0"
  chipType: string;      // e.g. "mt7682"
  uuid: string;          // e.g. "2209293781714761070348e1e9a9aee0"
  macAddress: string;    // e.g. "48:e1:e9:a9:ae:e0"
}

interface Firmware {
  version: string;                // e.g. "2.1.3"
  compileTime: string;            // e.g. "2020/04/17 11:58:10 GMT +08:00"
  wifiMac: string;                // e.g. "a8:6e:84:35:8d:6e"
  innerIp: string;                // e.g. "192.168.68.77"
  server: string;                 // e.g. "mqtt-us-4.meross.com"
  port: number;                   // e.g. 443
  userId: number;                 // e.g. 4505246
}

interface Time {
  timestamp: number;                    // e.g. 1754506069
  timezone: string;                     // e.g. "America/Chicago"
  /** Each entry is a 3‑item tuple: [unix‑time, utcOffset, isDST] */
  timeRule: [number, number, number][];
}

interface Online {
  status: number;   // e.g. 1
}

/* -------------------------------------------------------------------------- */
/*                               DIGEST SECTION                               */
/* -------------------------------------------------------------------------- */

interface Digest {
  /** Trigger events – an array of objects that share the same shape */
  triggerx: TriggerItem[];

  /** Timer events – same shape as triggerx */
  timerx: TriggerItem[];

  /** Garage door events – a slightly different shape */
  garageDoor: GarageDoorItem[];
}

interface TriggerItem {
  channel: number;
  id: string;   // e.g. "2222222222222222"
  count: number;
}

export interface GarageDoorItem {
  channel: number;
  doorEnable: number;   // 0 or 1
  open: number;         // 0 or 1
  lmTime: number;       // e.g. 1754438117
}