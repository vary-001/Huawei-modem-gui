# Call System API Reference

## Base URL
```
http://localhost:3001/api/call
```

## Endpoints

### 1. Get Call Status
**GET** `/status`

Returns the current state of all calls and voice capabilities.

**Response:**
```json
{
  "success": true,
  "status": {
    "modemIndex": "1",
    "voice": { "emergency-only": "no" },
    "calls": [
      {
        "path": "/org/freedesktop/ModemManager1/Call/0",
        "direction": "outgoing",
        "state": "unknown",
        "details": null
      }
    ],
    "incoming": null,
    "active": null,
    "timestamp": "2026-06-04T12:30:52.371Z"
  }
}
```

---

### 2. Dial a Call
**POST** `/dial`

Create a new call to a phone number or USSD code.

**Request Body:**
```json
{
  "number": "100"
}
```

**Supported Formats:**
- Standard phone numbers: `100`, `0712345678`
- USSD codes: `*123#`, `*1*1#`

**Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "path": "/org/freedesktop/ModemManager1/Call/1",
    "number": "100",
    "message": "Successfully created new call: /org/freedesktop/ModemManager1/Call/1",
    "details": {}
  }
}
```

---

### 3. Answer Call
**POST** `/answer`

Answer the first incoming call.

**Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "path": "/org/freedesktop/ModemManager1/Call/0",
    "message": "operation successful",
    "number": "unknown"
  }
}
```

---

### 4. Hangup Call
**POST** `/hangup`

Hang up the current active or incoming call.

**Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "path": "/org/freedesktop/ModemManager1/Call/0",
    "message": "operation successful",
    "state": "unknown"
  }
}
```

---

### 5. Hangup All Calls
**POST** `/hangup-all`

Terminate all active and incoming calls.

**Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "modemIndex": "1",
    "message": "operation successful",
    "timestamp": "2026-06-04T12:31:02.368Z"
  }
}
```

---

### 6. List All Calls
**GET** `/list`

Get a list of all current calls.

**Response:**
```json
{
  "success": true,
  "calls": [
    {
      "path": "/org/freedesktop/ModemManager1/Call/2",
      "direction": "outgoing",
      "state": "unknown",
      "details": null
    },
    {
      "path": "/org/freedesktop/ModemManager1/Call/1",
      "direction": "outgoing",
      "state": "unknown",
      "details": null
    }
  ]
}
```

---

### 7. Get Modem Info
**GET** `/info`

Get detailed information about the connected modem.

**Response:**
```json
{
  "success": true,
  "modemInfo": {
    "modem": {
      "3gpp": {
        "imei": "357289040034553",
        "operator-code": "63510",
        "operator-name": "name",
        "registration-state": "home",
        "packet-service-state": "attached"
      },
      "generic": {
        "manufacturer": "huawei",
        "model": "E153",
        "revision": "11.126.151.151.0"
      }
    }
  }
}
```

---

## Error Responses

### Invalid Phone Number
```json
{
  "success": false,
  "error": "Invalid phone number format. Use digits, or USSD codes like *123#"
}
```

### No Phone Number Provided
```json
{
  "success": false,
  "error": "Phone number is required"
}
```

### No Incoming Call to Answer
```json
{
  "success": false,
  "error": "No incoming call to answer."
}
```

### No Active Call to Hangup
```json
{
  "success": false,
  "error": "No active or incoming call to hang up."
}
```

### No Modem Found
```json
{
  "success": false,
  "error": "No modem found"
}
```

---

## WebSocket Events

The server emits real-time call updates via Socket.io:

**Event Name:** `call-update`

**Data:**
```json
{
  "modemIndex": "1",
  "voice": { "emergency-only": "no" },
  "calls": [...],
  "incoming": null,
  "active": null,
  "timestamp": "2026-06-04T12:30:52.371Z"
}
```

---

## Example Usage

### Using curl

**Dial a number:**
```bash
curl -X POST http://localhost:3001/api/call/dial \
  -H "Content-Type: application/json" \
  -d '{"number":"100"}'
```

**Check status:**
```bash
curl http://localhost:3001/api/call/status
```

**Hangup all calls:**
```bash
curl -X POST http://localhost:3001/api/call/hangup-all
```

### Using JavaScript

```javascript
// Dial a number
fetch('http://localhost:3001/api/call/dial', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ number: '100' })
})
.then(r => r.json())
.then(data => console.log(data));

// Get status
fetch('http://localhost:3001/api/call/status')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Using Socket.io (Real-time Updates)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('call-update', (status) => {
  console.log('Call status updated:', status);
  console.log('Active calls:', status.calls.length);
});
```

---

## Performance Notes

- **Status Check**: ~100-500ms
- **Dial Call**: ~200-300ms
- **Hangup Operation**: ~100-200ms
- **List Calls**: ~100-300ms
- **Socket Updates**: Only emitted on state changes (optimized for performance)

---

## Supported Modems

- Huawei E153
- Other ModemManager-compatible modems

---

## Environment Variables

- `MM_MODEM_INDEX` - Override detected modem index
- `MODEM_INDEX` - Alternative variable for modem index

---

Generated: 2026-06-04
