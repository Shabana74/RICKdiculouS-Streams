import { Layout, Space, message } from "antd";
import React, { useContext } from "react";
import { GlobalContext } from "../../../context/store";
import { connectWallet, disconnectWallet } from "../../../utils/wallet";
import { ApplicationLogo } from "../application-logo";
import { ApplicationAccountButton } from "./components/application-account-button";
import { ApplicationWalletButton } from "./components/application-wallet-button";
import { ApplicationCreateTokenButton } from "./components/application-create-token-button";

export const HEADER_HEIGHT = 80;

export const ApplicationHeader = () => {
  const [state, dispatch] = useContext(GlobalContext);

  return (
    <div>
      <Layout.Header className={"a-header"}>
        <div className={"a-header-wrapper"}>
          <div className={"a-header-content"}>
            <ApplicationLogo />

            <Space size={24}>
              {state.address ? (
                <>
                  <ApplicationCreateTokenButton />
                  <ApplicationAccountButton
                    account={state.address}
                    provider={state.provider}
                    onDisconnect={disconnectWallet}
                    dispatch={dispatch}
                  />
                </>
              ) : (
                <>
                  <ApplicationWalletButton
                    // loading={loadingSession}
                    provider={state.provider}
                    onConnect={connectWallet}
                    disconnect={disconnectWallet}
                    dispatch={dispatch}
                  />
                </>
              )}
            </Space>
          </div>
        </div>
      </Layout.Header>

      <style jsx>{`
        div :global(.a-header) {
          width: 100%;
          height: ${HEADER_HEIGHT}px;
          padding: 0px 48px 0px 48px;
          box-shadow: 0px 2px 8px #f0f1f2;
          display: flex;
          justify-content: center;
          align-items: center;
          position: fixed;
          z-index: 10;
          background: #ffffff;
        }

        .a-header-wrapper {
          width: 100%;
          max-width: 1024px;
        }

        .a-header-content {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </div>
  );
};
