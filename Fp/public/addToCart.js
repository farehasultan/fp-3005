function addToCart(){
        const bookItem = {
            id:book.isbn,
            title:book.title,
            price:book.price,
            quantity:1,
        }
        const req = new XMLHttpRequest();
        req.onreadystatechange = function(){
            if(this.readyState === 4 && this.status ===201){ //status is 201 when added
                alert("item successfully added!");
                //change the location of the user.
                window.location = "/cart";

            }else if (this.readyState === 4 && this.status ===400){
                alert("Error 400, book could not be added");
                return;
            }
        }
        req.open("POST", "/cart", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(bookItem));//on the slient side we need to stringify it
}
