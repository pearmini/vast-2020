import React from "react";
import styled from "styled-components";
import { Popover } from "antd";

import {
  DeleteFilled,
  UploadOutlined,
  PlusCircleOutlined,
  EyeInvisibleFilled,
  EyeFilled,
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
`;

const ExtraItem = styled.div`
  cursor: pointer;
  width: 100px;
  padding: 4px;
  border-radius: 3px;
  &:hover {
    background: #e2e9f3;
  }
`;

const Icon = styled.span`
  cursor: pointer;
`;

const PopoverContainer = styled.div`
  width: 100px;
`;

export default function ({
  onRemove,
  extraList = [],
  list,
  onAdd,
  onUpload,
  title,
  type,
  value = (d) => d,
}) {
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
    <Container>
      <Header>
        {title}
        {type !== "combine" && (
          <span>
            {onUpload && <UploadOutlined />}
            {onAdd && (
              <Popover
                arrowPointAtCenter
                placement="bottomRight"
                content={popoverContent}
              >
                <PlusCircleOutlined />
              </Popover>
            )}
          </span>
        )}
      </Header>
      <div>
        {list.map((d, index) => (
          <DataItem key={value(d)}>
            <span>{value(d)}</span>
            <Icon>
              {type === "combine" ? (
                <EyeFilled onClick={() => onRemove(index)} />
              ) : (
                <DeleteFilled onClick={() => onRemove(index)} />
              )}
            </Icon>
          </DataItem>
        ))}
        {type === "combine" &&
          extraList.map((d, index) => (
            <DataItem key={value(d)}>
              <span>{value(d)}</span>
              <Icon>
                <EyeInvisibleFilled onClick={() => onAdd(index)} />
              </Icon>
            </DataItem>
          ))}
      </div>
    </Container>
  );
}
