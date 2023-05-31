import React, {useEffect} from 'react';
import { Button } from 'antd';
import { useResponsive } from '../../../../common/hooks/use-responsive';
import Icon from '@ant-design/icons';
import { WalletIcon } from '../../../../common/icons/wallet-icon';


export const ApplicationWalletButton = ({ provider, onConnect, disconnect, dispatch }) => {
  const { isMobileAndBelow } = useResponsive();
  
  useEffect(() => {
    if (provider !== null) {
        const handleAccountsChanged = (accounts) => {
          // eslint-disable-next-line no-console
          dispatch({
            type: "SET_ADDRESS",
            address: accounts[0],
          });
        };

        // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
        const handleChainChanged = (_hexChainId) => {
          window.location.reload();
        };

        const handleDisconnect = (error) => {
          // eslint-disable-next-line no-console
          console.log("disconnect", error);
          disconnect();
        };

        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
        provider.on("disconnect", handleDisconnect);

        // Subscription Cleanup
        return () => {
          if (provider.removeListener) {
            provider.removeListener("accountsChanged", handleAccountsChanged);
            provider.removeListener("chainChanged", handleChainChanged);
            provider.removeListener("disconnect", handleDisconnect);
          }
        };
      }
    }, [provider, disconnect]);

  return (
    <div>
      {isMobileAndBelow ? (
        <Button
          type={"primary"}
          size={"large"}
          shape={"circle"}
          icon={<Icon component={WalletIcon} />}
          // loading={loading}
          onClick={() => onConnect(dispatch)}
        />
      ) : (
        <Button
          type={"primary"}
          size={"large"}
          shape={"round"}
          onClick={() => onConnect(dispatch)}
        >
          {"Connect wallet"}
        </Button>
      )}

      <style jsx>{``}</style>
    </div>
  );
}
