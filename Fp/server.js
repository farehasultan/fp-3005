const express = require('express');
const app = express();
//const session = require('express-session');
const { Client } = require('pg')
//-----------Connect to database--------------------------------
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Bookstore',
    password: 'Cristiano10.',
    port: 5432,
  })
  client.connect()
app.set('view engine','pug');


//--------MIDDLEWARE---------------------------------------------
//app.use(session({secret: "some secret key here", store:store}))
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
let curr_session = {
    loggedin: false,
    username: "",
    password:"",
    admin: false,
}
let cart_items = {}
//----REQUESTS-----------------------------------------------
//-------GET-------------------------------------------------
app.get(['/','homepage'],(req,res,next)=>{
    res.render("homepage",{user: curr_session});
})
app.get('/logout',logout); //only when logged in 
app.get('/register', loadRegisterForm); //
app.get('/books',listBooks); 
app.get('/books/:id', sendSingleBook); 
app.get('/orders', listOrders); 
app.get('/orders/:id', sendSingleOrder); 
app.get('/addbook', addBookForm);
app.get('/cart', viewCart) 
app.get('/reports', generateReport); 
app.get('/removebook', removeBookForm);


//------POST--------------------------------------------------
app.post('/login',login); //DONE
app.post('/register',register);
app.post('/removebook',deleteBook);
app.post('/books', searchBooks); //
app.post('/addbook', addBook); //
app.post('/cart',addToCart); //DONE
app.post('/removecart',removeFromCart); //DONE
app.post('/placeorder', placeorder) ; 
app.post('/reports', newReports);

//---------------FUNCTIONS------------------------------------




function login(req,res,next){
    //First check if someone is logged in
    if (curr_session.loggedin){
        res.status(200).send("You are already logged in!");
    }

    let username = req.body.username;
    let password = req.body.password;
    client.query("SELECT * FROM users WHERE username = '" + username+"'", (err, result) => {
        if(err){return err;}
        if(result){
            if (result.rows[0].password === password){
                curr_session.loggedin = true;
                curr_session.username = username;
                curr_session.password = password;
                curr_session.admin = result.rows[0].admin;
                res.status(200).render("homepage",{user: curr_session});
            }
            else{
                res.status(401).send("Invalid Password, try again.");
            }  
        }
        else{
            res.status(401).send("Invalid Username");
            return;}
    });
}

