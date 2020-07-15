import React, { useState } from "react";
import styled from "styled-components";
import { Popover, Input, Modal } from "antd";

import {
  DeleteFilled,
  PlusCircleOutlined,
  EyeInvisibleFilled,
  EyeFilled,
  PlusOutlined,
} from "@ant-design/icons";

const Container = styled.div`
  margin-bottom: 20px;
`;

const Header = styled.h2`
  font-weight: bold;
  font-size: 16px;
  margin: 6px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  & span {
    cursor: pointer;
    & span {
      margin-left: 8px;
    }
  }
`;

const DataItem = styled.div`
  width: 100%;
  height: 20px;
  background: rgba(237, 237, 237, 0.8);
  border-radius: 3px;
  padding: 1px 3px;
  color: #000;
  line-height: 18px;
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${(props) => props.pointer || "default"};
`;

const ExtraItem = styled.div`
  cursor: pointer;
  width: 100px;
  padding: 4px;
  border-radius: 3px;
  &:hover {
    background: #e2e9f3;
  }
  cursor: ${(props) => props.pointer || "default"};
`;

const Icon = styled.span`
  cursor: pointer;
`;

const PopoverContainer = styled.div`
  width: 100px;
`;

const Legend = styled.div`
  background: ${(props) => props.color};
  height: 10px;
  width: 10px;
  margin-right: 4px;
`;

const Right = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function ({
  onRemove,
  extraList = [],
  list,
  onAdd,
  onCreate,
  title,
  type,
  value = (d) => d,
  colorScale = () => "rgba(237, 237, 237, 0)",
  onMouseOver,
  onMouseLeave,
}) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const popoverContent = (
    <PopoverContainer>
      {extraList.length === 0
        ? "没有更多了～"
        : extraList.map((d, index) => (
            <ExtraItem key={value(d)} onClick={() => onAdd(index)}>
              {value(d)}
            </ExtraItem>
          ))}
    </PopoverContainer>
  );

  return (
    <Container onMouseLeave={() => onMouseLeave && onMouseLeave()}>
      <Modal
        title="Create a new graph"
        visible={showInput}
        onOk={() => {
          if (inputValue !== "") {
            setShowInput(false);
            setInputValue("");
            onCreate(inputValue);
          } else {
            alert("Graph key can not be empty!");
          }
        }}
        okText="Add"
        onCancel={() => {
          setShowInput(false);
          setInputValue("");
        }}
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Please input graph key..."
        ></Input>
      </Modal>
      <Header>
        {title}
        {type !== "combine" && (
          <span>
            {onAdd && (
              <Popover
                arrowPointAtCenter
                placement="bottomRight"
                content={
                  <div>
                    <ExtraItem onClick={() => setShowInput(true)}>
                      Graph
                    </ExtraItem>
                    <ExtraItem onClick={() => {}}>Edge</ExtraItem>
                  </div>
                }
              >
                <PlusCircleOutlined />
              </Popover>
            )}
          </span>
        )}
      </Header>
      <div>
        {list.map((d, index) => (
          <DataItem
            key={value(d)}
            onMouseOver={() => onMouseOver && onMouseOver(d)}
            pointer={onMouseOver ? "pointer" : "default"}
          >
            <span>{value(d)}</span>
            <Right>
              <Legend color={colorScale(value(d))} />
              <Icon>
                {type === "combine" ? (
                  <EyeFilled onClick={() => onRemove(index)} />
                ) : (
                  <DeleteFilled onClick={() => onRemove(index)} />
                )}
              </Icon>
            </Right>
          </DataItem>
        ))}
        {type === "combine" &&
          extraList.map((d, index) => (
            <DataItem
              key={value(d)}
              onMouseOver={() => onMouseOver && onMouseOver(d)}
              pointer={onMouseOver ? "pointer" : "default"}
            >
              <span>{value(d)}</span>
              <Right>
                <Legend color={colorScale(value(d))} />
                <Icon>
                  <EyeInvisibleFilled onClick={() => onAdd(index)} />
                </Icon>
              </Right>
            </DataItem>
          ))}
      </div>
      {type !== "combine" && onAdd && (
        <Popover arrowPointAtCenter placement="bottom" content={popoverContent}>
          <div
            style={{
              width: "100%",
              height: 20,
              borderRadius: 3,
              border: `1px solid rgba(237, 237, 237, 0.8)`,
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PlusOutlined />
          </div>
        </Popover>
      )}
    </Container>
  );
}
