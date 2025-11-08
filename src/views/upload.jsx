// src/pages/UploadView.jsx
import React, { useReducer, useRef, useCallback, useState, useEffect } from "react";
import { theme } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const initialState = {
  files: [], // { id, file, options, status, progress, xhr }
  concurrency: 3,
  uploading: false,
};

const sampleType = {
    "virus": 0,
    "bacteria": 1,
    "covid": 2

}

const readType = {
    "SE": 0,
    "PE": 1
}


const refSeqAccessionMap = {}

function reducer(state, action) {
  switch (action.type) {
    case "ADD_FILES": {
      const added = Array.from(action.files).map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        file,
        options: {
          sampleName: file.name.replace(/\.(fastq|fq|gz|fa|fasta)/i, ""),
          refAccession: "",
          layout: "SE", // SE or PE
          threads: 2,
          note: "",
        },
        status: "queued", // queued | uploading | done | error | paused
        progress: 0,
        xhr: null,
      }));
      return { ...state, files: state.files.concat(added) };
    }
    case "UPDATE_OPTIONS": {
      const { id, patch } = action;
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === id ? { ...f, options: { ...f.options, ...patch } } : f
        ),
      };
    }
    case "SET_STATUS": {
      const { id, status } = action;
      return {
        ...state,
        files: state.files.map((f) => (f.id === id ? { ...f, status } : f)),
      };
    }
    case "SET_PROGRESS": {
      const { id, progress } = action;
      return {
        ...state,
        files: state.files.map((f) => (f.id === id ? { ...f, progress } : f)),
      };
    }
    case "SET_XHR": {
      const { id, xhr } = action;
      return {
        ...state,
        files: state.files.map((f) => (f.id === id ? { ...f, xhr } : f)),
      };
    }
    case "REMOVE": {
      return { ...state, files: state.files.filter((f) => f.id !== action.id) };
    }
    case "CLEAR_FINISHED": {
      return {
        ...state,
        files: state.files.filter((f) => f.status !== "done"),
      };
    }
    case "SET_UPLOADING": {
      return { ...state, uploading: action.value };
    }
    case "SET_CONCURRENCY": {
      return { ...state, concurrency: action.value };
    }
    default:
      return state;
  }
}

function UploadBtn({
  onFiles,
  accept,
  multiple = true,
  disabled=false,
  height = 200,
  minWidth = 600,
  
}) {
  const inputRef = useRef(null);
  const { token } = theme.useToken(); // 跟随 AntD 主题
  const [dragging, setDragging] = useState(false);

  const openPicker = () => !disabled && inputRef.current?.click();
  const handleChange = (e) => {
    if (disabled) return;
    const files = Array.from(e.target.files || []);
    if (files.length) onFiles(files);
    e.target.value = ""; // 允许重复选择同一文件
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
      onDragOver={(e) => {
        e.preventDefault();
        !disabled && setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        height,
        minWidth: `${minWidth}px`,
        borderRadius: 12,
        border: `1px dashed ${
          dragging ? token.colorPrimary : token.colorBorder
        }`,
        background: dragging ? token.colorFillSecondary : "#fafafa",
        outline: dragging ? `2px solid ${token.colorPrimary}` : "none",
        transition: "all .15s",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 24,
      }}
      aria-disabled={disabled}
      aria-label="Upload files"
    >
      <div>
        <div style={{ fontSize: 42, color: token.colorPrimary }}>
          <InboxOutlined />
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>
          将样本拖拽或者点击上传样本
        </div>
        <div style={{ color: token.colorTextTertiary, marginTop: 6 }}>
          支持多样本上传
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}


function SampleCard({sampleConfig, samplesList, onSelectR2Sample, onSampleDelete}){


    return (
        
    )

}





function createSampleConfig(sampleFile){
    const id = crypto.randomUUID();

    return {
        sid: id,
        sampleName: sampleFile.name,
        r1SampleFile: sampleFile,
        r2SampleFile: null,
        readType: readType.SE,
        sampleType: sampleType.virus
    }
}

export default function Upload() {
  const [sampleList, setSampleList] = useState([]);



  useEffect(()=>{


  },[]);

  const onSamplesSelect = (files)=>{
    const samples = files.map((f)=>createSampleConfig(f));
    setSampleList(samples);
  }


  
  return sampleList.length === 0 ? (
    <>
      <div
        style={{
          height: "90vh",
          display: "flex",
          alignItems: "center", // 竖直居中
          justifyContent: "center", // 水平居中
        }}
      >
        <UploadBtn onFiles={onSamplesSelect}/>
      </div>
    </>
  ) : (
    <>


    
    
    </>
  );
}
