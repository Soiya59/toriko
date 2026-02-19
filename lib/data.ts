/** ランキング項目（料理・旅行・思い出など汎用） */
export type GourmetItem = {
  id: string
  name: string
  categoryId: string
  score: number
  comment: string
  image: string | null
  date: string // YYYY-MM-DD（食べた日・訪問日など）
}

/** @deprecated 後方互換のため。GourmetItem を使用してください */
export type Dish = GourmetItem

export type Category = {
  id: string
  name: string
}

export type FullCourseSlot = {
  key: string
  label: string
  dishId: string | null
}

export const FULL_COURSE_SLOTS: { key: string; label: string; emoji: string }[] = [
  { key: "appetizer", label: "前菜", emoji: "🥗" },
  { key: "soup", label: "スープ", emoji: "🍲" },
  { key: "fish", label: "魚料理", emoji: "🐟" },
  { key: "meat", label: "肉料理", emoji: "🥩" },
  { key: "main", label: "メインディッシュ", emoji: "👨‍🍳" },
  { key: "salad", label: "サラダ", emoji: "🥬" },
  { key: "dessert", label: "デザート", emoji: "🍰" },
  { key: "drink", label: "ドリンク", emoji: "🍷" },
]

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "かき氷" },
  { id: "cat-2", name: "カレーライス" },
  { id: "cat-3", name: "チャーハン（手作り）" },
  { id: "cat-4", name: "ハンバーグ" },
  { id: "cat-5", name: "ラーメン" },
  { id: "cat-6", name: "寿司" },
  { id: "cat-7", name: "焼肉" },
  { id: "cat-8", name: "餃子" },
  { id: "cat-9", name: "パスタ" },
  { id: "cat-10", name: "うどん" },
]

