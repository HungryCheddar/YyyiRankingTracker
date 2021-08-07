import * as fs from "fs"
import * as http from "http"
import * as Timers from "timers"
import JSDOM from "jsdom"
import JSON from "serialize-json"
import * as assert from "assert"
import { exit } from "process";

let rank = 3;
let table = [];
let intervalInSeconds = 90;

function UpdateTable(src,cb)
{
	let result_str = "";
	let req =http.request(src,(res)=>{ 
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
		  result_str += chunk;
		});
		
		//Schedule a callback for when we have received all the data in result_str
		res.on('end', () => {
			//Construct a DOM w/ the result
			let test = new JSDOM.JSDOM(result_str);
			//Grab the relevant table
			let htmlTable = test.window.document.body.children[1].children[0].children[0].children[0].children[1].children[0].children[1].children;
			//Convert the HTML table into a javascript table
			for(let i=0;i<htmlTable.length;++i)
			{
				let element = htmlTable[i];	
				table[i]= element.children[1].innerHTML;
			};
			
			cb();
		});
	});
	req.end();
	
}

let oldtable = [];
let records =[];
let recordsz =[
	[{points:"18,590,400pt",time:"15:30:53"},
	 {points:"18,639,300pt",time:"15:36:13"},
	 {points:"18,659,100pt",time:"15:42:14"},
	 {points:"18,666,700pt",time:"15:48:14"},
	 {points:"18,682,100pt",time:"15:54:14"},
	 {points:"18,705,000pt",time:"16:00:14"},
	 {points:"18,723,400pt",time:"16:06:15"},
	 {points:"18,749,800pt",time:"16:12:15"},
	 {points:"18,776,300pt",time:"16:18:15"},
	 {points:"18,824,900pt",time:"16:37:22"},
	 {points:"18,855,000pt",time:"16:40:21"},
	 {points:"18,874,800pt",time:"16:46:19"},
	 {points:"18,882,400pt",time:"16:52:17"},
	],
	 [
		 {points:"10,214,700pt",time:"15:30:53"},
	     {points:"10,218,300pt",time:"15:36:13"},
	     {points:"10,233,600pt",time:"15:42:14"},
	     {points:"10,236,250pt",time:"15:48:14"},
	     {points:"10,247,950pt",time:"16:40:21"},
	 ],
	 [
		{points:"7,195,750pt",time:"15:30:53"},
	 ],
	 [
	     {points:"3,606,100pt",time:"15:30:53"},
	     {points:"3,608,550pt",time:"15:36:13"},
	     {points:"3,611,750pt",time:"15:54:14"},
	     {points:"3,625,600pt",time:"16:12:15"},
	     {points:"3,634,750pt",time:"16:40:21"},
	     {points:"3,636,400pt",time:"16:52:17"},
	 ],
	 [
	     {points:"2,012,850pt",time:"15:30:53"},
	     {points:"2,013,400pt",time:"15:36:13"},
	     {points:"2,014,050pt",time:"15:48:14"},
	     {points:"2,014,350pt",time:"16:12:15"},
	     {points:"2,014,600pt",time:"16:24:15"},
	     {points:"2,014,800pt",time:"16:30:15"},
		 {points:"2,015,750pt",time:"16:40:21"},
	 ],
];
function GetNow()
{
	return new Date(Date.now()).toTimeString().substr(0,8);
}
function UpdateIndex(value,index)
{
	if(!records[index])
		records[index]=[];
	records[index].push({points:value,time:GetNow()});
	oldtable[index]=value;
}
function DumpRecords()
{
	let actuallyDump = (err,fd)=>{
		let stream = fs.createWriteStream("record.txt",{fd:fd});
		records.forEach((element,i) => {
			stream.write(`Tier: ${i}\n`);
			element.forEach(pair => {
				stream.write(` Points: ${pair.points}\t[${pair.time}]\n`);
			});
		});
		stream.close();
	};
	fs.open("record.txt",'w', actuallyDump);	
	fs.open("record.json", 'w', (err,fd)=>{
		let stream = fs.createWriteStream("record.txt",{fd:fd,encoding:null});
		let enc =JSON.encode(records);
		stream.write(enc);
	});	
	
	;
}
let shouldDump =true;
function Update()
{
	UpdateTable("http://r.yuyuyui.jp/campaigns/keejGeJd-may-rankingcp/result-all.html",()=>{
		let override = shouldDump;
	//if(table.length!=oldtable.length)
	table.forEach((element,index) => {
		if(element != oldtable[index]||override)
		{
			UpdateIndex(element,index);
			shouldDump = true;
		}
	});
	console.log("Checking["+shouldDump+"]: "+GetNow());
	if(shouldDump)
	{
		DumpRecords();
		shouldDump = false;
	}
});
}

//let foobar = [[{points:"awwrwa",time:"time"}]];
//
//let r= JSON.encode(foobar);
//
//let barfoo = {};
//try{
//	let fd= fs.openSync("recordz.json",'r');
//	let data = fs.readFileSync("recordz.json",{fd:fd,encoding:null});
//	
//	console.log("Decoding!"+data.length);
//	barfoo =JSON.decode(data);
//	console.log("Records: ",records.length);
//	}catch(e)
//	{
//		console.error("Failed to retrieve records: "+e);
//		barfoo = null;
//	}
//console.log(barfoo);
//assert.deepEqual(barfoo, foobar);


try{
let fd= fs.openSync("record.json",'r');
let data = fs.readFileSync("record.json",{fd:fd,encoding:null});

console.log("Decoding!");
records =JSON.decode(data);
console.log("Records: ",records.length);
}catch(e)
{
	console.error("Failed to retrieve records: "+e);
}
console.log(records.length);

Update();
Timers.setInterval(Update,intervalInSeconds*1000);