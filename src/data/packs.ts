import type { WordPack } from '../types';

export const WORD_PACKS: WordPack[] = [
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🐘',
    words: [
      'Elephant', 'Giraffe', 'Penguin', 'Kangaroo', 'Octopus', 'Dolphin', 'Monkey',
      'Lion', 'Tiger', 'Zebra', 'Koala', 'Panda', 'Cheetah', 'Crocodile', 'Flamingo',
      'Owl', 'Frog', 'Rabbit', 'Squirrel', 'Turtle', 'Camel', 'Gorilla', 'Peacock',
      'Hedgehog', 'Bat', 'Snail', 'Chicken', 'Duck', 'Horse', 'Bear', 'Shark',
      'Butterfly', 'Spider', 'Snake', 'Kitten', 'Puppy', 'Goldfish', 'Parrot', 'Sloth',
    ],
  },
  {
    id: 'foods',
    name: 'Foods',
    emoji: '🍕',
    words: [
      'Pizza', 'Ice Cream', 'Spaghetti', 'Hamburger', 'Popcorn', 'Pancakes', 'Watermelon',
      'Banana', 'Hot Dog', 'Cupcake', 'Donut', 'French Fries', 'Taco', 'Sandwich',
      'Cheese', 'Pretzel', 'Cookie', 'Pineapple', 'Strawberry', 'Corn on the Cob',
      'Sushi', 'Waffle', 'Peanut Butter', 'Egg', 'Soup', 'Birthday Cake', 'Lollipop',
      'Apple Pie', 'Grapes', 'Carrot', 'Broccoli', 'Milkshake', 'Marshmallow', 'Bacon',
      'Cereal', 'Chocolate Bar', 'Lemonade', 'Nachos',
    ],
  },
  {
    id: 'animals-farm',
    name: 'On the Farm',
    emoji: '🐄',
    words: [
      'Cow', 'Pig', 'Sheep', 'Rooster', 'Goat', 'Tractor', 'Scarecrow', 'Barn',
      'Haystack', 'Farmer', 'Donkey', 'Turkey', 'Beehive', 'Windmill', 'Wheelbarrow',
      'Pitchfork', 'Milking a Cow', 'Feeding Chickens', 'Sunflower', 'Pumpkin Patch',
    ],
  },
  {
    id: 'movies-shows',
    name: 'Movies & Shows',
    emoji: '🎬',
    words: [
      'Superhero', 'Pirate', 'Dinosaur', 'Robot', 'Astronaut', 'Wizard', 'Princess',
      'Dragon', 'Ninja', 'Mermaid', 'Vampire', 'Ghost', 'Alien', 'Cowboy', 'Knight',
      'Cartoon Character', 'Movie Popcorn', 'Superhero Cape', 'Magic Wand', 'Treasure Map',
      'Villain', 'Sidekick', 'Time Traveler', 'Secret Agent', 'Fairy',
    ],
  },
  {
    id: 'sports',
    name: 'Sports & Games',
    emoji: '⚽',
    words: [
      'Soccer', 'Basketball', 'Baseball', 'Swimming', 'Bowling', 'Skateboarding',
      'Tennis', 'Golf', 'Gymnastics', 'Karate', 'Ice Skating', 'Surfing', 'Boxing',
      'Volleyball', 'Football', 'Hockey', 'Jump Rope', 'Hopscotch', 'Tag', 'Hide and Seek',
      'Tug of War', 'Dodgeball', 'Racing', 'Fishing', 'Archery', 'Trampoline',
    ],
  },
  {
    id: 'jobs',
    name: 'Jobs & Helpers',
    emoji: '👩‍🚒',
    words: [
      'Firefighter', 'Doctor', 'Teacher', 'Police Officer', 'Chef', 'Astronaut',
      'Veterinarian', 'Dentist', 'Mail Carrier', 'Pilot', 'Farmer', 'Artist',
      'Musician', 'Scientist', 'Librarian', 'Builder', 'Baker', 'Zookeeper',
      'Photographer', 'Lifeguard', 'Bus Driver', 'Gardener', 'Nurse', 'Coach',
    ],
  },
  {
    id: 'nature-weather',
    name: 'Nature & Weather',
    emoji: '🌈',
    words: [
      'Rainbow', 'Thunderstorm', 'Snowman', 'Volcano', 'Waterfall', 'Tornado',
      'Sunrise', 'Rain Puddle', 'Lightning', 'Campfire', 'Mountain', 'Desert',
      'Ocean Wave', 'Cloud', 'Snowflake', 'Earthquake', 'Beach', 'Forest',
      'Cave', 'Iceberg', 'Shooting Star', 'Windy Day', 'Foggy Morning',
    ],
  },
  {
    id: 'school-everyday',
    name: 'School & Everyday',
    emoji: '🎒',
    words: [
      'Brushing Teeth', 'Riding a Bike', 'Reading a Book', 'Tying Shoes', 'Homework',
      'Recess', 'School Bus', 'Backpack', 'Alarm Clock', 'Sleeping', 'Sneezing',
      'Laughing', 'Crying', 'Yawning', 'Dancing', 'Singing', 'Jumping on a Trampoline',
      'Blowing Bubbles', 'Flying a Kite', 'Building a Sandcastle', 'Painting',
      'Playing Video Games', 'Taking a Bath', 'Making a Bed',
    ],
  },
  {
    id: 'holidays',
    name: 'Holidays & Celebrations',
    emoji: '🎉',
    words: [
      'Birthday Party', 'Santa Claus', 'Easter Bunny', 'Fireworks', 'Trick or Treat',
      'Turkey Dinner', 'Christmas Tree', 'Jack-o-Lantern', 'Valentine Heart',
      'New Year Countdown', 'Present', 'Balloon', 'Birthday Candles', 'Parade',
      'Snowball Fight', 'Costume', 'Piñata', 'Fourth of July',
    ],
  },
  {
    id: 'transportation',
    name: 'Transportation',
    emoji: '🚀',
    words: [
      'Airplane', 'Rocket Ship', 'Fire Truck', 'Submarine', 'Hot Air Balloon',
      'Train', 'Helicopter', 'Sailboat', 'Race Car', 'Motorcycle', 'Skateboard',
      'Scooter', 'School Bus', 'Garbage Truck', 'Ambulance', 'Bicycle', 'Canoe',
      'Tractor', 'Spaceship', 'Roller Skates',
    ],
  },
];

export function getPackById(id: string): WordPack | undefined {
  return WORD_PACKS.find((p) => p.id === id);
}

export function getAllWordsFromPacks(
  packIds: string[],
  disabledWords: Record<string, string[]>,
): string[] {
  const words: string[] = [];
  for (const packId of packIds) {
    const pack = getPackById(packId);
    if (!pack) continue;
    const disabled = new Set(disabledWords[packId] ?? []);
    for (const word of pack.words) {
      if (!disabled.has(word)) words.push(word);
    }
  }
  if (words.length === 0) {
    // Everything selected got disabled — fall back to the full list so the game never stalls.
    for (const packId of packIds) {
      const pack = getPackById(packId);
      if (pack) words.push(...pack.words);
    }
  }
  return words;
}