export const INITIAL_DISHES: GourmetItem[] = [
  // かき氷
  { id: "d-1", name: "日光天然氷のいちごかき氷", categoryId: "cat-1", score: 4.72, comment: "天然氷の口溶けが別次元。いちごシロップも自家製で最高。", image: null, date: "2026-01-15" },
  { id: "d-2", name: "抹茶金時かき氷", categoryId: "cat-1", score: 4.35, comment: "濃厚な抹茶と粒あんの組み合わせが絶品。", image: null, date: "2026-01-20" },
  { id: "d-3", name: "マンゴーかき氷", categoryId: "cat-1", score: 4.10, comment: "台湾風で果肉たっぷり。夏にぴったり。", image: null, date: "2026-01-25" },
  // カレーライス
  { id: "d-4", name: "神保町の欧風ビーフカレー", categoryId: "cat-2", score: 4.85, comment: "36時間煮込んだデミグラスベースが至高。ビーフも柔らか。", image: null, date: "2026-01-05" },
  { id: "d-5", name: "スリランカ風チキンカレー", categoryId: "cat-2", score: 4.50, comment: "スパイスの層が深い。ココナッツミルクの甘みが絶妙。", image: null, date: "2026-01-12" },
  { id: "d-6", name: "バターチキンカレー", categoryId: "cat-2", score: 4.20, comment: "クリーミーでマイルド。ナンとの相性抜群。", image: null, date: "2026-01-18" },
  { id: "d-7", name: "キーマカレー", categoryId: "cat-2", score: 3.95, comment: "スパイシーだがバランスが良い。温玉トッピングで更に美味。", image: null, date: "2026-02-01" },
  // チャーハン
  { id: "d-8", name: "町中華のパラパラ黄金チャーハン", categoryId: "cat-3", score: 4.90, comment: "火力が生み出すパラパラ感。卵のコーティングが完璧。これぞ至高。", image: null, date: "2026-01-08" },
  { id: "d-9", name: "ガーリックバターチャーハン", categoryId: "cat-3", score: 4.45, comment: "にんにくの香りとバターのコクが最高の組み合わせ。", image: null, date: "2026-01-22" },
  { id: "d-10", name: "あんかけチャーハン", categoryId: "cat-3", score: 4.15, comment: "とろりとしたあんとパラパラご飯の対比が面白い。", image: null, date: "2026-02-03" },
  // ハンバーグ
  { id: "d-11", name: "黒毛和牛100%ハンバーグ", categoryId: "cat-4", score: 4.88, comment: "肉汁が止まらない。焼き加減も絶妙でレアのまま提供。", image: null, date: "2026-01-10" },
  { id: "d-12", name: "デミグラスハンバーグ", categoryId: "cat-4", score: 4.30, comment: "ジューシーな肉にコクのあるソースが絡む。", image: null, date: "2026-01-28" },
  { id: "d-13", name: "煮込みハンバーグ", categoryId: "cat-4", score: 4.05, comment: "柔らかくてほろほろ。冬の定番にしたい。", image: null, date: "2026-02-05" },
  // ラーメン
  { id: "d-14", name: "濃厚豚骨魚介つけ麺", categoryId: "cat-5", score: 4.92, comment: "極太麺に濃厚スープが絡みつく。チャーシューも分厚い。", image: null, date: "2026-01-03" },
  { id: "d-15", name: "煮干しラーメン", categoryId: "cat-5", score: 4.60, comment: "煮干しの旨味がストレートに伝わる。麺との相性も抜群。", image: null, date: "2026-01-14" },
  { id: "d-16", name: "味噌ラーメン", categoryId: "cat-5", score: 4.40, comment: "札幌直送の味噌を使用。もやしとバターが合う。", image: null, date: "2026-01-21" },
  { id: "d-17", name: "担々麺", categoryId: "cat-5", score: 4.25, comment: "花椒の痺れとゴマの風味が絶妙。辛さも調整可能。", image: null, date: "2026-02-02" },
  { id: "d-18", name: "鶏白湯ラーメン", categoryId: "cat-5", score: 4.00, comment: "クリーミーでまろやか。女性にもおすすめ。", image: null, date: "2026-02-06" },
  // 寿司
  { id: "d-19", name: "大間のマグロ握り", categoryId: "cat-6", score: 4.95, comment: "口の中でとろける大トロ。シャリとのバランスが神。", image: null, date: "2026-01-07" },
  { id: "d-20", name: "ウニ軍艦巻き", categoryId: "cat-6", score: 4.70, comment: "北海道産バフンウニの甘みが広がる。", image: null, date: "2026-01-19" },
  { id: "d-21", name: "炙りサーモン", categoryId: "cat-6", score: 4.15, comment: "炙りの香ばしさとサーモンの脂がマッチ。", image: null, date: "2026-02-04" },
  // 焼肉
  { id: "d-22", name: "極上タン塩", categoryId: "cat-7", score: 4.80, comment: "厚切りの牛タンにレモンを絞って。食感が最高。", image: null, date: "2026-01-09" },
  { id: "d-23", name: "特選カルビ", categoryId: "cat-7", score: 4.55, comment: "サシが美しい。タレも自家製で深みがある。", image: null, date: "2026-01-23" },
  { id: "d-24", name: "ハラミ", categoryId: "cat-7", score: 4.30, comment: "赤身の旨味が凝縮。ご飯が止まらない。", image: null, date: "2026-02-07" },
  // 餃子
  { id: "d-25", name: "宇都宮の焼き餃子", categoryId: "cat-8", score: 4.65, comment: "皮パリッ、中ジューシー。にんにく強めが最高。", image: null, date: "2026-01-11" },
  { id: "d-26", name: "水餃子", categoryId: "cat-8", score: 4.20, comment: "モチモチの皮に旨味が閉じ込められている。", image: null, date: "2026-01-26" },
  // パスタ
  { id: "d-27", name: "カルボナーラ", categoryId: "cat-9", score: 4.75, comment: "濃厚なソースとアルデンテの麺。卵黄の黄金色が美しい。", image: null, date: "2026-01-06" },
  { id: "d-28", name: "ペペロンチーノ", categoryId: "cat-9", score: 4.40, comment: "シンプルだからこそ技術が光る。にんにくと唐辛子の香り。", image: null, date: "2026-01-17" },
  { id: "d-29", name: "ボロネーゼ", categoryId: "cat-9", score: 4.10, comment: "肉感たっぷりのソースが太麺に絡む。", image: null, date: "2026-02-08" },
  // うどん
  { id: "d-30", name: "讃岐うどん（ぶっかけ）", categoryId: "cat-10", score: 4.68, comment: "コシの強い麺と出汁の旨味。シンプルイズベスト。", image: null, date: "2026-01-13" },
  { id: "d-31", name: "肉うどん", categoryId: "cat-10", score: 4.35, comment: "甘辛い牛肉と出汁が絡み合う。温まる一杯。", image: null, date: "2026-01-27" },
]

export const INITIAL_FULL_COURSE: Record<string, string | null> = {
  appetizer: "d-19",  // 大間のマグロ握り
  soup: "d-14",       // 濃厚豚骨魚介つけ麺
  fish: "d-27",       // カルボナーラ
  meat: "d-11",       // 黒毛和牛100%ハンバーグ
  main: "d-8",        // 町中華のパラパラ黄金チャーハン
  salad: null,
  dessert: "d-1",     // 日光天然氷のいちごかき氷
  drink: null,
}
