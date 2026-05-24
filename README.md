# VARY'S MODEM MANAGER

A full-stack modem management project for sending SMS, reading contacts, handling USSD, and monitoring internet connectivity via a serial-connected modem.

## Project Summary

VARY'S MODEM MANAGER includes:

- `modem-backend`: Node.js + Express backend that communicates with a modem over serial ports
- `modem-ui`: React + Vite frontend for managing SMS, contacts, USSD, and internet monitoring

This project is intended as a complete modem dashboard and control interface, with backend services that access the modem hardware and a frontend that provides real-time UI and socket updates.

## Features

- Send and receive SMS
- Read/manage phonebook contacts from SIM or device storage
- Run USSD commands
- Monitor internet/modem connectivity status
- WebSocket integration for live updates

## Repository Structure

- `modem-backend/`
  - Express API server
  - Serial port modem services
  - Socket.IO integration

- `modem-ui/`
  - React app built with Vite
  - Pages for Dashboard, SMS, Contacts, USSD, Internet, and Settings

## Getting Started

### Backend

1. Navigate to `modem-backend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add environment variables in `.env`
   - `PORT` (optional)
   - `SERIAL_PORT_PATH` (recommended)
4. Start in development mode:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to `modem-ui`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the UI app:
   ```bash
   npm run dev
   ```

## Configuration

Create a `.env` file in `modem-backend` with values such as:

```env
PORT=3001
SERIAL_PORT_PATH=/dev/ttyUSB0
```

If the modem device path is not set, the backend will try common defaults like `/dev/ttyUSB0`, `/dev/ttyUSB1`, and `/dev/ttyUSB2`.

## Contribution Guide

This repository is open for contributions under the name **VARY'S MODEM MANAGER** on GitHub.

If you want to contribute:

- Open issues for bugs or feature ideas
- Submit pull requests for improvements
- Add support for additional modem drivers or device paths
- Improve documentation and setup instructions

### How to contribute

1. Fork the repository
2. Create a branch for your feature
3. Add tests or documentation when appropriate
4. Submit a pull request with a clear summary

## Notes

- Make sure you have permission to access serial devices on your machine.
- Use `.gitignore` in `modem-backend` to keep local environment and dependencies out of Git.
- Re-login after adding your user to `uucp` or use `sudo chmod a+rw /dev/ttyUSB*` for temporary access.

## Searchable Keywords

- VARY'S MODEM MANAGER
- modem dashboard
- serial modem backend
- React Vite modem UI
- Node Express serial port

---


# Huawei-modem-gui
