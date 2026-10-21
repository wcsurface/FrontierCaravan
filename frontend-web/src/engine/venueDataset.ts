export interface VenueRecord {
  venue: string;
  city: string;
  stateProvince: string;
  country: string;
}

export const PRESET_VENUES: VenueRecord[] = [
  // Historic & Current Names for Noblesville, IN
  { venue: "Deer Creek Music Center", city: "Noblesville", stateProvince: "IN", country: "USA" },
  { venue: "Klipsch Music Center", city: "Noblesville", stateProvince: "IN", country: "USA" },
  { venue: "Ruoff Music Center", city: "Noblesville", stateProvince: "IN", country: "USA" },
  { venue: "Ruoff Home Mortgage Music Center", city: "Noblesville", stateProvince: "IN", country: "USA" },
  { venue: "Verizon Wireless Music Center (Noblesville)", city: "Noblesville", stateProvince: "IN", country: "USA" },

  // ICONIC COLORADO VENUES
  { venue: "Red Rocks Amphitheatre", city: "Morrison", stateProvince: "CO", country: "USA" },
  { venue: "Dick's Sporting Goods Park", city: "Commerce City", stateProvince: "CO", country: "USA" },
  { venue: "Fiddler's Green Amphitheatre", city: "Greenwood Village", stateProvince: "CO", country: "USA" },
  { venue: "Boulder Theater", city: "Boulder", stateProvince: "CO", country: "USA" },
  { venue: "Macky Auditorium", city: "Boulder", stateProvince: "CO", country: "USA" },
  { venue: "The Fillmore Auditorium", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Ogden Theatre", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Gothic Theatre", city: "Englewood", stateProvince: "CO", country: "USA" },
  { venue: "Bluebird Theater", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Cervantes' Masterpiece Ballroom", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Paramount Theatre", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Oriental Theater", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Civic Center Park", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Mission Ballroom", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Mishawaka Amphitheatre", city: "Bellvue", stateProvince: "CO", country: "USA" },
  { venue: "Planet Bluegrass (Folks Festival)", city: "Lyons", stateProvince: "CO", country: "USA" },
  { venue: "1stBank Center", city: "Broomfield", stateProvince: "CO", country: "USA" },
  { venue: "Elitch Gardens Arena", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Quixote's True Blue", city: "Denver", stateProvince: "CO", country: "USA" },
  { venue: "Bohemian Nights Festival", city: "Fort Collins", stateProvince: "CO", country: "USA" },
  { venue: "McNichols Sports Arena", city: "Denver", stateProvince: "CO", country: "USA" },

  // INDIANA & MIDWEST VENUES
  { venue: "Market Square Arena", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "Hoosier Dome", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "Murat Theatre", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "Old National Centre (Murat Shrine)", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "Hilton U. Brown Theatre", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "The Vogue", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "World Mardi Gras", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "Military Park (Indy Jazz Fest)", city: "Indianapolis", stateProvince: "IN", country: "USA" },
  { venue: "Star Plaza Theatre", city: "Merrillville", stateProvince: "IN", country: "USA" },
  { venue: "Bluebird Nightclub", city: "Bloomington", stateProvince: "IN", country: "USA" },
  { venue: "Headliners", city: "Muncie", stateProvince: "IN", country: "USA" },
  { venue: "Worthen Arena (Ball State)", city: "Muncie", stateProvince: "IN", country: "USA" },
  { venue: "Emens Auditorium", city: "Muncie", stateProvince: "IN", country: "USA" },

  // NATIONAL AMPHITHEATERS & ARENAS
  { venue: "Buckeye Lake Music Center", city: "Millersport", stateProvince: "OH", country: "USA" },
  { venue: "Richfield Coliseum", city: "Richfield", stateProvince: "OH", country: "USA" },
  { venue: "Blossom Music Center", city: "Cuyahoga Falls", stateProvince: "OH", country: "USA" },
  { venue: "Riverbend Music Center", city: "Cincinnati", stateProvince: "OH", country: "USA" },
  { venue: "Hara Arena", city: "Dayton", stateProvince: "OH", country: "USA" },
  { venue: "Nutter Center", city: "Dayton", stateProvince: "OH", country: "USA" },
  { venue: "Alpine Valley Music Theatre", city: "East Troy", stateProvince: "WI", country: "USA" },
  { venue: "Rosemont Horizon", city: "Rosemont", stateProvince: "IL", country: "USA" },
  { venue: "Soldier Field", city: "Chicago", stateProvince: "IL", country: "USA" },
  { venue: "World Music Theatre", city: "Tinley Park", stateProvince: "IL", country: "USA" },
  { venue: "Assembly Hall", city: "Champaign", stateProvince: "IL", country: "USA" },
  { venue: "Riverport Amphitheater", city: "St. Louis", stateProvince: "MO", country: "USA" },
  { venue: "The Palace of Auburn Hills", city: "Auburn Hills", stateProvince: "MI", country: "USA" },
  { venue: "Palace Theatre", city: "Louisville", stateProvince: "KY", country: "USA" },
  { venue: "Mud Island Amphitheater", city: "Memphis", stateProvince: "TN", country: "USA" },
  { venue: "Concrete Street Amphitheater", city: "Corpus Christi", stateProvince: "TX", country: "USA" },
  { venue: "MGM Grand Garden Arena", city: "Las Vegas", stateProvince: "NV", country: "USA" },
  { venue: "Fox Theater", city: "Oakland", stateProvince: "CA", country: "USA" },
  { venue: "Golden State Theatre", city: "Monterey", stateProvince: "CA", country: "USA" },
  { venue: "Greek Theatre (UC Berkeley)", city: "Berkeley", stateProvince: "CA", country: "USA" },
  { venue: "Chase Center", city: "San Francisco", stateProvince: "CA", country: "USA" },
  { venue: "The Spectrum", city: "Philadelphia", stateProvince: "PA", country: "USA" },
  { venue: "Giants Stadium", city: "East Rutherford", stateProvince: "NJ", country: "USA" },
  { venue: "Madison Square Garden", city: "New York", stateProvince: "NY", country: "USA" },
];

export function searchVenues(query: string): VenueRecord[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  return PRESET_VENUES.filter(
    v => v.venue.toLowerCase().includes(q) || v.city.toLowerCase().includes(q)
  ).slice(0, 15);
}
