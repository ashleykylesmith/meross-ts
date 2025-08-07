import { MerossCloud } from "meross-cloud-ts/src/cloud";
import { MerossAbilitiesEvent, MerossApplianceEvent } from "./types/meross_events";
import { MerossCloudDevice } from "meross-cloud-ts";

export interface MerossControllerOptions {
    email: string;
    password: string;
    enableLogs?: boolean;
}
export class MerossController {

    private meross: MerossCloud;
    private devices: Record<string, MerossCloudDevice> = {};

    constructor(options: MerossControllerOptions) {
        const { email, password, enableLogs=false } = options;
        if (!email || !password) {
            throw new Error('Meross credentials are required');
        }

        // Initialize Meross Cloud with credentials;
        this.meross = new MerossCloud({
            ...options,
            logger: enableLogs ? console.log : undefined,
        });

        this.meross.on('deviceInitialized', (deviceId, deviceDef, device) => {
            this.devices[deviceId] = device;
        });

    }

    private async runDeviceMethod<T extends void | Object>(deviceId: string, event: string, method: (device: MerossCloudDevice) => any, onEvent?: (device: MerossCloudDevice) => void): Promise<T> {
        const device = this.getDevice(deviceId);
        const value = await new Promise<T>((resolve, reject) => {
            if (!device) {
                reject(`Device with UUID ${deviceId} not found`);
            }
            device.on(event, (payload: T) => {
                onEvent?.(device);
                resolve(payload);
            });
            method(device);
        });
        device?.removeAllListeners(event); // Remove listener after connection

        return value;
    }

    public async connectToMerossCloud() {
        try {
            return await this.meross.connect();
        } catch (error) {
            console.error('Error connecting to Meross Cloud:');
            throw error;
        }
    }

    public async disconnect() {
        try {
            await this.meross.disconnectAll(true);
        } catch (error) {
            console.error('Error disconnecting from Meross Cloud:');
            throw error;
        }
    }

    public getDevice(uuid: string) {
        return this.devices[uuid];
    }

    public async connectDevice(uuid: string, onConnected?: (device: MerossCloudDevice) => void) {
        return await this.runDeviceMethod<void>(uuid, 'connected', (device) => {
            device.connect();
        }, onConnected);
    }

    public async getDeviceStatus(uuid: string) {
        return await this.runDeviceMethod<MerossApplianceEvent>(uuid, 'rawData', (device) => {
            device.getSystemAllData();
        });
    }

    public async getDeviceAbilities(uuid: string) {
        return await this.runDeviceMethod<MerossAbilitiesEvent>(uuid, 'rawData', (device) => {
            device.getSystemAbilities();
        });
    }

    public async controlGarageDoor(uuid: string, channel: number, open: boolean) {
        return await this.runDeviceMethod<void>(uuid, 'rawData', (device) => {
            device.controlGarageDoor(`${channel}`, open);
        });
    }

};
