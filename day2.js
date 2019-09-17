var length=16;
var lastName="Johnson";

var x={firstName:"John",lastName: "Doe"};

console.log(x);

var x=16+"Volvo";
console.log(x);

var b=16+4+"Volvo";
console.log(b);

function myFunction(a, b){

    return a*b;
}

var x= myFunction(4,3);
console.log(x);

var car={

    name: "morning",
    ph: 500,

    start:function(x){
        console.log(x);
        console.log(this.ph);
    },
    stop:function(){
        console.log(name);
    }

}

console.log(car.name);
console.log(car);
console.log(car.start(423));

var cars = ["Saab", "Volvo", "BMW"];



console.log(cars);
console.log(cars[0]);
console.log(cars[1]);
console.log(cars[2]);
