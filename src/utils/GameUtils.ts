export const generateSnakeLadderPositions = (): Set<number> => {
    localStorage.removeItem('snakeLadderPositions');
    const positions = new Set<number>();
    
    // Ensure wide spread by dividing board into 4 segments
    const segments = [
      { start: 15, end: 30 },
      { start: 31, end: 50 },
      { start: 51, end: 85 },
      { start: 86, end: 99 }  // Adjusted end to avoid 100
    ];
    
    // Place 5-6 questions in each segment
    segments.forEach(segment => {
      const questionsInSegment = 5 + Math.floor(Math.random() * 2); // 5 or 6
      const segmentPositions = new Set<number>();
      
      let attempts = 0;
      const maxAttempts = 100; // Prevent infinite loops
      
      while (segmentPositions.size < questionsInSegment && attempts < maxAttempts) {
        const position = Math.floor(Math.random() * (segment.end - segment.start + 1)) + segment.start;
        
        // Add some additional randomness conditions
        if (
          !segmentPositions.has(position) && // Not already selected
          !segmentPositions.has(position + 1) && // Not adjacent to already selected
          !segmentPositions.has(position - 1)
        ) {
          segmentPositions.add(position);
        }
        attempts++;
      }
      
      // Add this segment's positions to the main set
      segmentPositions.forEach(pos => positions.add(pos));
    });

    return positions;
};

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const removeQuotes = (str: string): string => {
  if (!str) return '';
  return str.replace(/['"]/g, '');
};

export const cleanString = (str: string): string => {
  if (!str) return '';
  
  let cleaned = str
    // First remove all other special characters except \n
    .replace(/[*{}""]/g, '')
    // Keep \n intact by temporarily replacing it
    .replace(/\\n/g, '§§') // use a temporary placeholder
    // Remove any remaining backslashes
    .replace(/\\/g, '')
    // Restore \n
    .replace(/§§/g, '\\n')
    .trim();
    
  return cleaned;
};
