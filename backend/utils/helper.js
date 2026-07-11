function daysBetween(d1,d2){
 return Math.floor((d2-d1)/(1000*60*60*24));
}
module.exports={daysBetween};