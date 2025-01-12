// model.ts
const characterModel = import.meta.env.PROD 
  ? '/assets/character.glb'  // production path
  : '/assets/character.glb'; // development path
export { characterModel };
