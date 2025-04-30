export function normalizeScryfallQuery(query: string): string {
  return query
    .replace(/o:"create tokens"/gi, "o:token")
    .replace(/o:"makes tokens"/gi, "o:token")
    .replace(/o:"summon tokens"/gi, "o:token")
    .replace(/\bo:etb\b/gi, 'o:"enters the battlefield"')
    .replace(/\bo:board wipe\b/gi, 'o:"destroy all"')
    .replace(/\bo:draw cards\b/gi, "o:draw")
    .replace(/\bo:dies\b/gi, 'o:"dies"')
    .replace(/\bo:flicker\b/gi, 'o:"exile" o:"return"')
    .replace(/\bo:blink\b/gi, 'o:"exile" o:"return"')
    .replace(/\bo:ramp\b/gi, 'o:"search your library" o:land')
    .replace(/\bo:mill\b/gi, 'o:"put the top" o:graveyard')
    .replace(/\bo:discard\b/gi, 'o:"discard"')
    .replace(/\bo:lifegain\b/gi, 'o:"gain life"')
    .replace(/\bo:mana dork\b/gi, 'o:"add {"')
    .replace(/\bo:counterspell\b/gi, 'o:"counter target spell"')
    .replace(/\bo:wrath\b/gi, 'o:"destroy all creatures"');
}
