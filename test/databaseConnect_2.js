var mysql=require('mysql');
var connection=mysql.createConnection({
host        : 'localhost',
user        : 'root',
password    : '0000',
database    : 'fintech'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution',function(error,results,fields){
    if (error) throw error;
    console.log('the solution is: ',results[0].solution);
});

connection.end();