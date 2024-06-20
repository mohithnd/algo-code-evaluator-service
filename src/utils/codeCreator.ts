export default function codeCreator(
  startCode: string,
  midCode: string,
  endCode: string
): string {
  return `
  ${startCode}
  ${midCode}
  ${endCode}
  `;
}

/**
 * For python endCode can be passed as empty string
 * For java endCode can be passed as empty string
 */
