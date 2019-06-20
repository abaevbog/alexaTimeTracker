//import { resolve } from "dns";

const long = () => {
    setTimeout(() => {
        console.log('resolved');
    }, 2000)
}

const prm = new Promise((resolve,reject) => {
    setTimeout(() => {
        resolve('resolved');
    }, 2000)  
});


const funcInDb = () => {
    console.log("running main");
    prm.then((outcome) => console.log("resolve complete")).catch((e) => console.log(e));
    console.log("end");
}

funcInDb();