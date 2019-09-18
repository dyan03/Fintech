var express=require("express");
app=express();

app.set('views',__dirname+'/views');
app.set('view engine','ejs');
app.engine('html',require('ejs').renderFile);

var port=process.env.PORT||3000;

app.use(express.static(__dirname+"/public"));

app.get("/design",function(req,res){

    res.render('design');
})

// app.get("/media.html",function(req,res){
//     console.log("touch the media button");
//     res.end("you touch the media button");
// })

app.get("/",function(request,response){
    // response.end("hello world");
    response.render('main');
});

app.get("/sendUserData",function(req,res){
    var userId=req.query.userId;
    var userPwd=req.query.password;
    console.log(userId,userPwd);

    res.json("request complete");
});

app.get("/sayHello",function(request,reponse){
    var user_name=request.query.user_name;
    reponse.end("Hello "+user_name+" !");
});

app.get('/signup',function(req,res){
    res.render('signup');
})

app.listen(port);

console.log("Listening on port",port);