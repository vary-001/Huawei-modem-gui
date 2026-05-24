export async function getModemInfo() {
  try {
    const res = await fetch("http://localhost:3001/modem");
    return await res.json();
  } catch (err) {
    console.error("Modem fetch error:", err);
    return null;
  }
}