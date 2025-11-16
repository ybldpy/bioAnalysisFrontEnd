// src/pages/UploadView.jsx
import { useRef, useState, useEffect } from "react";
import {
  Input,
  Row,
  theme,
  Col,
  Select,
  Typography,
  Space,
  Button,
  Upload as AntdUpload,
  Spin,
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
import { loadRefSeq, uploadSample } from "../../api/sampleService";
import { useForm } from "antd/es/form/Form";

const sampleType = {
  virus: {
    code: 0,
    label: "病毒",
  },
  bacteria: {
    code: 1,
    label: "细菌",
  },
  covid: {
    code: 2,
    label: "新冠",
  },
};

const sampleFileType = {
  fasta: 0,
  fastq: 1,
};

const readType = {
  SE: 0,
  PE: 1,
};

const uploadStatus = {
  pending: 0,
  uploading: 1,
  fail: 2,
  ok: 3,
};

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
  refSeqList,
  onSelectR2Sample,
  onUpdateSampleConfig,
  deleteSampleHandler,
}) {
  const [sampleNameEditing, setSampleNameEditing] = useState(false);

  const [form] = useForm();

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

  const onRefSeqChange = (refSeqId) => {
    onUpdateSampleConfig({
      ...sampleConfig,
      refSeqAccession: refSeqId,
    });
  };

  const sampleNameLabel = "样本名称";
  return (
    <Spin spinning={sampleConfig.uploadStatus.code === uploadStatus.uploading}>
      <div className="sample_card">
        <div className="sample_card_header">
          <div
            className={
              "sample_card_status" +
              (sampleConfig.uploadStatus.code === uploadStatus.pending
                ? " sample_card_status_pending"
                : sampleConfig.uploadStatus.code === uploadStatus.uploading
                ? " sample_card_status_uploading"
                : " sample_card_status_fail")
            }
          >
            {sampleConfig.uploadStatus.code === uploadStatus.pending
              ? "待上传"
              : sampleConfig.uploadStatus.code === uploadStatus.uploading
              ? "正在上传"
              : sampleConfig.uploadStatus.code === uploadStatus.fail
              ? sampleConfig.uploadStatus.errorMsg
              : "上传成功"}
          </div>
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
            {sampleConfig.sampleFileType === sampleFileType.fastq && (
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

                <Col span={8}>
                  <Form.Item label="第二端样本">
                    <Select
                      style={{}}
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
            )}

            {
              <Row>
                <Col span={24}>
                  <Form.Item label={"选择参考基因组"} style={{ maxWidth: 450 }}>
                    <Select allowClear={true} onChange={onRefSeqChange}>
                      {refSeqList &&
                        Object.entries(refSeqList).map(([k, v]) => {
                          return (
                            <Select.Option value={k}>{v.label}</Select.Option>
                          );
                        })}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            }
          </Form>
        </div>
        <div className="sample_card_footer"></div>
      </div>
    </Spin>
  );
}

function substractSampleFileType(filename) {
  if (!filename) return null;

  // 全小写，方便判断
  let lower = filename.toLowerCase();

  // 如果是 .gz 结尾，先去掉 .gz （fastq.gz / fasta.gz 很常见）
  if (lower.endsWith(".gz")) {
    lower = lower.slice(0, -3); // 去掉末尾的 ".gz"
  }

  // 判断 fasta 系列后缀
  if (
    lower.endsWith(".fasta") ||
    lower.endsWith(".fa") ||
    lower.endsWith(".fna")
  ) {
    return sampleFileType.fasta;
  }

  // 判断 fastq 系列后缀
  if (lower.endsWith(".fastq") || lower.endsWith(".fq")) {
    return sampleFileType.fastq;
  }

  return null;
}

function transformSampleConfig(sampleConfig, r2Sample) {
  const {
    sid,
    sampleName,
    r1SampleFile,
    sampleType,
    refSeqAccession,
    ...viewProps
  } = sampleConfig;

  return {
    sid,
    sampleName,
    r1SampleFile,
    sampleType: sampleType.code,
    refSeqAccession,
    r2Sample
  };
}

function createSampleConfig(sampleFile) {
  const id = crypto.randomUUID();

  const sampleFileType = substractSampleFileType(sampleFile.name);
  if (sampleFileType === null) {
    return null;
  }
  return {
    sid: id,
    sampleName: sampleFile.name,
    sampleFileType: sampleFileType,
    r1SampleFile: sampleFile,
    r2SampleConfigId: null,
    readType: readType.SE,
    sampleType: sampleType.virus,
    refSeqAccession: null,
    uploadStatus: {
      code: uploadStatus.pending,
      errorMsg: null,
    },
    isPaired: false,
  };
}

