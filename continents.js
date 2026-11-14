// Hangi ülke hangi kıtada? Bir ülkenin rengini değiştirmek için adını başka listeye taşı.
const CONTINENTS = {
  "africa": [
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon",
    "Central African Rep.", "Chad", "Congo", "Dem. Rep. Congo", "Côte d'Ivoire", "Ivory Coast",
    "Djibouti", "Egypt", "Eq. Guinea", "Eritrea", "eSwatini", "Swaziland", "Ethiopia", "Gabon",
    "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya",
    "Madagascar", "Malawi", "Mali", "Mauritania", "Morocco", "Mozambique", "Namibia", "Niger",
    "Nigeria", "Rwanda", "Senegal", "Sierra Leone", "Somalia", "Somaliland", "South Africa",
    "S. Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "W. Sahara", "Zambia", "Zimbabwe"
  ],
  "europe": [
    "Albania", "Austria", "Belarus", "Belgium", "Bosnia and Herz.", "Bulgaria", "Croatia",
    "Czechia", "Czech Rep.", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
    "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Lithuania", "Luxembourg",
    "Moldova", "Montenegro", "Netherlands", "North Macedonia", "Macedonia", "Norway", "Poland",
    "Portugal", "Romania", "Russia", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden",
    "Switzerland", "Ukraine", "United Kingdom"
  ],
  "asia": [
    "Afghanistan", "Armenia", "Azerbaijan", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China",
    "Cyprus", "N. Cyprus", "Georgia", "India", "Indonesia", "Iran", "Iraq", "Israel", "Japan",
    "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Mongolia",
    "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar",
    "Saudi Arabia", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand",
    "Timor-Leste", "Turkey", "Türkiye", "Turkmenistan", "United Arab Emirates", "Uzbekistan",
    "Vietnam", "Yemen"
  ],
  "north-america": [
    "Bahamas", "Belize", "Canada", "Costa Rica", "Cuba", "Dominican Rep.", "El Salvador",
    "Greenland", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama",
    "Puerto Rico", "Trinidad and Tobago", "United States of America"
  ],
  "south-america": [
    "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Falkland Is.", "Guyana",
    "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"
  ],
  "oceania": [
    "Australia", "Fiji", "New Caledonia", "New Zealand", "Papua New Guinea", "Solomon Is.", "Vanuatu"
  ],
  "antarctica": [
    "Antarctica", "Fr. S. Antarctic Lands"
  ]
};

// Üstteki listeyi ülke adından kıtaya giden bir tabloya çevirir
const CONTINENT_OF = {};
Object.keys(CONTINENTS).forEach(continent => {
  CONTINENTS[continent].forEach(country => { CONTINENT_OF[country] = continent; });
});