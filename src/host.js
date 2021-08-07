import Server from "server"
import * as DR from "./dataRetrieval.js"
import * as Timers from "timers"
let {get,post} = Server.router;

class RecordServer
{
	constructor()
	{
		Server([
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
		]);
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
