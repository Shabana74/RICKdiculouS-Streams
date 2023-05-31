import { message } from "antd";
import Head from "next/head";
import React, { useContext, useCallback, useEffect } from "react";
import { GlobalContext } from "../context/store";
import { ApplicationPage } from "../application";
import { TokenGrid } from "../modules/token";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [state, dispatch] = useContext(GlobalContext);

  const onClickRent = useCallback(
    (rent) => {
      router.push("/token?id=" + rent.ricksAddress);
    },
    [router]
  );

  return (
    <>
      <Head>
        <title>RICKdiculous Streams</title>
      </Head>

      <ApplicationPage>
        <div>
          <TokenGrid rents={state.agreements} onClickRent={onClickRent} />
        </div>

        <style jsx>{``}</style>
      </ApplicationPage>
    </>
  );
}
