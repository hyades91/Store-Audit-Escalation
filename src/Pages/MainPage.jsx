
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
  


 //--File UPLOADER - START
 const [obj, setObj] = useState();
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
       setObj(JSON.parse(e.target.result).payload[0].questions);
     }
   }
 };

/*
   //--File UPLOADER - START
   const [obj, setObj] = useState();
   const [rawFile, setRawFile] = useState();
   const [jsonData, setJsonData] = useState(null);
  const handleFileChange = (e) => {
    e.preventDefault();
    setRawFile(e.target.files[0]);

    if (e.target.files) {
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(e.target.files[0]);
      fileReader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        let jsonObject = {};
        workbook.SheetNames.forEach((sheet) => {
          jsonObject[sheet] = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheet]
          );
        });

        setJsonData(jsonObject);
      };
    }
  }

  console.log(jsonData)
  */


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

  console.log(link)
  console.log(startDate)
  console.log(endDate)

  const [jsonData, setJsonData] = useState(null);
  

  console.log(jsonData)


    return (
      <div className="MainPageDiv">
        <div>   

        <select defaultValue={"Country"} className="countrySelector" onChange={(e) => linkChanger(e)}>
          <option disabled hidden>Country</option>
          <option>HU</option>
          <option>CZ</option>
          <option>SK</option>
        </select>

        <select defaultValue={new Date().getMonth()<2?new Date().getFullYear()-1:new Date().getFullYear()} className="yearSelector" onChange={(e)=>linkChanger(e)}>
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

        <h3>1. Click on the link and login </h3>
        <a href={link} target="_blank">Request data</a>
        <h3>2.Right click, Save as </h3>
        <h3>3.Choose file </h3>
        <input type="file" onChange={(e)=>handleFileChange(e)} />
        <div>{rawFile && `${rawFile.name} - ${rawFile.type}`}</div>
        <h3>Click on "Update" button </h3>
        <button onClick={()=>console.log(obj)}>Update</button>
      
      </div>
      {obj&&
      <div className="MainTable">
      <table >
        <thead>
          <tr >
           <th></th>
           <th></th>
            {obj[0].line.map(s=>s.storeNO).map(s=>
              <th >{s}</th>
            )}
          </tr>
          <tr>
            <th >Question Code</th>
            <th >Question____________________________________________________</th>
            {obj[0].line.map(s=>s.storeNam).map(s=>
              <th>{s}</th>
            )}
          </tr>
        </thead>
  
        <tbody>
      
            {obj.map(q=>
                <tr style={{ width: 200, fontWeight: 'bold', border: '1px solid black'}}>{q.codeID}
                    <td style={{ width: 200, fontWeight: 'bold', border: '1px solid black' }}>{q.task}</td>
                    {q.line.map(s=>
                     <th style={{ border: '1px solid black' }} >{s.resultG?"G":s.resultNA?"NA":"R"}</th>
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
  