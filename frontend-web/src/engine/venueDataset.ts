export interface VenueRecord {
  venue: string;
  city: string;
  stateProvince: string;
  country: string;
}

export const PRESET_VENUES: VenueRecord[] = [
  // Historic & Current Names for Noblesville, IN
  { venue: "Deer Creek Music Center", city: "Noblesville", stateProvince: "Indiana", country: "USA" },
  { venue: "Klipsch Music Center", city: "Noblesville", stateProvince: "Indiana", country: "USA" },
  { venue: "Ruoff Music Center", city: "Noblesville", stateProvince: "Indiana", country: "USA" },
  { venue: "Ruoff Home Mortgage Music Center", city: "Noblesville", stateProvince: "Indiana", country: "USA" },
  { venue: "Verizon Wireless Music Center (Noblesville)", city: "Noblesville", stateProvince: "Indiana", country: "USA" },

  // ICONIC COLORADO VENUES
  { venue: "Red Rocks Amphitheatre", city: "Morrison", stateProvince: "Colorado", country: "USA" },
  { venue: "Dick's Sporting Goods Park", city: "Commerce City", stateProvince: "Colorado", country: "USA" },
  { venue: "Fiddler's Green Amphitheatre", city: "Greenwood Village", stateProvince: "Colorado", country: "USA" },
  { venue: "Boulder Theater", city: "Boulder", stateProvince: "Colorado", country: "USA" },
  { venue: "Macky Auditorium", city: "Boulder", stateProvince: "Colorado", country: "USA" },
  { venue: "The Fillmore Auditorium", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Ogden Theatre", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Gothic Theatre", city: "Englewood", stateProvince: "Colorado", country: "USA" },
  { venue: "Bluebird Theater", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Cervantes' Masterpiece Ballroom", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Paramount Theatre", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Oriental Theater", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Civic Center Park", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Mission Ballroom", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Mishawaka Amphitheatre", city: "Bellvue", stateProvince: "Colorado", country: "USA" },
  { venue: "Planet Bluegrass (Folks Festival)", city: "Lyons", stateProvince: "Colorado", country: "USA" },
  { venue: "1stBank Center", city: "Broomfield", stateProvince: "Colorado", country: "USA" },
  { venue: "Elitch Gardens Arena", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Quixote's True Blue", city: "Denver", stateProvince: "Colorado", country: "USA" },
  { venue: "Bohemian Nights Festival", city: "Fort Collins", stateProvince: "Colorado", country: "USA" },
  { venue: "McNichols Sports Arena", city: "Denver", stateProvince: "Colorado", country: "USA" },

  // INDIANA & MIDWEST VENUES
  { venue: "Market Square Arena", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "Hoosier Dome", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "Murat Theatre", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "Old National Centre (Murat Shrine)", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "Hilton U. Brown Theatre", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "The Vogue", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "World Mardi Gras", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "Military Park (Indy Jazz Fest)", city: "Indianapolis", stateProvince: "Indiana", country: "USA" },
  { venue: "Star Plaza Theatre", city: "Merrillville", stateProvince: "Indiana", country: "USA" },
  { venue: "Bluebird Nightclub", city: "Bloomington", stateProvince: "Indiana", country: "USA" },
  { venue: "Headliners", city: "Muncie", stateProvince: "Indiana", country: "USA" },
  { venue: "Worthen Arena (Ball State)", city: "Muncie", stateProvince: "Indiana", country: "USA" },
  { venue: "Emens Auditorium", city: "Muncie", stateProvince: "Indiana", country: "USA" },

  // NATIONAL AMPHITHEATERS & ARENAS
  { venue: "Buckeye Lake Music Center", city: "Millersport", stateProvince: "Ohio", country: "USA" },
  { venue: "Richfield Coliseum", city: "Richfield", stateProvince: "Ohio", country: "USA" },
  { venue: "Blossom Music Center", city: "Cuyahoga Falls", stateProvince: "Ohio", country: "USA" },
  { venue: "Riverbend Music Center", city: "Cincinnati", stateProvince: "Ohio", country: "USA" },
  { venue: "Hara Arena", city: "Dayton", stateProvince: "Ohio", country: "USA" },
  { venue: "Nutter Center", city: "Dayton", stateProvince: "Ohio", country: "USA" },
  { venue: "Alpine Valley Music Theatre", city: "East Troy", stateProvince: "Wisconsin", country: "USA" },
  { venue: "Rosemont Horizon", city: "Rosemont", stateProvince: "Illinois", country: "USA" },
  { venue: "Soldier Field", city: "Chicago", stateProvince: "Illinois", country: "USA" },
  { venue: "World Music Theatre", city: "Tinley Park", stateProvince: "Illinois", country: "USA" },
  { venue: "Assembly Hall", city: "Champaign", stateProvince: "Illinois", country: "USA" },
  { venue: "Riverport Amphitheater", city: "St. Louis", stateProvince: "Missouri", country: "USA" },
  { venue: "The Palace of Auburn Hills", city: "Auburn Hills", stateProvince: "Michigan", country: "USA" },
  { venue: "Palace Theatre", city: "Louisville", stateProvince: "Kentucky", country: "USA" },
  { venue: "Mud Island Amphitheater", city: "Memphis", stateProvince: "Tennessee", country: "USA" },
  { venue: "Concrete Street Amphitheater", city: "Corpus Christi", stateProvince: "Texas", country: "USA" },
  { venue: "MGM Grand Garden Arena", city: "Las Vegas", stateProvince: "Nevada", country: "USA" },
  { venue: "Fox Theater", city: "Oakland", stateProvince: "California", country: "USA" },
  { venue: "Golden State Theatre", city: "Monterey", stateProvince: "California", country: "USA" },
  { venue: "Greek Theatre (UC Berkeley)", city: "Berkeley", stateProvince: "California", country: "USA" },
  { venue: "Chase Center", city: "San Francisco", stateProvince: "California", country: "USA" },
  { venue: "The Spectrum", city: "Philadelphia", stateProvince: "Pennsylvania", country: "USA" },
  { venue: "Giants Stadium", city: "East Rutherford", stateProvince: "New Jersey", country: "USA" },
  { venue: "Madison Square Garden", city: "New York", stateProvince: "New York", country: "USA" },
];

export function searchVenues(query: string): VenueRecord[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  return PRESET_VENUES.filter(
    v => v.venue.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)
  ).slice(0, 15);
}
