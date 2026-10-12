import { register } from 'node:module';
register('tsx', import.meta.url);
const { INITIAL_MACHINES } = await import('./src/data/initialMachines.ts');
console.log('Dynamic import with registered tsx ok:', INITIAL_MACHINES.length);
