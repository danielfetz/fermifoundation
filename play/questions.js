// The questions on the Play page: the Fermi Poker 30-question pack, in the order of the printed cards.
// Each has the short title printed on its cards (the Play page doesn’t show it), the question, its two hints
// and the answer. A question can also have a note, a few words on where the answer comes from, shown under it.
// Rewording, adding, removing or reordering questions starts every device again from the first one (assets/play.js);
// a hint or an answer can change without that.
window.FERMI_QUESTIONS = [
  {
    title: 'Chickens slaughtered',
    question: 'How many chickens were slaughtered for meat worldwide in 2024?',
    hints: [
      'An average cow yields as much meat as roughly 140 chickens.',
      'In the US, average chicken consumption is roughly 46 kg (101 lbs) per person per year.',
    ],
    answer: '78.5 billion',
  },
  {
    title: 'Smartphones sold',
    question: 'How many new smartphones were sold worldwide in 2025?',
    hints: [
      'Xiaomi sold 165 million smartphones in 2025.',
      'Apple and Samsung together held about 39% of the global smartphone market in 2025.',
    ],
    answer: '1.26 billion',
  },
  {
    title: 'Electric cars sold',
    question: 'How many new electric and plug-in hybrid cars were sold worldwide in 2025?',
    hints: [
      'About 64M new non-electric cars were sold worldwide in 2025.',
      'About 6 in 10 electric cars sold worldwide in 2025 went to Chinese buyers.',
    ],
    answer: '21.2 million',
  },
  {
    title: 'McDonald’s US staff',
    question: 'How many people work in McDonald’s restaurants in the United States?',
    hints: [
      'There are around 13,700 McDonald’s restaurants in the US.',
      'McDonald’s employs about 67,000 people in its 1,385 German restaurants.',
    ],
    answer: '800,000',
  },
  {
    title: 'US new car sales',
    question: 'How many new cars were sold in the US in 2025?',
    hints: [
      'Around 240 million people hold a valid driver’s license in the US.',
      'Around 1.9 million new cars were sold in Canada in 2025.',
    ],
    answer: '16.2 million',
  },
  {
    title: 'Europeans in the US',
    question: 'How many people born in Europe were living in the United States in 2024?',
    hints: [
      'Europeans made up 75% of all foreign-born people living in the US in 1960, but only 10% in 2024.',
      'California alone was home to 10.9 million foreign-born people in 2024.',
    ],
    answer: '4.9 million',
  },
  {
    title: 'US–Europe flights',
    question: 'How many passenger flights departed the US for Europe in 2025?',
    hints: [
      'Over 7,600 flights flew from New York JFK to London Heathrow in 2025.',
      'Flights from the US to Europe had about 45 million seats in total.',
    ],
    answer: '181,000',
  },
  {
    title: 'EU police officers',
    question: 'How many police officers worked across all 27 EU countries in 2024?',
    hints: [
      'The EU has about 30% more people than the US, but almost twice as many police officers.',
      'Finland has the fewest police per person in the EU, about 136 per 100,000 people.',
    ],
    answer: '1.55 million',
  },
  {
    title: 'Toyota sales',
    question: 'How many Toyota-brand cars were sold worldwide in 2025?',
    hints: [
      'About 2.15 million Toyota-brand cars were sold in the US in 2025.',
      'The Toyota brand alone outsold the entire Volkswagen Group by about 670,000 cars.',
    ],
    answer: '9.65 million',
  },
  {
    title: 'Reddit revenue',
    question: 'How much revenue in US dollars did Reddit make in the first half of 2026?',
    hints: [
      'Reddit had about 130 million daily active users in mid-2026.',
      'In the first half of 2023, Reddit made about $347 million in revenue with about 60 million daily active users.',
    ],
    answer: '$1.468 billion',
  },
  {
    title: 'Spanish speakers',
    question: 'How many native Spanish speakers were there worldwide in 2025?',
    hints: [
      'Mexico and Colombia each have more native Spanish speakers than Spain.',
      'Spanish is the main official language in about 20 countries.',
    ],
    answer: '520 million',
  },
  {
    title: 'Catholic priests',
    question: 'How many Catholic priests were there worldwide in 2024?',
    hints: [
      'There were around 1.4 billion baptized Catholics in 2024.',
      'Germany has an unusually high share of priests: about one for every 1,750 Catholics.',
    ],
    answer: '407,000',
  },
  {
    title: 'California teachers',
    question: 'How many public school teachers worked in California in the 2024-25 school year?',
    hints: [
      'There are around 10,000 public schools in California.',
      'California has about 5.8 million public school students.',
    ],
    answer: '286,000',
  },
  {
    title: 'Independence news',
    question: 'How many days after America declared independence did the first newspaper in London report it?',
    hints: [
      'Sailing eastbound from America to Britain was faster than westbound, often by two weeks or more.',
      'The straight-line distance from Philadelphia to London is about 5,700 km (3,500 miles).',
    ],
    answer: '37 days',
  },
  {
    title: '.com domains',
    question: 'How many .com domains were registered in total as of June 2026?',
    hints: [
      'China’s .cn, the largest country domain, has about 21 million registrations.',
      'There are about 400 million domain registrations worldwide across all extensions.',
    ],
    answer: '166.6 million',
  },
  {
    title: 'US war deaths',
    question: 'How many American service members have died in war throughout US history?',
    hints: [
      'The Civil War killed more Americans than both World Wars combined.',
      'Around 405,000 Americans died in World War II and about 58,000 in Vietnam.',
    ],
    answer: '1.3 million',
  },
  {
    title: 'US Olympic medals',
    question: 'How many Summer Olympic medals have American athletes won in total?',
    hints: [
      'The US has won the most gold medals at 19 out of 30 Summer Olympics.',
      'The US won 126 medals at the 2024 Summer Olympics in Paris.',
    ],
    answer: '2,765',
  },
  {
    title: 'People aged 80+',
    question: 'How many people worldwide were aged 80 or older in mid-2026?',
    hints: [
      'The UN estimates that 453 million people will be aged 80 or older by 2050.',
      'More than 1 in 10 people in Japan are 80 or older.',
    ],
    answer: '177 million',
  },
  {
    title: 'US births',
    question: 'How many babies were born in the United States in 2025?',
    hints: [
      'Around 700,000 fewer babies were born in the US in 2025 than in 2007.',
      'In 2025, there were about 53 births for every 1,000 women aged 15 to 44.',
    ],
    answer: '3.6 million',
  },
  {
    title: 'US lawyers',
    question: 'How many lawyers worked in the United States in 2025?',
    hints: [
      'In 1970, there was about one lawyer for every 620 Americans.',
      'China, with about four times the US population, had about 650,000 lawyers in 2022.',
    ],
    answer: '1.37 million',
  },
  {
    title: 'Tesla production',
    question: 'How many cars did Tesla produce in 2025?',
    hints: [
      'In 2018, Tesla produced 255,000 cars.',
      'Around 626,000 Teslas were sold to Chinese buyers in 2025, making China Tesla’s biggest market.',
    ],
    answer: '1.65 million',
  },
  {
    title: 'Duolingo users',
    question: 'How many people used Duolingo on an average day in mid-2026?',
    hints: [
      'Duolingo made just over $1 billion in revenue in 2025.',
      'In early 2025, about 130 million people used Duolingo at least once a month.',
    ],
    answer: '58.7 million',
  },
  {
    title: 'US radiologists',
    question: 'How many radiologists worked in the United States in 2024?',
    hints: [
      'About 93 million CT scans and 36 million MRI scans were done in the US in 2023.',
      'In 2024, about 4,500 doctors were training to become radiologists in the US.',
    ],
    answer: '32,600',
  },
  {
    title: 'Global migrants',
    question: 'How many people worldwide were living outside their country of birth in 2024?',
    hints: [
      'Nearly one in five people living in Germany was born abroad.',
      'About 18 million people born in India live abroad, which is more than from any other country.',
    ],
    answer: '304 million',
  },
  {
    title: 'US at NYC density',
    question: 'How many people could live in the US if it were as densely populated as New York City?',
    hints: [
      'US land area is about 9.15 million km² (≈3.53 million mi²).',
      'At New York City’s density, Florida alone could hold nearly 1.6 billion people.',
    ],
    answer: '103 billion',
  },
  {
    title: 'Visa transactions',
    question: 'How many transactions did Visa process on an average day in 2025?',
    hints: [
      'In 2025, Visa cards were used for about $40 billion in daily payments.',
      'Mastercard processed about 480 million transactions on an average day in 2025.',
    ],
    answer: '720 million',
  },
  {
    title: 'South America’s land',
    question: 'What percentage of the Earth’s land area is covered by South America?',
    hints: [
      'The US alone covers around 6.1% of Earth’s land area.',
      'South America is as large as Europe and Australia combined.',
    ],
    answer: '12%',
  },
  {
    title: 'American Scouts',
    question: 'How many Americans have been either Boy Scouts or Girl Scouts since 1910?',
    hints: [
      'In the early 1970s, more than 4 million boys were Boy Scouts at the same time, about five times as many as today.',
      'More than 50 million American girls have been Girl Scouts.',
    ],
    answer: '180 million',
  },
  {
    title: 'Number of popes',
    question: 'How many popes have there been in the Catholic Church?',
    hints: [
      'St. Peter is recognized as the first pope and died around AD 64.',
      'There have been 53 popes since the year 1500.',
    ],
    answer: '267',
  },
  {
    title: 'Pigs slaughtered',
    question: 'How many pigs were slaughtered for meat worldwide in 2023?',
    hints: [
      'The average meat yield per slaughtered pig is 82 kg (181 lbs).',
      'China slaughters about half of all the pigs in the world each year.',
    ],
    answer: '1.51 billion',
  },
];