function logout(req, res, next){
	if(curr_session.loggedin){
		curr_session.loggedin = false;
        curr_session.username = '';
        curr_session.password = '';
        curr_session.admin = false;

        res.status(200).render("homepage",{user: curr_session});
	}else{
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}


function listBooks(req,res,next){
    client.query('SELECT * FROM book', (err, result) => {
        if(err){return err;}
        if(result){
            console.log(result);
            // client.end()
            res.status(200).render("books",{books: result.rows ,user: curr_session});
        }
    })
}

function sendSingleBook(req,res,next){
    let isbn = req.params.id;
    console.log("-------",isbn)
    client.query('SELECT * FROM book WHERE isbn = ' + isbn, (err, result) => {
        if(err){return err;}
        if(result){
            console.log(result.rows);
            res.status(200).render("book",{book: result.rows[0], user: curr_session});
        }
        // client.end()
    })
}


function viewCart(req,res,next){
    let ships = {}, resul={};
    client.query("SELECT * FROM shipping WHERE id = '" + curr_session.username +"'", (err, result) => {
        if(err){return err;}
        if(result){
            console.log(result.rows[0]);}
            ships =result.rows[0];
    });
    client.query("SELECT * FROM billing WHERE id = '" + curr_session.username +"'", (err, ship) => {
        if(err){return err;}
        if(ship){
            console.log(ship.rows[0]);
            resul=ship.rows[0];
            res.status(200).render("cart",{cart:cart_items, user: curr_session, ship:ships,bill:resul});
        }
    });
}


function addToCart(req,res,next){
    if (cart_items.hasOwnProperty(req.body.id)){
        cart_items[req.body.id].quantity+=1;
        res.status(201);
        res.send();
    }else{
        //adding to our data on the server.
        cart_items[req.body.id] = 
        {
            id: req.body.id,//isbm
            title: req.body.title,
            quantity:req.body.quantity,
            price:req.body.price,
        }
        res.status(201);
        res.send();
    }
}

function removeFromCart(req,res,next){
    if (cart_items.hasOwnProperty(req.body.id)){
        if (cart_items[req.body.id].quantity>1){
            cart_items[req.body.id].quantity-=1;
            res.status(200);
            res.send();
        }else if (cart_items[req.body.id].quantity==1){
            delete cart_items[req.body.id];
            res.status(200);
            res.send();
        }
    }else{
        
        res.status(400);
        res.send("Item does not exist!");
    }
}
function searchBooks(req,res,next){ 
    console.log("here is the", req.body.search);
}

//Placing the order and saving the new addresses
function placeorder(req, res,next){
    client.query("UPDATE shipping  set (street_number, street_name, city, province, country, postal_code) = (" + req.body.ship_streetno +",'" + req.body.ship_streetname +"', '"+req.body.ship_city +"', '"+req.body.ship_province +"', '"+ req.body.ship_country +"', '"+ req.body.ship_postalcode +"' ) where id = '"+ curr_session.username+"';", (err, shipping) => {
        if(err){return err;}
        if(shipping){
            console.log("Shipping Address Updated!")
        }    
    });
    client.query("UPDATE billing  set (street_number, street_name, city, province, country, postal_code) = (" + req.body.bill_streetno +",'" + req.body.bill_streetname +"', '"+req.body.bill_city +"', '"+req.body.bill_province +"', '"+ req.body.bill_country +"', '"+ req.body.bill_postalcode +"' ) where id = '"+ curr_session.username+"';", (err, billing) => {
        if(err){return err;}
        if(billing){
            console.log("Billing Address Updated!")
            
        }
    });
    let order_number = Math.floor(Math.random() * 1000000000);
    let total=0;
    for (let key in cart_items){
        total += cart_items[key].quantity * cart_items[key].price;
        //console.log(total);
    }
    client.query("INSERT into orders values ('" + order_number +"', '"+ curr_session.username+"', 'Processing', '"+total+"'); ", (err, addorders) => {
        if(err){return err;}
        if(addorders){
            console.log("Added to orders!")
            
        }
    });
    for(let key in cart_items){
        ///console.log(key.id,key.quantity);
        client.query("INSERT into order_items values ('" + order_number+"','"+ cart_items[key].id+"', "+cart_items[key].quantity +" );", (err, items) => {
            if(err){return err;}
            if(items){
                console.log("Items added!")
                delete cart_items[key];
                
            }
        });
    }
    res.status(200).redirect("/orders");
    
}

function listOrders(req,res,next){
    client.query("SELECT * FROM orders WHERE user_id = '" + curr_session.username +"';", (err, result) => {
        if(err){return err;}
        if(result){
            console.log("Here are the result for the orders!",result);
            res.status(200).render("orders",{ user: curr_session, orders:result.rows});
        }
    });
}
function sendSingleOrder(req,res,next){
        let order = req.params.id;
        client.query('SELECT * FROM order_items WHERE order_id = ' + order, (err, result) => {
            if(err){return err;}
            if(result){
                console.log(result.rows);
                res.status(200).render("order",{order: result.rows, user: curr_session});
            }
            // client.end()
        })
}
function generateReport(req,res,next){
    client.query('select * from book inner join order_items using (isbn)', (err, result) => {
        if(err){return err;}
        if(result){
            console.log(result.rows);
            res.status(200).render("reports",{sales:result.rows, user: curr_session});
            }
        });
}


function newReports(req,res,next){
    let val = req.body.reporttype;
    console.log(val);
    if (val == 'overall'){
        client.query('select * from book inner join order_items using (isbn)', (err, result) => {
        if(err){return err;}
        if(result){
            console.log(result.rows);
            res.status(200).render("customreports",{sales:result.rows, user: curr_session, type:{overall:true}});
        }
    });
    }
    else if (val == 'genre'){
        client.query('select category,count(ISBN) as isbn_count, sum(book.price*order_items.quantity) as sales, sum(book.price*order_items.quantity-(book.percentage/100)*(book.price*order_items.quantity)) as net_sales from book inner join order_items using (isbn) group by category;', (err, result) => {
            if(err){return err;}
            if(result){
                console.log(result.rows);
                res.status(200).render("customreports",{ sales: result.rows,user: curr_session, type:{genre:true}});
    }
    });
}
}


function addBookForm (req,res,next){
    res.status(200).render("addbook",{user: curr_session});
}

function addBook(req,res,next){
    let book = req.body;
    //console.log(book.ISBN);
    client.query("insert into book values ('"+ book.ISBN +"',"+ " '"+book.title+"',"+ " '"+book.author+"',"+ " '"+book.price+"',"+ " '"+book.year+"',"+ " '"+book.category+"',"+ " '"+book.publisher+"',"+ " '"+book.place+"',"+ " '"+book.rating+"',"+ " '"+book.format+"',"+ " '"+book.length+"',"+ " '"+book.stock+"',"+ " '"+book.image+"',"+ " '"+book.percentage+"');", (err, result) => {
        if(err){return err;}
        if(result){
            console.log(result.rows);
            res.status(200).render("addbook",{ user: curr_session});
        }
    });
}

function removeBookForm (req,res,next){
    res.status(200).render("removebook",{user: curr_session});
}

function deleteBook(req,res,next){
    let book = req.body;
    //console.log(book.ISBN);
    client.query("delete from book where isbn = '"+ book.ISBN+"';", (err, result) => {
        if(err){return err;}
        if(result){
            console.log(result.rows);
            res.status(200).render("removebook",{ user: curr_session});
        }
    });

}

function loadRegisterForm(req,res,next){
    curr_session.loggedin = false;
    curr_session.admin = false;

    res.status(200).render("register", {available:true,user:curr_session});
	}

function register(req,res,next){
    let username = req.body.username;
    let password = req.body.password;
    //Checking if the username is available
    client.query("select * from users where username = '"+ username+"';", (err, existing) => {
        if(err){return err;}
        if(existing.rows != []){
            
            res.status(406).render("register", {available : false, user : curr_session});
        }
            //Create a new user and add to database .
        else{
            client.query("insert into users values ('"+username+"',"+" '"+password+"',"+ 'false'+");", (err, result) => {
                if(err) throw err;
                    if(result){
                        //Make the user login
                        console.log(result);
                        curr_session.loggedin = true;
                        curr_session.username = username;
                        curr_session.password = password;
                        curr_session.admin = false;
                            //it will be logged in
                        res.status(201).redirect("homepage");    
                    }
                });
                                
            }
        });
    }

//-----------------Connecting to Server-------------------------
app.listen(3000, function(){
    console.log("Server Listening on port 3000");
});

