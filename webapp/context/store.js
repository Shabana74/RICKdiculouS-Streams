import React, { useReducer, createContext, useEffect } from "react";

import { connectWallet, disconnectWallet } from "../utils/wallet";
import { loadAgreements, setContracts } from "../utils/client";

const initialState = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
  agreements: [],
  signer: null,
  ricksContract: null,
  sf: null,
  sfSigner: null,
  hyphen: null
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
        signer: action.signer,
        sf: action.sf,
        sfSigner: action.sfSigner,
        hyphen: action.hyphen
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "SET_CHAIN_ID":
      return {
        ...state,
        chainId: action.chainId,
      };
    case "SET_AGREEMENTS":
      return {
        ...state,
        agreements: action.agreements,
      };
    case "SET_RICKS_CONTRACT":
      return {
        ...state,
        ricksContract: action.ricksContract,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!state.provider) {
      setTimeout(() => connectWallet(dispatch), 500);
      loadAgreements(dispatch);
    }
  }, []);

  useEffect(() => {
    loadAgreements(dispatch);
  }, [state.address]);

  useEffect(() => {
    if (state.signer !== null) {
      setContracts(state.signer, dispatch);
    }
  }, [state.signer]);

  useEffect(() => {
    if (state.provider && state.provider.on) {
      const handleAccountsChanged = (accounts) => {
        // eslint-disable-next-line no-console
        console.log("accountsChanged", accounts);
        connectWallet(dispatch);
        loadAgreements(dispatch);
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
        disconnectWallet(state.provider, dispatch);
      };

      state.provider.on("accountsChanged", handleAccountsChanged);
      state.provider.on("chainChanged", handleChainChanged);
      state.provider.on("disconnect", handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (state.provider.removeListener) {
          state.provider.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          state.provider.removeListener("chainChanged", handleChainChanged);
          state.provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [state.provider]);

  return (
    <GlobalContext.Provider value={[state, dispatch]}>
      {children}
    </GlobalContext.Provider>
  );
};

export const GlobalContext = createContext();
export default Store;
