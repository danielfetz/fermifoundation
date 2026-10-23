// The questions on the Play page: the Fermi Poker 63-question pack, in the order of the printed cards (each device
// plays them in an order of its own, shuffled the first time). Each has the short title printed on its cards (the
// Play page doesn’t show it), the question, its two hints and the answer. A question can also have a note, a few
// words on where the answer comes from, shown under it. Rewording, adding, removing or reordering questions here
// starts every device again, in a new order (assets/play.js); a hint or an answer can change without that.
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
    question: 'How many police officers worked in EU countries in 2024?',
    hints: [
      'The EU has about 30% more people than the US, but almost twice as many police officers.',
      'Finland has the fewest police per person in the EU, about 136 per 100,000 people.',
    ],
    answer: '1.55 million',
  },
  {
    title: 'Toyota sales',
    question: 'How many Toyotas were sold worldwide in 2025?',
    hints: [
      'About 2.15 million Toyotas were sold in the US in 2025.',
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
    answer: '$1.47 billion',
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
    question: 'How many licensed lawyers were there in the United States in 2025?',
    hints: [
      'In 1970, there was about one lawyer for every 620 Americans.',
      'China had about 650,000 lawyers in 2022.',
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
  {
    title: 'Medical students',
    question: 'How many students were enrolled in US medical schools in the 2025–26 school year?',
    hints: [
      'The US had about 1.03 million active doctors in 2024.',
      'There are about 200 accredited medical schools in the US, where studies usually take four years.',
    ],
    answer: '141,500',
  },
  {
    title: 'US wartime service',
    question: 'How many Americans served in the US military during wartime, from the Revolution to the 1991 Gulf War?',
    hints: [
      'About 4.7 million Americans served in World War I (1917–1918).',
      'The two World Wars together account for roughly half of everyone who has served.',
    ],
    answer: '41.9 million',
  },
  {
    title: 'Spotify subscribers',
    question: 'How many paying subscribers did Spotify have as of June 2026?',
    hints: [
      'Spotify made about €4.8 billion in revenue in the second quarter of 2026.',
      'About 494 million people used Spotify’s free, ad-supported tier in June 2026.',
    ],
    answer: '300 million',
  },
  {
    title: 'US veterinarians',
    question: 'How many veterinarians were there in the United States at the end of 2025?',
    hints: [
      'Australia has about 15,000 registered veterinarians, while Brazil has about 182,000 active ones.',
      'There were about 90 million pet dogs and 74 million pet cats in the US in 2024.',
    ],
    answer: '133,500',
  },
  {
    title: 'US marriages',
    question: 'How many couples got legally married in the United States in 2024?',
    hints: [
      'About three-quarters of Americans have married at least once by the age of 40.',
      'In 2024, there were about 2.4 marriages for every divorce in the US.',
    ],
    answer: '2.13 million',
  },
  {
    title: 'Forest cover',
    question: 'What percentage of the Earth’s land surface is covered by forest?',
    hints: [
      'Around 71% of the Earth’s land surface is habitable.',
      'More than half of the world’s forests are found in just five countries: Russia, Brazil, Canada, the US, and China.',
    ],
    answer: '28%',
  },
  {
    title: 'Disney+ subscribers',
    question: 'How many subscribers did Disney+ have as of September 2025?',
    hints: [
      'Around 45% of Disney+ subscribers were in the US and Canada.',
      'Disney+ launched in November 2019 and reached 10 million subscribers on its first day.',
    ],
    answer: '131.6 million',
  },
  {
    title: 'SFO passengers',
    question: 'How many passengers traveled through San Francisco International Airport in 2025?',
    hints: [
      'About 1.36 million passengers flew between San Francisco and Taipei in 2024, the airport’s busiest international route.',
      'Los Angeles International Airport handled about 73.7 million passengers in 2025.',
    ],
    answer: '54.5 million',
  },
  {
    title: 'EU dental graduates',
    question: 'How many new dentistry graduates were there across the European Union in 2023?',
    hints: [
      'In 2022, Romania trained the second-most dentists in the EU, only about 600 fewer than Germany.',
      'The EU countries together had about 360,000 practicing dentists in 2022.',
    ],
    answer: '14,200',
  },
  {
    title: 'Minecraft sales',
    question: 'How many copies of Minecraft had been sold worldwide as of September 2026?',
    hints: [
      'Minecraft was officially released in 2011 and passed 100 million copies sold in 2016.',
      'Grand Theft Auto V, the second-best-selling video game ever, has sold more than 230 million copies.',
    ],
    answer: '425 million',
  },
  {
    title: 'Babies worldwide',
    question: 'How many babies were born worldwide in 2025?',
    hints: [
      'For every person who died in 2025, more than two babies were born.',
      'India alone saw about 23 million births in 2025, more than any other country.',
    ],
    answer: '132 million',
  },
  {
    title: 'McDonald’s worldwide',
    question: 'How many McDonald’s restaurants existed worldwide at the end of 2025?',
    hints: [
      'The United States has about 13,700 McDonald’s restaurants.',
      'With about 3,000 locations, Japan has the third-most McDonald’s restaurants of any country.',
    ],
    answer: '45,400',
  },
  {
    title: 'US book sales',
    question: 'How many hardcover and paperback books were sold in the United States in 2025, not counting used books?',
    hints: [
      'About 351 million new hardcover and paperback books were sold in France in 2023.',
      'In 2025, romance books sold almost 44 million copies in the US, while science fiction sold about 6 million.',
    ],
    answer: '762 million',
  },
  {
    title: 'Airline pilots',
    question: 'How many active commercial airline pilots were there worldwide in 2025?',
    hints: [
      'There were about 36.4 million scheduled airline flights worldwide in 2024.',
      'About 29,000 commercial aircraft were in service worldwide at the start of 2025.',
    ],
    answer: '382,000',
  },
  {
    title: 'Jewish population',
    question: 'How many Jewish people were there worldwide in 2024?',
    hints: [
      'Around 46% of the world’s Jewish population lives in Israel.',
      'The United States has the second-largest Jewish population, at about 6.3 million.',
    ],
    answer: '15.8 million',
  },
  {
    title: 'US golf courses',
    question: 'How many golf courses were there in the United States at the end of 2025?',
    hints: [
      'More than 29 million Americans played at least one round on a golf course in 2025.',
      'Americans played more than 500 million rounds on golf courses in 2025.',
    ],
    answer: '16,000',
  },
  {
    title: 'Earth’s land share',
    question: 'What percentage of Earth’s surface is land?',
    hints: [
      'The US covers around 1.9% of the Earth’s surface.',
      'The Pacific Ocean alone covers more area than all the land on Earth combined.',
    ],
    answer: '29%',
  },
  {
    title: 'Harris votes',
    question: 'How many people voted for Kamala Harris in the 2024 US presidential election?',
    hints: [
      'Harris won around 9.3 million votes in California alone.',
      'When Trump won the 2016 election, he received just under 63 million votes.',
    ],
    answer: '75 million',
  },
  {
    title: 'Netflix revenue',
    question: 'How much revenue in US dollars did Netflix make in the first half of 2026?',
    hints: [
      'The United States and Canada account for around 43% of Netflix’s revenue.',
      'Netflix passed 325 million paid subscribers at the end of 2025.',
    ],
    answer: '$24.8 billion',
  },
  {
    title: 'Computers sold',
    question: 'How many desktop computers and laptops were sold worldwide in 2025?',
    hints: [
      'About 71.5 million desktop computers and laptops were sold in the US in 2025.',
      'China, India, the Middle East, Turkey and all of Africa combined bought about as many desktops and laptops as the US.',
    ],
    answer: '270 million',
  },
  {
    title: 'Wikipedia articles',
    question: 'How many articles were there in the English Wikipedia as of October 2026?',
    hints: [
      'There are about 2.2 million articles about individual people on English Wikipedia.',
      'About 500 new articles are created on English Wikipedia every day.',
    ],
    answer: '7.25 million',
  },
  {
    title: 'German divorces',
    question: 'How many couples got divorced in Germany in 2025?',
    hints: [
      'Roughly 81% of the marriages formed in 2005 were still intact in 2015.',
      'About 350,000 couples married in Germany in 2025.',
    ],
    answer: '130,000',
  },
  {
    title: 'iPhones sold',
    question: 'How many iPhones has Apple ever sold (up until July 2025)?',
    hints: [
      'In 2024, Apple sold about 232 million iPhones.',
      'The first iPhone launched in June 2007, and about 1.4 million were sold that year.',
    ],
    answer: '3 billion',
  },
  {
    title: 'OpenAI revenue',
    question: 'How much revenue in US dollars did OpenAI make in the first half of 2026?',
    hints: [
      'OpenAI’s revenue for all of 2025 was about $13 billion.',
      'ChatGPT had about 900 million weekly users in early 2026.',
    ],
    answer: '$12.4 billion',
  },
  {
    title: 'US Bible sales',
    question: 'How many Bibles were sold in the United States in 2025?',
    hints: [
      'In 2019, about 9.7 million Bibles were sold in the US.',
      'Bible sales rose 22% in 2024 and another 12% in 2025, reaching a 21-year high.',
    ],
    answer: '19 million',
  },
  {
    title: 'World population 1925',
    question: 'How many people were alive worldwide in 1925?',
    hints: [
      'The US population in 1925 was about 116 million.',
      'India, including today’s Pakistan and Bangladesh, had around 320 million people in 1925.',
    ],
    answer: '1.98 billion',
  },
  {
    title: 'China car production',
    question: 'How many cars were produced in China in 2025?',
    hints: [
      'China exported about 6 million cars in 2025.',
      'China produces more cars than the US, Japan and Germany combined.',
    ],
    answer: '30.3 million',
  },
  {
    title: 'Harry Potter box office',
    question: 'How much revenue in US dollars did the eight Harry Potter films make at the worldwide box office?',
    hints: [
      'The eight films earned $2.39 billion at the US box office.',
      'The final film alone earned $1.34 billion worldwide.',
    ],
    answer: '$7.7 billion',
  },
  {
    title: 'US horses',
    question: 'How many horses were there in the United States in 2023?',
    hints: [
      'The horse population has declined by more than two-thirds since its peak in 1920.',
      'Texas has more horses than any other state, with about 750,000.',
    ],
    answer: '6.7 million',
  },
  {
    title: 'Ford production',
    question: 'How many cars has Ford produced in total from 1903 to the end of 2025?',
    hints: [
      'In 2025, Ford produced a bit more than double the number of cars it did 100 years earlier.',
      'Ford produced around 4.4 million cars in 2025.',
    ],
    answer: '420 million',
  },
  {
    title: 'Louvre visitors',
    question: 'How many visitors did the Louvre Museum have in 2025?',
    hints: [
      'About 23 million tourists from abroad visited Paris and its region in 2025.',
      'The Louvre limits entry to 30,000 visitors a day.',
    ],
    answer: '9 million',
  },
  {
    title: 'MacBooks sold',
    question: 'How many MacBooks were sold worldwide in 2025?',
    hints: [
      'About 36% of Apple’s revenue in 2025 came from the US, and about 16% from China.',
      'Apple’s Mac revenue was about $33 billion in 2025, including desktops like the iMac.',
    ],
    answer: '21.5 million',
  },
  {
    title: 'SF to London, 1910',
    question: 'How many days did the fastest possible journey from San Francisco to London take in 1910?',
    hints: [
      'The straight-line distance between San Francisco and London is 5,354 miles (8,617 km).',
      'In Jules Verne’s Around the World in Eighty Days (1872), the same trip takes 18 days.',
    ],
    answer: '9 days',
  },
];
