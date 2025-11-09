// src/pages/UploadView.jsx
import React, { useReducer, useRef, useCallback, useState, useEffect } from "react";
import { Input, Row, theme,Col} from "antd";
import { InboxOutlined, DeleteOutlined} from "@ant-design/icons";
import {Form} from "antd"
import "./index.css";

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


    const [sampleNameEditing, setSampleNameEditing] = useState(false);
    

    const sampleNameLabel = "样本名称";
    return (
        <div className="sample_card">
            <div className="sample_card_header">
                <div className="sample_card_status">待上传</div>
                <div className="sample_card_delete_btn">
                    <DeleteOutlined size={16}/>
                </div>
            </div>
            <div className="sample_card_body">
                <Form>
                    <Row>
                        <Col span={24}>
                            <Form.Item label={sampleNameLabel}>
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        {sampleConfig.readType===readType.SE && (
                            <Col>

                            </Col>
                        )}
                    </Row>
                </Form>
            </div>
            <div className="sample_card_footer">

            </div>
        </div>
    )

}

function createMockSampleData(){
}



function createSampleConfig(sampleFile){
    const id = crypto.randomUUID();

    return {
        sid: id,
        sampleName: sampleFile.name,
        r1SampleFile: sampleFile,
        r2SampleFile: null,
        readType: readType.SE,
        sampleType: sampleType.virus,
        refSeqAccession: null
    }
}

export default function Upload() {
  const [sampleList, setSampleList] = useState([]);

  useEffect(()=>{


    const a = [];
    for(let i = 0;i<10;i++){
        a.push(i);
    }
    // setSampleList(a);
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
        <div className="sample_card_list">
            {
                sampleList.map((i)=>{
                    return <SampleCard></SampleCard>
                })
            }
        </div>
    </>
  );
}
