--I would not recommend running them because they rely on the current session , 
--just there to give an idea of what queries were used in the server.js

--Logging in
SELECT * FROM users WHERE username = 'user1';

--listing all books
SELECT * FROM book;

--a specific book by isbn, title, genre...
SELECT * FROM book WHERE isbn = isbn; --insert some number

--getting the billing and shipping address for the user that is logged in
SELECT * FROM shipping WHERE id = 'user1'

--When the user changes their shipping address/billing address when ordering
-- UPDATE shipping  set (street_number, street_name, city, province, country, postal_code) = 
-- (" + req.body.ship_streetno +",'" + req.body.ship_streetname +"', '"+req.body.ship_city +"', 
-- '"+req.body.ship_province +"', '"+ req.body.ship_country +"', '"+ req.body.ship_postalcode +"' ) 
-- where id = '"+ curr_session.username+"';

--Inserting into orders when a new order is created:
INSERT into orders values 
('" + order_number +"', '"+ curr_session.username+"', 'Processing', '"+total+"');

--Inserting into order_items
INSERT into order_items values ('" + order_number+"','"+ cart_items[key].id+"', "+cart_items[key].quantity +" );

--Report for genre
select category,count(ISBN) as isbn_count, sum(book.price*order_items.quantity) as sales, sum(book.price*order_items.quantity-(book.percentage/100)*(book.price*order_items.quantity)) as net_sales 
from book inner join order_items using (isbn) 
group by category;

--deleting a book
delete from book where isbn = book.ISBN;

