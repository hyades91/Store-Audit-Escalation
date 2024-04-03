
//import MainPageComponent from "../Components/MainPage/MainPageComponent";

import { useEffect,  useState, useContext } from "react";
import { UserContext } from "./..";
import { useNavigate } from "react-router-dom";
//import Loading from "../Components/Loading";
import urlString from "./..";
var XLSX = require("xlsx")

//GET FINISHED VISITS
const fetchData = (link) => {
  try{
    //console.log("fetching...");
    return fetch(link,{
      method: 'GET',

    })
    .then((res) => res.json())
    .catch((err)=>console.error("Error during visit fetch (first catch):"+err));
  }catch (error) {
    console.error("Error during visit fetch (second catch)", error);
  };
 
};


const MainPage = () => {

  const [country, setCountry] = useState(""); 
  const [year, setYear] = useState(new Date().getMonth()<2?new Date().getFullYear()-1:new Date().getFullYear()); 
  const [link, setLink] = useState(""); 
  //const [startDate, setStartDate] = useState(new Date().getMonth()<2?(new Date().getFullYear()-1).toString()+"-03-01":new Date().getFullYear().toString()+"-03-01");
 
  const newStartDate = new Date(); // A startDate beállítása
  newStartDate.setDate(newStartDate.getDate() - 6); 
  const [startDate, setStartDate] =  useState(newStartDate.toISOString().substring(0,10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0,10));
  
  const [rawObj, setRawObj] = useState(null); 
  const [sumTable, setSumTable] = useState(null); 
  const [storeList, setStoreList] = useState(null); 
  const [questionList, setQuestionList] = useState(null); 

  const [treshold, setTreshold] = useState(0,3); 
  const escalationCategories=[
    {
      name: "Hygiene and Sanitation",
      codeID: ["1.10","1.12","1.16","2.07","2.09","2.12","3.09","4.09"]
    },
    {
      name: "Date code",
      codeID: ["1.20","1.21","2.18","3.17","4.18", "5.18",  "6.17",  "7.17",  "8.10", "10.01", "14.11"
      ]
    },
    {
      name: "Allergens",
      codeID: ["1.27", "2.14","2.21","2.22", "2.24", "4.21","5.12", "7.13"]
    },
    {
      name: "Cold chain",
      codeID: ["9.06","9.07","9.08","9.11","9.12", "9.13","9.14"]
    },
    {
      name: "Pest control",
      codeID: ["11.13","11.14"]
    }
  ]

 //--File UPLOADER - START
 //const [obj, setObj] = useState();
 const [rawFile, setRawFile] = useState();
// const [file, setFile] = useState();

const handleFileChange = (e) => {
  e.preventDefault();
  setRawFile(e.target.files[0])
  console.log(e.target.files[0])
  if (e.target.files) {

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {
      //console.log("e.target.result", e);
      sumTableUpdater(JSON.parse(e.target.result).payload[0].questions);
    }
  
  }
};


function sumTableUpdater(obj){
  if (sumTable===null){
    setSumTable(obj)
  }
  else{
    let newTable=sumTable
    obj.forEach(element => {
      console.log(!questionList.includes(element.codeID))
      
      if(questionList.includes(element.codeID)){
        newTable.filter(newElement=>newElement.codeID===element.codeID)[0].line.push(...(element.line))
      }

      else if(!questionList.includes(element.codeID)){
        newTable.push(element)
       /* if (storeList){
          storeList.forEach(store=>{
            let existedStore={
              storeNO: store.storeNO,
              storeNam: store.storeNam,
              resultR: null,
              resultNA: 1,
              resultG: null,
            }
            newTable[newTable.length-1].line.push(existedStore)
          })
           
          }
        */
        }
    });
    setSumTable(newTable)
  }
  setRawObj(obj)
}

  const linkChanger = (e) => {
    e.preventDefault();
    console.log(e)
    console.log(e.target.value)

    if(e.target.className==="countrySelector"){
    setCountry(e.target.value)
    }
    else if(e.target.className==="yearSelector"){
      setYear(e.target.value)
    }

    else if(e.target.className==="startDateSelector"){
      setStartDate(e.target.value)
    }
    else if(e.target.className==="endDateSelector"){
      setEndDate(e.target.value)
    }


  }
  
  useEffect(() => {
    setLink(`https://tlt.ourtesco.com/tlt/sas/reports/storeReport?country=${country}&dateFrom=${startDate.split("-").reverse().join(".")}&dateTo=${endDate.split("-").reverse().join(".")}&outlineName=CE%20audit%20${year}&auditType=0&_=`)
  }, [year,country,startDate,endDate]);
  
  useEffect(() => {
    console.log("hello")
    sumTable&&setStoreList(sumTable[0].line.map(s=>{
      return {
        storeNO: s.storeNO,
        storeNam: s.storeNam
      }
    }))
    sumTable&&setQuestionList(sumTable.map(s=>s.codeID))
  }, [sumTable,rawObj]);
  

  console.log(link)
  //console.log(startDate)
  //console.log(endDate)
  console.log(sumTable)
  console.log(storeList)
  console.log(questionList)

  
 
    return (
      <div className="MainPageDiv">
       
        <div className="Filters">   

          <select className="countrySelector" defaultValue={"Country"} onChange={(e) => linkChanger(e)}>
            <option disabled hidden>Country</option>
            <option>HU</option>
            <option>CZ</option>
            <option>SK</option>
          </select>

          <select className="yearSelector" defaultValue={new Date().getMonth()<2?new Date().getFullYear()-1:new Date().getFullYear()} onChange={(e)=>linkChanger(e)}>
            <option>2021</option>
            <option>2022</option>
            <option>2023</option>
            <option>2024</option>
            <option>2025</option>
          </select>

          <div className="DateFilter">
            <label>Date: </label><br></br>
            <input className="startDateSelector" onChange={(e)=>linkChanger(e)} type="date" min="2021-03-01" defaultValue={startDate} id="start"></input>
            <input className="endDateSelector" onChange={(e)=>linkChanger(e)} type="date" min="2021-03-01" defaultValue={endDate} id="end"></input>
          </div>

          <div className="ManualForUser">
            <h3>1. Click on the link and login </h3>
            <a href={link} target="_blank">Request data</a>
            <h3>2.Right click, Save as </h3>
            <h3>3.Choose file </h3>
            <input type="file" onChange={(e)=>handleFileChange(e)} />
            <div>{rawFile && `${rawFile.name} - ${rawFile.type}`}</div>
            <h3>Click on "Update" button </h3>
            <button onClick={()=>console.log(sumTable)}>Update</button>
          </div>

        </div>

        {sumTable&&storeList&&
        <div className="MainTable">
        <table >
          <thead>
            <tr >
              <th></th>
              <th></th>
                {sumTable[0].line.map(s=>
                  <th  key={s.storeNO}>{s.storeNO}</th>
                )}
            </tr>
            <tr>
              <th >Question Code</th>
              <th >Question____________________________________________________</th>
              {sumTable[0].line.map(s=>
                <th key={s.storeNO}>{s.storeNam}</th>
              )}
            </tr>
          </thead>
    
          <tbody>

              {sumTable.map(q=>
                  <tr key={q.codeID} style={{ width: 200, fontWeight: 'bold', border: '1px solid black'}}>{q.codeID}
                      <td style={{ width: 200, fontWeight: 'bold', border: '1px solid black' }}>{q.task}</td>
                      {storeList.map(s=>
                      <th key={s.storeNO} style={{ border: '1px solid black' }} >{!q.line.map(store=>store.storeNO).includes(s.storeNO)?"NA":q.line.filter(store=>store.storeNO===s.storeNO)[0].resultG?"G":q.line.filter(store=>store.storeNO===s.storeNO)[0].resultR?"R":"NA"}</th>
                      )}
                  </tr>
              )}

          </tbody>
    
        </table>
      </div>
    }
    </div>
    )
  
  };
  
  export default MainPage;
  