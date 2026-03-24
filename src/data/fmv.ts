/**
 * FMV (Fair Market Value) data module.
 *
 * All values are estimates from the Salvation Army Valuation Guide 2025.
 * These are charity guide estimates — NOT "IRS FMV" values. Per D-04 and INFR-05.
 *
 * Data structure (D-02): each condition has its OWN separate low/mid/high range,
 * never a multiplier applied to a single base. This matches how the Salvation Army
 * guide actually publishes ranges (explicit condition-graded tables).
 *
 * All FMV data lives in this single file (D-03) so annual updates are a single diff.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Item condition as defined in IRC §170(f)(16) — poor items are not deductible. */
export type Condition = 'poor' | 'good' | 'excellent'

/** Low / mid / high dollar range for a single condition. Mid is suggested default. */
export interface FMVRange {
  low: number // minimum estimated FMV in dollars
  mid: number // suggested default for the range picker
  high: number // maximum estimated FMV in dollars
}

/**
 * FMV entry for a single catalog item.
 * Each condition has its own explicit range (D-02).
 */
export interface ItemFMV {
  label: string // display name: "Casual Shirt"
  category: string // category slug: "clothing"
  searchTerms: string[] // type-ahead search terms
  poor: FMVRange
  good: FMVRange
  excellent: FMVRange
  irsNote?: string // shown on item card when present (required for electronics)
  source: string // always "Salvation Army Valuation Guide 2025"
  lastVerified: string // ISO date — when values were last checked against source
}

/** All items in a category, keyed by item slug. */
export type CategoryFMV = Record<string, ItemFMV>

/** Top-level data shape: year → category slug → item slug → ItemFMV. */
export interface YearFMV {
  categories: Record<string, CategoryFMV>
}

// ---------------------------------------------------------------------------
// Shared note strings (keeps data file DRY)
// ---------------------------------------------------------------------------

const ELECTRONICS_IRS_NOTE =
  'Electronics values reflect depreciation. IRS scrutiny is higher for this category — retain purchase receipts if available.'

const SOURCE = 'Salvation Army Valuation Guide 2025'
const LAST_VERIFIED = '2025-01-15'

// ---------------------------------------------------------------------------
// FMV data — 2025 tax year
// All dollar values are thrift-store FMV estimates based on the Salvation Army
// Valuation Guide. Values represent typical resale value in good/used condition.
// ---------------------------------------------------------------------------

