// Grid categories for rows and columns
export const generateDailyGrid = () => {
  // Fixed grid with no conflicting categories
  // Rule: If rows have a tier, columns should NOT have a tier
  return {
    rows: [
      { id: 'row1', label: 'Lakers', type: 'team' },
      { id: 'row2', label: 'Warriors', type: 'team' },
      { id: 'row3', label: 'Legendary', type: 'tier' }
    ],
    columns: [
      { id: 'col1', label: 'Celtics', type: 'team' },
      { id: 'col2', label: 'Heat', type: 'team' },
      { id: 'col3', label: '2023-24', type: 'season' }
    ]
  };
};

// All available categories for random grid generation
export const allCategories = {
  teams: [
    'Lakers', 'Warriors', 'Celtics', 'Mavericks', 'Bucks',
    '76ers', 'Nuggets', 'Suns', 'Heat', 'Nets',
    'Clippers', 'Hawks', 'Cavaliers', 'Pelicans',
    'Grizzlies', 'Thunder', 'Bulls', 'Raptors', 'Spurs'
  ],
  tiers: ['Common', 'Rare', 'Legendary'],
  seasons: ['2020-21', '2021-22', '2022-23', '2023-24']
};

// Generate a random grid with valid (non-conflicting) categories
export const generateRandomGrid = () => {
  const teams = [...allCategories.teams];
  const tiers = [...allCategories.tiers];
  const seasons = [...allCategories.seasons];

  // Shuffle arrays
  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  shuffle(teams);
  shuffle(tiers);
  shuffle(seasons);

  // Randomly decide: tier in rows or columns (not both)
  const tierInRows = Math.random() > 0.5;

  let rowCategories, colCategories;

  if (tierInRows) {
    // Rows: 2 teams + 1 tier
    // Columns: 2 teams + 1 season (NO tier to avoid conflicts)
    rowCategories = [
      { label: teams[0], type: 'team' },
      { label: teams[1], type: 'team' },
      { label: tiers[0], type: 'tier' }
    ];
    colCategories = [
      { label: teams[2], type: 'team' },
      { label: teams[3], type: 'team' },
      { label: seasons[0], type: 'season' }
    ];
  } else {
    // Rows: 2 teams + 1 season
    // Columns: 2 teams + 1 tier (NO season conflict)
    rowCategories = [
      { label: teams[0], type: 'team' },
      { label: teams[1], type: 'team' },
      { label: seasons[0], type: 'season' }
    ];
    colCategories = [
      { label: teams[2], type: 'team' },
      { label: teams[3], type: 'team' },
      { label: tiers[0], type: 'tier' }
    ];
  }

  return {
    rows: rowCategories.map((cat, i) => ({ id: `row${i+1}`, ...cat })),
    columns: colCategories.map((cat, i) => ({ id: `col${i+1}`, ...cat }))
  };
};
