/**
 * Created by Demitry on 22.05.2015.
 */
$(document).ready(function () {

    var noneAutorization = "<button class='sign-in btn btn-info'>Sign In</button>&nbsp;<button class='sign-up btn btn-info'>Sign Up</button>";
    var isAutorization = "&nbsp;&nbsp;<button class='order-list btn btn-warning'>Order List</button>&nbsp;&nbsp;<button class='sign-out btn btn-danger'>Sign Out</button>";
    var loginForm = "<div id='loginbox' style='margin-top:50px;' class='mainbox col-md-6 col-md-offset-3'>" +
        "<div class='panel panel-info' ><div class='panel-heading'><div class='panel-title'>Sign in</div></div><div class='error'></div>" +
        "<div style='padding-top:30px' class='panel-body' >" +
        "<form id='loginform' class='form-horizontal' ><div style='margin-bottom: 25px' class='input-group'>" +
        "<span class='input-group-addon'><i class='glyphicon glyphicon-user'></i></span>" +
        "<input type='text' class='form-control' name='email' placeholder='Email' id='email'></div>" +
        " <div style='margin-bottom: 25px' class='input-group'><span class='input-group-addon'><i class='glyphicon glyphicon-lock'></i></span>" +
        "<input type='password' class='form-control' name='password' placeholder='Password' id='password'></div>" +
        "<div style='margin-top:10px' class='form-group'><div class='col-sm-12 controls'>" +
        "<input type='button' class='btn btn-success' value='Sign in' id='signIn'></div></div></form></div></div></div>";


    /*
    function checkAuthorization(){
        if ( localStorage['autoShopUser3'] ){
            var fromLocal = JSON.parse(localStorage['autoShopUser3']);
            var hash =  CryptoJS.HmacSHA1(fromLocal.idUser + fromLocal.secret, fromLocal.secret.toString()).toString();
            $.ajax({
                type: "GET",
                url: '/~user3/rest/client/api/getSecret' ,
                // url: 'rest/client/api/getSecret',
                headers:{'idUser': fromLocal.idUser, 'hash': hash},
                success: function (data, statusText, xhr) {
                    var name = JSON.parse(xhr.getResponseHeader('name'));
                    $(".place-register").empty();
                    $(".place-register").append("<span>Hello, " + name + "</span>");
                    $(".place-register").append(isAutorization);
                },
                error: function(xhr, textStatus, error) {
                    console.log(xhr.status);
                    console.log(error);
                    localStorage.removeItem('autoShopUser3');
                    $(".place-register").empty();
                    $(".place-register").append(noneAutorization);
                }
            });
        }
        else
        {
            $(".place-register").empty();
            $(".place-register").append(noneAutorization);
        }
    }
*/
    //checkAuthorization();


    function printAllCars(data){
        var returnData = '';
        var array = JSON.parse(data);
        $(array).each(function (index, value){
            if ( (index + 1) % 2 != 0){
                returnData += "<div class='row cars'>";
            }
            returnData += "<div class='col-md-6'>" +
            "<div class='container-img'>" +
            "<img class='carDetail' src='./soap2/client/img/" + value.idCar + ".jpg" + "' title='" + value.vendor + ' ' + value.model + "' alt='no image' name='" + value.idCar+ "' />" +
            "</div>" +
            "<p class='content'>" + value.vendor + ' ' + value.model + "</p>" +
            "<p class='content'>" +
            "<input type='button' value='Reserve' class='btn btn-primary carReserve' name='" + value.idCar + "'>" +
            "</p></div>";
            if ( (index + 1) % 2 == 0){
                returnData += "</div>";
            }
        });
        return returnData;
    }

    function getAllCars(){
        $.ajax({
            type: "GET",
            //url: '/~user5/rest-client/api/' ,
            url: 'rest-client/api/',
            success: function (data) {
                var getAllCars = printAllCars(data);
                $("#append-all-cars").append(getAllCars);
                if ( !localStorage['autoShopUser3'] ){
                    $(".carReserve").css("display", "none");
                }

            },
            error: function(xhr, textStatus, error) {
                $("#append-all-cars").append("<h4>There're no cars</h4>");

            }
        });
    }

    getAllCars();


    $("body").on("click", ".carDetail", function(){
        $("#append-all-cars").empty();
        var idCar = $(this).attr('name');
        getDetail(idCar);
    });

    $("body").on("click", ".sign-in", function(){
        $("#append-all-cars").empty();
        $("#append-all-cars").append(loginForm);
    });

    $("body").on("click", ".sign-out", function() {
        logOut();
    });

    $("body").on("click", "#signIn", function(){
        var email = $("#email").val();
        var password = $("#password").val();
        login(email, password);
    });

    $("body").on("click", "#signUp", function(){
        var name = $("#name").val();
        var email = $("#email").val();
        var password = $("#password").val();
        var confirm = $("#confirm").val();
        registration(name, email, password, confirm);
    });

    $("body").on("click", ".glyphicon", function() {
        if (confirmOnDelete()){
            var idOrder = $(this).attr("name");
            var tr = $(this).parent().parent();
            var sendData = JSON.parse(localStorage['autoShopUser3']);
            sendData['idOrder'] = idOrder;
            var message = sendData['idUser'] + idOrder;
            sendData['hash'] =  CryptoJS.HmacSHA1(message, sendData['secret'].toString()).toString();
            delete sendData.secret;
            $.ajax({
                //url: "rest/client/api/removeOrder",
                method: "DELETE",
                url: '/~user3/rest/client/api/removeOrder' ,
                headers: {"idUser" : sendData.idUser, "idOrder": sendData.idOrder},
                data: JSON.stringify(sendData['hash']),
                statusCode:{
                    200: function(data, statusText, xhr)
                    {
                        console.log(data);
                        tr.fadeOut();
                    },
                    401: function(xhr, statusText, error )
                    {
                        $(".error").remove();
                        $("#append-all-cars").prepend("<span class='error'>" + error + "</span>");
                    },
                    415: function(xhr, statusText, error )
                    {
                        $("#append-all-cars").empty();
                        $("#append-all-cars").append("<h4>You have no one orders</h4>");
                    }
                }
            });
        }

    });

    function confirmOnDelete()
    {
        if(confirm('Are you sure you want to delete this contact?'))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    $("body").on("click", ".order-list", function(){
        var sendData = JSON.parse(localStorage['autoShopUser3']);
        var message = sendData['idUser'] + sendData['secret'];
        sendData['hash'] =  CryptoJS.HmacSHA1(message, sendData['secret'].toString()).toString();
        delete sendData.secret;
        $.ajax({
            //url: "rest/client/api/orderList",
            type: "GET",
            url: '/~user3/rest/client/api/orderList' ,
            data: sendData,
            statusCode:{
                200: function(data, statusText, xhr)
                {
                    data = JSON.parse(data);
                    $("#append-all-cars").empty();
                    var table = "<table class='table'><tr><th>#</th><th>Vendor</th><th>Model</th><th>Delete</th></tr>";
                    $(data).each( function(index, value) {
                        table += "<tr><td>" + parseInt(index + 1) + "</td><td>" + value.vendor + "</td><td>" + value.model + "</td><td>"+
                        "<span class='glyphicon glyphicon-remove' name='" + value.idOrder  + "'></span></td>";
                    });
                    table += "</table";
                    $("#append-all-cars").append(table);
                },
                401: function(xhr, statusText, error )
                {
                    $(".error").remove();
                    $("#append-all-cars").prepend("<span class='error'>" + error + "</span>");
                },
                415: function(xhr, statusText, error )
                {
                    $("#append-all-cars").empty();
                    $("#append-all-cars").append("<h4>You have no one orders</h4>");
                }
            }
        });
    });

    $("body").on("click", ".carReserve", function() {
        var fromLocal = JSON.parse(localStorage['autoShopUser3']);
        var idUser = fromLocal.idUser;
        var idCar = $(this).attr("name");
        var hash =  CryptoJS.HmacSHA1(idUser + idCar, fromLocal.secret.toString()).toString();
        $('.success').remove();
        $.ajax({
            type: "POST",
            url: '/~user3/rest/client/api/addOrder',
            //url: 'rest/client/api/addOrder',
            data: {"idUser": idUser, "idCar" : idCar, "hash": hash},
            success: function (data) {
                $("#append-all-cars").prepend("<span class='success'>Thank for your choose. That car was reserved.</span>");

            },
            error: function(xhr, textStatus, error) {
                $("#append-all-cars").prepend("<span class='error'>" + error + "</span>");
            }
        });

    });

    $("body").on("click", ".sign-up", function(){
        $("#append-all-cars").empty();
        var registerForm = " <div id='signupbox' style='margin-top:50px' class='mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2'>" +
            "<div class='panel panel-info'><div class='panel-heading'><div class='panel-title'>Sign Up</div>" +
            "<div class='panel-body'> <div class='error'></div><form id='signupform' class='form-horizontal' >" +
            "<div id='signupalert' style='display:none' class='alert alert-danger'></div>" +
            "<div class='form-group'><label for='firstname' class='col-md-3 control-label'>Name</label><div class='col-md-9'>" +
            " <input type='text' class='form-control' name='name' placeholder='Name' id='name'> </div> </div>" +
            "<div class='form-group'> <label for='email' class='col-md-3 control-label'>Email</label><div class='col-md-9'>" +
            "<input type='text' class='form-control' name='email' placeholder='Email Address' id='email'></div> </div>" +
            "<div class='form-group'><label for='password' class='col-md-3 control-label'>Password</label><div class='col-md-9'>" +
            "<input type='password' class='form-control' name='password' placeholder='Password' id='password'></div></div>" +
            "<div class='form-group'><label for='password' class='col-md-3 control-label'>Password* (Confirm)</label>" +
            "<div class='col-md-9'><input type='password' class='form-control' name='confirmPassword' placeholder='Password' id='confirm'>" +
            "</div></div><div class='form-group'><div class='col-md-offset-3 col-md-9'><input id='signUp' class='btn btn-info' type='button' value='Sign Up'>" +
            "</div></div></form></div></div></div>";

        $("#append-all-cars").append(registerForm);
    });

    function getDetail(idCar){
        $.ajax({
            type: "GET",
            url: '/~user3/rest/client/api/detail/' + idCar ,
            //url: 'rest/client/api/detail/'+ idCar,
            success: function (data) {
                var array = JSON.parse(data);
                var returnData = function(){
                    var data = '';
                    data += "<div class='row cars'><div class='col-md-8'><div class='content'>" +
                    "<p>" +  array.vendor + ' ' + array.model + "</p>" +
                    "<img src='./soap2/client/img/" + array.idCar + ".jpg" + "' title='" + array.model + "' >" +

                    "<p>speed: " +  array.speed + " km/h</p>" +
                    "<p>color: <span style='background: " + array.color + "'>__</span></p>" +
                    "<p>price: $" + array.price + ".000 </p>" +
                    "<p>engine: " +  array.engine + " </p>" +
                    "<p>year: " +  array.year + " </p>" +
                    "<p><input type='button' name='" + array.idCar + "' value='Reserve' class='btn btn-primary carReserve' ></p>" +
                    "</div></div></div>";
                    return data;

                };
                $("#append-all-cars").append(returnData());
                if ( !localStorage['autoShopUser3'] ){
                    $(".carReserve").css("display", "none");
                }
            },
            error: function(xhr, textStatus, error) {
                $("#append-all-cars").append("<h3>" + error + "</h3");
            }
        });
    }

    $( "#search" ).on( "click", function( event ) {
        $(".error").remove();
        var model = $("#model").val();
        var year = $("#year").val();
        var color = $("#color").val();
        var engine = $("#engine").val();
        var price = $("#price").val();
        var speed = $("#speed").val();
        search(model, year, color, engine, price, speed);

    });

    function search(model, year, color, engine, price, speed){
        $.ajax({
            // url: "rest/client/api/search",
            type: "GET",
            url: '/~user3/rest/client/api/search' ,
            data: {"year" : year, "model": model, color: color, "price": price, "engine": engine, "speed": speed},
            success: function (data) {
                var getAllCars = printAllCars(data);
                $("#append-all-cars").empty();
                $("#append-all-cars").append(getAllCars);

                if ( !localStorage['autoShopUser3'] ){
                    $(".carReserve").css("display", "none");
                }
            },
            error: function(xhr, textStatus, error) {
                console.log(xhr.status);
                $("#append-all-cars").prepend("<span class='error' style='color:red'>" + error + "</span>");
            }

        });
    }

    function registration(name, email, password, confirm){
        $(".error").empty();
        $.ajax({
            // url: "rest/client/api/registration",
            type: "POST",
            url: '/~user3/rest/client/api/registration' ,
            data: {"name" : name, "email" : email, "password" :password, "confirmPassword" : confirm},
            statusCode: {
                200: function (data, statusText, xhr) {
                    $("#append-all-cars").empty();
                    $("#append-all-cars").append("<div class='success'>You have created an account. Please, log in to system.</div>");
                    $("#append-all-cars").append(loginForm);

                },

                415: function (data, statusText, error) {
                    var arrayOfError = JSON.parse(data.getResponseHeader('error'));
                    console.log(arrayOfError);
                    $(arrayOfError).each(function (index, value) {
                        $(".error").append("<p>" + value + "</p>");
                    });

                },

                403: function (data, statusText, error) {
                    $(".error").append(error);
                }
            }

        });
    }


    function login(email, password){
        $(".error").empty();
        $(".success").remove();
        $.ajax({
            //url: "rest/client/api/login",
            type: "PUT",
            url: '/~user3/rest/client/api/login' ,
            data: {"email" : email, "password" : password},
            statusCode:{
                200: function(data, statusText, xhr)
                {
                    var values = JSON.parse(xhr.getResponseHeader('keys'));
                    var name = values[2];
                    localStorage['autoShopUser3'] = JSON.stringify({"idUser" : values[0], "secret": values[1]});
                    // var value = JSON.parse(localStorage['autoShopUser3']);
                    //console.log(value['idUser']);
                    $(".place-register").empty();
                    $(".place-register").append("<span>Hello, " +  name + "</span>");
                    $(".place-register").append(isAutorization);
                    $("#append-all-cars").empty();
                    $("#append-all-cars").append(getAllCars());

                },

                401: function(data, statusText, error){
                    $(".error").append(error);
                },

                415: function(data, statusText, error){
                    var arrayOfError = JSON.parse(data.getResponseHeader('error'));
                    $(arrayOfError).each(function(index, value) {
                        $(".error").append("<p>"+ value + "</p>");
                    });

                }
            }
        });
    }

    function logOut()
    {
        var sendData = JSON.parse(localStorage['autoShopUser3']);
        var message = sendData['idUser'] + sendData['secret'];
        sendData['hash'] =  CryptoJS.HmacSHA1(message, sendData['secret'].toString()).toString();
        delete sendData.secret;
        $.ajax({
            //url: "rest/client/api/logout",
            type: "PUT",
            url: '/~user3/rest/client/api/logout' ,
            data: sendData,
            statusCode:{
                200: function(data, statusText, xhr)
                {
                    localStorage.removeItem('autoShopUser3');
                    $(".place-register").empty();
                    $(".place-register").append(noneAutorization);
                    $(".carReserve").css("display", "none");
                },
                401: function(xhr, statusText, error)
                {
                    console.log(xhr.status);
                    $(".error").remove();
                    $("#append-all-cars").prepend("<span class='error' style='color:red'>" + error + "</span>");
                }
            }

        });
    }

})