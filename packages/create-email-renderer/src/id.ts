// Identificador de bloques/columnas en JS puro, sin crypto ni Math.random:
// Cloudflare Workers prohíbe generar aleatoriedad en la fase de arranque
// (scope global) y aquí los ids por defecto se crean al importar el módulo.
// Formato UUID v7: 48 bits de timestamp (Date.now() está permitido al
// arrancar) + contador monótono de proceso, que garantiza unicidad incluso
// con el reloj congelado durante un request de Workers.
const HEX = "0123456789abcdef";

let sequence = 0n;

export const newId = (): string => {
  sequence = (sequence + 1n) & 0xfffffffffffffffffn; // contador de 72 bits
  const time = Date.now().toString(16).padStart(12, "0");
  const seq = sequence.toString(16).padStart(18, "0");
  return [
    time.slice(0, 8),
    time.slice(8, 12),
    "7" + seq.slice(0, 3),
    "8" + seq.slice(3, 6),
    seq.slice(6, 18),
  ].join("-");
};
