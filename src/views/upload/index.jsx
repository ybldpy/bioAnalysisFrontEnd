// src/pages/UploadView.jsx
import React, {
  useReducer,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  Input,
  Row,
  theme,
  Col,
  Select,
  Typography,
  Space,
  Button,
} from "antd";
const { Text } = Typography; // ✅ 从 Typography 拿出 Text

import {
  InboxOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { Form, Radio } from "antd";
import "./index.css";

const initialState = {
  files: [], // { id, file, options, status, progress, xhr }
  concurrency: 3,
  uploading: false,
};

const sampleType = {
  virus: {
    code: 0,
    label: "病毒"
  },
  bacteria: {
    code: 1,
    label: "细菌"
  },
  covid: {
    code: 2,
    label: "新冠"
  },
};

const sampleChineseTypeMap = {
  "病毒": "virus", 
  "细菌": "bacteria",
  "新冠": "covid"
}

const readType = {
  SE: 0,
  PE: 1,
};

const refSeqAccessionMap = {};
function UploadBtn({
  onFiles,
  accept,
  multiple = true,
  disabled = false,
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

function SampleCard({
  sampleConfig,
  selectableR2SampleList,
  onSelectR2Sample,
  onUpdateSampleConfig,
  deleteSampleHandler,
}) {
  const [sampleNameEditing, setSampleNameEditing] = useState(false);

  const finishEdit = () => {
    setSampleNameEditing(false);
  };

  function onSampleReadTypeChange(e) {
    const newSampleConfig = { ...sampleConfig };
    newSampleConfig.readType = e.target.value;
    onUpdateSampleConfig(newSampleConfig);
  }

  const onInputSampleNameChange = (e) => {
    onUpdateSampleConfig({ ...sampleConfig, sampleName: e.target.value });
  };

  const onR2ConfigSelectClear = () => {
    onSelectR2Sample(sampleConfig, null);
  };

  const onR2SampleChange = (r2SampleConfigSid) => {
    onSelectR2Sample(sampleConfig, r2SampleConfigSid);
  };

  const handlSampleTypeChange = (code)=>{
    onUpdateSampleConfig({
      ...sampleConfig,
      sampleType: code
    });
  }


  const sampleNameLabel = "样本名称";
  return (
    <div className="sample_card">
      <div className="sample_card_header">
        <div className="sample_card_status">待上传</div>
        <div
          className="sample_card_delete_btn"
          onClick={(e) => {
            deleteSampleHandler(sampleConfig);
          }}
        >
          <DeleteOutlined size={16} />
        </div>
      </div>
      <div className="sample_card_body">
        <Form>
          <Row>
            <Col>
              <Form.Item label={sampleNameLabel}>
                {sampleNameEditing ? (
                  <Space.Compact style={{ width: "100%" }}>
                    <Input
                      autoFocus
                      value={sampleConfig.sampleName}
                      onChange={(e) => {
                        onInputSampleNameChange(e);
                      }}
                      onPressEnter={finishEdit}
                      // 失焦也算完成（不想的话可以去掉）
                    />
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={finishEdit}
                    >
                      完成
                    </Button>
                  </Space.Compact>
                ) : (
                  // 非编辑状态：文本 + 编辑按钮
                  <Space>
                    {sampleConfig.sampleName ? (
                      <Text>{sampleConfig.sampleName}</Text>
                    ) : (
                      <Text type="secondary">未命名样本</Text>
                    )}

                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setSampleNameEditing(true)}
                    >
                      编辑
                    </Button>
                  </Space>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label={"样本文件"}>
                {sampleConfig.r1SampleFile.name}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col>
              <Form.Item label="测序方式">
                <Radio.Group
                  value={sampleConfig.readType}
                  onChange={onSampleReadTypeChange}
                >
                  <Radio value={readType.SE}>单端</Radio>
                  <Radio value={readType.PE}>双端</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            {/* 只有是双端时才显示第二端样本文件（可选逻辑） */}

            <Col>
              <Form.Item label="第二端样本">
                <Select
                  style={{ minWidth: 100 }}
                  disabled={sampleConfig.readType === readType.SE}
                  onChange={onR2SampleChange}
                  allowClear={true}
                  onClear={onR2ConfigSelectClear}
                >
                  {selectableR2SampleList.map((s) => (
                    <Select.Option key={s.sid} value={s.sid}>
                      {s.sampleName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Item label={"样本类型"}>
                <Select value={sampleConfig.sampleType} style={{minWidth: 100}} onChange={handlSampleTypeChange}>
                  { 
                    Object.entries(sampleType).map((([k,v])=>{
                      return (<Select.Option key={v.code} value={v.code}>
                        {v.label}
                      </Select.Option>)
                    }))
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="sample_card_footer"></div>
    </div>
  );
}

function createSampleConfig(sampleFile) {
  const id = crypto.randomUUID();

  return {
    sid: id,
    sampleName: sampleFile.name,
    r1SampleFile: sampleFile,
    r2SampleConfigId: null,
    readType: readType.SE,
    sampleType: sampleType.virus,
    refSeqAccession: null,
    uploadStatus: 0,
    isPaired: false,
  };
}

export default function Upload() {
  const [sampleList, setSampleList] = useState([]);

  const onSamplesSelect = (files) => {
    const samples = files.map((f) => createSampleConfig(f));
    setSampleList(samples);
  };

  function onUpdateSampleConfig(sampleConfig) {
    const newSampleList = sampleList.map((s) => {
      if (s.sid === sampleConfig.sid) {
        return sampleConfig;
      } else {
        return s;
      }
    });

    if (sampleConfig.readType === readType.SE && sampleConfig.r2SampleConfig) {
      newSampleList.push(sampleConfig.r2SampleConfig);
      sampleConfig.r2SampleConfig = null;
    }
    setSampleList(newSampleList);
  }

  const onR2Select = (sampleConfig, r2SampleId) => {
    let newList = [...sampleList];

    if (!r2SampleId) {
      if (!sampleConfig.r2SampleConfigId) {
        const r2Sample = sampleList.find(
          (s) => s.sid === sampleConfig.r2SampleConfigId
        );
        if (!r2Sample) {
          r2Sample.isPaired = false;
        }
      }
      sampleConfig.r2SampleConfigId = null;
    } else {
      const r2Sample = sampleList.find((s) => s.sid === r2SampleId);
      if (!r2Sample) {
        r2Sample.isPaired = true;
        sampleConfig.r2SampleConfigId = r2SampleId;
      }
    }

    setSampleList(newList);
  };

  const sampleDeleteHandler = (sampleConfig) => {
    setSampleList((list) => {
      return list.filter(
        (s) =>
          s.sid !== sampleConfig.sid && s.sid !== sampleConfig.r2SampleConfigId
      );
    });
  };

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
        <UploadBtn onFiles={onSamplesSelect} />
      </div>
    </>
  ) : (
    <>
      <div className="sample_card_list">
        {sampleList
          .filter((i) => !i.isPaired)
          .map((i) => {
            return (
              <SampleCard
                key={i.sid}
                sampleConfig={i}
                selectableR2SampleList={sampleList.filter(
                  (s) => s.sid !== i.sid && s.readType === readType.SE
                )}
                onUpdateSampleConfig={onUpdateSampleConfig}
                onSelectR2Sample={onR2Select}
                deleteSampleHandler={sampleDeleteHandler}
              />
            );
          })}
      </div>
    </>
  );
}
