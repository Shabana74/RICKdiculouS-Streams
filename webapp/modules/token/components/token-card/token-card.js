import { Image, Card, Typography } from "antd";
import React, { useState, useMemo, useEffect } from "react";
import Icon from "@ant-design/icons";
import { DAIIcon } from "../../../../common/icons/dai-icon";

export const TokenCard = React.memo(function TokenCard({
  agreement,
  // onLoadNFT,
  style,
}) {
  return (
    <div style={style}>
      <Card
        hoverable={true}
        loading={!agreement}
        cover={
          <Image
            src={agreement ? agreement.tokenUri : undefined}
            preview={false}
          />
        }
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography.Text>
                {agreement ? agreement.name : ""}
              </Typography.Text>
              <Typography.Text strong={true}>
                {"#" + (agreement ? agreement.tokenId : "")}
              </Typography.Text>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              <Typography.Text>{"Amount"}</Typography.Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon component={DAIIcon} style={{ marginRight: 8 }} />
                <Typography.Text strong={true}>
                  {agreement.amount}
                </Typography.Text>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Typography.Text type={"secondary"} style={{ fontSize: "0.8em" }}>
              {agreement.totalSupply ? agreement.totalSupply : "-"}
            </Typography.Text>
          </div>
        </div>
      </Card>

      <style jsx>{``}</style>
    </div>
  );
});
