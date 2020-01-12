var express = require("express"),
app = express();

var jwt = require("jsonwebtoken");
var request = require('request');
var auth = require('./auth');
var morgan = require('morgan')

app.use(morgan('dev'))

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'q1w2e3r4',
  database : 'fintech'
});
connection.connect(); 

app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.json());
app.use(express.urlencoded({extended : false}));

var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.get("/", function (request, response) {
    response.render('main');
});

app.get("/design", function (request, response) {
    response.render('design');
});

app.get('/authResult', function (req, res) {
    var authCode = req.query.code;
    console.log(authCode);
    option = {
        url : "https://testapi.open-platform.or.kr/oauth/2.0/token",
        method : "POST",
        headers : {
        },
        form : {
            code : authCode,
            client_id : "l7xx9aeec8195c534ad9a0ebd55aa6bc9e81",
            client_secret : "ad78be0471d940359458864e3e15fe81",
            redirect_uri : "http://localhost:3000/authResult",
            grant_type : "authorization_code"
        }
    }
    request(option, function (error, response, body) {
        console.log(body);
        if(error){
            console.error(error);
            throw error;
        }
        else {
            var accessTokenObj = JSON.parse(body);
            console.log(accessTokenObj);
            res.render('resultChild', {data : accessTokenObj});
        }
    });
});

app.get('/sendUserData', function(req, res){
    var userId = req.query.userId;
    var userPwd = req.query.password;
    console.log(userId, userPwd);
    res.json(1);
})

app.get('/main', function(req, res){
    res.render('main');
})

app.get('/balance', function(req,res){
    res.render('balance');
})

app.post('/getUser', auth, function(req, res){
    console.log(req.decoded);
    var selectUserSql = "SELECT * FROM fintech.user WHERE user_id = ?";
    var userseqnum = "";
    var userAccessToken = "";
    connection.query(selectUserSql, [req.decoded.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result);
            userseqnum = result[0].userseqnum;
            userAccessToken = result[0].accessToken;
            console.log("parameter :", userseqnum, userAccessToken);

            var qs = "?user_seq_no=" + userseqnum
            option = {
                url : "https://testapi.open-platform.or.kr/user/me"+qs,
                method : "GET",
                headers : {
                    "Authorization" : "Bearer "+ userAccessToken
                },
            }
            request(option, function (error, response, body) {
                if(error){
                    console.error(error);
                    throw error;
                }
                else {
                    var responseObj = JSON.parse(body);
                    res.json(responseObj);
                }
            });
        }
    })
})

app.post('/withdrawQR', auth, function(req, res){
    console.log(req.decoded);
    var selectUserSql = "SELECT * FROM fintech.user WHERE user_id = ?"
    var userseqnum = "";
    var userAccessToken = "";
    connection.query(selectUserSql, [req.decoded.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            userseqnum = result[0].userseqnum;
            userAccessToken = result[0].accessToken;
            option = {
                url : "https://testapi.open-platform.or.kr/v1.0/transfer/withdraw",
                method : "POST",
                headers : {
                    "Authorization" : "Bearer "+ userAccessToken,
                    "Content-Type" : "application/json"
                },
                json : {
                    "dps_print_content": "널앤서",
                    "fintech_use_num": "199003328057724253012100",
                    "tran_amt": "11000",
                    "tran_dtime": "20190920104620"                  
                }
            }
            request(option, function (error, response, body) {
                if(error){
                    console.error(error);
                    throw error;
                }
                else {
                    var responseObj = body;
                    if(responseObj.rsp_code== "A0002" || responseObj.rsp_code== "A0000"){
                        res.json(1);
                    }
                    else {
                        res.json(2);
                    }
                }
            });
        }
    })
})

app.get("/signup", function (request, response) {
    console.log(request);
    console.error(request.body);
    response.render('signup');
});

app.get("/sayHello", function (request, response) {
	var user_name = request.query.user_name;
	response.end("Hello " + user_name + "!");
});

app.get('/qrcode', function(req, res){
    res.render('qrcode');
})

app.get('/qr', function(req, res){
    res.render('qrcodeReader');

})

app.get('/login', function(req, res){
    res.render('login');
});

app.post('/balance',auth, function(req, res){
    var finusenum = req.body.finNum;
    var selectUserSql = "SELECT * FROM fintech.user WHERE user_id = ?";
    connection.query(selectUserSql,[req.decoded.userId], function(err, result){
        var accessToken = result[0].accessToken;
        var qs = "?fintech_use_num="+finusenum+"&tran_dtime=20190919105400"
        option = {
            url : "https://testapi.open-platform.or.kr/v1.0/account/balance"+qs,
            method : "GET",
            headers : {
                "Authorization" : "Bearer " + accessToken
            },
        }
        request(option, function (error, response, body) {
            console.log(body);
            if(error){
                console.error(error);
                throw error;
            }
            else {
                console.log(body);
                var resultObj = JSON.parse(body);
                res.json(resultObj);
            }
        });
    })
})

app.get('/nodemon', function(req, res){
    res.json(1);
} )

app.post('/login', function (req, res) {
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    console.log(userEmail, userPassword);
    var sql = "SELECT * FROM user WHERE user_id = ?";
    connection.query(sql, [userEmail], function (error, results) {
      if (error) throw error;  
      else {

        console.log(userPassword, results[0].user_password);
        if(userPassword == results[0].user_password){
            jwt.sign(
                {
                    userName : results[0].name,
                    userId : results[0].user_id,
                    comment : "안녕하세요"
                },
                "abcdefg123456",
                {
                    expiresIn : '1d',
                    issuer : 'fintech.admin',
                    subject : 'user.login.info'
                },
                function(err, token){
                    console.log('로그인 성공', token)
                    res.json(token)
                }
            )            
        }
        else {
            res.json('등록정보가 없습니다');
        }
      }
    });
})

app.post('/transactionList',auth, function(req, res){
    var finusenum = req.body.finNum;
    var selectUserSql = "SELECT * FROM fintech.user WHERE user_id = ?";
    connection.query(selectUserSql,[req.decoded.userId], function(err, result){
        var accessToken = result[0].accessToken;
        var qs = "?fintech_use_num="+finusenum+
        "&inquiry_type=A" +
        "&from_date=20161001" +
        "&to_date=20161001" +
        "&sort_order=D" +
        "&page_index=1" +
        "&tran_dtime=20190919105400" 
        option = {
            url : "https://testapi.open-platform.or.kr/v1.0/account/transaction_list"+qs,
            method : "GET",
            headers : {
                "Authorization" : "Bearer " + accessToken
            },
        }
        request(option, function (error, response, body) {
            console.log(body);
            if(error){
                console.error(error);
                throw error;
            }
            else {
                console.log(body);
                var resultObj = JSON.parse(body);
                res.json(resultObj);
            }
        });
    })
})

app.post('/signup', function(req, res){
    var userEmail = req.body.userEmail;
    var userPassword = req.body.userPassword;
    var accessToken = req.body.accessToken;
    var refreshToken = req.body.refreshToken;
    var useseqnum = req.body.useseqnum;
    console.log(userEmail, userPassword, accessToken, refreshToken, useseqnum);
    var sql = "INSERT INTO `fintech`.`user` " +
    "(`user_id`, `user_password`, `phone`, `accessToken`, `refreshToken`, `userseqnum`)"+
    " VALUES (?,?,?,?,?,?)";
    connection.query(sql,[userEmail,
        userPassword,
        "010",
        accessToken ,
        refreshToken,
        useseqnum ],function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            res.json(1);
        }
    })
})

app.listen(port);
console.log("Listening on port ", port);
