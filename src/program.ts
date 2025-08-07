import { MerossController, MerossControllerOptions } from './meross_controller';

import { select, confirm } from '@inquirer/prompts';
import c from 'chalk';
import { delay, logToFile, logInfo, logSuccess, logError, logWaiting, log } from './util';
import { MerossCloudDevice } from 'meross-cloud-ts';
import { GarageDoorItem } from './types/meross_events';


const main = async () => {

    // Configuration - Replace with your Meross account credentials
    const credentials: MerossControllerOptions = {
        email: process.env.MEROSS_EMAIL ?? '',
        password: process.env.MEROSS_PASSWORD ?? ''
    };
    // Initialize Meross
    const controller = new MerossController(credentials);

    const close = async () => {
        await controller.disconnect();
        exit();
    };
    
    logWaiting('🚗 Connecting to Meross Cloud...');
    const devices = await controller.connectToMerossCloud();

    if (!devices.length) {
        logError('❌ No devices found. Please check your credentials and network connection.');
        close();
    }
    while (true) {
        logInfo(`Connected to ${devices.length} device(s)`);

        const deviceId = await selectDevice(devices);
        if (deviceId === 'Exit') {
            break;
        }

        const selected = controller.getDevice(deviceId);
        await controller.connectDevice(deviceId, (device) => {
            logToFile(`Raw Event - ${deviceId}`, 'Connected');
            logSuccess(`✅ Connected to ${device.dev.devName || 'unknown'}`);
        });
        const status = await controller.getDeviceStatus(deviceId);
        log(`\n📊 Current Status for ${selected.dev.devName || 'unknown'}:`);

        if (selected.dev.deviceType === 'msg200') {
            const channels = (status?.payload?.digest?.garageDoor || []).filter(c => c.doorEnable);
            const channelId = await selectChannels(channels, selected.dev.channels);
            // const confirmed = await confirm({ message: 'Are you sure?' });

            const channel = channels.find(c => c.channel === channelId);
            if (!channel) {
                if (channelId !== -1) {
                    logError('❌ Invalid channel selected');
                }
                continue;
            }

            logWaiting(`\n🔄 Toggling channel ${channelId}...`);
            // await controller.controlGarageDoor(deviceId, channelId, !channel.open);
            await delay(10000); // Wait for 10 seconds before next action

            logSuccess('✅ Channel toggled successfully!');
            const newStatus = await controller.getDeviceStatus(deviceId);
            logInfo(`\n📊 New Status for ${selected.dev.devName || 'unknown'}:`);
            logInfo(`   Channel ${channelId}: ${newStatus.payload.digest.garageDoor[channelId].open ? '🔓 OPEN' : '🔒 CLOSED'}`);
        }
    }

    close();
};

const exit = () => {
    log('\n👋 Exiting...');
    process.exit(0);
};

// User Input
const selectDevice = async (devices: MerossCloudDevice[]) => {
    return await select({
        message: 'Select the device you want to control',
        choices: devices.map((device, idx) => ({
            name: device.dev.devName || 'unknown',
            value: device.dev.uuid,
            description: `Device ${idx + 1}: ${device.dev.devName || 'unknown'}, UUID: ${device.dev.uuid}`
        })).concat({
            name: 'Exit',
            value: 'Exit',
            description: 'Exit the application'
        }),
    });
};
const selectChannels = async (channels: GarageDoorItem[], deviceDefinitionChannels: any[]) => {
    return await select({
        message: 'Select the channel you want to toggle',
        choices: channels.map((channel, idx) => ({
            name: c.blue(`Channel ${channel.channel}: ${deviceDefinitionChannels[channel.channel]?.devName || 'unknown'} - ${channel.open ? c.red.bold('Open') : c.green.bold('Closed')}`),
            value: channel.channel,
            description: channel.open ? 'Currently open' : 'Currently closed'
        })).concat({
            name: 'Back',
            value: -1,
            description: 'Go back to the previous menu'
        }),
    });
};


// Handle graceful shutdown
process.on('SIGINT', exit);

// Run the application
main().catch(console.error);

