var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://Kareem:koko123@ds113435.mlab.com:13435/url_shortener";
var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

function checkUrl(str){
  var temp = str.substr(0,4);
  var temp2 = str.substr(0,5);
  if(temp2!='https'&&temp=='http'){
    var dots = str.substr(4,7);
    //console.log(dots);
    if(dots!="://www."){
      return false;
    }else{
      str = str.substr(str.indexOf(".")+1,str.length);
      if(str.indexOf(".")==-1){
        return false;
      }else{
        var end = str.substr(str.indexOf(".")+1,str.length);
        end=end.substr(0,3);
        //console.log(end);
        if(end!="com"&&end!="org"&&end!="net"){
          return false;
        }else{
          return true;
        }
      }
    }
  }else if(temp2=='https'){
    var dots = str.substr(5,7);
    if(dots!="://www."){
      return false;
    }else{
      str = str.substr(str.indexOf(".")+1,str.length);
        //console.log(str);
      if(str.indexOf(".")==-1){
        return false;
      }else{
        var end = str.substr(str.indexOf(".")+1,str.length);
        end=end.substr(0,3);
        if(end!="com"&&end!="org"&&end!="net"){
          return false;
        }else{
          return true;
        }
      }
    }
  }else{
    return false;
  }
}
router.route('/')
.get(function(req,res){
  var Url = req.query.website;
  if(!checkUrl(Url)){
    res.send({error:'URL requested is not correct format'});
  }else{
  MongoClient.connect(mongoUrl, function(err, db) {
  if (err) throw err;
  db.collection("data").find({}).toArray(function(err, result) {
    if (err) throw err;
    var sent = false;
    for (var i = 0; i < result.length; i++){
      if(result[i].short==Url){
        res.redirect(result[i].link);
        sent = true;
        i = result.length;
      }
    }
    if(!sent){
      var num = Math.round(Math.random()*10000);
      addNew(Url,'https://www.hi.com/'+(num));
      res.send({link:Url,short:'https://nickel-trombone.glitch.me/api/?website=https://www.hi.com/'+num})
    }
    db.close();
  });
    function addNew(link,short){
      MongoClient.connect(mongoUrl, function(err, db) {
		console.log('hi');
	  if (err) throw err;
	  var myobj = { link:link, short:short};
	  db.collection("data").insertOne(myobj, function(err, res) {
	    if (err) throw err;
	    console.log("1 document inserted");
	    db.close();
	  });
});
    }
});
  }
});
// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
app.get('/', function(request, response) {
  response.render('index.html');
});
// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);