//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol"; //"@superfluid-finance/ethereum-monorepo/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {ISuperTokenFactory} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperTokenFactory.sol";
import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {SuperFractionalized} from "./SuperFractionalized.sol";
import {ISuperFractionalized} from "./interfaces/ISuperFractionalized.sol";

import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {SafeERC20, SafeMath} from "./utils/Libraries.sol";

contract RickdiculusStreams is SuperAppBase {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _loanIds;

    using CFAv1Library for CFAv1Library.InitData;

    //initialize cfaV1 variable
    CFAv1Library.InitData public cfaV1;

    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa;

    IPool constant aaveLendingPool =
        IPool(address(0x6C9fB0D5bD9429eb9Cd96B85B81d872281771E6B));

    IERC20 constant dai =
        IERC20(address(0x9A753f0F7886C9fbF63cF59D0D4423C5eFaCE95B));
    IERC20 constant aDai =
        IERC20(address(0xDD4f3Ee61466C4158D394d57f3D4C397E91fBc51));

    ISuperTokenFactory internal immutable _factory;

    enum LoanAgreementState {
        initiated,
        inactive,
        active,
        closed
    }

    struct LoanAgreement {
        LoanAgreementState agreementState;
        uint256 tokenId;
        address borrower;
        address delegator;
        uint256 agreementPeriod;
        uint amount;
        address tokenAddress;
        address ricksAddress;
    }

    mapping(address => LoanAgreement) public LoanAgreements;
    mapping(uint256 => LoanAgreement) public loanIdsToAgreement;

    uint256 constant decimals = 1e18;

    constructor(ISuperTokenFactory factory, ISuperfluid host) {
        _factory = factory;
        dai.safeApprove(address(aaveLendingPool), 2**256 - 1);
        aDai.safeApprove(address(aaveLendingPool), 2**256 - 1);
        assert(address(host) != address(0));
        _host = host;
        _cfa = IConstantFlowAgreementV1(
            address(
                host.getAgreementClass(
                    keccak256(
                        "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
                    )
                )
            )
        );
        cfaV1 = CFAv1Library.InitData(_host, _cfa);

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            // change from 'before agreement stuff to after agreement
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        _host.registerApp(configWord);
    }


    function fetchAllAgreements() public view returns (LoanAgreement[] memory) {
        uint itemCount = _loanIds.current();
        uint currentIndex = 0;

        LoanAgreement[] memory items = new LoanAgreement[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            uint currentId = i + 1;
            LoanAgreement storage currentItem = loanIdsToAgreement[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return items;
    }

    function delegate(uint256 _amount, address _ricksAddress) public {
        require(
            LoanAgreements[_ricksAddress].agreementState ==
                LoanAgreementState.initiated,
            "loan agreement should be initiated"
        );
        uint256 amount = _amount * decimals;
        dai.transferFrom(msg.sender, address(this), amount);
        dai.approve(address(aaveLendingPool), amount);
        aaveLendingPool.supply(address(dai), amount, msg.sender, 0);
        LoanAgreements[_ricksAddress].delegator = msg.sender;
        LoanAgreements[_ricksAddress].agreementState = LoanAgreementState
            .inactive;
    }

    function withdraw(uint256 _amount, address _ricksAddress) public {
        require(
            LoanAgreements[_ricksAddress].delegator == msg.sender,
            "you do not have a delegator yet"
        );
        require(
            LoanAgreements[_ricksAddress].agreementState ==
                LoanAgreementState.closed,
            "loan agreement should be closed"
        );
        uint256 amount = _amount * decimals;
        aDai.transferFrom(msg.sender, address(this), amount);
        aaveLendingPool.withdraw(address(dai), amount, msg.sender);
    }

    function createLoanAgreement(
        address _tokenAddress,
        string memory _name,
        string memory _symbol,
        uint256 _tokenId,
        uint256 _initialSupply,
        // uint256 _agreementPeriod,
        uint _amount
    ) external {
        uint256 initialSupply = _initialSupply * decimals;
        uint256 amount = _amount * decimals;
        address _ricksAddress = fractionalize(
            _tokenAddress,
            _name,
            _symbol,
            _tokenId,
            initialSupply
        );
        LoanAgreement memory newAgreement = LoanAgreement({
            agreementState: LoanAgreementState.initiated,
            tokenId: _tokenId,
            borrower: msg.sender,
            delegator: address(0),
            agreementPeriod: block.timestamp + 2 days,
            amount: amount,
            tokenAddress: _tokenAddress,
            ricksAddress: _ricksAddress
        });
        LoanAgreements[_ricksAddress] = newAgreement;
        _loanIds.increment();
        uint256 newLoanId = _loanIds.current();
        loanIdsToAgreement[newLoanId] = newAgreement;
    }

    // BORROWER METHODS

    function borrow(address _ricksAddress) internal {
        require(
            LoanAgreements[_ricksAddress].delegator != address(0),
            "you do not have a delegator yet"
        );
        require(
            LoanAgreements[_ricksAddress].agreementState ==
                LoanAgreementState.inactive,
            "loan agreement should be inactive"
        );

        uint amountToBorrow = LoanAgreements[_ricksAddress].amount;
        address delegator = LoanAgreements[_ricksAddress].delegator;
        address borrower = LoanAgreements[_ricksAddress].borrower;
        aaveLendingPool.borrow(address(dai), amountToBorrow, 2, 0, delegator);

        // borrowers[msg.sender].borrowed = amountToBorrow;
        LoanAgreements[_ricksAddress].agreementState = LoanAgreementState
            .active;
        dai.approve(borrower, amountToBorrow);
        dai.transfer(borrower, amountToBorrow);
    }

    function repay(address _ricksAddress) external {
        require(
            LoanAgreements[_ricksAddress].borrower == msg.sender,
            "not an allowed borrower"
        );
        require(
            LoanAgreements[_ricksAddress].delegator != address(0),
            "you do not have a delegator yet"
        );
        require(
            LoanAgreements[_ricksAddress].agreementState ==
                LoanAgreementState.active,
            "loan agreement is not active"
        );

        uint borrowedAmount = LoanAgreements[_ricksAddress].amount;
        address delegator = LoanAgreements[_ricksAddress].delegator;

        dai.transferFrom(msg.sender, address(this), borrowedAmount);
        dai.approve(address(aaveLendingPool), borrowedAmount);
        aaveLendingPool.repay(address(dai), borrowedAmount, 2, delegator);
        LoanAgreements[_ricksAddress].agreementState = LoanAgreementState
            .closed;
    }

    /// @dev Thrown when user has not approved this contract to transferFrom
    error NotApproved();

    /// @dev Thrown when user does not have all shards
    error NotPermitted();

    /// @dev Thrown when user is not the owner of the token
    error NotTokenOwner();

    event Fractionalized(
        address receiver,
        address indexed erc721Token,
        uint256 indexed tokenId,
        address indexed superFractionalized,
        uint256 initialSupply
    );

    /// @dev Implementation of ISuperFractionalizer.fractionalize
    /// MUST have approved SuperFractionalizer
    /// MUST be owner of NFT
    function fractionalize(
        address _tokenAddress,
        string memory _name,
        string memory _symbol,
        uint256 _tokenId,
        uint256 _initialSupply
    ) internal returns (address _superFractionalized) {
        IERC721 _erc721 = IERC721(_tokenAddress);
        // CHECKS
        if (msg.sender != _erc721.ownerOf(_tokenId)) revert NotTokenOwner();
        if (address(this) != _erc721.getApproved(_tokenId))
            revert NotApproved();

        // DEPLOY
        bytes32 salt = keccak256(abi.encode(_erc721, _tokenId));
        bytes memory bytecode = type(SuperFractionalized).creationCode;
        assembly {
            _superFractionalized := create2(
                0,
                add(bytecode, 32),
                mload(bytecode),
                salt
            )
        }

        // UPGRADE WITH THE FACTORY
        _factory.initializeCustomSuperToken(_superFractionalized);

        // INTIALIZE
        ISuperFractionalized(_superFractionalized).initialize(
            _name,
            _symbol,
            _initialSupply,
            _tokenId,
            address(_erc721),
            msg.sender
        );

        // LOCK THE NFT
        _erc721.transferFrom(msg.sender, address(this), _tokenId);

        // EMIT
        emit Fractionalized(
            msg.sender,
            address(_erc721),
            _tokenId,
            _superFractionalized,
            _initialSupply
        );
    }

    function reconstitute(address _ricksAddress) public {
        if (msg.sender != LoanAgreements[_ricksAddress].borrower)
            revert NotTokenOwner();

        if (
            IERC20(_ricksAddress).balanceOf(msg.sender) !=
            IERC20(_ricksAddress).totalSupply()
        ) revert NotPermitted();
        IERC721(LoanAgreements[_ricksAddress].tokenAddress).approve(
            msg.sender,
            LoanAgreements[_ricksAddress].tokenId
        );
        IERC721(LoanAgreements[_ricksAddress].tokenAddress).transferFrom(
            address(this),
            msg.sender,
            LoanAgreements[_ricksAddress].tokenId
        );
        delete LoanAgreements[_ricksAddress];
    }

    /// @dev If a new stream is opened, or an existing one is opened
    function _aggrementCreated(ISuperToken _superToken) private {
        int96 netFlowRate = _cfa.getNetFlow(_superToken, address(this));

        if (netFlowRate != int96(0)) {
            borrow(address(_superToken));
        }
    }

    /// @dev If a new stream is opened, or an existing one is opened
    function _aggrementTerminated(ISuperToken _superToken) private {
        int96 netFlowRate = _cfa.getNetFlow(_superToken, address(this));

        if (netFlowRate == int96(0)) {
            uint256 streamedAmount = _superToken.balanceOf(address(this));
            if (
                LoanAgreements[address(_superToken)].agreementState ==
                LoanAgreementState.closed
            ) {
                _superToken.approve(
                    LoanAgreements[address(_superToken)].borrower,
                    streamedAmount
                );
                _superToken.transfer(
                    LoanAgreements[address(_superToken)].borrower,
                    streamedAmount
                );
            } else {
                _superToken.approve(
                    LoanAgreements[address(_superToken)].delegator,
                    streamedAmount
                );
                _superToken.transfer(
                    LoanAgreements[address(_superToken)].delegator,
                    streamedAmount
                );
            }
        }
    }

    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, // _cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass, _ctx)
        onlyHost
        returns (bytes memory newCtx)
    {
        _aggrementCreated(_superToken);
        return _ctx;
    }

    function afterAgreementUpdated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, //_agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, //_cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass, _ctx)
        onlyHost
        returns (bytes memory newCtx)
    {
        _aggrementCreated(_superToken);
        return _ctx;
    }

    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, //_agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, //_cbdata,
        bytes calldata _ctx
    ) external override onlyHost returns (bytes memory newCtx) {
        // According to the app basic law, we should never revert in a termination callback
        if (
            !_isTokenExpected(address(_superToken), _ctx) ||
            !_isCFAv1(_agreementClass)
        ) return _ctx;
        _aggrementTerminated(_superToken);
        return _ctx;
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return
            ISuperAgreement(agreementClass).agreementType() ==
            keccak256(
                "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
            );
    }

    function _isTokenExpected(address _ricksAddress, bytes calldata _ctx)
        private
        view
        returns (bool)
    {
        // decode Context - store full context as uData variable for easy visualization purposes
        address user = _host.decodeCtx(_ctx).msgSender;

        return LoanAgreements[_ricksAddress].borrower == user;
    }

    modifier onlyHost() {
        require(
            msg.sender == address(_host),
            "RedirectAll: support only one host"
        );
        _;
    }

    modifier onlyExpected(
        ISuperToken superToken,
        address agreementClass,
        bytes calldata _ctx
    ) {
        require(
            _isTokenExpected(address(superToken), _ctx),
            "RedirectAll: not expected token"
        );
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }
}
