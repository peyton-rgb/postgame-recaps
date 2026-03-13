export interface Shoot {
  slug: string;
  parade: string;
  city: string;
  state: string;
  date: string;
  paradeStartTime: string;
  arrivalTime: string;
  videographer: string;
  phone: string;
  startingAddress: string;
  website: string;
  type: "parade" | "river-dyeing";
  contentFolder: string;
  canesContact?: string;
  canesPhone?: string;
}

export const shoots: Shoot[] = [
  {
    slug: "philadelphia",
    parade: "The 2026 Philadelphia St. Patrick's Day Parade",
    city: "Philadelphia",
    state: "PA",
    date: "Sunday, March 15, 2026",
    paradeStartTime: "11:00 AM",
    arrivalTime: "10:30 AM",
    videographer: "Trey T.",
    phone: "(607) 793-2153",
    startingAddress: "16th Street and JFK Boulevard",
    website: "https://phillyparade.com",
    type: "parade",
    contentFolder: "https://drive.google.com/drive/folders/1x7SrOIsi1J2TB5dvHAJYUs5v3Z16ph9u",
    canesContact: "Kevin Matthews",
    canesPhone: "(484) 695-1696",
  },
  {
    slug: "pittsburgh",
    parade: "Pittsburgh St. Patrick's Day Parade",
    city: "Pittsburgh",
    state: "PA",
    date: "Saturday, March 14, 2026",
    paradeStartTime: "10:00 AM",
    arrivalTime: "9:30 AM",
    videographer: "Josh V.",
    phone: "(727) 272-7647",
    startingAddress:
      "Greyhound Bus Station at the intersection of Liberty Avenue and 11th Street",
    website: "https://pittsburghstpatricksdayparade.com",
    type: "parade",
    contentFolder: "https://drive.google.com/drive/folders/1a9z9MEnKfvEbr92ItfdFWkWFKu_QmtR5",
    canesContact: "Nicole McKinley",
    canesPhone: "(412) 600-2962",
  },
  {
    slug: "dallas",
    parade: "Dallas St. Patrick's Day Parade & Festival",
    city: "Dallas",
    state: "TX",
    date: "Saturday, March 14, 2026",
    paradeStartTime: "11:00 AM",
    arrivalTime: "10:30 AM",
    videographer: "Homero A.",
    phone: "(210) 389-7737",
    startingAddress: "St. Patrick's Day Parade (Lower Greenville)",
    website: "https://www.dallasstpp.com/",
    type: "parade",
    contentFolder: "https://drive.google.com/drive/folders/11YPElIg4Iqmiq63wlfS7pvCVqA0RwSqg",
    canesContact: "Kelsey Thompson",
    canesPhone: "(972) 365-3187",
  },
  {
    slug: "denver",
    parade: "Denver St. Patrick's Day Parade",
    city: "Denver",
    state: "CO",
    date: "Saturday, March 14, 2026",
    paradeStartTime: "9:30 AM",
    arrivalTime: "9:00 AM",
    videographer: "Akeem B.",
    phone: "",
    startingAddress: "Coors Field Parking Lots",
    website: "https://www.denverstpatricksdayparade.com/",
    type: "parade",
    contentFolder: "https://drive.google.com/drive/folders/1Qa2oqbXcmtYdxDuHifYd-DJSXtpK8OXz",
    canesContact: "Brittny Thompson",
    canesPhone: "(719) 369-4420",
  },
  {
    slug: "phoenix",
    parade: "The 43rd Annual St. Patrick's Day Parade & Faire",
    city: "Phoenix",
    state: "AZ",
    date: "Saturday, March 14, 2026",
    paradeStartTime: "10:00 AM",
    arrivalTime: "9:30 AM",
    videographer: "Junior C.",
    phone: "(360) 888-6078",
    startingAddress:
      "The route goes down 3rd Street from Oak St. to Margaret T Hance Park",
    website: "https://stpatricksdayphoenix.org/",
    type: "parade",
    contentFolder: "https://drive.google.com/drive/folders/1BEYIGsh81Skoxb9BlYAfZbu92Iemdqyb",
    canesContact: "Kim Bastien",
    canesPhone: "(262) 565-8868",
  },
  {
    slug: "baton-rouge",
    parade: "Wearin' of the Green St. Patrick's Day Parade & Faire",
    city: "Baton Rouge",
    state: "LA",
    date: "Saturday, March 14, 2026",
    paradeStartTime: "11:00 AM",
    arrivalTime: "10:30 AM",
    videographer: "Gavin A.",
    phone: "(210) 748-6599",
    startingAddress: "Begins at Hundred Oaks Blvd and South Acadian Thruway",
    website: "https://wearinofthegreen.com/",
    type: "parade",
    contentFolder: "https://drive.google.com/drive/folders/1lSq_h5kPHlGa4VA3lNC59z1r48AIlJVs",
    canesContact: "Erin Credo",
    canesPhone: "(225) 328-2161",
  },
  {
    slug: "chicago",
    parade: "Chicago River Dyeing",
    city: "Chicago",
    state: "IL",
    date: "Saturday, March 14, 2026",
    paradeStartTime: "10:00 AM",
    arrivalTime: "9:30 AM",
    videographer: "Lars P.",
    phone: "(847) 767-5256",
    startingAddress:
      "Chicago River between State and Columbus (Cane's is not participating in a parade — capturing river dyeing content only)",
    website:
      "https://www.choosechicago.com/articles/holidays/st-patricks-day-chicago/",
    type: "river-dyeing",
    contentFolder: "https://drive.google.com/drive/folders/1PEaAVychr4_qPN6RPZ5ErCTXwT7ZvgDB",
  },
];

export function getShoot(slug: string): Shoot | undefined {
  return shoots.find((s) => s.slug === slug);
}
