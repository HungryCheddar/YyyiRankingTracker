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
			ctx => header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"),
			ctx => header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE, HEAD"),
			ctx => ctx.method.toLowerCase() === 'options' ? 200 : false
		  ]
		Server({},cors[0],cors[1],cors[2],cors[3],
			get('/',(ctx)=>{
				return {test_string:"hello_world"};
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
}

let dr = new DR.DataRetrieval();
let rs = new RecordServer();

Timers.setInterval(()=>
{
	dr.RetrieveAndRecordData("http://localhost:8080/sample.html",rs.table,rs.records,(src,tableStore,records)=>{
	rs.records = records;
	rs.table = tableStore;
});
},1000);
