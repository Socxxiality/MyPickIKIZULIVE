export type SongBucket = "group" | "project" | "solo" | MemberId;

export type MemberId =
  | "polka"
  | "mai"
  | "akira"
  | "hanabi"
  | "miracle"
  | "noriko"
  | "yukuri"
  | "aurora"
  | "midori"
  | "shion";

export interface Song {
  slug: string;
  title: string;
  bucket: SongBucket;
  artist: string;
  cover: string;
  source: string;
}

export interface Member {
  id: MemberId;
  name: string;
  nameJa: string;
  color: string;
  xHandle: string;
}

export const MEMBERS: Member[] = [
  { id: "polka", name: "Polka Takahashi", nameJa: "高橋ポルカ", color: "#f06b69", xHandle: "polka_lion" },
  { id: "mai", name: "Mai Azabu", nameJa: "麻布麻衣", color: "#a875d6", xHandle: "My_Mai_Eld" },
  { id: "akira", name: "Akira Gokiri", nameJa: "五桐 玲", color: "#4f91d8", xHandle: "G_Akky304250" },
  { id: "hanabi", name: "Hanabi Komagata", nameJa: "駒形花火", color: "#e35656", xHandle: "hanabistarmine" },
  { id: "miracle", name: "Miracle Kanazawa", nameJa: "金澤奇跡", color: "#e6ad35", xHandle: "MiracleGoldSP" },
  { id: "noriko", name: "Noriko Chofu", nameJa: "調布のりこ", color: "#54b7c8", xHandle: "Noricco_U" },
  { id: "yukuri", name: "Yukuri Harumiya", nameJa: "春宮ゆくり", color: "#ef8bb2", xHandle: "Yukuri_talk" },
  { id: "aurora", name: "Aurora Konohana", nameJa: "此花輝夜", color: "#6568bd", xHandle: "Rollie_twinkle" },
  { id: "midori", name: "Midori Yamada", nameJa: "山田真緑", color: "#68ad69", xHandle: "LittlegreenCom" },
  { id: "shion", name: "Shion Sasaki", nameJa: "佐々木翔音", color: "#8994a6", xHandle: "ShaunTheBunny" },
];

const official = "https://www.lovelive-anime.jp/lovehigh/music/";

export const SONGS: Song[] = [
  { slug: "what-is-my-life", title: "What is my LIFE?", bucket: "group", artist: "いきづらい部！", cover: "/covers/group-first.jpeg", source: official },
  { slug: "himitsumichi", title: "ヒミツミチ", bucket: "group", artist: "いきづらい部！", cover: "/covers/group-first.jpeg", source: official },
  { slug: "dou-da-doing", title: "Dou-Da? DOING!", bucket: "group", artist: "いきづらい部！", cover: "/covers/group-second.jpeg", source: official },
  { slug: "regain-again-llllove", title: "REGAIN AGAIN LLLLOVE", bucket: "group", artist: "いきづらい部！", cover: "/covers/group-second.jpeg", source: official },
  { slug: "super-summer-sensation", title: "SUPER SUMMER SENSATION!!", bucket: "group", artist: "いきづらい部！", cover: "/covers/group-second.jpeg", source: official },

  { slug: "dekoboko-quartet", title: "凸凹Quartet", bucket: "project", artist: "CHAKI！", cover: "/covers/chaki.jpeg", source: official },
  { slug: "symmetry", title: "シンメトリー", bucket: "project", artist: "Mi×Nori=Tea", cover: "/covers/minoritea.jpeg", source: official },
  { slug: "daitan-party-time", title: "Daitan Party Time", bucket: "project", artist: "Plumina", cover: "/covers/plumina.jpeg", source: official },
  { slug: "silent-stella", title: "Silent Stella", bucket: "project", artist: "SH1ON", cover: "/covers/shion-unit.jpeg", source: official },
  { slug: "next-card", title: "NEXT CARD", bucket: "project", artist: "AiScReam", cover: "/covers/next-card.jpeg", source: official },

  { slug: "asakusa-guilty-girl", title: "浅草Guilty Girlの歌", bucket: "solo", artist: "高橋ポルカ", cover: "/covers/polka.jpeg", source: official },
  { slug: "odoru-polka", title: "オドルポルカ", bucket: "solo", artist: "高橋ポルカ", cover: "/covers/polka.jpeg", source: official },

  { slug: "public-style", title: "Public Style", bucket: "solo", artist: "麻布麻衣", cover: "/covers/mai.jpeg", source: official },
  { slug: "maimai-mode", title: "ひっさつマイマイモード", bucket: "solo", artist: "麻布麻衣", cover: "/covers/mai.jpeg", source: official },

  { slug: "itsuka-ao", title: "いつか碧", bucket: "solo", artist: "五桐 玲", cover: "/covers/akira.jpeg", source: official },
  { slug: "jet-starter", title: "ジェットスターター", bucket: "solo", artist: "五桐 玲", cover: "/covers/akira.jpeg", source: official },

  { slug: "hibana", title: "HIBANA―火花―", bucket: "solo", artist: "駒形花火", cover: "/covers/hanabi.jpeg", source: official },
  { slug: "first-ride", title: "First Ride", bucket: "solo", artist: "駒形花火", cover: "/covers/hanabi.jpeg", source: official },

  { slug: "homerun-queen", title: "HomeRun Queen!!", bucket: "solo", artist: "金澤奇跡", cover: "/covers/miracle.jpeg", source: official },
  { slug: "magical-recipe", title: "マジカル♡レシピ・シルブプレ！", bucket: "solo", artist: "金澤奇跡", cover: "/covers/miracle.jpeg", source: official },

  { slug: "one-time-password", title: "恋のワンタイムパスワード", bucket: "solo", artist: "調布のりこ", cover: "/covers/noriko.jpeg", source: official },
  { slug: "centimeter-rendezvous", title: "センチメートル・ランデヴー", bucket: "solo", artist: "調布のりこ", cover: "/covers/noriko.jpeg", source: official },

  { slug: "pray-for-love", title: "Pray for love", bucket: "solo", artist: "春宮ゆくり", cover: "/covers/yukuri.jpeg", source: official },
  { slug: "happy-end", title: "二人はいつでもHappy End", bucket: "solo", artist: "春宮ゆくり", cover: "/covers/yukuri.jpeg", source: official },

  { slug: "night-polaris", title: "キミは夜のポラリス", bucket: "solo", artist: "此花輝夜", cover: "/covers/aurora.jpeg", source: official },
  { slug: "clarit-bright", title: "クラリトブライト", bucket: "solo", artist: "此花輝夜", cover: "/covers/aurora.jpeg", source: official },

  { slug: "little-green-committee", title: "Little Green委員会", bucket: "solo", artist: "山田真緑", cover: "/covers/midori.jpeg", source: official },
  { slug: "save-the-earth", title: "LOVE♡YOU♡Save the EARTH!!", bucket: "solo", artist: "山田真緑", cover: "/covers/midori.jpeg", source: official },

  { slug: "ikitakunai-every-day", title: "イキタクナイevery day", bucket: "solo", artist: "佐々木翔音", cover: "/covers/shion.jpeg", source: official },
  { slug: "trick-or-toxic", title: "Trick or Toxic", bucket: "solo", artist: "佐々木翔音", cover: "/covers/shion.jpeg", source: official },
];

export const SONG_BY_SLUG = Object.fromEntries(SONGS.map((song) => [song.slug, song]));

export function songsForBucket(bucket: SongBucket): Song[] {
  return SONGS.filter((song) => song.bucket === bucket);
}
