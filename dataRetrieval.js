import * as fs from "fs"
import * as http from "http"
import * as Timers from "timers"
import JSDOM from "jsdom"
import JSON from "serialize-json"
import Globalize from "globalize"
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cldr =require("cldr-data")
Globalize.load(cldr.entireSupplemental());
Globalize.load(cldr.entireMainFor("en"));
Globalize.locale( "en" );

function debugLog(str)
{
	let enabled =false;
	if(enabled)
		console.trace(str);
}

class DataRetrieval
{
	RetrievePage(src,cb)
	{
		let result_str = "";
		debugLog("RetrievePage: "+src);
		let req =http.request(src,(res)=>{ 
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
			  result_str += chunk;
			});
			
			//Schedule a callback for when we have received all the data in result_str
			res.on('end', () => {
				debugLog("Received Data: "+result_str);
				cb(result_str);
			});
		});
		req.end();
	}
	GetTableFromDom(dom)
	{
		return dom.window.document.body.children[1].children[0].children[0].children[0].children[1].children[0].children[1].children;
	}
	GetEntryFromTableElement(element)
	{
		debugLog("Getting entry: "+element.children[1].innerHTML);
		return element.children[1].innerHTML;
	}
	
	PageToTable(pageHtml)
	{
		let resultTable = [];
		let test = new JSDOM.JSDOM(pageHtml);
		debugLog("Got html to dom");
		//Grab the relevant table
		let htmlTable = this.GetTableFromDom(test);
		debugLog("HtmlTable len: "+htmlTable.length);
		//Convert the HTML table into a javascript table
		for(let i=0;i<htmlTable.length;++i)
		{
			let element = htmlTable[i];	
			//Process table entry
			
			let str = this.GetEntryFromTableElement(element);
			//Assumes form of <numbers>(<comma><numbers>)*pts
			//let numStr = str.substr(0,str.indexOf('p'));
			//resultTable[i]= Globalize.parseNumber(numStr);
			//Store the table entry's text
			resultTable[i] = str;
		};
		return resultTable;
	}
	
	TableStrToNumber(strTable)
	{
		let resultNumTable = [];
		strTable.forEach(entry => {
			let numStr = entry.substr(0,entry.indexOf('p'));
			resultNumTable.push(Globalize.parseNumber(numStr));
		});
		return resultNumTable;
	}
	
	GetNow()
	{
		return new Date(Date.now()).toTimeString().substr(0,8);
	}
	
	RetrieveAndRecordData(src,tableStore, recordsOut,onChanged,overrides ={forceUpdate:false})
	{
		let hasChanged = false;
		this.RetrievePage(src,(pageHtml)=>{
			const stringTable = this.PageToTable(pageHtml);
			const numTable = this.TableStrToNumber(stringTable);
			
			let updateIndex = (value,index)=>{
				if(!recordsOut[index])
					recordsOut[index]=[];
				recordsOut[index].push({points:value,time:this.GetNow()});
				tableStore[index]=value;
			};
			//if(table.length!=oldtable.length)
			numTable.forEach((element,index) => {
				if(element != tableStore[index]||overrides.forceUpdate)
				{
					updateIndex(element,index);
					hasChanged =true;
				}
			});
			if(hasChanged&&onChanged)
				onChanged(src,tableStore,recordsOut);
		});
	}
	
	
};

function TestTableStrToRecord()
{
	let dr = new DataRetrieval();
	let dummyData = ["18,882,400pt","10,214,700pt","7,195,750pt","3,606,100pt","2,012,850pt"];
	let dummyRetrievePage = (src,cb)=>{
		debugLog("DUMMY RETRIEVE PAGE!");
		cb(src);
	};
	let dummyPageToTable = (html)=>
	{
		return dummyData;
	};
	let tableStore = [];
	let records = [];
	dr.RetrievePage = dummyRetrievePage;
	dr.PageToTable = dummyPageToTable;
	dr.RetrieveAndRecordData("dummy src",tableStore,records,(src,tableStore,records)=>{
		console.log(records);
	});
}

function TestRetrieveToRecord()
{
	let dr = new DataRetrieval();
	let dummyData = ["18,882,400pt","10,214,700pt","7,195,750pt","3,606,100pt","2,012,850pt"];
	let dummyTableFromDom = (dom)=>{
		debugLog(dom.window.document.body.children[0].children[1].children.length);
		return dom.window.document.body.children[0].children[1].children;
	};
	let tableStore = [];
	let records = [];
	dr.GetTableFromDom=dummyTableFromDom;
	dr.RetrieveAndRecordData("http://localhost:8080/index.html",tableStore,records,(src,tableStore,records)=>{
		console.log(records);
	});
}
TestTableStrToRecord();
TestRetrieveToRecord();