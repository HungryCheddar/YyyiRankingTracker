import Server from "server"
import * as DR from "./dataRetrieval.js"
import * as Timers from "timers"
import * as fs from "fs"

let {get,post} = Server.router;
let header = Server.reply.header;

let backupPath = "./records.json";
let savePath = "./saveFiles/";

class RecordServer
{
	Set(records)
	{
		for(const k in records)
		{
			if(this[k] && typeof this[k] !== 'function' )
				this[k] = records[k];
		}
	}
	Init()
	{
		let self = this;
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
			post('/save_records',(ctx)=>{
				console.log("Received a save_records post");
				let data = ctx.data;
				let result = false;
				if(!data.save_path.includes("..")){
					try{
						DumpRecords(data.save_path,this);
						result = true;
					}catch(err){
						console.error(`Failed to save to path: ${savePath}${data.save_path}\n Error received:${err}`);
					}
				}
				return JSON.stringify({done:result});
			}),
			get('/load_records',(ctx)=>{
				console.log("Received a load_records get");
				let data = ctx.data;
				let result = false;
				if(!data.save_path.includes("..")){
					try{
						let records =RetrieveRecords(data.save_path,false);
						this.Set(records);
						result = true;
					}catch(err){
						console.error(`Failed to load to path: ${savePath}${data.save_path}\n Error received:${err}`);
					}
				}
				return JSON.stringify({done:result});
			}),
			post('/clear_records',(ctx)=>{
				console.log("Received a clear_records post");
				this.records = [];
				this.table = [];
				return JSON.stringify({done:true});
			}),
			get('/get_records',(ctx)=>{
				console.log("Received a getrecords get");
				return JSON.stringify(this);
			}),
			post('/set_records',(ctx)=>{
				console.log("Received a clear_records post");
				let data = ctx.data.data;
				this.Set(data);
				return JSON.stringify({done:true});
			}),
			(ctx)=>{return 404;}
		);
	}
	constructor(init = true)
	{
		if(init)
		this.Init();
	}

	RecordsJson()
	{
		return {table:this.records};
	}
	records = [];
	table =[];
	default_url = "http://localhost:8080/sample.html";
	target_url = this.default_url;
}



function DumpRecords(path,records)
{
	path = savePath+path;
	fs.open(path, 'w', (err,fd)=>{
		let stream = fs.createWriteStream("record.txt",{fd:fd,encoding:"utf-8"});
		let enc =JSON.stringify(records);
		stream.write(enc);
	});	
}
function RetrieveRecords(path,init=true)
{
	path = savePath+path;
	try{
	let fd= fs.openSync(path,'r');
	let data = fs.readFileSync(path,{fd:fd,encoding:"utf-8"});
	
	console.log("Decoding!");
	let records =JSON.parse(data);
	
	Object.setPrototypeOf(records,RecordServer.prototype);
	if(init)
		records.Init();
	return records;

	}catch(e)
	{
		console.error("Failed to retrieve records: "+e);
	}
	return new RecordServer(init);
}
let dr = new DR.DataRetrieval();
let rs = RetrieveRecords(backupPath);
Timers.setInterval(()=>
{
	console.log("Test");
	try{
		dr.RetrieveAndRecordData(rs.target_url,rs.table,rs.records,(src,tableStore,records)=>{
		rs.records = records;
		rs.table = tableStore;
		DumpRecords(backupPath,rs);
	});
	}catch(err)
	{
		console.error(err);	
		console.log(err);
	}
},1000);
