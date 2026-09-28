// checks if a piece of text contains a link or something link-like.
// used to block spam in the name/message fields
export function containsLinks(text: string): boolean {
  const httpPattern = /https?:\/\/[^\s]+/i;
  const wwwPattern = /www\.[^\s]+/i;
  const discordPattern = /discord\.gg\/[^\s]+/i;
  const htmlTagPattern = /<[^>]+>/;

  if (httpPattern.test(text)) {
    return true;
  }

  if (wwwPattern.test(text)) {
    return true;
  }

  if (discordPattern.test(text)) {
    return true;
  }

  if (htmlTagPattern.test(text)) {
    return true;
  }

  return false;
}