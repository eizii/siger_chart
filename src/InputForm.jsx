import React from "react";
import KeywordSelector from "./KeywordSelector";
import Slider from "@mui/material/Slider";

const allKeywords = [
  "初心者向け","上級者向け","ロングサイズ","滑らか","強い吸いごたえ","コク深い","甘い","香りが良い","オーガニック","清涼感","アメリカンブレンド","バージニアブレンド","カプセル入り",
];

export default function InputForm({filters,onChange}){
  const handleTarChange = (event,newValue) =>{
    onChange({...filters,tarMin:newValue[0],tarMax:newValue[1]});
  };

  const handleNicChange =(event,newValue) =>{
    onChange({...filters,nicMin:newValue[0],nicMax:newValue[1]});
  };

  const handleFieldChange = (field,value) =>{
    onChange({...filters,[field]:value});
  };
  return(
    <div style={{marginBottom:"10px"}}>
      <div style={{marginBottom:"10px",width:"200px"}}>
        <label>タール(mg):{filters.tarMin}~{filters.tarMax}</label>
        <Slider 
          value={[filters.tarMin,filters.tarMax]}
          onChange={handleTarChange}
          valueLabelDisplay="auto"
          min={0}
          max={20}
          step={0.1}
          getAriaLabel={()=>"Tar range"}
          />
      </div>
      <div style={{margniBottom:"20px",width:"200px"}}>
        <label>ニコチン(mg):{filters.nicMin}~{filters.nicMax}</label>
        <Slider 
          value={[filters.nicMin,filters.nicMax]}
          onChange={handleNicChange}
          valueLabelDisplay="auto"
          min={0}
          max={1.5}
          step={0.01}
          getAriaLabel={()=>"Nicotine range"}
        />
      </div>
      <div style={{marginBottom:"20px"}}>
        <label>
          <input
            type="checkbox"
            checked={filters.mentholOnly}
            onChange={(e)=>handleFieldChange("mentholOnly",e.target.checked)}
          />
          メンソールのみ
        </label>
      </div>
      <div>
        <label>属性キーワード(複数選択):</label>
        <KeywordSelector
          keywords={allKeywords}
          selected={filters.keywords}
          onChange={(newKeywords)=>handleFieldChange("keywords",newKeywords)}
        />
      </div>
    </div>
  );
}