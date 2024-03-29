import React from "react";
import { Button, List, Popover } from "antd";
import Icon from "@ant-design/icons";
import { AccountIcon } from "../../../../common/icons/account-icon";
import Link from "next/link";

export const ApplicationAccountButton = ({ account, provider, onDisconnect, dispatch }) => {
  const links = [
    { id: 0, title: "My listings", route: "/owner?address=" + account },
    { id: 1, title: "My rents", route: "/tenant?address=" + account },
  ];
  return (
    <div>
      <Popover
        placement={"bottomRight"}
        content={
          <List
            footer={
              <div>
                <Button type={"text"} danger={true} onClick={() => onDisconnect(provider, dispatch)}>
                  {"Disconnect"}
                </Button>
              </div>
            }
            dataSource={links}
            renderItem={(item) => (
              <List.Item>
                <Link href={item.route}>
                  <a className={"g-link-no-border"}>
                    <Button type={"text"}>{item.title}</Button>
                  </a>
                </Link>
              </List.Item>
            )}
          />
        }
        trigger={"click"}
      >
        <Button
          type={"default"}
          size={"large"}
          shape={"circle"}
          icon={<Icon component={AccountIcon} />}
        />
      </Popover>

      <style jsx>{``}</style>
    </div>
  );
};
