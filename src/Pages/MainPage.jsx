
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

  const [treshold, setTreshold] = useState(0.3); 
console.log("treshold:"+treshold)
  const [escalationTable, setEscalationTable] = useState(null); 
  const [selectedEscCat, setSelectedEscCat] = useState(["Hygiene and Sanitation","Date code","Allergens","Cold chain","Pest control"]); 
  const escalationCategories=[
    {
      name: "Hygiene and Sanitation",
      codeIDs: ["1.10","1.12","1.16","2.07","2.09","2.12","3.09","4.09"]
    },
    {
      name: "Date code",
      codeIDs: ["1.20","1.21","2.18","3.17","4.18", "5.18",  "6.17",  "7.17",  "8.10", "10.01", "14.11"]
    },
    {
      name: "Allergens",
      codeIDs: ["1.27", "2.14","2.21","2.22", "2.24", "4.21","5.12", "7.13"]
    },
    {
      name: "Cold chain",
      codeIDs: ["9.06","9.07","9.08","9.11","9.12", "9.13","9.14"]
    },
    {
      name: "Pest control",
      codeIDs: ["11.13","11.14"]
    }
  ]
  const [escalationSumTableActive, setEscalationSumTableActive]=useState(false)
  const [escalationTableActive, setEscalationTableActive]=useState(false)
  const [summaryTableActive, setSummaryTableActive]=useState(true)
  
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
    setSumTable(newTable.sort((elem1,elem2)=>Number(elem1.codeID)>Number(elem2.codeID)?1:-1))
  }
  setRawObj(obj)
}

const calculateEscalation = (newDetailedList)=>{
  console.log((question=>question.result===-1).length/newDetailedList.filter(question=>question.result===1||question.result===-1).length)
  console.log (treshold)
  return newDetailedList.filter(question=>question.result===-1).length/
  newDetailedList.filter(question=>question.result===1||question.result===-1).length>=treshold
}
const calculateEscalationRatio = (newDetailedList)=>{
  return newDetailedList.filter(question=>question.result===-1).length/
  newDetailedList.filter(question=>question.result===1||question.result===-1).length
}

const makeEscalationTable = (store) =>{
  let EscalationTable=[]
  escalationCategories.forEach(category=>{
    let newDetailedList=[]
    category.codeIDs.forEach(id=>{
      let filteredQuestion=sumTable.filter(question=>question.codeID===id)[0]
      let filteredStore
      if (filteredQuestion){
        filteredStore=filteredQuestion.line.filter(st=>st.storeNO===store.storeNO)[0]
      }
      if  (store.storeNO===44077)
      {     console.log(id)
        console.log("filteredQuestion:"+filteredQuestion)
        console.log("filteredStore:"+filteredStore)
      }
 
      newDetailedList.push(
        {
          codeID: id,
          result: filteredQuestion?filteredStore?filteredStore.resultG?1:filteredStore.resultR?-1:0:0:0
        }
      )

    })
    EscalationTable.push({
      categoryName: category.name,
      detailedList: newDetailedList,
      escalation: calculateEscalation(newDetailedList),
      escalationRatio: calculateEscalationRatio(newDetailedList)
    })
  })
 return EscalationTable
}

const makeStoreEscalationTable=()=>{
  let newEscalationTable=[]
  storeList.forEach(store=>{
    let newStore={
      storeNO: store.storeNO,
      storeNam: store.storeNam,
      escalationTable: makeEscalationTable(store)
    }
    newEscalationTable.push(newStore)
})
setEscalationTable(newEscalationTable)
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
  

  useEffect(() => {
    console.log("hello2")
    
  }, [sumTable,rawObj]);
  

  console.log(link)
  //console.log(startDate)
  //console.log(endDate)
  console.log(sumTable)
  console.log(storeList)
  console.log(questionList)
  console.log(escalationTable)

  
 
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
        
            <h3>StoreEscalation </h3>
            <button onClick={()=>makeStoreEscalationTable()}>Create StoreEscalationData</button>
          </div>

        </div>
{/*ESCALATION SUMMARY TABLE*/}
<button onClick={()=>escalationSumTableActive?setEscalationSumTableActive(false):setEscalationSumTableActive(true)}>StoreEscalationSummaryTable</button>
        
        {escalationSumTableActive&&sumTable&&storeList&&
       <div className="EscalationTable">
        <table >

          <thead>
            <tr >
              <th></th>
                {escalationTable.map(e=>
                  <th  key={e.storeNO}>{e.storeNO}</th>
                )}
            </tr>
            <tr>
              <th >Escalation Category</th>
              {escalationTable.map(e=>
                <th key={e.storeNO}>{e.storeNam}</th>
              )}
            </tr>
          </thead>
    
          <tbody>
              {selectedEscCat.map(catName=>
                  
                  <tr>
          
                    <th style={{ width: 200, fontWeight: 'bold', border: '1px solid black'}}>{catName}</th>
                   
                    {escalationTable.map(st=>
                    <td key={st.storeNO} >{st.escalationTable.filter(esc=>esc.categoryName===catName)[0].escalationRatio}</td>
                    )}
                  
                  </tr>
                  
              )}
          </tbody>

        </table>
      </div>
    }



<br></br>
        <button onClick={()=>escalationTableActive?setEscalationTableActive(false):setEscalationTableActive(true)}>StoreEscalationTable</button>
        
        {escalationTableActive&&sumTable&&storeList&&
       <div className="EscalationTable">
        <table >

          <thead>
            <tr >
              <th></th>
              <th></th>
              <th></th>
                {sumTable[0].line.map(s=>
                  <th  key={s.storeNO}>{s.storeNO}</th>
                )}
            </tr>
            <tr>
              <th >Escalation Category</th>
              <th >Question Code</th>
              <th >Question____________________________________________________</th>
              {sumTable[0].line.map(s=>
                <th key={s.storeNO}>{s.storeNam}</th>
              )}
            </tr>
          </thead>
    
          <tbody>
              {selectedEscCat.map(catName=>
                  escalationCategories.filter(escCat=>escCat.name===catName)[0].codeIDs.map(id=>
                  <tr key={id} >
          
                    <th style={{border: '1px solid black'}}>{catName}</th>
                    <th style={{border: '1px solid black' }}>{id}</th>
                    <th style={{border: '1px solid black' }}>{sumTable.map(s=>s.codeID).includes(id)?sumTable.filter(s=>s.codeID===id)[0].task:"Not availabe"}</th>
                    
                    {storeList.map(st=>
                    <td key={st.storeNO} style={{ border: '1px solid black' }} >{!sumTable.map(s=>s.codeID).includes(id)?"NA":
                    !sumTable.filter(s=>s.codeID===id)[0].line.map(store=>store.storeNO).includes(st.storeNO)?"NA":
                    sumTable.filter(s=>s.codeID===id)[0].line.filter(store=>store.storeNO===st.storeNO)[0].resultG?"G":
                    sumTable.filter(s=>s.codeID===id)[0].line.filter(store=>store.storeNO===st.storeNO)[0].resultR?"R":
                    "NA"}</td>
                    )}
                  
                  </tr>
                  )
              )}
          </tbody>

        </table>
      </div>
    }



{/*SUMMARY TABLE WITH ALL RESULTS*/}
      <br></br>
      <button onClick={()=>summaryTableActive?setSummaryTableActive(false):setSummaryTableActive(true)}>SummaryTable</button>

        {summaryTableActive&&sumTable&&storeList&&
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
  