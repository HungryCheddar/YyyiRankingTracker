import Server from "server"
import * as DR from "./dataRetrieval.js"
import * as Timers from "timers"
let {get,post} = Server.router;
let header = Server.reply.header;

class RecordServer
{
	constructor()
	{
		const cors = [
			ctx => header("Access-Control-Allow-Origin", "*"),
			ctx => header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Content-Length, Accept"),
			ctx => header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE, HEAD"),
			ctx => ctx.method.toLowerCase() === 'options' ? 200 : false
		  ]
//TODO: handle csrf properly
		Server({security:{csrf:false}},cors[0],cors[1],cors[2],cors[3],
			get('/',(ctx)=>{
				return {test_string:"hello_world"};
			}),
			get('/data_url',(ctx)=>{
				console.log("Received a data_url get");
				return {url:this.target_url};
			}),
			post('/data_url',(ctx)=>{
				console.log("Received a data_url post");
				let data =ctx.data;
				if(!data.url)
					this.target_url = JSON.parse(data).url;
				else
					this.target_url =data.url;
				return JSON.stringify({done:true});
			}),
			get('/records',(ctx)=>{
				console.log("Received a records get");
				let result = {};
				try{
					result=this.RecordsJson();
				}catch(e)
				{
					console.error(e);
				}
				return result;
			}),
			(ctx)=>{return 404;}
		);
		this.records = [];
		this.table =[];
	}

	RecordsJson()
	{
		return {table:this.records};
	}
	default_url = "http://localhost:8080/sample.html";
	target_url = this.default_url;
}

let dr = new DR.DataRetrieval();
let rs = new RecordServer();

Timers.setInterval(()=>
{
	try{
		dr.RetrieveAndRecordData(rs.target_url,rs.table,rs.records,(src,tableStore,records)=>{
		rs.records = records;
		rs.table = tableStore;
	});
	}catch(err)
	{
		console.error(err);	
	}
},1000);
