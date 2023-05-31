import React from "react";
import { Space, Button, Modal } from "antd";
import { BigButton } from "../../../../common/components/big-button";

export const TokenActionBar = React.memo(function TokenActionBar({
  agreement,
  account,
  onRepay,
  onReconstitute,
  startStream,
  onDelegate,
  onWithdraw,
  onNoAccount,
  style,
}) {
  if (account === agreement.borrower) {
    return (
      <div style={style}>
        <Space size={24}>
          {agreement.agreementState == 1 && (
            <BigButton
              type={"primary"}
              shape={"round"}
              size={"large"}
              onClick={() =>
                Modal.confirm({
                  title: "Do you want to start stream to the contract?",
                  okText: "Start",
                  cancelText: "Cancel",
                  centered: true,
                  icon: null,
                  onOk: async () => await startStream(agreement.ricksAddress),
                })
              }
            >
              {"Start Stream To Receive Funds!"}
            </BigButton>
          )}
          {agreement.agreementState == 2 && (
            <BigButton
              type={"primary"}
              danger={true}
              shape={"round"}
              size={"large"}
              onClick={() =>
                Modal.confirm({
                  title: "Do you want to repay?",
                  okType: "danger",
                  okText: "Repay",
                  cancelText: "Cancel",
                  centered: true,
                  icon: null,
                  onOk: async () =>
                    await onRepay(agreement.amount, agreement.ricksAddress),
                })
              }
            >
              {"Repay"}
            </BigButton>
          )}
          {(agreement.agreementState == 0 || agreement.agreementState == 3) && (
            <BigButton
              type={"primary"}
              danger={true}
              shape={"round"}
              size={"large"}
              onClick={() =>
                Modal.confirm({
                  title: "Do you want to reconstitute your NFT?",
                  okType: "danger",
                  okText: "Reconstitute",
                  cancelText: "Cancel",
                  centered: true,
                  icon: null,
                  onOk: async () =>
                    await onReconstitute(agreement.ricksAddress),
                })
              }
            >
              {"Reconstitute NFT"}
            </BigButton>
          )}
        </Space>

        <style jsx>{``}</style>
      </div>
    );
  }

  if (account === agreement.delegator) {
    return (
      <div style={style}>
        <Space size={24}>
          {agreement.agreementState == 3 && (
            <BigButton
              type={"primary"}
              shape={"round"}
              size={"large"}
              onClick={() =>
                Modal.confirm({
                  title: "Do you want to withdraw your amount?",
                  okText: "Withdraw",
                  cancelText: "Cancel",
                  centered: true,
                  icon: null,
                  onOk: async () =>
                    await onWithdraw(agreement.amount, agreement.ricksAddress),
                })
              }
            >
              {"Withdraw"}
            </BigButton>
          )}
        </Space>

        <style jsx>{``}</style>
      </div>
    );
  }

  if (account !== null) {
    return (
      <div style={style}>
        <Space size={24}>
          {agreement.agreementState == 0 && (
            <BigButton
              type={"primary"}
              shape={"round"}
              size={"large"}
              onClick={() =>
                Modal.confirm({
                  title: `You need to delegate ${Math.ceil(
                    agreement.amount / 0.7
                  )}. So that borrower can borrow ${agreement.amount}`,
                  okText: "Delegate",
                  cancelText: "Cancel",
                  centered: true,
                  icon: null,
                  onOk: async () =>
                    await onDelegate(
                      Math.ceil(agreement.amount / 0.7),
                      agreement.ricksAddress
                    ),
                })
              }
            >
              {"Delegate"}
            </BigButton>
          )}
        </Space>

        <style jsx>{``}</style>
      </div>
    );
  }

  return (
    <div style={style}>
      <Space size={24}>
        {agreement.agreementState == 0 && (
          <BigButton
            type={"primary"}
            shape={"round"}
            size={"large"}
            onClick={() => onNoAccount()}
          >
            {"Delegate"}
          </BigButton>
        )}
      </Space>

      <style jsx>{``}</style>
    </div>
  );
});
