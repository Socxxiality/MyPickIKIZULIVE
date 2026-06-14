# My Pick IKIZULIVE!

Unofficial fan selection board for **IKIZULIVE! LOVELIVE! BLUEBIRD**.

This is a separate project from the Aqours vote counter. It contains no X
scraper, no voting database, and does not read or modify the Aqours project.

## Current layout

- 3 favorite group songs
- 3 favorite project songs (units, aliases, and collaborations)
- 1 favorite solo song for each of the 10 members
- English/Japanese interface
- Picks and display name saved locally in the browser
- Two downloadable 9:16 WebP boards
- Anonymous Community Picks with one current ballot per browser
- Community rankings for group, project, and member solo songs

Community ballots are stored only in `data/community-picks.sqlite3` inside
this IKIZULIVE project. The random browser voter ID is hashed before storage;
display names are not submitted.

The catalog is based on the official IKIZULIVE! music pages as of June 13,
2026. Cover images remain the property of their respective rights holders.

## Development

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>.

## References

- <https://www.lovelive-anime.jp/lovehigh/music/>
- <https://mypick.rurino.dev/>
- <https://aqours-mypick.ccwu.cc/>
- <https://mypick-nijigaku.naufalalfa.com/>
- <https://github.com/rurimegu/MyPickHasunosora>
- <https://github.com/naufaruuu/mypick-nijigaku>
