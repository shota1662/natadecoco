// ============================================================
// /register-intl 専用の軽量 i18n 辞書
// ------------------------------------------------------------
// デフォルトは English。ここに言語を追加すれば拡張できる。
// 用語は両言語とも「サポーター / supporter」で統一（"volunteer" とは呼ばない）。
// 本文コピーは指示された確定コピーをそのまま使用している。
// ============================================================

export type Locale = 'en' | 'ja'

// プライバシーポリシーのリンク先。
// TODO: アプリ内に専用ポリシーページを用意したら差し替える。
//       現状は組織サイトの既存ポリシーページを暫定で参照している。
export const PRIVACY_POLICY_URL = 'https://natadecoco.org/privacy.html'

export interface Dict {
  langName: string
  toggleTo: string
  nav: { back: string }
  hero: { title: string; subtitle: string; button: string }
  why: { heading: string; intro: string; items: { title: string; body: string }[] }
  forYou: { heading: string; intro: string; items: string[] }
  message: { heading: string; paragraphs: string[] }
  programs: {
    heading: string
    intro: string
    items: { title: string; body: string }[]
  }
  company: {
    heading: string
    intro: string
    whoTitle: string
    who: string[]
    ageTitle: string
    ages: { label: string; pct: number }[]
  }
  steps: { heading: string; items: { title: string; body: string }[] }
  form: {
    heading: string
    intro: string
    required: string
    optional: string
    labels: {
      full_name: string
      birth_date: string
      email: string
      origin_country: string
      residence_pref: string
      question: string
    }
    placeholders: {
      full_name: string
      email: string
      origin_country: string
      question: string
      select: string
    }
    consentBefore: string
    consentLink: string
    consentAfter: string
    submit: string
    sending: string
    successTitle: string
    successBody: string
    errors: { turnstile: string; validation: string; email: string; server: string }
  }
}

