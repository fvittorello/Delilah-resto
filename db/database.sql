DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS orders_has_products;
DROP TABLE IF EXISTS order_status;
DROP TABLE IF EXISTS payment_method;

CREATE TABLE users(
    user_id INT AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    fullname VARCHAR(50) NOT NULL,
    address VARCHAR(250) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    is_disabled BOOLEAN NOT NULL DEFAULT false,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (user_id)
);

CREATE TABLE products(
    product_id INT AUTO_INCREMENT,
    image_url VARCHAR(200) NOT NULL,
    title VARCHAR(50) NOT NULL,
    price FLOAT UNSIGNED NOT NULL,
    prod_description VARCHAR(500),
    is_disabled BOOLEAN NOT NULL DEFAULT false,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (product_id)
);

CREATE TABLE orders(
    order_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    status INT NOT NULL DEFAULT 1,
    payment_method INT(2) NOT NULL,
    order_description VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (status) REFERENCES order_status(status_id),
    FOREIGN KEY (payment_method) REFERENCES payment_method(payment_id)
);

CREATE TABLE orders_has_products(
    orders_has_products_id INT AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_qty INT(4) NOT NULL,
    unit_price FLOAT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (orders_has_products_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE order_status(
    status_id INT AUTO_INCREMENT,
    status VARCHAR(50) NOT NULL DEFAULT 'nuevo',
    PRIMARY KEY (status_id)
);

CREATE TABLE payment_method(
    payment_id INT AUTO_INCREMENT,
    payment_method VARCHAR(50) NOT NULL,
    PRIMARY KEY (payment_id)
);

INSERT INTO users (username, fullname, address, email, password, phone, is_admin) VALUES
('fervitto', 'Fernando Vittorello', 'Calle Falsa 123', 'fvittorello@gmail.com', 'admin', '1555555555', true),
('test', 'test testing', 'Av Luro 1233', 'test@test.com', 'test', '1555555554', false),
('fmercuri', 'Freddy Mercuri', '1 Logan PlKensington, London', 'fmercuri@queen.com', 'eeeooo', '+44 7712345678', false),
('jsmith', 'John Smith', 'TARDIS ST, 4242, Space 453m Gallifrey', 'jsmith@queen.com', 'oooeee', '+44 77213452378', false),
('b-may', 'Brian May', '8236 Bohemian Street, Paddington, London', 'brianmay@queen.com', 'safestpass123', '+44 773219987678', false)
;

INSERT INTO products (image_url, title, price, prod_description) VALUES
('https://via.placeholder.com/500', 'Texas Burguer', 300, 'Hamburguesa con panceta, carne de 200g, queso chedar y cebolla caramelizada'),
('https://via.placeholder.com/500', 'Chicago Burguer', 365, 'Medallón de carne 220g a la parrilla, queso cheddar, tomate, lechuga y pepinos agridulces con ketchup ahumado.'),
('https://via.placeholder.com/500', 'Porteña Burguer', 370, 'Medallón de carne 220g a la parrilla, jamón, queso, huevo a la plancha y salsa de mayo-chími.'),
('https://via.placeholder.com/500', 'Veggie Burguer', 350, 'Hamburguesa de garbanzos, guacamole, tomate, lechuga y cebolla morada.'),
('https://via.placeholder.com/500', 'Crispy Burguer', 340, 'Medallón de carne 220g a la parrilla, queso mozzarella, cebolla crispy, tomates asados, lechuga y salsa ranch.')
;

INSERT INTO order_status (status) VALUES
    ('nuevo'), ('confirmado'), ('preparando'), ('enviando'), ('entregado'), ('cancelado')
;

INSERT INTO payment_method (payment_method) VALUES 
    ('efectivo'), ('tarjeta de credito')
;

INSERT INTO orders (user_id, status, payment_method) VALUES 
(4, 3, 1),
(3, 2, 2),
(2, 1, 1)
;

INSERT INTO orders_has_products (order_id, product_id, product_qty, unit_price) VALUES
(1, 1, 2, 300),
(1, 2, 1, 365),
(2, 4, 1, 350),
(3, 1, 1, 200),
(3, 3, 1, 200),
(3, 4, 1, 200)
;