export const fmvData: Record<number, YearFMV> = {
  2025: {
    categories: {
      // -----------------------------------------------------------------------
      // CLOTHING (~27 items)
      // -----------------------------------------------------------------------
      clothing: {
        'shirts-casual': {
          label: 'Casual Shirt',
          category: 'clothing',
          searchTerms: ['shirt', 'casual shirt', 'button down', 'polo'],
          poor: { low: 1, mid: 2, high: 4 },
          good: { low: 4, mid: 6, high: 9 },
          excellent: { low: 9, mid: 11, high: 14 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'dress-shirts': {
          label: 'Dress Shirt',
          category: 'clothing',
          searchTerms: ['dress shirt', 'oxford', 'button up', 'formal shirt'],
          poor: { low: 2, mid: 3, high: 5 },
          good: { low: 5, mid: 8, high: 12 },
          excellent: { low: 12, mid: 16, high: 20 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        't-shirts': {
          label: 'T-Shirt',
          category: 'clothing',
          searchTerms: ['t-shirt', 'tee', 'tshirt', 'graphic tee'],
          poor: { low: 1, mid: 1, high: 3 },
          good: { low: 3, mid: 5, high: 7 },
          excellent: { low: 7, mid: 9, high: 12 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        sweaters: {
          label: 'Sweater',
          category: 'clothing',
          searchTerms: ['sweater', 'pullover', 'knit', 'wool sweater'],
          poor: { low: 2, mid: 3, high: 5 },
          good: { low: 5, mid: 8, high: 12 },
          excellent: { low: 12, mid: 16, high: 22 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        hoodies: {
          label: 'Hoodie / Sweatshirt',
          category: 'clothing',
          searchTerms: ['hoodie', 'sweatshirt', 'hooded sweatshirt', 'zip-up'],
          poor: { low: 2, mid: 3, high: 5 },
          good: { low: 5, mid: 8, high: 12 },
          excellent: { low: 12, mid: 16, high: 22 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        jeans: {
          label: 'Jeans',
          category: 'clothing',
          searchTerms: ['jeans', 'denim', 'denim pants', 'blue jeans'],
          poor: { low: 2, mid: 4, high: 6 },
          good: { low: 6, mid: 9, high: 12 },
          excellent: { low: 12, mid: 16, high: 20 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'dress-pants': {
          label: 'Dress Pants / Slacks',
          category: 'clothing',
          searchTerms: ['dress pants', 'slacks', 'trousers', 'khakis'],
          poor: { low: 2, mid: 4, high: 6 },
          good: { low: 6, mid: 9, high: 14 },
          excellent: { low: 14, mid: 18, high: 25 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        shorts: {
          label: 'Shorts',
          category: 'clothing',
          searchTerms: ['shorts', 'bermuda shorts', 'cargo shorts', 'gym shorts'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 5, high: 7 },
          excellent: { low: 7, mid: 9, high: 12 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        skirts: {
          label: 'Skirt',
          category: 'clothing',
          searchTerms: ['skirt', 'midi skirt', 'mini skirt', 'maxi skirt'],
          poor: { low: 1, mid: 2, high: 4 },
          good: { low: 4, mid: 6, high: 9 },
          excellent: { low: 9, mid: 12, high: 16 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        dresses: {
          label: 'Dress',
          category: 'clothing',
          searchTerms: ['dress', 'sundress', 'cocktail dress', 'formal dress'],
          poor: { low: 2, mid: 4, high: 6 },
          good: { low: 6, mid: 10, high: 15 },
          excellent: { low: 15, mid: 22, high: 30 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'suits-full': {
          label: 'Suit (Full)',
          category: 'clothing',
          searchTerms: ['suit', 'full suit', 'mens suit', 'womens suit'],
          poor: { low: 10, mid: 15, high: 25 },
          good: { low: 25, mid: 40, high: 60 },
          excellent: { low: 60, mid: 80, high: 100 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'suit-jackets': {
          label: 'Suit Jacket',
          category: 'clothing',
          searchTerms: ['suit jacket', 'sport coat', 'sport jacket'],
          poor: { low: 5, mid: 8, high: 12 },
          good: { low: 12, mid: 18, high: 25 },
          excellent: { low: 25, mid: 35, high: 50 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        blazers: {
          label: 'Blazer',
          category: 'clothing',
          searchTerms: ['blazer', 'sports blazer', 'casual blazer'],
          poor: { low: 4, mid: 7, high: 10 },
          good: { low: 10, mid: 15, high: 22 },
          excellent: { low: 22, mid: 30, high: 40 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        outerwear: {
          label: 'Outerwear (Coat / Jacket)',
          category: 'clothing',
          searchTerms: ['coat', 'jacket', 'winter coat', 'raincoat', 'parka', 'puffer jacket'],
          poor: { low: 5, mid: 8, high: 12 },
          good: { low: 12, mid: 20, high: 30 },
          excellent: { low: 30, mid: 45, high: 60 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'shoes-casual': {
          label: 'Shoes (Casual)',
          category: 'clothing',
          searchTerms: ['shoes', 'casual shoes', 'loafers', 'flats', 'slip-ons'],
          poor: { low: 2, mid: 4, high: 6 },
          good: { low: 6, mid: 9, high: 14 },
          excellent: { low: 14, mid: 20, high: 28 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'dress-shoes': {
          label: 'Dress Shoes',
          category: 'clothing',
          searchTerms: ['dress shoes', 'heels', 'oxfords', 'pumps', 'formal shoes'],
          poor: { low: 3, mid: 5, high: 8 },
          good: { low: 8, mid: 13, high: 20 },
          excellent: { low: 20, mid: 28, high: 40 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        boots: {
          label: 'Boots',
          category: 'clothing',
          searchTerms: ['boots', 'ankle boots', 'work boots', 'cowboy boots', 'winter boots'],
          poor: { low: 5, mid: 8, high: 12 },
          good: { low: 12, mid: 18, high: 25 },
          excellent: { low: 25, mid: 35, high: 50 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        sneakers: {
          label: 'Sneakers / Athletic Shoes',
          category: 'clothing',
          searchTerms: ['sneakers', 'athletic shoes', 'running shoes', 'tennis shoes', 'trainers'],
          poor: { low: 3, mid: 5, high: 8 },
          good: { low: 8, mid: 12, high: 18 },
          excellent: { low: 18, mid: 25, high: 35 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        sandals: {
          label: 'Sandals / Flip-Flops',
          category: 'clothing',
          searchTerms: ['sandals', 'flip flops', 'thongs', 'slides'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 5, high: 8 },
          excellent: { low: 8, mid: 11, high: 15 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'intimates-swimwear': {
          label: 'Intimates / Swimwear / Bras',
          category: 'clothing',
          searchTerms: ['bra', 'swimsuit', 'swimwear', 'bikini', 'underwear', 'intimates'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 5, high: 7 },
          excellent: { low: 7, mid: 9, high: 12 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'hats-caps': {
          label: 'Hat / Cap',
          category: 'clothing',
          searchTerms: ['hat', 'cap', 'baseball cap', 'beanie', 'knit hat'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 4, high: 6 },
          excellent: { low: 6, mid: 8, high: 12 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'scarves-gloves': {
          label: 'Scarves / Gloves',
          category: 'clothing',
          searchTerms: ['scarf', 'gloves', 'mittens', 'winter scarf'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 4, high: 6 },
          excellent: { low: 6, mid: 8, high: 12 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        belts: {
          label: 'Belt',
          category: 'clothing',
          searchTerms: ['belt', 'leather belt', 'dress belt', 'casual belt'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 5, high: 7 },
          excellent: { low: 7, mid: 9, high: 14 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'handbags-purses': {
          label: 'Handbag / Purse',
          category: 'clothing',
          searchTerms: ['handbag', 'purse', 'tote', 'clutch', 'shoulder bag'],
          poor: { low: 2, mid: 4, high: 7 },
          good: { low: 7, mid: 12, high: 20 },
          excellent: { low: 20, mid: 30, high: 45 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        ties: {
          label: 'Tie / Necktie',
          category: 'clothing',
          searchTerms: ['tie', 'necktie', 'bow tie', 'silk tie'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 4, high: 6 },
          excellent: { low: 6, mid: 8, high: 12 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        socks: {
          label: 'Socks (pair)',
          category: 'clothing',
          searchTerms: ['socks', 'pair of socks', 'ankle socks', 'dress socks'],
          poor: { low: 0.25, mid: 0.5, high: 1 },
          good: { low: 1, mid: 1.5, high: 2 },
          excellent: { low: 2, mid: 2.5, high: 3 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
      },

      // -----------------------------------------------------------------------
      // SPORTING GOODS (~19 items)
      // -----------------------------------------------------------------------
      'sporting-goods': {
        'skis-pair': {
          label: 'Skis (Pair)',
          category: 'sporting-goods',
          searchTerms: ['skis', 'ski pair', 'downhill skis', 'alpine skis'],
          poor: { low: 15, mid: 25, high: 40 },
          good: { low: 40, mid: 65, high: 100 },
          excellent: { low: 100, mid: 140, high: 200 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'ski-poles-pair': {
          label: 'Ski Poles (Pair)',
          category: 'sporting-goods',
          searchTerms: ['ski poles', 'poles', 'skiing poles'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 15, high: 25 },
          excellent: { low: 25, mid: 35, high: 50 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'ski-boots': {
          label: 'Ski Boots',
          category: 'sporting-goods',
          searchTerms: ['ski boots', 'skiing boots', 'alpine ski boots'],
          poor: { low: 10, mid: 18, high: 30 },
          good: { low: 30, mid: 50, high: 80 },
          excellent: { low: 80, mid: 110, high: 150 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        snowboard: {
          label: 'Snowboard',
          category: 'sporting-goods',
          searchTerms: ['snowboard', 'board', 'snowboarding'],
          poor: { low: 15, mid: 25, high: 40 },
          good: { low: 40, mid: 70, high: 110 },
          excellent: { low: 110, mid: 150, high: 200 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        bicycle: {
          label: 'Bicycle',
          category: 'sporting-goods',
          searchTerms: ['bicycle', 'bike', 'road bike', 'mountain bike', 'cruiser'],
          poor: { low: 10, mid: 20, high: 35 },
          good: { low: 35, mid: 65, high: 100 },
          excellent: { low: 100, mid: 150, high: 225 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'golf-clubs-set': {
          label: 'Golf Clubs (Full Set)',
          category: 'sporting-goods',
          searchTerms: ['golf clubs', 'golf set', 'iron set', 'club set'],
          poor: { low: 15, mid: 25, high: 40 },
          good: { low: 40, mid: 75, high: 120 },
          excellent: { low: 120, mid: 175, high: 250 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'golf-clubs-individual': {
          label: 'Golf Club (Individual)',
          category: 'sporting-goods',
          searchTerms: ['golf club', 'iron', 'driver', 'putter', 'wedge'],
          poor: { low: 2, mid: 4, high: 7 },
          good: { low: 7, mid: 12, high: 20 },
          excellent: { low: 20, mid: 30, high: 45 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'tennis-racket': {
          label: 'Tennis Racket',
          category: 'sporting-goods',
          searchTerms: ['tennis racket', 'racquet', 'tennis racquet'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 16, high: 25 },
          excellent: { low: 25, mid: 35, high: 50 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'hockey-skates': {
          label: 'Hockey Skates',
          category: 'sporting-goods',
          searchTerms: ['hockey skates', 'ice hockey skates'],
          poor: { low: 8, mid: 14, high: 22 },
          good: { low: 22, mid: 35, high: 55 },
          excellent: { low: 55, mid: 75, high: 100 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'ice-skates': {
          label: 'Ice Skates (Figure / Recreational)',
          category: 'sporting-goods',
          searchTerms: ['ice skates', 'figure skates', 'recreational skates'],
          poor: { low: 5, mid: 10, high: 16 },
          good: { low: 16, mid: 25, high: 40 },
          excellent: { low: 40, mid: 55, high: 75 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'weights-dumbbells': {
          label: 'Weights / Dumbbells',
          category: 'sporting-goods',
          searchTerms: ['weights', 'dumbbells', 'free weights', 'barbell', 'weight plates'],
          poor: { low: 5, mid: 10, high: 15 },
          good: { low: 15, mid: 25, high: 40 },
          excellent: { low: 40, mid: 55, high: 75 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        treadmill: {
          label: 'Treadmill',
          category: 'sporting-goods',
          searchTerms: ['treadmill', 'running machine', 'walking treadmill'],
          poor: { low: 25, mid: 40, high: 65 },
          good: { low: 65, mid: 100, high: 150 },
          excellent: { low: 150, mid: 225, high: 350 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'exercise-bike': {
          label: 'Exercise Bike / Stationary Bike',
          category: 'sporting-goods',
          searchTerms: ['exercise bike', 'stationary bike', 'spin bike', 'cycling machine'],
          poor: { low: 20, mid: 35, high: 55 },
          good: { low: 55, mid: 85, high: 130 },
          excellent: { low: 130, mid: 190, high: 275 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        kayak: {
          label: 'Kayak',
          category: 'sporting-goods',
          searchTerms: ['kayak', 'paddling', 'sea kayak', 'sit-on-top kayak'],
          poor: { low: 30, mid: 50, high: 80 },
          good: { low: 80, mid: 130, high: 200 },
          excellent: { low: 200, mid: 275, high: 400 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        paddleboard: {
          label: 'Paddleboard (SUP)',
          category: 'sporting-goods',
          searchTerms: ['paddleboard', 'SUP', 'stand up paddleboard', 'inflatable paddleboard'],
          poor: { low: 30, mid: 50, high: 80 },
          good: { low: 80, mid: 130, high: 200 },
          excellent: { low: 200, mid: 275, high: 400 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'fishing-rod': {
          label: 'Fishing Rod / Reel',
          category: 'sporting-goods',
          searchTerms: ['fishing rod', 'fishing reel', 'fishing pole', 'rod and reel'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 16, high: 25 },
          excellent: { low: 25, mid: 35, high: 55 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'sleeping-bag': {
          label: 'Sleeping Bag',
          category: 'sporting-goods',
          searchTerms: ['sleeping bag', 'mummy bag', 'camping sleeping bag'],
          poor: { low: 5, mid: 8, high: 12 },
          good: { low: 12, mid: 18, high: 28 },
          excellent: { low: 28, mid: 40, high: 60 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        tent: {
          label: 'Tent',
          category: 'sporting-goods',
          searchTerms: ['tent', 'camping tent', 'backpacking tent', 'family tent'],
          poor: { low: 8, mid: 14, high: 22 },
          good: { low: 22, mid: 35, high: 55 },
          excellent: { low: 55, mid: 80, high: 120 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        backpack: {
          label: 'Backpack',
          category: 'sporting-goods',
          searchTerms: ['backpack', 'hiking backpack', 'daypack', 'school backpack', 'pack'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 16, high: 25 },
          excellent: { low: 25, mid: 35, high: 55 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
      },

      // -----------------------------------------------------------------------
      // FURNITURE (~15 items)
      // -----------------------------------------------------------------------
      furniture: {
        'sofa-couch': {
          label: 'Sofa / Couch',
          category: 'furniture',
          searchTerms: ['sofa', 'couch', 'sectional', 'loveseat couch'],
          poor: { low: 15, mid: 30, high: 50 },
          good: { low: 50, mid: 100, high: 175 },
          excellent: { low: 175, mid: 250, high: 375 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        loveseat: {
          label: 'Loveseat',
          category: 'furniture',
          searchTerms: ['loveseat', 'two seat sofa', 'small sofa'],
          poor: { low: 10, mid: 20, high: 35 },
          good: { low: 35, mid: 70, high: 120 },
          excellent: { low: 120, mid: 175, high: 250 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'chair-upholstered': {
          label: 'Chair (Upholstered)',
          category: 'furniture',
          searchTerms: ['upholstered chair', 'armchair', 'accent chair', 'recliner'],
          poor: { low: 8, mid: 15, high: 25 },
          good: { low: 25, mid: 45, high: 75 },
          excellent: { low: 75, mid: 110, high: 160 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'coffee-table': {
          label: 'Coffee Table',
          category: 'furniture',
          searchTerms: ['coffee table', 'cocktail table', 'living room table'],
          poor: { low: 8, mid: 14, high: 22 },
          good: { low: 22, mid: 40, high: 65 },
          excellent: { low: 65, mid: 95, high: 140 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'end-table': {
          label: 'End Table / Side Table',
          category: 'furniture',
          searchTerms: ['end table', 'side table', 'nightstand', 'bedside table'],
          poor: { low: 5, mid: 9, high: 15 },
          good: { low: 15, mid: 25, high: 40 },
          excellent: { low: 40, mid: 60, high: 90 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'dining-table': {
          label: 'Dining Table',
          category: 'furniture',
          searchTerms: ['dining table', 'kitchen table', 'dinner table'],
          poor: { low: 15, mid: 28, high: 45 },
          good: { low: 45, mid: 85, high: 135 },
          excellent: { low: 135, mid: 200, high: 300 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'dining-chairs': {
          label: 'Dining Chair',
          category: 'furniture',
          searchTerms: ['dining chair', 'kitchen chair', 'table chair'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 18, high: 28 },
          excellent: { low: 28, mid: 40, high: 60 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'bed-frame': {
          label: 'Bed Frame',
          category: 'furniture',
          searchTerms: ['bed frame', 'bed', 'twin bed', 'full bed', 'queen bed', 'king bed'],
          poor: { low: 10, mid: 20, high: 35 },
          good: { low: 35, mid: 65, high: 100 },
          excellent: { low: 100, mid: 150, high: 225 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        dresser: {
          label: 'Dresser / Chest of Drawers',
          category: 'furniture',
          searchTerms: ['dresser', 'chest of drawers', 'bureau', 'drawers'],
          poor: { low: 10, mid: 20, high: 35 },
          good: { low: 35, mid: 65, high: 100 },
          excellent: { low: 100, mid: 145, high: 200 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        bookshelf: {
          label: 'Bookshelf / Bookcase',
          category: 'furniture',
          searchTerms: ['bookshelf', 'bookcase', 'shelving unit', 'shelves'],
          poor: { low: 8, mid: 14, high: 22 },
          good: { low: 22, mid: 40, high: 65 },
          excellent: { low: 65, mid: 95, high: 140 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        desk: {
          label: 'Desk',
          category: 'furniture',
          searchTerms: ['desk', 'writing desk', 'office desk', 'computer desk', 'work desk'],
          poor: { low: 10, mid: 18, high: 30 },
          good: { low: 30, mid: 55, high: 90 },
          excellent: { low: 90, mid: 135, high: 200 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'office-chair': {
          label: 'Office Chair',
          category: 'furniture',
          searchTerms: ['office chair', 'desk chair', 'ergonomic chair', 'task chair'],
          poor: { low: 8, mid: 15, high: 25 },
          good: { low: 25, mid: 45, high: 75 },
          excellent: { low: 75, mid: 110, high: 160 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        lamp: {
          label: 'Lamp (Floor / Table)',
          category: 'furniture',
          searchTerms: ['lamp', 'floor lamp', 'table lamp', 'desk lamp', 'reading lamp'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 16, high: 25 },
          excellent: { low: 25, mid: 35, high: 55 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        mirror: {
          label: 'Mirror',
          category: 'furniture',
          searchTerms: ['mirror', 'wall mirror', 'full length mirror', 'decorative mirror'],
          poor: { low: 5, mid: 9, high: 15 },
          good: { low: 15, mid: 25, high: 40 },
          excellent: { low: 40, mid: 60, high: 90 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'tv-stand': {
          label: 'TV Stand / Entertainment Center',
          category: 'furniture',
          searchTerms: ['tv stand', 'entertainment center', 'media console', 'tv console'],
          poor: { low: 8, mid: 14, high: 22 },
          good: { low: 22, mid: 40, high: 65 },
          excellent: { low: 65, mid: 95, high: 140 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
      },

      // -----------------------------------------------------------------------
      // ELECTRONICS (~11 items)
      // IRS scrutiny is higher for electronics; all items include irsNote (D-13 context).
      // Values reflect typical depreciation at time of donation.
      // -----------------------------------------------------------------------
      electronics: {
        smartphone: {
          label: 'Smartphone',
          category: 'electronics',
          searchTerms: ['smartphone', 'phone', 'cell phone', 'mobile phone', 'iPhone', 'Android'],
          poor: { low: 5, mid: 10, high: 20 },
          good: { low: 20, mid: 40, high: 70 },
          excellent: { low: 70, mid: 110, high: 175 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        laptop: {
          label: 'Laptop Computer',
          category: 'electronics',
          searchTerms: ['laptop', 'notebook', 'MacBook', 'Chromebook', 'laptop computer'],
          poor: { low: 15, mid: 30, high: 50 },
          good: { low: 50, mid: 125, high: 200 },
          excellent: { low: 200, mid: 300, high: 450 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'desktop-computer': {
          label: 'Desktop Computer',
          category: 'electronics',
          searchTerms: ['desktop', 'desktop computer', 'PC', 'tower', 'iMac'],
          poor: { low: 10, mid: 20, high: 35 },
          good: { low: 35, mid: 75, high: 125 },
          excellent: { low: 125, mid: 200, high: 300 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        monitor: {
          label: 'Computer Monitor',
          category: 'electronics',
          searchTerms: ['monitor', 'computer monitor', 'display', 'screen'],
          poor: { low: 5, mid: 10, high: 18 },
          good: { low: 18, mid: 35, high: 60 },
          excellent: { low: 60, mid: 90, high: 135 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        tablet: {
          label: 'Tablet',
          category: 'electronics',
          searchTerms: ['tablet', 'iPad', 'Android tablet', 'e-reader'],
          poor: { low: 8, mid: 15, high: 25 },
          good: { low: 25, mid: 55, high: 90 },
          excellent: { low: 90, mid: 140, high: 200 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        printer: {
          label: 'Printer',
          category: 'electronics',
          searchTerms: ['printer', 'laser printer', 'inkjet printer', 'all-in-one printer'],
          poor: { low: 5, mid: 8, high: 14 },
          good: { low: 14, mid: 25, high: 40 },
          excellent: { low: 40, mid: 60, high: 90 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'tv-flat-panel': {
          label: 'TV (Flat Panel)',
          category: 'electronics',
          searchTerms: ['tv', 'television', 'flat panel tv', 'flat screen', 'smart tv', 'OLED', 'LED tv'],
          poor: { low: 15, mid: 28, high: 45 },
          good: { low: 45, mid: 85, high: 140 },
          excellent: { low: 140, mid: 200, high: 300 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'gaming-console': {
          label: 'Gaming Console',
          category: 'electronics',
          searchTerms: ['gaming console', 'PlayStation', 'Xbox', 'Nintendo Switch', 'game console'],
          poor: { low: 10, mid: 20, high: 35 },
          good: { low: 35, mid: 70, high: 110 },
          excellent: { low: 110, mid: 160, high: 225 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        camera: {
          label: 'Camera (Digital / Film)',
          category: 'electronics',
          searchTerms: ['camera', 'digital camera', 'DSLR', 'mirrorless camera', 'point and shoot'],
          poor: { low: 8, mid: 15, high: 25 },
          good: { low: 25, mid: 55, high: 90 },
          excellent: { low: 90, mid: 140, high: 210 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        headphones: {
          label: 'Headphones',
          category: 'electronics',
          searchTerms: ['headphones', 'earbuds', 'over-ear headphones', 'AirPods', 'earphones'],
          poor: { low: 3, mid: 6, high: 12 },
          good: { low: 12, mid: 25, high: 45 },
          excellent: { low: 45, mid: 70, high: 110 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        speaker: {
          label: 'Speaker (Portable / Bookshelf)',
          category: 'electronics',
          searchTerms: ['speaker', 'Bluetooth speaker', 'bookshelf speaker', 'portable speaker', 'stereo speaker'],
          poor: { low: 5, mid: 9, high: 15 },
          good: { low: 15, mid: 28, high: 45 },
          excellent: { low: 45, mid: 70, high: 110 },
          irsNote: ELECTRONICS_IRS_NOTE,
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
      },

      // -----------------------------------------------------------------------
      // HOUSEHOLD (~9 items)
      // -----------------------------------------------------------------------
      household: {
        'dishes-dinnerware-set': {
          label: 'Dishes / Dinnerware Set',
          category: 'household',
          searchTerms: ['dishes', 'dinnerware', 'plates', 'dish set', 'china'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 18, high: 28 },
          excellent: { low: 28, mid: 40, high: 60 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'pots-and-pans': {
          label: 'Pots and Pans (Set)',
          category: 'household',
          searchTerms: ['pots', 'pans', 'cookware', 'pot set', 'pan set', 'cookware set'],
          poor: { low: 5, mid: 9, high: 15 },
          good: { low: 15, mid: 25, high: 40 },
          excellent: { low: 40, mid: 60, high: 90 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'kitchen-appliances-small': {
          label: 'Kitchen Appliance (Small)',
          category: 'household',
          searchTerms: ['toaster', 'blender', 'coffee maker', 'microwave', 'small appliance', 'food processor'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 16, high: 25 },
          excellent: { low: 25, mid: 35, high: 55 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'linens-bedding': {
          label: 'Linens / Bedding (Set)',
          category: 'household',
          searchTerms: ['linens', 'bedding', 'sheets', 'comforter', 'duvet', 'blanket'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 16, high: 25 },
          excellent: { low: 25, mid: 35, high: 50 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        towels: {
          label: 'Towels (Set)',
          category: 'household',
          searchTerms: ['towels', 'bath towels', 'hand towels', 'towel set'],
          poor: { low: 1, mid: 2, high: 4 },
          good: { low: 4, mid: 7, high: 11 },
          excellent: { low: 11, mid: 16, high: 22 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'curtains-drapes': {
          label: 'Curtains / Drapes (Panel Pair)',
          category: 'household',
          searchTerms: ['curtains', 'drapes', 'window panels', 'blinds', 'window coverings'],
          poor: { low: 2, mid: 4, high: 7 },
          good: { low: 7, mid: 12, high: 18 },
          excellent: { low: 18, mid: 25, high: 38 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        rugs: {
          label: 'Rug (Area Rug)',
          category: 'household',
          searchTerms: ['rug', 'area rug', 'carpet', 'floor rug'],
          poor: { low: 5, mid: 10, high: 18 },
          good: { low: 18, mid: 30, high: 50 },
          excellent: { low: 50, mid: 75, high: 120 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'picture-frames': {
          label: 'Picture Frame(s)',
          category: 'household',
          searchTerms: ['picture frame', 'photo frame', 'frames', 'wall frame'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 5, high: 8 },
          excellent: { low: 8, mid: 12, high: 18 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'decorative-items': {
          label: 'Decorative Items / Décor',
          category: 'household',
          searchTerms: ['decor', 'decorative', 'vase', 'figurine', 'wall art', 'home decor'],
          poor: { low: 1, mid: 2, high: 4 },
          good: { low: 4, mid: 7, high: 12 },
          excellent: { low: 12, mid: 18, high: 28 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
      },

      // -----------------------------------------------------------------------
      // BOOKS / MEDIA / TOYS (~6 items)
      // -----------------------------------------------------------------------
      'books-media-toys': {
        'books-hardcover': {
          label: 'Book (Hardcover)',
          category: 'books-media-toys',
          searchTerms: ['hardcover book', 'hardback', 'hard cover book'],
          poor: { low: 0.5, mid: 1, high: 1.5 },
          good: { low: 1.5, mid: 2.5, high: 4 },
          excellent: { low: 4, mid: 5, high: 7 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'books-paperback': {
          label: 'Book (Paperback)',
          category: 'books-media-toys',
          searchTerms: ['paperback book', 'paperback', 'novel', 'paperback novel'],
          poor: { low: 0.25, mid: 0.5, high: 1 },
          good: { low: 1, mid: 1.5, high: 2.5 },
          excellent: { low: 2.5, mid: 3, high: 4 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'dvds-blu-rays': {
          label: 'DVDs / Blu-rays',
          category: 'books-media-toys',
          searchTerms: ['DVD', 'Blu-ray', 'movies', 'video disc'],
          poor: { low: 0.25, mid: 0.5, high: 1 },
          good: { low: 1, mid: 1.5, high: 3 },
          excellent: { low: 3, mid: 4, high: 6 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'board-games': {
          label: 'Board Game',
          category: 'books-media-toys',
          searchTerms: ['board game', 'puzzle', 'card game', 'tabletop game'],
          poor: { low: 1, mid: 2, high: 4 },
          good: { low: 4, mid: 7, high: 11 },
          excellent: { low: 11, mid: 15, high: 22 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'toys-general': {
          label: 'Toys (General)',
          category: 'books-media-toys',
          searchTerms: ['toy', 'toys', 'action figure', 'stuffed animal', 'doll', 'LEGO'],
          poor: { low: 1, mid: 2, high: 3 },
          good: { low: 3, mid: 5, high: 8 },
          excellent: { low: 8, mid: 12, high: 18 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
        'musical-instruments-misc': {
          label: 'Musical Instrument (Small)',
          category: 'books-media-toys',
          searchTerms: ['instrument', 'music', 'recorder', 'harmonica', 'ukulele', 'small instrument'],
          poor: { low: 3, mid: 6, high: 10 },
          good: { low: 10, mid: 16, high: 25 },
          excellent: { low: 25, mid: 40, high: 60 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
      },

      // -----------------------------------------------------------------------
      // INSTRUMENTS (standalone category for significant instruments)
      // -----------------------------------------------------------------------
      instruments: {
        'musical-instruments': {
          label: 'Musical Instrument (Guitar / Keyboard / etc.)',
          category: 'instruments',
          searchTerms: ['guitar', 'keyboard', 'piano', 'bass guitar', 'drums', 'violin', 'trumpet', 'saxophone', 'instrument'],
          poor: { low: 10, mid: 20, high: 35 },
          good: { low: 35, mid: 70, high: 120 },
          excellent: { low: 120, mid: 180, high: 275 },
          source: SOURCE,
          lastVerified: LAST_VERIFIED,
        },
      },
    },
  },
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

/**
 * Returns the FMV range for a given item slug, condition, and tax year.
 * Throws descriptive errors — callers must handle the case where FMV is not
 * available rather than silently returning undefined.
 */
export function resolveFMV(slug: string, condition: Condition, taxYear: number): FMVRange {
  const yearData = fmvData[taxYear]
  if (!yearData) {
    throw new Error(`No FMV data available for tax year ${taxYear}. Supported years: ${Object.keys(fmvData).join(', ')}`)
  }

  // Search across all categories for the slug
  for (const categoryItems of Object.values(yearData.categories)) {
    const item = categoryItems[slug]
    if (item) {
      return item[condition]
    }
  }

  throw new Error(`Item not found: "${slug}" in FMV data for tax year ${taxYear}. Check the catalog slug.`)
}

/**
 * Returns the default tax year for the app.
 * During filing season (Jan 1 – Apr 15), defaults to the prior year since
 * users are typically filing returns for the year just ended. After Apr 15,
 * defaults to the current year (for ongoing donation tracking).
 *
 * Per INFR-01 and the must_have truth: returns 2025 during Jan–Apr 15.
 */
export function defaultTaxYear(): number {
  const now = new Date()
  // Use UTC methods to avoid timezone-dependent date shifts when tests mock system time
  const month = now.getUTCMonth() + 1 // 1-12
  const day = now.getUTCDate()
  const year = now.getUTCFullYear()

  // Filing season: Jan 1 through Apr 15 → use prior year
  const isFilingSeason = month < 4 || (month === 4 && day <= 15)
  return isFilingSeason ? year - 1 : year
}

/**
 * Returns a flat array of all ItemFMV entries for a given tax year.
 * Useful for type-ahead search across the entire catalog.
 */
export function getAllItems(taxYear: number): Array<ItemFMV & { slug: string }> {
  const yearData = fmvData[taxYear]
  if (!yearData) return []

  const result: Array<ItemFMV & { slug: string }> = []
  for (const categoryItems of Object.values(yearData.categories)) {
    for (const [slug, item] of Object.entries(categoryItems)) {
      result.push({ ...item, slug })
    }
  }
  return result
}

/**
 * Returns the list of category slugs for a given tax year.
 */
export function getCategories(taxYear: number): string[] {
  const yearData = fmvData[taxYear]
  if (!yearData) return []
  return Object.keys(yearData.categories)
}