export default function Upload() {
  const [sampleList, setSampleList] = useState([]);
  const [successUploadSampleList, setSuccessSampleList] = useState([]);
  const [virusRefSeqList, setVirusRefSeqList] = useState({});
  const [bacteriaRefSeqList, setBacteriaRefSeqList] = useState({});

  const moreInputRef = useRef();

  const [selectedSampleType, setSelectedSampleType] = useState(
    sampleType.virus.code
  );

  const onSamplesSelect = (files) => {
    const samples = files
      .map((f) => createSampleConfig(f))
      .filter((s) => {
        return s !== null;
      });
    setSampleList(samples);
  };

  useEffect(() => {
    loadRefSeq(sampleType.virus)
      .then((virusRefSeqs) => {
        setVirusRefSeqList(virusRefSeqs);
      })
      .catch();

    loadRefSeq(sampleType.bacteria)
      .then((bacteriaRefSeqs) => {
        setBacteriaRefSeqList(bacteriaRefSeqs);
      })
      .catch();
  }, []);

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

  const onAddMoreSamples = (e) => {
    const files = Array.from(e.target.files || []);
    const existingKeys = new Set(
      sampleList.map((s) => {
        const f = s.r1SampleFile;
        return `${f.name}_${f.size}_${f.lastModified}`;
      })
    );

    const newSamples = files
      .filter((f) => {
        const key = `${f.name}_${f.size}_${f.lastModified}`;
        return !existingKeys.has(key);
      })
      .map((f) => createSampleConfig(f));

    setSampleList((old) => {
      return [...old, ...newSamples];
    });

    e.target.value = "";
  };

  const onClickUploadHandler = (e) => {
    const toUploadSamples = sampleList
      .filter((s) => {
        return (
          (!s.isPaired && s.uploadStatus.code === 0) ||
          s.uploadStatus.code === uploadStatus.fail
        );
      })
      .map((s) => {
        let r2Sample = null;
        if (!s.r2SampleConfigId) {
          r2Sample = sampleList.find((r2Sample) => {
            r2Sample.sid === s.sid;
          });
        }
        return transformSampleConfig(s, r2Sample);
      });

    setSampleList((old) => {
      return old.map((s) => {
        if (
          !s.isPaired &&
          (s.uploadStatus.code === uploadStatus.pending ||
            s.uploadStatus.code === uploadStatus.fail)
        ) {
          return {
            ...s,
            uploadStatus: {
              code: uploadStatus.uploading,
              errorMsg: null,
            },
          };
        }
        return s;
      });
    });

    for (let i = 0; i < toUploadSamples.length; i++) {
      uploadSample(toUploadSamples[i]).then((response) => {
        if (response.ok) {
          setSampleList((old) => {
            return old.filter((s) => {
              s.sid !== toUploadSamples[i].sid;
            });
          });

          const uploadedSample = {
            ...toUploadSamples[i],
            uploadStatus: {
              code: uploadStatus.ok,
              errorMsg: null,
            },
          };

          setSuccessSampleList((old) => {
            return [...old, uploadedSample];
          });
        } else {
          setSampleList((old) => {
            const index = old.findIndex(
              (s) => s.sid === toUploadSamples[i].sid
            );
            
            const newList = [...old];
            newList[index] = {
              ...newList[index],
              uploadStatus: {
                code: uploadStatus.fail,
                errorMsg: response.errorMsg
              }
            };
            return newList;
          });
        }
      });
    }
  };

  return (
    <>
      <div
        className="upload-toolbar"
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-start", // 居中，也可以改成 flex-start 靠左
        }}
      >
        {sampleList.length !== 0 && (
          <div style={{ marginRight: 10 }}>
            {/* 隐藏的 file input */}
            <input
              ref={moreInputRef}
              type="file"
              multiple
              onChange={onAddMoreSamples}
              style={{ display: "none" }}
              //onChange={onMoreSamplesSelect}
            />

            <Button
              type="primary"
              onClick={() => moreInputRef.current?.click()}
            >
              上传更多样本
            </Button>
          </div>
        )}
        <Form layout="inline">
          <Form.Item label="样本类型">
            <Select
              style={{ width: 160 }}
              value={selectedSampleType}
              onChange={(e) => {
                setSelectedSampleType(e);
                console.log(e);
              }}
            >
              {Object.values(sampleType).map((t) => (
                <Select.Option key={t.code} value={t.code}>
                  {t.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </div>

      {sampleList.length === 0 ? (
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
                      (s) =>
                        s.sid !== i.sid &&
                        i.sampleFileType === sampleFileType.fastq &&
                        s.sampleFileType === i.sampleFileType &&
                        s.readType === readType.SE &&
                        (!s.isPaired ||
                          (s.isPaired && s.sid === i.r2SampleConfigId))
                    )}
                    onUpdateSampleConfig={onUpdateSampleConfig}
                    onSelectR2Sample={onR2Select}
                    deleteSampleHandler={sampleDeleteHandler}
                    refSeqList={
                      i.sampleType === sampleType.virus.code
                        ? virusRefSeqList
                        : i.sampleType === sampleType.bacteria.code
                        ? bacteriaRefSeqList
                        : null
                    }
                  />
                );
              })}
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button type="primary" onClick={onClickUploadHandler}>
              上传
            </Button>
          </div>
        </>
      )}
    </>
  );
}
