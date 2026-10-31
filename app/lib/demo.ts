// Ten synthetic households for demos and tests. Emails use the reserved example.test domain; nothing here is a real person.
type M = { first_name: string; birth_year: number; veteran?: boolean; disabled?: boolean };
export type Demo = {
  n: number; relationship: "self" | "family" | "caseworker"; county: string; city: string; sponsor: boolean; share?: boolean;
  members: M[]; answers: Record<string, unknown>;
};

const A = (o: Record<string, unknown>) => ({
  tenure: "rent", housing_cost: 900, subsidized: "no", inc_social_security: 0, inc_ssi: 0, inc_pension: 0, inc_wages: 0, inc_other: 0,
  asset_bank: 500, asset_other: 0, exp_electric: 100, exp_heat: 40, exp_water: 80, exp_phone_internet: 60, exp_medical: 90,
  medicare: "yes", part_d: "yes", medicaid: "no", existing_benefits: [] as string[], ...o,
});

export const DEMOS: Demo[] = [
  { n: 1, relationship: "self", county: "Pierce", city: "Tacoma", sponsor: true, share: true, members: [{ first_name: "Ruth", birth_year: 1950 }], answers: A({ inc_social_security: 1400, asset_bank: 800 }) },
  { n: 2, relationship: "family", county: "Pierce", city: "Tacoma", sponsor: true, share: true, members: [{ first_name: "Harold", birth_year: 1947 }, { first_name: "Bea", birth_year: 1949 }], answers: A({ tenure: "own", housing_cost: 0, inc_social_security: 2200, inc_pension: 300, asset_bank: 9000 }) },
  { n: 3, relationship: "self", county: "King", city: "Seattle", sponsor: true, members: [{ first_name: "Maria", birth_year: 1958 }], answers: A({ inc_social_security: 1150, asset_bank: 2000 }) },
  { n: 4, relationship: "caseworker", county: "Pierce", city: "Tacoma", sponsor: true, members: [{ first_name: "Walter", birth_year: 1943, veteran: true }], answers: A({ tenure: "own", housing_cost: 0, inc_social_security: 1900, inc_pension: 300, asset_bank: 4000 }) },
  { n: 5, relationship: "self", county: "Pierce", city: "Lakewood", sponsor: true, members: [{ first_name: "Dolores", birth_year: 1954 }], answers: A({ inc_ssi: 970, medicaid: "yes", existing_benefits: ["apple_health"] }) },
  { n: 6, relationship: "family", county: "Spokane", city: "Spokane", sponsor: true, members: [{ first_name: "James", birth_year: 1960, disabled: true }], answers: A({ inc_social_security: 1500, medicare: "no", asset_bank: 1200 }) },
  { n: 7, relationship: "self", county: "Pierce", city: "Tacoma", sponsor: true, members: [{ first_name: "Ellen", birth_year: 1945 }], answers: A({ inc_social_security: 1300 }) },
  { n: 8, relationship: "self", county: "King", city: "Seattle", sponsor: true, members: [{ first_name: "Carl", birth_year: 1952 }, { first_name: "Joan", birth_year: 1955 }], answers: A({ inc_social_security: 2600, asset_bank: 12000 }) },
  { n: 9, relationship: "self", county: "Pierce", city: "Tacoma", sponsor: true, members: [{ first_name: "Nora", birth_year: 1956 }], answers: A({ inc_social_security: 1250 }) },
  { n: 10, relationship: "family", county: "King", city: "Federal Way", sponsor: false, members: [{ first_name: "Frank", birth_year: 1949 }], answers: A({ inc_social_security: 1500, asset_bank: 3000 }) },
];
