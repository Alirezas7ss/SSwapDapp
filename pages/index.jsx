import { Input } from "@nextui-org/react";
import {
  Card,
  Col,
  Row,
  Button,
  Text,
  Modal,
  useModal,
  Avatar,
  Grid,
  Spacer,
} from "@nextui-org/react";
import React from "react";
import { useState, useEffect } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import qs from "qs";
import Erc20 from "../engine/erc20.json";
import { ethers } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";
//wagmi
import {
  useAccount,
  useConnect,
  useSigner,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { ConnectButton } from "@rainbow-me/rainbowkit";
export default function Home() {
  const { isConnected, address } = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
  const { visible, setVisible } = useModal();
  const [flogo, getFromLogo] = useState([]);
  const [fname, getFromName] = useState([]);
  const [faddr, getFromAddr] = useState([]);
  const [fdec, getFromDec] = useState([]);
  const [tlogo, getToLogo] = useState([]);
  const [tname, getToName] = useState([]);
  const [taddr, getToAddr] = useState([]);
  const [tdec, getToDec] = useState([]);
  const [holdup, setHold] = useState("");
  const [alert, setAlert] = useState(false);
  const config = {
    apiKey: "Yd4yXGXZK9z2YOpkIirm60QPElEgSx5Z",
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(config);

  var zeroxapi = "https://api.0x.org";

  useEffect(() => {}, [getFromLogo, getFromName, getFromAddr, getFromDec]);

  useEffect(() => {}, [getToLogo, getToName, getToAddr]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getPrice();
    }, 1000);
    return () => clearTimeout(delayDebounce);
  }, [holdup]);

  // alchemy.nft.getNftsForOwner('0x3b23c3873BBb97757337B68CAEC7bB46ba2b3613').then('ali');
  let currentTrade = {};
  let currentSelectSide = null;
  let toTrade = {};
  let toSelectSide = null;
  var web3 = null;

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const sendAlert = () => setAlert(true);

  const fromHandler = (side) => {
    if (isConnected) {
      setVisible(true);
      currentSelectSide = side;
      listFromTokens();
    }
  };

  async function listFromTokens() {
    let response = await fetch("http://localhost:3000//api/tokens");
    let tokenListJSON = await response.json();
    var tokens = tokenListJSON.tokens;
    let parent = document.getElementById("token_list");
    for (const i in tokens) {
      let div = document.createElement("div");
      div.className = "token_row flex mb-5 gap-5 ";
      let html = `
      <img className="token_list_img" width="12%" src="${tokens[i].logoURI}">
        <span className="token_list_text">${tokens[i].symbol}</span>
        `;
      div.innerHTML = html;
      div.onclick = () => {
        selectFrom(tokens[i]);
      };
      parent.appendChild(div);
    }
  }

  function selectFrom(token) {
    currentTrade[currentSelectSide] = token;
    closeHandler();
    var fromName = token.name;
    var fromLogo = token.logoURI;
    var fromAddr = token.address;
    var fromDec = token.decimals;
    getFromName(fromName);
    getFromLogo(fromLogo);
    getFromAddr(fromAddr);
    getFromDec(fromDec);
  }

  const toHandler = (side) => {
    if (isConnected) {
      setVisible(true);
      currentSelectSide = side;
      listToTokens();
    }
  };

  async function listToTokens() {
    let response = await fetch("/api/tokens");
    let tokenListJson = await response.json();
    var tokens = tokenListJson.tokens;
    let parent = document.getElementById("token_list");
    for (const i in tokens) {
      let div = document.createElement("div");
      div.className = "token_row flex mb-5 gap-5 ";
      let html = `
       <img className='token_list_img ' width='12%' src='${tokens[i].logoURI}'>
       <span className='token_list_text  '>${tokens[i].symbol}</span> 
      `;
      div.innerHTML = html;
      div.onclick = () => {
        selectTo(tokens[i]);
      };
      parent.appendChild(div);
    }
  }
  const closeHandler = () => {
    setVisible(false);
    setAlert(false);
    console.log("closed");
  };
  function selectTo(token) {
    currentTrade[currentSelectSide] = token;
    closeHandler();
    var toName = token.name;
    var toLogo = token.logoURI;
    var toAddr = token.address;
    var toDec = token.decimals;
    getToName(toName);
    getToLogo(toLogo);
    getToAddr(toAddr);
    getToDec(toDec);
    // displayBalance();
  }
  function changeToken() {
      getToName(fname);
      getToLogo(flogo);
      getToAddr(faddr);
      getToDec(fdec);
      getFromName(tname);
      getFromLogo(tlogo);
      getFromAddr(taddr);
      getFromDec(tdec);
      getPrice()
  }
  async function displayBalance(){
    const tokenContractAddresses = [faddr];
    const data = await alchemy.core.getTokenBalances(
      `${address}`,
      tokenContractAddresses
    )
    data.tokenBalances.find(item => {
      let rawbalance = parseInt(item.tokenBalance, 16).toString()
      let formatbalance = Number(web3.utils.fromWei(rawbalance))
      let balance = formatbalance.toFixed(2);
      if (item.tokenBalance === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        document.getElementById("get_balance").innerHTML = '0.00'
      }
      else {
        document.getElementById("get_balance").innerHTML = balance
      }
    })
  }

  async function getPrice() {
    console.log("Getting Price");
    if (!faddr || !taddr || !document.getElementById("from_amount").value)
      return;
    let amount = Number(
      document.getElementById("from_amount").value * 10 ** fdec
    );
    const params = {
      sellToken: faddr,
      buyToken: taddr,
      sellAmount: amount,
    };
    const response = await fetch(
      zeroxapi + `/swap/v1/price?${qs.stringify(params)}`
    );
    const sources = await fetch(
      zeroxapi + `/swap/v1/quote?${qs.stringify(params)}`
    );
    var swapPriceJSON = await response.json();
    console.log(swapPriceJSON);
    var swapOrders = await sources.json();
    try {
      await swapOrders.orders.find((item) => {
        document.getElementById("defisource").innerHTML = item.source;
      });
    } catch (error) {
      document.getElementById("defisource").innerHtml = "Pool Not Available";
    }
    var rawvalue = swapOrders.buyAmount / 10 ** tdec;
    var value = rawvalue.toFixed(2);
    document.getElementById("to_amount").innerHTML = value;
    document.getElementById("gas_estimate").innerHTML =
      swapPriceJSON.estimatedGas;
  }

  async function swapit() {
    if (!faddr || !taddr || !document.getElementById("from_amount").value)
      return;
    let amount = Number(
      document.getElementById("from_amount").value * 10 ** fdec
    );
    const params = {
      sellToken: faddr,
      buyToken: taddr,
      sellAmount: amount,
    };
    const fromTokenAddress = faddr;
    const getquote = await fetch(
      zeroxapi + `/swap/v1/quote?${qs.stringify(params)}`
    );
    var quote = await getquote.json();
    var proxy = quote.allowanceTarget;
    var amountstr = amount.toString();
    const ERC20Contract = new ethers.Contract(fromTokenAddress, Erc20, signer);
    const approval = await ERC20Contract.approve(proxy, amountstr);
    await approval.wait();
    const txParams = {
      ...quote,
      from: userWallet,
      to: quote.to,
      value: quote.value.toString(16),
      gasPrice: null,
      gas: quote.gas,
    };
    await ethereum.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });
  }

  return (
    <Grid.Container gap={1} justify="center">
      <div style={{ marginTop: "50px", marginBottom: "50px" }}>
        <ConnectButton />
      </div>
      <Row justify="center">
        <Grid sm={4}>
          <Card variant="bordered">
            <Card.Header>
              <Row>
                <Col>
                  <h4 className="text-copper">Sticky Gum</h4>
                </Col>
                <Col>
                  <Avatar
                    src="8.png"
                    css={{ size: "$20" }}
                    zoomed
                    bordered
                    color="gradient"
                  />
                </Col>
                <img src="0xpicw.png" width={"80%"} />
              </Row>
            </Card.Header>
            <Text
              h3={true}
              color="white"
              css={{
                textShadow: "0px 0px 1px #000000",
                display: "flex",
                justifyContent: "center",
                textRendering: "geometricPrecision",
                fontFamily: "SF Pro Display",
                fontWeight: "$bold",
                m: "$0",
              }}
            >
              Token Swap
            </Text>
          </Card>
        </Grid>
      </Row>
      <Modal
        scroll
        closeButton
        blur
        aria-labelledby="connect_modal"
        onClose={closeHandler}
        open={alert}
      >
        {" "}
        Please Connect Wallet
        <Modal.Footer>
          { !isConnected &&

            <Button auto flat color="primary" onClick={connect}>
            Connect Wallet
            </Button>
          }
          <Button auto flat color="error" onClick={closeHandler}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Text h5="true">FROM TOKEN</Text>
      <Row justify="center">
        <Grid sm={4}>
          <Col>
            <Card
              variant="bordered"
              css={{
                color: "white",
                opacity: "80%",
                fontFamily: "SF Pro Display",
                fontWeight: "300",
                fontSize: "30px",
                textShadow: "0px 0px 2px #000000",
                boxShadow: "0px 0px 4px #e38d83",
              }}
            >
              <Col>
                <Input
                  type="text"
                  size="$3xl"
                  css={{ fontFamily: "SF Pro Display", color: "white" }}
                  className="number"
                  color="default"
                  placeholder="amount"
                  id="from_amount"
                  onChange={(e) => setHold(e.target.value)}
                />
              </Col>
            </Card>
          </Col>
          <Col>
            <a onClick={fromHandler}>
              <Text
                size="$lg"
                css={{
                  fontFamily: "SF Pro Display",
                  textShadow: "0px 0px 1px #000000",
                  fontWeight: "400",
                  color: "white",
                  ml: "$10",
                  cursor: "pointer",
                }}
              >
                {'Swap From\n'}
                <img src={flogo} style={{ width: "30px" }} />
                {" " + fname}
              </Text>
            </a>
            <Row justify="center">
              <Text css={{ marginLeft: "$3", fontSize: "$lg" }}>Balance:</Text>
              <Text
                css={{
                  marginLeft: "$3",
                  fontSize: "$lg",
                  fontFamily: "SF Pro Display",
                  color: "$blue600",
                }}
                id="get_balance"
              ></Text>
            </Row>
          </Col>
        </Grid>
      </Row>
      <Modal
        scroll
        closeButton
        blur
        aria-labelledby="token_modal"
        onClose={closeHandler}
        open={visible}
      >
        <Modal.Body>
          <Input
            type="text"
            size="$3xl"
            css={{ fontFamily: "SF Pro Display", color: "white" }}
            className="number"
            color="default"
            placeholder="Paste Token Address"
          />
          <Text size={16}>Or Choose Below:</Text>
          <div id="token_list"></div>
        </Modal.Body>
        <Modal.Footer>
          <Button auto flat color="error" onClick={closeHandler}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Row justify="center" onClick={changeToken}>
        <img src="arrow.png" width={"2%"} />
      </Row>
      <Row justify="center">
        <Grid sm={4}>
          <Card
            variant="bordered"
            css={{
              color: "white",
              opacity: "80%",
              fontFamily: "SF Pro Display",
              fontWeight: "300",
              fontSize: "30px",
              textShadow: "0px 0px 2px #000000",
              boxShadow: "0px 0px 4px #00ADB5",
              height: "55px",
            }}
          >
            <Col>
              <Text
                type="text"
                size="$4xl"
                css={{
                  fontFamily: "SF Pro Display",
                  color: "white",
                  textShadow: "0px 0px 10px #e38d83",
                  ml: "$2",
                }}
                className="number"
                color="default"
                id="to_amount"
              />
            </Col>
          </Card>
          <Spacer />
          <Col>
            <a onClick={toHandler}>
              <Text
                size="$lg"
                css={{
                  fontFamily: "SF Pro Display",
                  textShadow: "0px 0px 1px #000000",
                  fontWeight: "400",
                  color: "white",
                  ml: "$10",
                  cursor: "pointer",
                }}
              > 
                 {'Swap To\n'}
                <img src={tlogo} style={{ width: "30px" }} />
                {" " + tname}
              </Text>
            </a>
          </Col>
        </Grid>
      </Row>
      <Grid sm={4}>
        <Row justify="center">
          {isConnected ? (
            <Card
              isPressable
              css={{
                backgroundColor: "#e38d83",
                boxShadow: "0px 0px 4px #e38d83",
              }}
              onPress={swapit}
            >
              <Text
                css={{
                  display: "flex",
                  justifyContent: "center",
                  color: "black",
                  textShadow: "0px 0px 2px #000000",
                }}
                size="$3xl"
                weight="bold"
                transform="uppercase"
              >
                SWAP
              </Text>
            </Card>
          ) : (
            <Card
              isPressable
              css={{
                backgroundColor: "#e38d83",
                boxShadow: "0px 0px 4px #00ADB5",
              }}
              onPress={connect}
            >
              <Text
                css={{
                  display: "flex",
                  justifyContent: "center",
                  color: "black",
                  textShadow: "0px 0px 2px #000000",
                }}
                size="$3xl"
                weight="bold"
                transform="uppercase"
              >
                First Connect Wallet
              </Text>
            </Card>
          )}
        </Row>
      </Grid>
      <Row justify="center">
        <Grid sm={4}>
          <Row>
            <Text size={20} css={{ marginLeft: "$5", color: "white" }}>
              Gas Estimate:{" "}
            </Text>
            <p
              style={{
                fontFamily: "SF Pro Display",
                fontSize: "24px",
                marginLeft: "4px",
                color: "#00ADB5",
                fontWeight: "bold",
                textShadow: "0px 0px 1px #000000",
              }}
              id="gas_estimate"
            ></p>
          </Row>
          <Row>
            <Text size={24} css={{ marginLeft: "$5", color: "white" }}>
              LP Provider:{" "}
            </Text>
            <p
              style={{
                fontFamily: "SF Pro Display",
                fontSize: "25px",
                marginLeft: "4px",
                color: "#00ADB5",
                fontWeight: "bold",
                textShadow: "0px 0px 1px #000000",
              }}
              id="defisource"
            ></p>
          </Row>
        </Grid>
      </Row>
      <Row justify="center">
        <Grid sm={4}>
          <Row justify="center">
            <Card
              css={{
                borderTop:
                  "$borderWeights$light solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Row justify="center" css={{ mt: "$2" }}>
                <Text color="#fff" size={10}>
                  Secured with
                </Text>
                <img src="alchemy-white.png" width={"30%"} />
              </Row>
              <Row justify="center" css={{mt:'$2'}}>
            <Text
              size={20}
              id="wallet-address"
              css={{ color: "#00ADB5", textShadow: "0px 0px 3px #000000",marginRight: "$2" }}
            >
              {address}
            </Text>
            </Row>
            </Card>
          </Row>
        </Grid>
      </Row>
    </Grid.Container>
  );
}