export const DICT: Record<Locale, Dict> = {
  en: {
    langName: 'English',
    toggleTo: 'やさしい日本語',
    nav: { back: 'Back to Nata de Coco' },
    hero: {
      title: 'Become an International Supporter',
      subtitle:
        'Share your culture with children across Japan — no experience, no language skills, and no cost to you.',
      button: 'Sign up as a supporter',
    },
    why: {
      heading: "Why it's easy to join",
      intro: 'Joining Nata de Coco is easier than you might think.',
      items: [
        {
          title: 'Join on your own terms',
          body: 'Come as often, or as rarely, as you like. Even once a month or less is perfectly fine. Your life comes first.',
        },
        {
          title: 'No experience required',
          body: "You don't need any teaching background, and you don't need English or Japanese skills either. Just come as you are.",
        },
        {
          title: 'Zero cost to you',
          body: "We provide an honorarium and cover your travel expenses, so taking part won't cost you anything.* (*Some exceptions may apply.)",
        },
      ],
    },
    forYou: {
      heading: 'This is for you if…',
      intro: 'Our supporters join for all kinds of reasons. You might feel the same if you want to…',
      items: [
        "Explore regional Japan — visit towns and cities you'd never see as a tourist",
        'Be part of a multinational team — work alongside people from all over the world',
        'Step inside Japanese schools — experience classrooms from the inside',
        'Feel at home in Japan — build real connections to life here',
        'Spend time with kids — because you simply love being around children',
        'Share your own culture — introduce your country and roots to a new generation',
      ],
    },
    message: {
      heading: 'Message from our representative',
      paragraphs: [
        "At Nata de Coco, we work toward one simple goal: to draw a map of the world in every child's heart. All across Japan, we give children the chance to experience other cultures firsthand.",
        "Why not share the country or region you come from, or one that's close to your heart, with the children here? We can't wait to work alongside you.",
      ],
    },
    programs: {
      heading: 'Example programs',
      intro: 'Here are some of the activities our supporters take part in.',
      items: [
        {
          title: 'Elementary school visits',
          body: 'We run special lessons for 3rd-grade classes where children encounter cultures from around the world. English lessons begin in 3rd grade in Japanese schools, so simple English communication works well.',
        },
        {
          title: 'Nursery school visits',
          body: 'We give young children aged 3–6 their very first taste of foreign cultures. Exchanges through songs and dancing are especially popular.',
        },
        {
          title: 'Summer camp',
          body: 'A two-day, one-night international exchange camp with the children. Beyond the kids, connecting with other adults is part of the fun too.',
        },
        {
          title: 'High school visits',
          body: 'We hold discussions with high school students — on global issues, of course, but also topics like building an international career.',
        },
      ],
    },
    company: {
      heading: "You'll be in good company",
      intro: 'Supporters come from many different walks of life.',
      whoTitle: "Who's taking part",
      who: [
        'International students',
        'Technical intern trainees',
        'Short-term residents',
        'Permanent residents (including stay-at-home parents)',
      ],
      ageTitle: 'Age groups',
      ages: [
        { label: 'In their 20s', pct: 50 },
        { label: 'In their 30s', pct: 30 },
        { label: 'In their 40s', pct: 10 },
        { label: 'Other', pct: 10 },
      ],
    },
    steps: {
      heading: 'How to get started',
      items: [
        {
          title: 'Join an info session',
          body: "Once you sign up, we'll email you the dates for our monthly online info session. Just reply with the one that suits you. (None of the dates work? Get in touch and we'll arrange something else.)",
        },
        {
          title: 'Join our Nata de Coco LINE group',
          body: 'Stay in the loop on upcoming events.',
        },
        {
          title: 'Come to an event that fits your schedule',
          body: 'Take part whenever it suits you.',
        },
        {
          title: 'Get more involved (optional)',
          body: "If you'd like to do more, you're welcome to join our core team.",
        },
      ],
    },
    form: {
      heading: 'Sign up as a supporter',
      intro: "Fill in the form below and we'll be in touch. All fields except the question are required.",
      required: 'Required',
      optional: 'Optional',
      labels: {
        full_name: 'Full name',
        birth_date: 'Date of birth',
        email: 'Email address',
        origin_country: 'Country or region of origin',
        residence_pref: 'Where you live in Japan',
        question: 'Questions',
      },
      placeholders: {
        full_name: 'e.g. Maria Santos',
        email: 'e.g. example@mail.com',
        origin_country: 'e.g. Philippines, USA, Vietnam',
        question: "Anything you'd like to ask? Leave it blank if not.",
        select: 'Please select',
      },
      consentBefore: 'I agree to the ',
      consentLink: 'Privacy Policy',
      consentAfter: '',
      submit: 'Submit',
      sending: 'Sending…',
      successTitle: 'Thank you for signing up!',
      successBody:
        "We've received your registration. We'll get in touch about the info session soon. A confirmation email is on its way to you.",
      errors: {
        turnstile: 'Please complete the spam check.',
        validation: 'Please fill in all required fields.',
        email: 'Please enter a valid email address.',
        server: 'Something went wrong. Please try again.',
      },
    },
  },

  ja: {
    langName: 'やさしい日本語',
    toggleTo: 'English',
    nav: { back: 'ナタデココHPへ戻る' },
    hero: {
      title: '外国人サポーター募集',
      subtitle:
        '日本ぜんこくの 子どもたちに、あなたの 文化を つたえませんか。経験・語学力・自己負担は いりません。',
      button: 'サポーターに 登録する',
    },
    why: {
      heading: 'かんたんに はじめられます',
      intro: 'ナタデココは、思っているより かんたんに はじめられます。',
      items: [
        {
          title: '好きなときに、好きなだけ',
          body: '月に1回より 少なくても だいじょうぶです。あなたの生活が いちばん大切です。',
        },
        {
          title: '経験は いりません',
          body: '教えた経験は いりません。英語も 日本語も 上手でなくて だいじょうぶです。そのままの あなたで 来てください。',
        },
        {
          title: 'お金は かかりません',
          body: '謝礼（お礼のお金）を わたします。交通費も 出します。だから、あなたの お金は かかりません。＊ときどき 例外が あります。',
        },
      ],
    },
    forYou: {
      heading: 'こんな人に おすすめ',
      intro: 'サポーターは いろいろな 理由で 参加しています。あなたも こう思ったら 仲間です。',
      items: [
        '日本の 地方の 町を たずねたい',
        'いろいろな 国の 人と いっしょに かつどうしたい',
        '日本の 学校に 入ってみたい',
        '日本の 生活に なれたい',
        '子どもが 好き',
        '自分の 国の 文化を つたえたい',
      ],
    },
    message: {
      heading: '代表からの メッセージ',
      paragraphs: [
        'わたしたち ナタデココは、「子どもたちの 心に 世界地図を えがく」ことを 目ざして います。日本ぜんこくで、子どもたちに 外国の 文化を つたえて います。',
        'あなたの 国や、大切に 思う 国のことを、日本の 子どもたちに つたえて みませんか。いっしょに かつどうできるのを 楽しみに して います。',
      ],
    },
    programs: {
      heading: 'プログラムの れい',
      intro: 'サポーターが 参加する かつどうの れいを しょうかいします。',
      items: [
        {
          title: '小学校 訪問プログラム',
          body: '小学３年生の 授業で、世界の 文化に ふれる 特別な クラスを 行います。日本の 学校では 小学３年生から 英語の 授業が 始まります。だから、かんたんな 英語で コミュニケーションが できます。',
        },
        {
          title: '保育園 訪問プログラム',
          body: '３〜６才の 小さな 子どもたちに、外国の 文化に ふれる はじめての 体験を とどけます。歌や ダンスを つかった 交流が 人気です。',
        },
        {
          title: 'サマーキャンプ',
          body: '１泊２日で、子どもたちと 国際交流キャンプを 行います。子どもは もちろん、大人どうしの 交流も みりょくです。',
        },
        {
          title: '高校 訪問プログラム',
          body: '高校生と いろいろな テーマで 話し合いを します。世界の 問題は もちろん、外国で はたらくこと（グローバルキャリア）に ついても 話します。',
        },
      ],
    },
    company: {
      heading: 'いまの サポーター',
      intro: 'サポーターは いろいろな 人が います。',
      whoTitle: 'どんな人が いますか',
      who: ['留学生', '実習生', '短期で 日本に いる人', '永住者（主婦／主夫 など）'],
      ageTitle: '年代',
      ages: [
        { label: '20〜30才', pct: 50 },
        { label: '30〜40才', pct: 30 },
        { label: '40〜50才', pct: 10 },
        { label: 'その他', pct: 10 },
      ],
    },
    steps: {
      heading: '参加の ステップ',
      items: [
        {
          title: '説明会に 参加する',
          body: '登録が おわったら、毎月の オンライン説明会の 日にちを メールで お知らせします。都合の いい 日を えらんで、返信してください。（どの日も 合わない ときは、れんらく してください。べつの 日を 相談できます。）',
        },
        {
          title: 'ナタデココの LINEグループに 入る',
          body: 'イベントの お知らせが とどきます。',
        },
        {
          title: '都合の いい イベントに 参加する',
          body: '好きな ときに 参加できます。',
        },
        {
          title: '（もっと やりたい 人は）運営メンバーに なる',
          body: 'もっと やりたい 人は、運営メンバーに なれます。',
        },
      ],
    },
    form: {
      heading: 'サポーターに 登録する',
      intro: 'したの フォームに 入力してください。質問いがいは ぜんぶ 必須です。',
      required: '必須',
      optional: '任意',
      labels: {
        full_name: '名前',
        birth_date: '生年月日',
        email: 'メールアドレス',
        origin_country: '出身の 国・地域',
        residence_pref: '住んでいる ところ（都道府県）',
        question: '質問',
      },
      placeholders: {
        full_name: '例）マリア サントス',
        email: '例）example@mail.com',
        origin_country: '例）フィリピン、アメリカ、ベトナム',
        question: 'ききたいことが あれば 書いてください（なくても OK）',
        select: 'えらんでください',
      },
      consentBefore: '',
      consentLink: 'プライバシーポリシー',
      consentAfter: 'に 同意します',
      submit: '送信する',
      sending: '送信中…',
      successTitle: '登録 ありがとうございます！',
      successBody:
        '登録を うけとりました。説明会について、あとで れんらくします。確認の メールも おくりました。',
      errors: {
        turnstile: 'スパム チェックを かんりょうしてください。',
        validation: '必須の 項目を ぜんぶ 入力してください。',
        email: 'ただしい メールアドレスを 入力してください。',
        server: 'エラーが おきました。もう一度 おためしください。',
      },
    },
  },
}
