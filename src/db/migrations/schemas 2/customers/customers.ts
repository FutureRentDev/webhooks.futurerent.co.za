import { Knex } from "knex";

export const customerSchema = (table: Knex.CreateTableBuilder) => {
  table.increments("id").primary();

  table.enu("type", ["individual", "company"]).nullable();

  table
    .enu("status", [
      "Applicant",
      "Active",
      "Cancelled",
      "Rejected",
      "Restricted",
      "Staff",
    ])
    .nullable();

  table.string("account_name", 255).nullable();
  table.string("password", 255).nullable();

  table.enu("title", ["Mr", "Mrs", "Ms"]).nullable();
  table.enu("married_status", ["single", "married"]).nullable();
  table.string("first_name", 255).nullable();
  table.string("middle_name", 255).nullable();
  table.string("last_name", 255).nullable();

  table.string("email", 255).nullable().unique();
  table.string("mobile", 255).nullable();
  table.string("home_no", 255).nullable();
  table.string("work_no", 255).nullable();
  table.string("co_reg_no", 255).nullable();

  table.enu("identification_type", ["ID", "Passport"]).nullable();

  table.string("identification_no", 255).nullable().unique();

  table
    .enu("citizenship_country", [
      "Afghanistan",
      "Albania",
      "Algeria",
      "Andorra",
      "Angola",
      "Antigua and Barbuda",
      "Argentina",
      "Armenia",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas",
      "Bahrain",
      "Bangladesh",
      "Barbados",
      "Belarus",
      "Belgium",
      "Belize",
      "Benin",
      "Bhutan",
      "Bolivia",
      "Bosnia and Herzegovina",
      "Botswana",
      "Brazil",
      "Brunei",
      "Bulgaria",
      "Burkina Faso",
      "Burundi",
      "Cabo Verde",
      "Cambodia",
      "Cameroon",
      "Canada",
      "Central African Republic",
      "Chad",
      "Chile",
      "China",
      "Colombia",
      "Comoros",
      "Congo",
      "Congo (Republic)",
      "Costa Rica",
      "Croatia",
      "Cuba",
      "Cyprus",
      "Czechia",
      "Denmark",
      "Djibouti",
      "Dominica",
      "Dominican Republic",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Equatorial Guinea",
      "Eritrea",
      "Estonia",
      "Eswatini",
      "Ethiopia",
      "Fiji",
      "Finland",
      "France",
      "Gabon",
      "Gambia",
      "Georgia",
      "Germany",
      "Ghana",
      "Greece",
      "Grenada",
      "Guatemala",
      "Guinea",
      "Guinea-Bissau",
      "Guyana",
      "Haiti",
      "Honduras",
      "Hungary",
      "Iceland",
      "India",
      "Indonesia",
      "Iran",
      "Iraq",
      "Ireland",
      "Israel",
      "Italy",
      "Jamaica",
      "Japan",
      "Jordan",
      "Kazakhstan",
      "Kenya",
      "Kiribati",
      "Korea (North)",
      "Korea (South)",
      "Kuwait",
      "Kyrgyzstan",
      "Laos",
      "Latvia",
      "Lebanon",
      "Lesotho",
      "Liberia",
      "Libya",
      "Liechtenstein",
      "Lithuania",
      "Luxembourg",
      "Madagascar",
      "Malawi",
      "Malaysia",
      "Maldives",
      "Mali",
      "Malta",
      "Marshall Islands",
      "Mauritania",
      "Mauritius",
      "Mexico",
      "Micronesia",
      "Moldova",
      "Monaco",
      "Mongolia",
      "Montenegro",
      "Morocco",
      "Mozambique",
      "Myanmar",
      "Namibia",
      "Nauru",
      "Nepal",
      "Netherlands",
      "New Zealand",
      "Nicaragua",
      "Niger",
      "Nigeria",
      "North Macedonia",
      "Norway",
      "Oman",
      "Pakistan",
      "Palau",
      "Panama",
      "Papua New Guinea",
      "Paraguay",
      "Peru",
      "Philippines",
      "Poland",
      "Portugal",
      "Qatar",
      "Romania",
      "Russia",
      "Rwanda",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Vincent and the Grenadines",
      "Samoa",
      "San Marino",
      "Sao Tome and Principe",
      "Saudi Arabia",
      "Senegal",
      "Serbia",
      "Seychelles",
      "Sierra Leone",
      "Singapore",
      "Slovakia",
      "Slovenia",
      "Solomon Islands",
      "Somalia",
      "South Africa",
      "South Sudan",
      "Spain",
      "Sri Lanka",
      "Sudan",
      "Suriname",
      "Sweden",
      "Switzerland",
      "Syria",
      "Taiwan",
      "Tajikistan",
      "Tanzania",
      "Thailand",
      "Timor-Leste",
      "Togo",
      "Tonga",
      "Trinidad and Tobago",
      "Tunisia",
      "Turkey",
      "Turkmenistan",
      "Tuvalu",
      "Uganda",
      "Ukraine",
      "United Arab Emirates",
      "United Kingdom",
      "United States",
      "Uruguay",
      "Uzbekistan",
      "Vanuatu",
      "Vatican City",
      "Venezuela",
      "Vietnam",
      "Yemen",
      "Zambia",
      "Zimbabwe",
    ])
    .nullable();

  table
    .enu("ethnic_group", ["white", "coloured", "black", "asian", "indian"])
    .nullable();

  table.date("date_of_birth").nullable();

  table.enu("gender", ["male", "female"]).nullable();

  table.string("vat_no", 255).nullable();
  table.string("address_1", 255).nullable();
  table.string("address_2", 255).nullable();
  table.string("suburb", 255).nullable();
  table.string("city", 255).nullable();

  table
    .enu("province", [
      "Western Cape",
      "Eastern Cape",
      "Northern Cape",
      "KwaZulu-Natal",
      "Free State",
      "North West",
      "Gauteng",
      "Mpumalanga",
      "Limpopo",
    ])
    .nullable();

  table.integer("salary_day").nullable();
  table.check("salary_day >= 1 AND salary_day <= 31");

  table.string("file_identification", 1000).nullable();
  table.string("file_drivers", 1000).nullable();
  table.string("file_registration", 1000).nullable();

  table.string("xero_contact_id", 255).nullable();

  table.string("additional_contact_name", 255).nullable();

  table
    .enu("add_contact_type", [
      "Mother",
      "Father",
      "Parent",
      "Son",
      "Daughter",
      "Brother",
      "Sister",
      "Child",
      "Friend",
      "Spouse",
      "Partner",
      "Assistant",
      "Manager",
      "Other",
    ])
    .nullable();

  table.string("emergency_contact", 255).nullable();

  table
    .enu("emergency_contact_type", [
      "Mother",
      "Father",
      "Parent",
      "Son",
      "Daughter",
      "Brother",
      "Sister",
      "Child",
      "Friend",
      "Spouse",
      "Partner",
      "Assistant",
      "Manager",
      "Other",
    ])
    .nullable();

  table.string("add_contact_mobile", 15).nullable();
  table.string("emergency_mobile", 15).nullable();

  table.boolean("isDeleted").notNullable().defaultTo(false);
  table.timestamps(true, true);
};
