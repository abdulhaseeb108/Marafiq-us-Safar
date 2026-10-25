import {
  Users, Route as RouteIcon, Building2, Bus, Car, ScrollText, Moon, Compass, FileText, Plane,
} from "lucide-react";

export const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const WHATSAPP_NUMBER = "923000000000";
export const JSON_H = { "Content-Type": "application/json" };
export const EMPTY_HOTELS = { makkah: [], madinah: [] };
export const FIRST_DAY = "2026-10-06";
export const LAST_DAY = "2027-01-31";

export const STEPS = [
  "Travel details",
  "Makkah hotel",
  "Madinah hotel",
  "Route",
  "Transport & ziyarat",
  "Summary",
];
export const ROOMS = [
  ["sharing", "Sharing", "Shared room, per person"],
  [1, "Private", "Private room for one guest"],
  [4, "Quad", "4 per room"],
  [3, "Triple", "3 per room"],
  [2, "Double", "2 per room"],
  [5, "Quint", "5 per room · rate on request"],
];
export const ROOM_NAME = { sharing: "Sharing", 1: "Private", 2: "Double", 3: "Triple", 4: "Quad", 5: "Quint" };
export const DEPARTURE_CITIES = [
  "Abbottabad", "Ahmadpur East", "Akora Khattak", "Arifwala", "Astore", "Attock",
  "Awaran", "Badin", "Bagh", "Bahawalnagar", "Bahawalpur", "Bannu", "Barkhan",
  "Batkhela", "Bhakkar", "Bhalwal", "Bhera", "Bhimber", "Burewala", "Chakwal",
  "Chaman", "Charsadda", "Chichawatni", "Chilas", "Chiniot", "Chishtian",
  "Chitral", "Dadu", "Daharki", "Daska", "Dera Ghazi Khan", "Dera Ismail Khan",
  "Dina", "Duki", "Faisalabad", "Gahkuch", "Ghotki", "Gilgit", "Gojra",
  "Gujar Khan", "Gujranwala", "Gujrat", "Gwadar", "Hafizabad", "Hangu",
  "Haripur", "Haroonabad", "Hasilpur", "Hattian Bala", "Hub", "Hyderabad",
  "Islamabad", "Jacobabad", "Jaranwala", "Jhang", "Jhelum", "Jiwani",
  "Kalat", "Kamalia", "Kamoke", "Karachi", "Karak", "Kasur", "Khanewal",
  "Kharian", "Khairpur", "Khaplu", "Khushab", "Khuzdar", "Kohat", "Kot Addu",
  "Kotli", "Kotri", "Lahore", "Lakki Marwat", "Larkana", "Layyah", "Lodhran",
  "Loralai", "Mandi Bahauddin", "Mansehra", "Mardan", "Mastung", "Matiari",
  "Mehrabpur", "Mian Channu", "Mianwali", "Mingora", "Mirpur", "Mirpur Khas",
  "Moro", "Multan", "Muzaffarabad", "Muzaffargarh", "Nankana Sahib", "Narowal",
  "Naushahro Feroze", "Nawabshah", "Nowshera", "Nushki", "Okara", "Ormara",
  "Pakpattan", "Palandri", "Panjgur", "Parachinar", "Pasni", "Pasrur", "Pattoki",
  "Peshawar", "Pindi Bhattian", "Pishin", "Quetta", "Rahim Yar Khan", "Rajanpur",
  "Rawalakot", "Rawalpindi", "Renala Khurd", "Rohri", "Sadiqabad", "Sahiwal",
  "Sambrial", "Samundri", "Sanghar", "Sargodha", "Sehwan Sharif", "Shahkot",
  "Shakargarh", "Sheikhupura", "Shikarpur", "Shigar", "Shorkot", "Sialkot",
  "Sibi", "Skardu", "Sohbatpur", "Sukkur", "Swabi", "Tando Adam",
  "Tando Allahyar", "Tando Muhammad Khan", "Tank", "Thatta", "Timergara",
  "Toba Tek Singh", "Turbat", "Umerkot", "Uthal", "Vehari", "Wana",
  "Wazirabad", "Zhob", "Ziarat",
  "Ahmedpur Sial", "Aliabad", "Alipur", "Alipur Chatha", "Amangarh",
  "Athmuqam", "Athara Hazari", "Badah", "Basirpur", "Battagram", "Bhara Kahu",
  "Buner", "Chachro", "Chak Jhumra", "Chak Saida", "Chakdara", "Chamber",
  "Chichawatni", "Choa Saidan Shah", "Chuhar Kana", "Dadu", "Daggar",
  "Dalbandin", "Danyore", "Dargai", "Darya Khan", "Daulatpur", "Daud Khel",
  "Depalpur", "Dera Allah Yar", "Dera Bugti", "Dera Murad Jamali", "Dhadar",
  "Dijkot", "Diplo", "Dunyapur", "Eminabad", "Fateh Jang", "Fatehpur",
  "Fort Abbas", "Ganda Singh Wala", "Garhi Khairo", "Ghauspur", "Gharo",
  "Gupis", "Hala", "Harnai", "Havelian", "Hazro", "Hujra Shah Muqeem",
  "Islamkot", "Jampur", "Jand", "Jandiala Sher Khan", "Jam Sahib", "Jamshoro",
  "Jati", "Jatoi", "Jhudo", "Kabirwala", "Kacha Khuh", "Kalatuk",
  "Kamber Ali Khan", "Kanganpur", "Keti Bandar", "Khairpur Nathan Shah",
  "Khanpur", "Kharan", "Khipro", "Kohlu", "Kot Chutta", "Kot Momin",
  "Kot Mithan", "Kot Radha Kishan", "Kot Samaba", "Kotla Arab Ali Khan",
  "Kumb", "Kunjah", "Lalamusa", "Lalian", "Lawa", "Lower Dir", "Mach",
  "Mailsi", "Malakwal", "Mankera", "Matli", "Matiari", "Mithi", "Murree",
  "Narang Mandi", "Naukot", "Nok Kundi", "Nowshera Virkan", "Pabbi",
  "Paharpur", "Pano Aqil", "Piplan", "Pindi Gheb", "Qadirpur Rawan",
  "Qila Didar Singh", "Qila Saifullah", "Risalpur", "Rojhan", "Sajawal",
  "Samahni", "Saro", "Shabqadar", "Shah Bandar", "Shahdadkot",
  "Shahdadpur", "Shahpur Saddar", "Shergarh", "Sillanwali", "Sinjhoro",
  "Sost", "Sui", "Sujawal", "Takht-i-Bahi", "Talagang", "Tando Bago",
  "Tando Jam", "Tangi", "Taunsa Sharif", "Taxila", "Thari Mirwah",
  "Ubauro", "Usta Muhammad", "Wah Cantonment", "Washuk", "Yasin", "Zafarwal",
  "Other",
].filter((city, index, cities) => cities.indexOf(city) === index)
  .sort((a, b) => a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b));
