function removeFromCart(item){
    console.log("HELLO")
    let val = item.getAttribute('value');
    console.log(val);
    const bookItem = {
        id:val,
    }
    const req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState === 4 && this.status ===200){ //status is 201 when added
            alert("item successfully removed!");
            //change the location of the user.
            window.location = "/cart";

        }else if (this.readyState === 4 && this.status ===400){
            alert("Error 400, book could not be removed");
            return;
        }
    }
    req.open("POST", "/removecart", true);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(bookItem));//on the slient side we need to stringify it
}

// function placeOrder(){
//     let addresses = {

//     'ship':
//     {'street_number': document.getElementById( "ship_streetno").innerText,
//         'street_name':document.getElementById( "ship_streetname").innerText,
//         'city' : document.getElementById( "ship_city").innerText,
//         'province': document.getElementById( "ship_province").innerText,
//         'country': document.getElementById( "ship_country").innerText,
//         'postal_code': document.getElementById( "ship_postalcode").innerText
//         },
//     'bill':{
//         'street_number' : document.getElementById( "ship_streetno").innerText,
//         'street_name' : document.getElementById( "ship_streetname").innerText,
//         'city': document.getElementById( "ship_city").innerText,
//         'province' : document.getElementById( "ship_province").innerText,
//         'country': document.getElementById( "ship_country").innerText,
//         'postal_code' : document.getElementById( "ship_postalcode").innerText
//         }
//     }
//     //console.log(addresses);

//     const req = new XMLHttpRequest();
//     req.onreadystatechange = function(){
//         if(this.readyState === 4 && this.status ===201){ //status is 201 when added
//             alert("Order successfully placed!");
//             //change the location of the user.
//             window.location = "/orders";

//         }else if (this.readyState === 4 && this.status ===400){
//             alert("Error: Could not place order");
//             return;
//         }
//     }
//     req.open("POST", "/placeorder", true);
//     req.setRequestHeader("Content-Type", "application/json");
//     req.send(JSON.stringify(addresses));//on the slient side we need to stringify it
// }


