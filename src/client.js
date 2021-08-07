import * as http from "http"



let options ={hostname:"localhost",port:3000,path: "/records",method:"GET"};
let result_str = "";
let req =http.request(options,(res)=>{ 
	res.setEncoding('utf8');
	res.on('data', (chunk) => {
	  result_str += chunk;
	});
	
	//Schedule a callback for when we have received all the data in result_str
	res.on('end', () => {
		console.log("Received Data: "+result_str);
		let obj = JSON.parse(result_str);
		obj.table.forEach(element => {
			console.log("Table elem:"+element);
		});
	});
});
req.end();