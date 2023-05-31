import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import React, { useCallback, useState, useContext } from "react";
import { GlobalContext } from "../../../../context/store";
import { ethers, providers } from "ethers";
import { TokenCard } from "../../../../modules/token/components/token-card/token-card";
import IERC721 from "../../../../abi/IERC721.json";
import RickdiculusStreams from "../../../../abi/RickdiculusStreams.json";
import Icon from "@ant-design/icons";
import { CloseIcon } from "../../../../common/icons/close-icon";
import { loadAgreements } from "../../../../utils/client";

export const ApplicationCreateTokenButton = React.memo(
  function ApplicationCreateTokenButton({}) {
    const [state, dispatch] = useContext(GlobalContext);
    // The agreement object built when inserting the data into the form with default values
    const [agreement, setAgreement] = useState({
      tokenId: "",
      tokenAddress: "",
      tokenUri: "",
      amount: 0,
      name: "",
      symbol: "",
      initialSupply: 0,
    });

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();
    const onSubmit = useCallback(
      async (values) => {
        setLoading(true);
        const nftContract = new ethers.Contract(
          values.tokenAddress,
          IERC721.abi,
          state.signer
        );
        let txn = await nftContract.approve(
          process.env.NEXT_PUBLIC_RICKS_CONTRACT,
          ethers.BigNumber.from(values.tokenId)
        );
        await txn.wait();
        message.success("NFT was Approved!");

        const ricksContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_RICKS_CONTRACT,
          RickdiculusStreams.abi,
          state.signer
        );

        txn = await ricksContract.createLoanAgreement(
          ethers.utils.getAddress(values.tokenAddress),
          values.name,
          values.symbol,
          ethers.BigNumber.from(values.tokenId),
          ethers.BigNumber.from(values.initialSupply),
          ethers.BigNumber.from(values.amount)
        );
        await txn.wait();
        message.success(
          "NFT has been fractionalized into streamable SUPER Tokens and agreement has been created!",
          3
        );

        loadAgreements(dispatch);

        setLoading(false);
        setDrawerVisible(false);

        // Clear fields for next time
        form.resetFields();
        setAgreement({
          tokenId: "",
          tokenAddress: "",
          tokenUri: "",
          amount: 0,
          name: "",
          symbol: "",
          initialSupply: 0,
        });
      },
      [form]
    );
    const onValuesChange = useCallback(async (changedValues, values) => {
      let tokenUri = "";
      if (
        values.tokenAddress.length === 42 &&
        values.tokenId &&
        values.tokenId.length
      ) {
        const nftContract = new ethers.Contract(
          values.tokenAddress,
          IERC721.abi,
          state.signer
        );
        tokenUri = await nftContract.tokenURI(
          ethers.BigNumber.from(values.tokenId)
        );
      }
      // Normalize scripthash if needed

      setAgreement((_agreement) => ({
        ..._agreement,
        tokenAddress:
          values.tokenAddress !== undefined ? values.tokenAddress : "",
        tokenId: values.tokenId !== undefined ? values.tokenId : "",
        name: values.name !== undefined ? values.name : "",
        symbol: values.symbol !== undefined ? values.symbol : "",
        amount: values.amount !== undefined ? values.amount : 0,
        initialSupply:
          values.initialSupply !== undefined ? values.initialSupply : 0,
        tokenUri,
      }));
    }, []);

    return (
      <div>
        <Button
          type={"primary"}
          size={"large"}
          shape={"round"}
          onClick={() => setDrawerVisible(true)}
        >
          {"Create SuperRICKS!"}
        </Button>

        <Drawer
          title={
            <Typography.Text strong={true}>
              {"Create SuperRICKS!"}
            </Typography.Text>
          }
          width={720}
          closable={!loading}
          maskClosable={!loading}
          closeIcon={<Icon component={CloseIcon} />}
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Space size={24} align={"end"}>
                <Button
                  onClick={() => setDrawerVisible(false)}
                  disabled={loading}
                >
                  {"Cancel"}
                </Button>
                <Button
                  onClick={() => form.submit()}
                  type={"primary"}
                  loading={loading}
                >
                  {"Create"}
                </Button>
              </Space>
            </div>
          }
        >
          <Row gutter={24}>
            <Col span={12}>
              <TokenCard agreement={agreement} />
            </Col>

            <Col span={12}>
              <Form
                form={form}
                layout={"vertical"}
                onFinish={onSubmit}
                onValuesChange={onValuesChange}
              >
                <Form.Item
                  name={"tokenAddress"}
                  label={
                    <Typography.Text strong={true}>
                      {"NFT Token Address"}
                    </Typography.Text>
                  }
                  rules={[{ required: true, message: "" }]}
                >
                  <Input autoFocus={true} size={"large"} />
                </Form.Item>

                <Form.Item
                  name={"tokenId"}
                  label={
                    <Typography.Text strong={true}>
                      {"NFT token id"}
                    </Typography.Text>
                  }
                  rules={[{ required: true, message: "" }]}
                >
                  <Input size={"large"} />
                </Form.Item>

                <Form.Item
                  name={"name"}
                  label={
                    <Typography.Text strong={true}>
                      {"RICKS name"}
                    </Typography.Text>
                  }
                  rules={[{ required: true, message: "" }]}
                >
                  <Input size={"large"} />
                </Form.Item>
                <Form.Item
                  name={"symbol"}
                  label={
                    <Typography.Text strong={true}>
                      {"RICKS symbol"}
                    </Typography.Text>
                  }
                  rules={[{ required: true, message: "" }]}
                >
                  <Input size={"large"} />
                </Form.Item>

                <Form.Item
                  name={"initialSupply"}
                  label={
                    <Typography.Text strong={true}>
                      {"Initial Supply"}
                    </Typography.Text>
                  }
                  rules={[{ required: true, message: "" }]}
                >
                  <Input type={"number"} size={"large"} />
                </Form.Item>

                <Form.Item
                  name={"amount"}
                  label={
                    <Typography.Text strong={true}>
                      {"Agreement Amount"}
                    </Typography.Text>
                  }
                  rules={[{ required: true, message: "" }]}
                >
                  <Input type={"number"} size={"large"} />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Drawer>

        <style jsx>{``}</style>
      </div>
    );
  }
);
