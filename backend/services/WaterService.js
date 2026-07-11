function getStatus(value){
 if(value<=4) return 'Normal';
 if(value<=8) return 'Alert';
 return 'Critical';
}
module.exports={getStatus};