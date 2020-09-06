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
    payment_type INT NOT NULL,
    date DATETIME NOT NULL,
    order_description VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (status) REFERENCES order_status(status_id),
    FOREIGN KEY (payment_type) REFERENCES payment_method(payment_id)
);

CREATE TABLE orders_has_products(
    orders_has_products_id INT AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_amount INT NOT NULL,
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
    method VARCHAR(50) NOT NULL,
    PRIMARY KEY (payment_id)
);

INSERT INTO users (username, fullname, address, email, password, phone, is_admin, is_disabled, created_at) VALUES
('fervitto', 'Fernando Vittorello', 'Calle Falsa 123', 'fvittorello@gmail.com', 'admin', '1555555555', true, false, '2020-07-11 20:04:00'),
('test', 'test testing', 'Av Luro 1233', 'test@test.com', '123', '1555555554', false, false, '2020-07-11 20:04:00');

INSERT INTO products (image_url, title, price, prod_description, is_disabled, created_at) VALUES
('https://via.placeholder.com/500', 'Hamburguesa con bacon', 300, 'Hamburguesa con panceta, carne de 200g, queso chedar y cebolla caramelizada', false, '2020-07-11 20:04:00');

INSERT INTO order_status (status) VALUES
    ('nuevo'), ('confirmado'), ('preparando'), ('enviando'), ('entregado'), ('cancelado')
;

INSERT INTO payment_method (method) VALUES 
    ('efectivo'), ('tarjeta de credito')
;