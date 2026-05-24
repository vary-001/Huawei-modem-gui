const dbus = require("dbus-next");

const bus = dbus.systemBus();

const MM_SERVICE = "org.freedesktop.ModemManager1";
const MM_PATH = "/org/freedesktop/ModemManager1";
const MM_IFACE = "org.freedesktop.DBus.ObjectManager";

async function getSMSList() {
  const obj = await bus.getProxyObject(MM_SERVICE, MM_PATH);
  const manager = obj.getInterface(MM_IFACE);

  // 🔥 GET ALL DBUS OBJECTS
  const objects = await manager.GetManagedObjects();

  const messages = [];

  for (const path in objects) {
    if (!path.includes("/SMS/")) continue;

    const props = objects[path]["org.freedesktop.ModemManager1.Sms"];

    if (!props) continue;

    messages.push({
      id: path,
      number: props.Number?.value || null,
      text: props.Text?.value || null,
      timestamp: props.Timestamp?.value || null,
      state: props.State?.value || null,
    });
  }

  return messages;
}

module.exports = {
  getSMSList,
};