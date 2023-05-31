/* pages/index.js */
import { ethers, providers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";

import RickdiculusStreams from "../abi/RickdiculusStreams.json";
import IERC721 from "../abi/IERC721.json";
import IERC20 from "../abi/IERC20.json";

export async function loadAgreements(dispatch) {
  /* create a generic provider and query for unsold market items */
  const alchemyProvider = new providers.AlchemyProvider(
    80001,
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY
  );
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_RICKS_CONTRACT,
    RickdiculusStreams.abi,
    alchemyProvider
  );
  const data = await contract.fetchAllAgreements();

  /*
   *  map over items returned from smart contract and format
   *  them as well as fetch their token metadata
   */
  const items = await Promise.all(
    data.map(async (i) => {
      let borrower = ethers.utils.getAddress(i.borrower);
      let delegator = ethers.utils.getAddress(i.delegator);
      let tokenAddress = ethers.utils.getAddress(i.tokenAddress);
      let ricksAddress = ethers.utils.getAddress(i.ricksAddress);
      const nftContract = new ethers.Contract(
        tokenAddress,
        IERC721.abi,
        alchemyProvider
      );
      const erc20Contract = new ethers.Contract(
        ricksAddress,
        IERC20.abi,
        alchemyProvider
      );
      const tokenUri = await nftContract.tokenURI(i.tokenId);
      const totalSupply = await erc20Contract.totalSupply();
      const name = await nftContract.name();
      const symbol = await nftContract.symbol();
      let item = {
        tokenId: i.tokenId.toString(),
        borrower,
        delegator,
        amount: ethers.utils.formatUnits(i.amount, 18),
        tokenAddress,
        tokenUri,
        ricksAddress,
        name,
        symbol,
        agreementState: i.agreementState,
        totalSupply: ethers.utils.formatUnits(totalSupply, 18),
      };
      return item;
    })
  );

  dispatch({
    type: "SET_AGREEMENTS",
    agreements: items,
  });
}

export async function setContracts(signer, dispatch) {
  const ricksContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_RICKS_CONTRACT,
    RickdiculusStreams.abi,
    signer
  );

  dispatch({
    type: "SET_RICKS_CONTRACT",
    ricksContract: ricksContract,
  });
}
// export async function buyNft(nft) {
//   /* needs the user to sign the transaction, so will use Web3Provider and sign it */
//   const web3Modal = new Web3Modal();
//   const connection = await web3Modal.connect();
//   const provider = new ethers.providers.Web3Provider(connection);
//   const signer = provider.getSigner();
//   const contract = new ethers.Contract(
//     marketplaceAddress,
//     NFTMarketplace.abi,
//     signer
//   );

//   /* user will be prompted to pay the asking proces to complete the transaction */
//   const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
//   const transaction = await contract.createMarketSale(nft.tokenId, {
//     value: price,
//   });
//   await transaction.wait();
//   loadNFTs();
// }
