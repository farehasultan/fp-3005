DROP TABLE IF EXISTS book CASCADE;
DROP Table IF EXISTS users CASCADE;
DROP TABLE IF EXISTS shipping CASCADE;
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
create table book
    (
        ISBN numeric(17,0) not null,
        title varchar(50),
        author varchar(50),
        price numeric(4,2) not null,
        year numeric(4,0),
        category varchar(50),
        publisher varchar(30) not null,
        place varchar(50),
        rating float(2),
        format varchar(10),
        length int,
        stock int,
        image varchar(200),
        percentage numeric(4,2) not null,
        primary key (ISBN)
    );

create table billing
    (
        id varchar(25) not null,
        street_number numeric(4,0),
        street_name varchar (20),
        city varchar (20),
        province varchar(20),
        country varchar (20),
        postal_code varchar(7),
        primary key (id)

    );

create table shipping
    (
        id varchar(25) not null,
        street_number numeric(4,0),
        street_name varchar (20),
        city varchar (20),
        province varchar(20),
        country varchar (20),
        postal_code varchar(7),
        primary key (id)

    );
create table users
    (username varchar(25) not null,
    password varchar(15) not null,
    admin boolean,
    name varchar(20),
    email varchar(50),
    billing_address varchar(25),
    shipping_address varchar(25),
    primary key (username),
    foreign key (billing_address) references billing on delete cascade,
	foreign key (shipping_address) references shipping on delete cascade
    );
create table orders
    (order_id numeric(25) not null,
    user_id varchar(25) not null,
    status varchar(25) not null,
    total numeric(10,2),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    primary key (order_id),
    foreign key (user_id) references users(username) on delete cascade
    );

create table order_items
    (order_id numeric(25) not null,
    ISBN numeric(17,0) not null,
    quantity int,
    primary key (order_id,ISBN),
    foreign key (ISBN) references book on delete cascade,
    foreign key (order_id) references orders on delete cascade
    );
create table publisher
    (
    name varchar(25) not null,
    email varchar(50) ,
    bank_acct numeric(10,0),
    );