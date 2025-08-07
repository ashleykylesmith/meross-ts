# Meross Controller

A node lib to interact with smart home devices through Meross Cloud.  Also contains a Bun script (`/src/program.ts`) that gives the user an interactive application to control their devices.  Got it to a useful state for myself, feel free to make a PR

## Features

- 🔐 Authenticate with Meross cloud services
- 🔍 Auto-discover Meross devices
- 🎮 Interactive control interface
- 📊 Get device status
- 🔄 Toggle
- 💻 Full TypeScript support with Bun runtime

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Meross account with devices configured
- Meross devices connected to your network

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Create env file and configure your credentials:
   ```bash
   touch .env
   ```

3. Edit `.env` with your Meross account details:
   ```env
   MEROSS_EMAIL=your-actual-email@example.com
   MEROSS_PASSWORD=your-actual-password
   ```


## Usage

Run the interactive application:

```bash
bun dev
```

The script will:
1. Authenticate with your Meross account
2. Discover all Meross devices
3. Present an interactive menu for control

## API Usage

You can also use the `MerossController` class directly in your own code:

```typescript
import { MerossGarageController } from './src/meross-controller';

const controller = new MerossGarageController({
  email: 'your-email@example.com',
  password: 'your-password'
});

// Connect to Meross cloud
const devices = await controller.connectToMerossCloud();

// Get device
const device = controller.getDevice(deviceUuid);

// Get device status
const status = await controller.getDeviceStatus(deviceUuid);

// Take action
await controller.controlGarageDoor(deviceUuid, channelId, !channel.open);

// Clean up
await controller.disconnect();
```

## Security Notes

- Never commit your `.env` file with real credentials
- Consider using environment variables in production
- Uses a modified `meross-cloud-ts` package for communication with Meross

## Troubleshooting

- **Authentication fails**: Verify your Meross email and password
- **No devices found**: Ensure your devices are online and configured in the Meross app
- **Control commands fail**: Check that your device is responsive in the official Meross app
- **Status not available**: Some models don't support status queries

## Supported Commands

- Toggle garage door (open/close)
- Get current door status
- List all devices
- Show device information
- Interactive control menu

## Dependencies

- `meross-cloud-ts`: Unofficial Node.js library for Meross IoT devices (I've included patches to get the package working)
- `bun`: Fast JavaScript runtime and package manager

## License

This project is for educational and personal use. Meross is a trademark of their respective owners.