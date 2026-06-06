USE ecommerce;

-- Seed products across 5 categories: Electronics, Clothing, Home & Garden, Sports, Books

-- Electronics (6 products)
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Wireless Bluetooth Headphones', 'Premium noise-cancelling headphones with 30-hour battery life', 89.99, 'https://picsum.photos/seed/headphones/400/400', 'Electronics', 45),
('4K Smart TV 55 inch', 'Ultra HD smart television with HDR and built-in streaming apps', 499.99, 'https://picsum.photos/seed/smarttv/400/400', 'Electronics', 20),
('Laptop Stand Aluminum', 'Ergonomic laptop stand with adjustable height and cooling design', 34.99, 'https://picsum.photos/seed/laptopstand/400/400', 'Electronics', 78),
('Wireless Gaming Mouse', 'High-precision gaming mouse with RGB lighting and programmable buttons', 59.99, 'https://picsum.photos/seed/gamingmouse/400/400', 'Electronics', 62),
('USB-C Hub 7-in-1', 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader', 39.99, 'https://picsum.photos/seed/usbhub/400/400', 'Electronics', 95),
('Portable Power Bank 20000mAh', 'Fast-charging power bank with dual USB ports and LED display', 29.99, 'https://picsum.photos/seed/powerbank/400/400', 'Electronics', 120);

-- Clothing (6 products)
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Classic Cotton T-Shirt', 'Comfortable 100% cotton t-shirt available in multiple colors', 19.99, 'https://picsum.photos/seed/tshirt/400/400', 'Clothing', 150),
('Denim Jeans Slim Fit', 'Premium denim jeans with stretch fabric for comfort', 49.99, 'https://picsum.photos/seed/jeans/400/400', 'Clothing', 85),
('Winter Puffer Jacket', 'Warm insulated jacket with water-resistant outer shell', 89.99, 'https://picsum.photos/seed/jacket/400/400', 'Clothing', 42),
('Running Sneakers', 'Lightweight athletic shoes with cushioned sole and breathable mesh', 69.99, 'https://picsum.photos/seed/sneakers/400/400', 'Clothing', 67),
('Wool Blend Sweater', 'Cozy pullover sweater perfect for cold weather', 44.99, 'https://picsum.photos/seed/sweater/400/400', 'Clothing', 55),
('Baseball Cap', 'Adjustable cotton baseball cap with embroidered logo', 14.99, 'https://picsum.photos/seed/cap/400/400', 'Clothing', 200);

-- Home & Garden (6 products)
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Ceramic Plant Pot Set', 'Set of 3 decorative ceramic pots with drainage holes', 24.99, 'https://picsum.photos/seed/plantpot/400/400', 'Home & Garden', 88),
('LED Desk Lamp', 'Adjustable LED lamp with touch control and USB charging port', 32.99, 'https://picsum.photos/seed/desklamp/400/400', 'Home & Garden', 72),
('Memory Foam Pillow', 'Ergonomic pillow with cooling gel and washable cover', 39.99, 'https://picsum.photos/seed/pillow/400/400', 'Home & Garden', 95),
('Stainless Steel Cookware Set', '10-piece non-stick cookware set with glass lids', 129.99, 'https://picsum.photos/seed/cookware/400/400', 'Home & Garden', 35),
('Indoor Herb Garden Kit', 'Complete kit for growing herbs indoors with LED grow light', 54.99, 'https://picsum.photos/seed/herbgarden/400/400', 'Home & Garden', 48),
('Bamboo Cutting Board', 'Large eco-friendly cutting board with juice groove', 22.99, 'https://picsum.photos/seed/cuttingboard/400/400', 'Home & Garden', 110);

-- Sports (4 products)
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Yoga Mat Premium', 'Extra-thick non-slip yoga mat with carrying strap', 29.99, 'https://picsum.photos/seed/yogamat/400/400', 'Sports', 125),
('Adjustable Dumbbells Set', 'Space-saving adjustable dumbbells 5-25 lbs per hand', 149.99, 'https://picsum.photos/seed/dumbbells/400/400', 'Sports', 28),
('Resistance Bands Set', 'Set of 5 resistance bands with different strength levels', 19.99, 'https://picsum.photos/seed/resistancebands/400/400', 'Sports', 156),
('Water Bottle Insulated', 'Stainless steel water bottle keeps drinks cold for 24 hours', 24.99, 'https://picsum.photos/seed/waterbottle/400/400', 'Sports', 180);

-- Books (5 products)
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('The Art of Programming', 'Comprehensive guide to software development best practices', 44.99, 'https://picsum.photos/seed/programmingbook/400/400', 'Books', 65),
('Mindfulness and Meditation', 'Practical guide to developing a daily meditation practice', 16.99, 'https://picsum.photos/seed/meditationbook/400/400', 'Books', 92),
('World History Encyclopedia', 'Illustrated encyclopedia covering 5000 years of human history', 59.99, 'https://picsum.photos/seed/historybook/400/400', 'Books', 38),
('Healthy Cooking Made Easy', 'Collection of 200 nutritious and delicious recipes', 29.99, 'https://picsum.photos/seed/cookingbook/400/400', 'Books', 74),
('Science Fiction Anthology', 'Collection of award-winning short stories from top sci-fi authors', 19.99, 'https://picsum.photos/seed/scifibook/400/400', 'Books', 105);
