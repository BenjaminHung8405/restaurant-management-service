// Tự động sinh bởi generateMock.js

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export const mockCategories: Category[] = [
  {
    "id": 1,
    "name": "Beef",
    "description": "Beef is the culinary name for meat from cattle, particularly skeletal muscle. Hu..."
  },
  {
    "id": 2,
    "name": "Chicken",
    "description": "Chicken is a type of domesticated fowl, a subspecies of the red junglefowl. It i..."
  },
  {
    "id": 3,
    "name": "Dessert",
    "description": "Dessert is a course that concludes a meal. The course usually consists of sweet..."
  },
  {
    "id": 4,
    "name": "Lamb",
    "description": "Lamb, hogget, and mutton are the meat of domestic sheep (species Ovis aries) at..."
  },
  {
    "id": 5,
    "name": "Miscellaneous",
    "description": "General foods that don't fit into another category"
  },
  {
    "id": 6,
    "name": "Pasta",
    "description": "Pasta is a staple food of traditional Italian cuisine, with the first reference..."
  }
];

export const mockMenuItems: MenuItem[] = [
  {
    "id": 1,
    "categoryId": 6,
    "name": "Baba Ghanoush",
    "description": "Preheat an outdoor grill for medium-high heat and lightly oil the grate. Prick the surface of the sk...",
    "price": 55000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/dlmh401760524897.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 2,
    "categoryId": 6,
    "name": "Baingan Bharta",
    "description": "Rinse the baingan (eggplant or aubergine) in water. Pat dry with a kitchen napkin. Apply some oil al...",
    "price": 60000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/urtpqw1487341253.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 3,
    "categoryId": 4,
    "name": "Baked salmon with fennel & tomatoes",
    "description": "Heat oven to 180C/fan 160C/gas 4. Trim the fronds from the fennel and set aside. Cut the fennel bulb...",
    "price": 185000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/1548772327.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 4,
    "categoryId": 3,
    "name": "Bakewell tart",
    "description": "To make the pastry, measure the flour into a bowl and rub in the butter with your fingertips until t...",
    "price": 145000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/wyrqqq1468233628.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 5,
    "categoryId": 3,
    "name": "Baklava with spiced nuts, ricotta & chocolate",
    "description": "step 1\r\nFirst, make the syrup. Tip the sugar into a large saucepan with 650ml water. Stir over a low...",
    "price": 80000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/ytme8t1764111401.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 6,
    "categoryId": 3,
    "name": "Banana Pancakes",
    "description": "In a bowl, mash the banana with a fork until it resembles a thick purée. Stir in the eggs, baking po...",
    "price": 205000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/sywswr1511383814.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 7,
    "categoryId": 4,
    "name": "Bang bang prawn salad",
    "description": "step 1\r\nCook the noodles following pack instructions, then rinse under cold water and drain thorough...",
    "price": 230000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/4xcfai1763765676.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 8,
    "categoryId": 2,
    "name": "Barbecue pork buns",
    "description": "step 1\r\nHeat the oven to 200C/fan 180C/gas. Mix the sugar into the bread mix in a large bowl, then a...",
    "price": 215000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/tzsy461763769901.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 9,
    "categoryId": 3,
    "name": "Barramundi with Moroccan spices",
    "description": "step 1\r\nTip all the dressing ingredients into a food processor with a pinch of salt and blitz to a d...",
    "price": 220000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/4o4wh11761848573.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 10,
    "categoryId": 3,
    "name": "Battenberg Cake",
    "description": "Heat oven to 180C/160C fan/gas 4 and line the base and sides of a 20cm square tin with baking parchm...",
    "price": 235000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/ywwrsp1511720277.jpg/preview",
    "isAvailable": false
  },
  {
    "id": 11,
    "categoryId": 1,
    "name": "BBQ Pork Sloppy Joes",
    "description": "1\r\n\r\nPreheat oven to 450 degrees. Wash and dry all produce. Cut sweet potatoes into ½-inch-thick wed...",
    "price": 55000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/atd5sh1583188467.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 12,
    "categoryId": 5,
    "name": "Bean & Sausage Hotpot",
    "description": "In a large casserole, fry the sausages until brown all over – about 10 mins.\r\n\r\nAdd the tomato sauce...",
    "price": 80000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/vxuyrx1511302687.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 13,
    "categoryId": 3,
    "name": "BeaverTails",
    "description": "In the bowl of a stand mixer, add warm water, a big pinch of sugar and yeast. Allow to sit until fro...",
    "price": 185000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/ryppsv1511815505.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 14,
    "categoryId": 1,
    "name": "Beef and Broccoli Stir-Fry",
    "description": "Marinate the beef:\r\nStir together the beef marinade ingredients (1 teaspoon soy sauce, 1 teaspoon Ch...",
    "price": 115000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/m0p0j81765568742.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 15,
    "categoryId": 1,
    "name": "Beef and Mustard Pie",
    "description": "Preheat the oven to 150C/300F/Gas 2.\r\nToss the beef and flour together in a bowl with some salt and...",
    "price": 240000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 16,
    "categoryId": 1,
    "name": "Beef and Oyster pie",
    "description": "Season the beef cubes with salt and black pepper. Heat a tablespoon of oil in the frying pan and fry...",
    "price": 210000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/wrssvt1511556563.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 17,
    "categoryId": 1,
    "name": "Beef Asado",
    "description": "0.\tCombine beef, crushed peppercorn, soy sauce, vinegar, dried bay leaves, lemon, and tomato sauce....",
    "price": 130000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/pkopc31683207947.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 18,
    "categoryId": 1,
    "name": "Beef Banh Mi Bowls with Sriracha Mayo, Carrot & Pickled Cucumber",
    "description": "Add'l ingredients: mayonnaise, siracha\r\n\r\n1\r\n\r\nPlace rice in a fine-mesh sieve and rinse until water...",
    "price": 115000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/z0ageb1583189517.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 19,
    "categoryId": 1,
    "name": "Beef Bourguignon",
    "description": "Heat a large casserole pan and add 1 tbsp goose fat. Season the beef and fry until golden brown, abo...",
    "price": 130000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/vtqxtu1511784197.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 20,
    "categoryId": 1,
    "name": "Beef Brisket Pot Roast",
    "description": "1 Prepare the brisket for cooking: On one side of the brisket there should be a layer of fat, which...",
    "price": 225000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/ursuup1487348423.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 21,
    "categoryId": 1,
    "name": "Beef Caldereta",
    "description": "0.\tHeat oil in a cooking pot. Saute onion and garlic until onion softens\r\n1.\tAdd beef. Saute until t...",
    "price": 195000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/41cxjh1683207682.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 22,
    "categoryId": 1,
    "name": "Beef Dumpling Stew",
    "description": "Preheat the oven to 180C/350F/Gas 4.\r\n\r\nFor the beef stew, heat the oil and butter in an ovenproof c...",
    "price": 175000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/uyqrrv1511553350.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 23,
    "categoryId": 1,
    "name": "Beef Empanadas",
    "description": "For the dough place lard, warm water and salt in a large kneading bowl and stir. Add flour and orega...",
    "price": 175000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/dxpc7j1764370714.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 24,
    "categoryId": 1,
    "name": "Beef Lo Mein",
    "description": "STEP 1 - MARINATING THE BEEF\r\nIn a bowl, add the beef, salt, 1 pinch white pepper, 1 Teaspoon sesame...",
    "price": 140000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/1529444830.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 25,
    "categoryId": 1,
    "name": "Beef Mandi",
    "description": "1. Wash the beef and cut into large pieces. Season lightly with salt and turmeric.\r\n2. Heat ghee/oil...",
    "price": 165000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/1nalo51765188375.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 26,
    "categoryId": 1,
    "name": "Beef Mechado",
    "description": "0.\tMake the beef tenderloin marinade by combining soy sauce, vinegar, ginger, garlic, sesame oil, ol...",
    "price": 65000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/cgl60b1683206581.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 27,
    "categoryId": 1,
    "name": "Beef pho",
    "description": "step 1\r\nTip the beef stock along with 500ml of water into a large saucepan. Sit the onion and ginger...",
    "price": 155000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/pbzcrx1763765096.jpg/preview",
    "isAvailable": false
  },
  {
    "id": 28,
    "categoryId": 1,
    "name": "Beef Rendang",
    "description": "Chop the spice paste ingredients and then blend it in a food processor until fine.\r\nHeat the oil in...",
    "price": 150000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/bc8v651619789840.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 29,
    "categoryId": 1,
    "name": "Beef stroganoff",
    "description": "Heat the olive oil in a non-stick frying pan then add the sliced onion and cook on a medium heat unt...",
    "price": 95000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/svprys1511176755.jpg/preview",
    "isAvailable": true
  },
  {
    "id": 30,
    "categoryId": 1,
    "name": "Beef Sunday Roast",
    "description": "Cook the Broccoli and Carrots in a pan of boiling water until tender.\r\n\r\nRoast the Beef and Potatoes...",
    "price": 95000,
    "imageUrl": "https://www.themealdb.com/images/media/meals/ssrrrs1503664277.jpg/preview",
    "isAvailable": true
  }
];