export const BOOKING_TABS = [
  { id: "umrah", label: "Umrah", icon: <Moon aria-hidden="true" /> },
  { id: "hajj", label: "Hajj", icon: <Users aria-hidden="true" /> },
  { id: "tours", label: "Tours", icon: <Compass aria-hidden="true" /> },
  { id: "visa", label: "Visa", icon: <FileText aria-hidden="true" /> },
  { id: "flights", label: "Flights", icon: <Plane aria-hidden="true" /> },
];
export const DURATION_OPTIONS = [7, 10, 14, 21];
export const TRANSPORTS = [
  { id: "bus", name: "Sharing bus", priceSar: { min: 575, max: 700 }, note: "Price depends on group size", text: "" },
  { id: "private", name: "Full private transport", price: "Quoted by our team", text: "Every leg in your own vehicle. " },
  { id: "partial", name: "Partial private transport", price: "Quoted by our team", text: "Airport transfers by shared bus." },
];
export const ROUTES = {
  route1: {
    order: ["makkah", "madinah"], land: "Jeddah", home: "Jeddah",
    title: "Route 1", text: "Jeddah → Makkah → Madinah → Jeddah",
  },
  route2: {
    order: ["madinah", "makkah"], land: "Jeddah", home: "Jeddah",
    title: "Route 1", text: "Madinah → Makkah → Jeddah",
    stops: ["Madinah", "Makkah", "Jeddah"],
  },
  route3: {
    order: ["makkah", "madinah", "makkah"], land: "Jeddah", home: "Jeddah",
    title: "Route 2", text: "Jeddah → Makkah → Madinah → Makkah → Jeddah",
    stops: ["Jeddah", "Makkah", "Madinah", "Makkah", "Jeddah"],
  },
  route4: {
    order: ["makkah", "madinah", "makkah"], land: "Jeddah", home: "Jeddah",
    title: "Route 4", text: "Jeddah → Makkah → Madinah → Makkah → Jeddah airport",
  },
  custom: {
    order: ["makkah", "madinah"], land: "Jeddah", home: "Jeddah",
    title: "Custom Route", text: "Enter your preferred itinerary.",
  },
};
export const CITY = { makkah: "Makkah", madinah: "Madinah" };
export const STEP_ICONS = [
  <Users key="s1" aria-hidden="true" />,
  <Building2 key="s2" aria-hidden="true" />,
  <Building2 key="s3" aria-hidden="true" />,
  <RouteIcon key="s4" aria-hidden="true" />,
  <Car key="s5" aria-hidden="true" />,
  <ScrollText key="s6" aria-hidden="true" />,
];
export const TRANSPORT_ICONS = {
  bus: <Bus aria-hidden="true" />,
  private: <Car aria-hidden="true" />,
  partial: <RouteIcon aria-hidden="true" />,
};
export const PLACES = ["Turkey", "UAE (Dubai)", "Malaysia", "Thailand", "Azerbaijan", "Egypt", "Jordan", "Maldives", "United Kingdom"];
export const TRIP_TYPES = ["Family holiday", "Honeymoon", "Religious / ziyarat tour", "Group tour", "Business travel", "Other"];
export const SERVICES = ["Flights", "Hotels", "Visa assistance", "Airport transfers", "Tours & activities", "Travel insurance"];
export const NEEDS = ["Halal food", "Prayer facilities nearby", "Family-friendly / privacy", "Wheelchair or mobility support"];
